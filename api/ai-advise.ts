/**
 * Serverless proxy for the AI Advisor.
 * Keeps OPENAI_API_KEY on the server (never shipped to the browser bundle),
 * validates the incoming payload, formats a language-specific prompt, and
 * forwards the request to OpenAI `gpt-4o-mini`.
 *
 * Deploy-shape agnostic: the exported default handler matches the Vercel /
 * Netlify Functions shape (`(req, res)`), so the same file works on either.
 */

interface AdviseRequestBody {
  buildingType: 'school' | 'residential' | 'office';
  area: number;
  electricityKwh: number;
  waterM3: number;
  monthlyTotal: number;
  savedYearly: number;
  reductionPct: number;
  language: 'en' | 'ru' | 'kk';
}

type Lang = AdviseRequestBody['language'];

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_MAX_TOKENS = 900;
const OPENAI_TIMEOUT_MS = 25_000;

const BUILDING_LABELS: Record<Lang, Record<AdviseRequestBody['buildingType'], string>> = {
  en: { school: 'school', residential: 'residential building', office: 'office' },
  ru: { school: 'школа', residential: 'жилой дом', office: 'офис' },
  kk: { school: 'мектеп', residential: 'тұрғын үй', office: 'кеңсе' },
};

const PROMPT_TEMPLATES: Record<Lang, (fields: PromptFields) => string> = {
  en: (f) => `You are an energy-efficiency advisor for buildings in Almaty, Kazakhstan.

Building data:
- Type: ${f.buildingLabel}
- Floor area: ${f.area} m²
- Electricity use: ${f.electricityKwh} kWh / month
- Water use: ${f.waterM3} m³ / month
- Current monthly cost: ${f.monthlyTotal} KZT
- Reduction target: ${f.reductionPct}%
- Estimated yearly savings at target: ${f.savedYearly} KZT

Give 3–4 concrete, prioritized recommendations tailored to this building type and Kazakhstani climate/market conditions.
Each recommendation: a short emoji-prefixed title, then 1–2 sentences with the expected % impact and rough payback period.
Respond in English. Be concrete, no fluff.`,

  ru: (f) => `Ты — консультант по энергоэффективности зданий в Алматы, Казахстан.

Данные здания:
- Тип: ${f.buildingLabel}
- Площадь: ${f.area} м²
- Потребление электроэнергии: ${f.electricityKwh} кВт·ч / мес
- Потребление воды: ${f.waterM3} м³ / мес
- Текущие затраты: ${f.monthlyTotal} ₸ / мес
- Целевое снижение: ${f.reductionPct}%
- Потенциальная годовая экономия: ${f.savedYearly} ₸

Дай 3–4 конкретные, приоритетные рекомендации именно для этого типа здания и казахстанских реалий.
Каждая рекомендация: короткий заголовок с эмодзи, затем 1–2 предложения с ожидаемым эффектом в % и примерным сроком окупаемости.
Отвечай на русском языке. Коротко и по делу, без воды.`,

  kk: (f) => `Сен — Алматыдағы ғимараттардың энергия тиімділігі бойынша кеңесшісің.

Ғимарат деректері:
- Түрі: ${f.buildingLabel}
- Ауданы: ${f.area} м²
- Электр тұтыну: ${f.electricityKwh} кВт·сағ / ай
- Су тұтыну: ${f.waterM3} м³ / ай
- Ағымдағы шығын: ${f.monthlyTotal} ₸ / ай
- Мақсатты төмендету: ${f.reductionPct}%
- Жылдық үнемдеу әлеуеті: ${f.savedYearly} ₸

Осы ғимарат түріне және Қазақстан жағдайына бейімделген 3–4 нақты, басымдықпен реттелген ұсыныс бер.
Әр ұсыныс: эмодзи қойылған қысқа тақырып, содан кейін 1–2 сөйлем — күтілетін әсер (%) мен шамамен өтелу мерзімі.
Қазақ тілінде жауап бер. Қысқа, нақты, артық сөзсіз.`,
};

interface PromptFields {
  buildingLabel: string;
  area: number;
  electricityKwh: number;
  waterM3: number;
  monthlyTotal: number;
  savedYearly: number;
  reductionPct: number;
}

function isValidPayload(value: unknown): value is AdviseRequestBody {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;

  const validBuilding =
    body.buildingType === 'school' ||
    body.buildingType === 'residential' ||
    body.buildingType === 'office';

  const validLanguage =
    body.language === 'en' || body.language === 'ru' || body.language === 'kk';

  const numbers: (keyof AdviseRequestBody)[] = [
    'area',
    'electricityKwh',
    'waterM3',
    'monthlyTotal',
    'savedYearly',
    'reductionPct',
  ];
  const numbersOk = numbers.every(
    (field) => typeof body[field] === 'number' && Number.isFinite(body[field] as number),
  );

  return validBuilding && validLanguage && numbersOk;
}

function buildPrompt(payload: AdviseRequestBody): string {
  const fields: PromptFields = {
    buildingLabel: BUILDING_LABELS[payload.language][payload.buildingType],
    area: Math.round(payload.area),
    electricityKwh: Math.round(payload.electricityKwh),
    waterM3: Number(payload.waterM3.toFixed(1)),
    monthlyTotal: Math.round(payload.monthlyTotal),
    savedYearly: Math.round(payload.savedYearly),
    reductionPct: Math.round(payload.reductionPct),
  };
  return PROMPT_TEMPLATES[payload.language](fields);
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  setHeader?: (name: string, value: string) => void;
  json: (body: unknown) => unknown;
}

interface RequestLike {
  method?: string;
  body?: unknown;
}

async function readJsonBody(req: RequestLike): Promise<unknown> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body) as unknown;
      } catch {
        return null;
      }
    }
    return req.body;
  }
  return null;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader?.('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  const parsed = await readJsonBody(req);
  if (!isValidPayload(parsed)) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  const prompt = buildPrompt(parsed);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const upstream = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_tokens: OPENAI_MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (upstream.status === 429) {
      return res.status(429).json({ error: 'rate_limited' });
    }

    if (!upstream.ok) {
      return res.status(502).json({ error: 'upstream_error' });
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const advice = data.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ advice });
  } catch (err) {
    const aborted =
      err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'));
    return res.status(aborted ? 504 : 502).json({ error: aborted ? 'timeout' : 'upstream_error' });
  } finally {
    clearTimeout(timeout);
  }
}
