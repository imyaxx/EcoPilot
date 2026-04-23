#!/usr/bin/env node
/**
 * Locale consistency audit for EcoPilot.
 *
 * Walks every locale JSON under `src/shared/config/i18n/locales/**` and every
 * `t('...')` / `t(`...`)` call inside `src/**`, then reports:
 *   1. Keys used in code but missing from at least one locale file.
 *   2. Keys defined in a locale but never referenced in code (dead strings).
 *   3. Divergence between locales — key present in one but missing in another.
 *
 * Exits with code 1 if any issue is found so it can gate CI / lint pipelines.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(HERE, '..');
const LOCALES_DIR = join(PROJECT_ROOT, 'src', 'shared', 'config', 'i18n', 'locales');
const SOURCE_DIR = join(PROJECT_ROOT, 'src');

const LANGS = ['en', 'ru', 'kk'];
const NAMESPACES = ['common', 'dashboard', 'calculator'];

function flattenKeys(value, prefix = '', out = new Set()) {
  if (value === null || typeof value !== 'object') {
    out.add(prefix);
    return out;
  }
  for (const [childKey, childValue] of Object.entries(value)) {
    flattenKeys(childValue, prefix ? `${prefix}.${childKey}` : childKey, out);
  }
  return out;
}

function loadLocale(lang, ns) {
  const path = join(LOCALES_DIR, lang, `${ns}.json`);
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

function walkSourceFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const absolute = join(dir, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      walkSourceFiles(absolute, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(absolute);
    }
  }
  return files;
}

/**
 * Collects every literal key passed to `t(…)` and `t(`…`)`. Template literals
 * containing `${…}` are flagged as "dynamic" — we verify only their static
 * prefix so that e.g. `t(`metrics.${key}.label`)` requires *some* key below
 * `metrics.` in all locales.
 */
