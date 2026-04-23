# EcoPilot

City-scale energy & water observatory for Almaty, paired with a building-level cost & savings calculator. Built for the EcoSolutions Hackathon (Almaty 2026).

**Stack:** React 19 · TypeScript · Vite · CSS Modules · i18next · Phosphor Icons · xlsx

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run lint         # eslint + i18n consistency check
npm run lint:i18n    # locale audit only (missing / unused keys)
npm run build        # type-check, i18n check, then Vite production build
npm run preview      # serve dist/ locally
```

---

## Environment variables

The OpenAI API key **must not** be exposed to the browser. All AI calls go through the serverless handler in [`api/ai-advise.ts`](api/ai-advise.ts), which reads the key server-side only.

1. Copy the template: `cp .env.example .env.local`
2. Fill in `OPENAI_API_KEY=sk-...` (do **not** prefix with `VITE_`)
3. Deploy the `api/` folder as a serverless function (Vercel, Netlify, Cloudflare Workers, etc.). The handler signature is framework-agnostic: `export default async function handler(req, res)`.

During local development without a deployed endpoint, the AI Advisor will surface a network error — this is expected; the UI stays usable.

---

## Project structure (FSD)

```
src/
├── app/           # shell: providers, routing, global styles
├── pages/         # dashboard, calculator
├── widgets/       # line-chart, metric-card, consumption-heatmap,
│                  # ai-advisor, cost-breakdown-donut, result-card
├── shared/
│   ├── ui/        # Button, Card, Skeleton, LanguageSwitcher, BrandMark
│   ├── config/    # i18n (en, ru, kk)
│   └── data/      # xlsx adapters, dataset loader, selectors, types
api/
└── ai-advise.ts   # OpenAI proxy (runs server-side, reads OPENAI_API_KEY)
scripts/
└── check-locales.mjs  # locale consistency auditor
```

---

## Responsive breakpoints

| Width      | Target                              |
|------------|-------------------------------------|
| ≥ 1200 px  | Desktop baseline (container capped) |
| 769–1199   | Tablet landscape                    |
| 481–768    | Tablet portrait / small laptop      |
| 361–480    | Mobile                              |
| ≤ 360      | Small mobile                        |

Tested widths: 375, 390, 768, 1024, 1440.

Notable mobile behaviors:
- Dashboard metric grid collapses 4 → 2 → 1 cols at 960 / 480.
- Charts grid 2 → 1 col at 768.
- Calculator layout 2 → 1 col at 768; result grid 1-col at 480.
- Consumption heatmap row-label shrinks to 60 px at 480; x-axis labels skip every other month at 480 and every third at 360 to keep cells legible.
- Sticky nav respects `env(safe-area-inset-top)` on iOS; brand tile shrinks to 26 px at ≤640.

---

## Adding a fourth language

1. Create `src/shared/config/i18n/locales/<lang>/{common,dashboard,calculator}.json`. Copy the English files as a baseline and translate every value.
2. Register the code in [`src/shared/config/i18n/index.ts`](src/shared/config/i18n/index.ts) under `resources` and (if desired) in the `LanguageSwitcher` options.
3. Run `npm run lint:i18n` — it will fail loudly if any key is missing from the new locale.

The checker validates all four languages in one pass, so a partial translation cannot ship accidentally.

---

## i18n conventions

- Three namespaces: `common`, `dashboard`, `calculator`. Use `t('ns:key')` only when referencing another namespace (e.g. `common:units.kzt`); otherwise the namespace follows from `useTranslation(...)`.
- Do **not** hardcode user-facing strings in `.tsx` files.
- Dynamic keys (`t(\`metrics.${k}.label\`)`) are allowed; the checker validates the static prefix.
- Run `npm run lint` locally before pushing — unused or missing keys will fail the lint step.
