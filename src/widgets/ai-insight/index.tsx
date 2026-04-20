import { useEffect, useState } from 'react';
import { Brain } from '@phosphor-icons/react';
import { Card, CardHeader, CardBody } from '../../shared/ui';
import styles from './styles.module.css';

export interface AiInsightData {
  totalEnergy: number;        // млн кВт·ч
  totalWater: number;         // млн м³
  carbonFootprint: number;    // млн кг CO₂
  efficiencyScore: number;    // %
  energyDelta: number;        // % к предыдущему периоду
  waterDelta: number;
  language: string;
}

interface AiInsightProps {
  data: AiInsightData | null;
}

function buildPrompt(d: AiInsightData): string {
  const lang =
    d.language === 'ru' ? 'русском' : d.language === 'kk' ? 'казахском' : 'английском';

  return `Ты — аналитик городского энергопотребления Алматы. Дай короткий (3–4 предложения) инсайт по текущим данным.

Данные:
- Потребление электроэнергии: ${d.totalEnergy.toFixed(1)} млн кВт·ч (изменение: ${d.energyDelta > 0 ? '+' : ''}${d.energyDelta.toFixed(1)}%)
- Потребление воды: ${d.totalWater.toFixed(2)} млн м³ (изменение: ${d.waterDelta > 0 ? '+' : ''}${d.waterDelta.toFixed(1)}%)
- Углеродный след: ${d.carbonFootprint.toFixed(1)} млн кг CO₂
- Индекс эффективности: ${d.efficiencyScore.toFixed(0)}%

Сделай вывод: что обращает на себя внимание, какая динамика, что это значит для города.
Не перечисляй цифры — они уже видны пользователю. Дай осмысленную интерпретацию.
Отвечай на ${lang} языке. Без заголовков, просто текст.`;
}

export function AiInsight({ data }: AiInsightProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;

    setLoading(true);
    setInsight('');

    const controller = new AbortController();

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY as string}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildPrompt(data) }],
      }),
    })
      .then((r) => r.json())
      .then((json: { choices: { message: { content: string } }[] }) => {
        const text = json.choices[0]?.message.content ?? '';
        setInsight(text);
      })
      .catch(() => {/* silent fail — insight is supplementary */})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [data]);

  if (!data) return null;

  return (
    <Card>
      <CardHeader title="Анализ ИИ" />
      <CardBody>
        <div className={styles.wrapper}>
          <div className={styles.iconCol}>
            <div className={styles.icon}>
              <Brain size={18} weight="fill" />
            </div>
            {loading && <div className={styles.pulse} />}
          </div>
          <div className={styles.content}>
            {loading && (
              <div className={styles.skeleton}>
                <span className={styles.skeletonLine} style={{ width: '90%' }} />
                <span className={styles.skeletonLine} style={{ width: '75%' }} />
                <span className={styles.skeletonLine} style={{ width: '82%' }} />
              </div>
            )}
            {insight && (
              <p className={styles.text}>{insight}</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}