function extractKeys(source) {
  const literals = new Set();
  const dynamicPrefixes = new Set();

  const literalPattern = /\bt\(\s*['"]([^'"]+?)['"]/g;
  for (const match of source.matchAll(literalPattern)) {
    literals.add(match[1]);
  }

  const templatePattern = /\bt\(\s*`([^`]+?)`/g;
  for (const match of source.matchAll(templatePattern)) {
    const key = match[1];
    if (key.includes('${')) {
      const staticPrefix = key.split('${')[0].replace(/\.?$/, '');
      if (staticPrefix) dynamicPrefixes.add(staticPrefix);
    } else {
      literals.add(key);
    }
  }

  return { literals, dynamicPrefixes };
}

function keyExistsInLocale(localeKeys, key, ns) {
  const fq = key.includes(':') ? key : `${ns}:${key}`;
  const [resolvedNs, rawKey] = fq.split(':');
  const set = localeKeys.get(resolvedNs);
  if (!set) return false;
  return set.has(rawKey);
}

function hasPrefixInLocale(localeKeys, prefix, ns) {
  const fq = prefix.includes(':') ? prefix : `${ns}:${prefix}`;
  const [resolvedNs, rawPrefix] = fq.split(':');
  const set = localeKeys.get(resolvedNs);
  if (!set) return false;
  for (const existing of set) {
    if (existing === rawPrefix || existing.startsWith(`${rawPrefix}.`)) {
      return true;
    }
  }
  return false;
}

function inferNamespace(source) {
  const match = source.match(/useTranslation\(\s*['"]([a-zA-Z_-]+)['"]\s*\)/);
  return match ? match[1] : 'common';
}

function main() {
  const localeKeys = new Map();
  for (const lang of LANGS) {
    const byNs = new Map();
    for (const ns of NAMESPACES) {
      byNs.set(ns, flattenKeys(loadLocale(lang, ns)));
    }
    localeKeys.set(lang, byNs);
  }

  const usedKeys = new Map();
  const usedPrefixes = new Map();
  const files = walkSourceFiles(SOURCE_DIR);
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const { literals, dynamicPrefixes } = extractKeys(source);
    if (literals.size === 0 && dynamicPrefixes.size === 0) continue;
    const ns = inferNamespace(source);
    for (const key of literals) {
      if (!usedKeys.has(key)) usedKeys.set(key, new Set());
      usedKeys.get(key).add(ns);
    }
    for (const prefix of dynamicPrefixes) {
      if (!usedPrefixes.has(prefix)) usedPrefixes.set(prefix, new Set());
      usedPrefixes.get(prefix).add(ns);
    }
  }

  const problems = [];
  const missing = [];
  const unused = new Map();

  for (const [key, namespaces] of usedKeys) {
    for (const ns of namespaces) {
      for (const lang of LANGS) {
        const keys = localeKeys.get(lang);
        if (!keyExistsInLocale(keys, key, ns)) {
          missing.push({ lang, key, ns });
        }
      }
    }
  }

  for (const [prefix, namespaces] of usedPrefixes) {
    for (const ns of namespaces) {
      for (const lang of LANGS) {
        const keys = localeKeys.get(lang);
        if (!hasPrefixInLocale(keys, prefix, ns)) {
          missing.push({ lang, key: `${prefix}.*`, ns, dynamic: true });
        }
      }
    }
  }

  const usedByNs = new Map();
  for (const [key, namespaces] of usedKeys) {
    for (const ns of namespaces) {
      const resolvedNs = key.includes(':') ? key.split(':')[0] : ns;
      const rawKey = key.includes(':') ? key.split(':')[1] : key;
      if (!usedByNs.has(resolvedNs)) usedByNs.set(resolvedNs, new Set());
      usedByNs.get(resolvedNs).add(rawKey);
    }
  }
  const usedPrefixByNs = new Map();
  for (const [prefix, namespaces] of usedPrefixes) {
    for (const ns of namespaces) {
      const resolvedNs = prefix.includes(':') ? prefix.split(':')[0] : ns;
      const rawPrefix = prefix.includes(':') ? prefix.split(':')[1] : prefix;
      if (!usedPrefixByNs.has(resolvedNs)) usedPrefixByNs.set(resolvedNs, new Set());
      usedPrefixByNs.get(resolvedNs).add(rawPrefix);
    }
  }

  for (const lang of LANGS) {
    for (const ns of NAMESPACES) {
      const defined = localeKeys.get(lang).get(ns);
      const used = usedByNs.get(ns) ?? new Set();
      const prefixes = usedPrefixByNs.get(ns) ?? new Set();
      for (const key of defined) {
        if (used.has(key)) continue;
        let matchedByPrefix = false;
        for (const prefix of prefixes) {
          if (key === prefix || key.startsWith(`${prefix}.`)) {
            matchedByPrefix = true;
            break;
          }
        }
        if (matchedByPrefix) continue;
        const id = `${ns}:${key}`;
        if (!unused.has(id)) unused.set(id, new Set());
        unused.get(id).add(lang);
      }
    }
  }

  if (missing.length) {
    problems.push(`Missing keys (${missing.length}):`);
    for (const item of missing) {
      problems.push(
        `  · [${item.lang}/${item.ns}] ${item.key}${item.dynamic ? '  (dynamic prefix)' : ''}`,
      );
    }
  }

  if (unused.size) {
    problems.push(`Unused locale keys (${unused.size}):`);
    for (const [id, langs] of unused) {
      problems.push(`  · ${id}  (in ${[...langs].sort().join(', ')})`);
    }
  }

  if (!problems.length) {
    const total = [...usedKeys.keys()].length + [...usedPrefixes.keys()].length;
    console.log(
      `lint:i18n · OK — ${total} keys referenced, ${LANGS.length} locales aligned.`,
    );
    return;
  }

  console.error('lint:i18n · FAIL');
  for (const line of problems) console.error(line);
  console.error(`\nLocale files scanned under ${relative(PROJECT_ROOT, LOCALES_DIR)}`);
  process.exit(1);
}

main();
