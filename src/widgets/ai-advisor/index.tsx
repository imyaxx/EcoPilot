import { useState } from 'react';
import { Sparkle, ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { Card, CardHeader, CardBody, Button } from '../../shared/ui';
import styles from './styles.module.css';

export interface AiAdvisorInput {
  buildingType: 'school' | 'residential' | 'office';
  area: number;
  electricityKwh: number;
  waterM3: number;
  monthlyTotal: number;
  savedYearly: number;
  reductionPct: number;
  language: string;
}

interface AiAdvisorProps {
  input: AiAdvisorInput;
  disabled?: boolean;
}

const BUILDING_LABEL: Record<string, string> = {
  school: 'школа',
  residential: 'жилой дом',
  office: 'офис',
};

function buildPrompt(input: AiAdvisorInput): string {
  const lang =
    input.language === 'ru'
      ? 'русском'
      : input.language === 'kk'
        ? 'казахском'
        : 'английском';

  return `Ты — энергетический консультант для зданий Казахстана (Алматы).

Данные здания:
- Тип: ${BUILDING_LABEL[input.buildingType] ?? input.buildingType}
- Площадь: ${input.area} м²
- Потребление электроэнергии: ${Math.round(input.electricityKwh)} кВт·ч/мес
- Потребление воды: ${input.waterM3.toFixed(1)} м³/мес
- Текущие затраты: ${Math.round(input.monthlyTotal)} ₸/мес
- Целевое снижение: ${input.reductionPct}%
- Потенциальная годовая экономия: ${Math.round(input.savedYearly)} ₸

Дай 3–4 конкретные рекомендации по снижению потребления именно для этого типа здания в казахстанских реалиях.
Каждая рекомендация — одно конкретное действие, примерный эффект в % и срок окупаемости.
Формат: короткий заголовок (эмодзи + название), затем 1–2 предложения с деталями.
Отвечай на ${lang} языке. Будь конкретным, без воды.`;
}

export function AiAdvisor({ input, disabled }: AiAdvisorProps) {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setAdvice('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY as string}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [{ role: 'user', content: buildPrompt(input) }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      const text = data.choices[0]?.message.content ?? '';

      setAdvice(text);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAdvice('');
    setGenerated(false);
    setError(null);
  };

  return (
    <Card>
      <CardHeader
        title="ИИ-советник"
        action={
          generated ? (
            <Button variant="ghost" size="small" onClick={handleReset}>
              Обновить
            </Button>
          ) : undefined
        }
      />
      <CardBody>
        {!generated && !loading && (
          <div className={styles.intro}>
            <div className={styles.introIcon}>
              <Sparkle size={20} weight="fill" />
            </div>
            <p className={styles.introText}>
              Получите персональные рекомендации по снижению потребления для
              вашего здания — на основе введённых данных.
            </p>
            <Button
              variant="primary"
              onClick={() => void handleGenerate()}
              disabled={disabled || loading}
            >
              Получить рекомендации
              <ArrowRight size={14} weight="bold" />
            </Button>
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingDots}>
              <span />
              <span />
              <span />
            </div>
            <p className={styles.loadingText}>Анализирую данные здания…</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <WarningCircle size={16} weight="fill" />
            <span>{error}</span>
          </div>
        )}

        {advice && (
          <div className={styles.advice}>
            {advice.split('\n').map((line, i) => {
              if (!line.trim()) return null;
              // Lines starting with emoji + bold-looking text → treat as header
              const isHeader = /^[^\w\s]/.test(line.trim()) && line.length < 80;
              return isHeader ? (
                <p key={i} className={styles.adviceHeader}>
                  {line}
                </p>
              ) : (
                <p key={i} className={styles.adviceLine}>
                  {line}
                </p>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}