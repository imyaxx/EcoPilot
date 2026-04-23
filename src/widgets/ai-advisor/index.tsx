/**
 * AiAdvisor — renders the AI-generated energy-efficiency recommendations
 * panel in the calculator right column. The component only ships structured
 * building data to the /api/ai-advise serverless proxy; the prompt template
 * and OpenAI key live on the server.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

type ErrorKind = 'generic' | 'rateLimit' | 'network';

const ADVISE_ENDPOINT = '/api/ai-advise';

export function AiAdvisor({ input, disabled }: AiAdvisorProps) {
  const { t } = useTranslation('calculator');
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [generated, setGenerated] = useState(false);

  const errorMessage =
    errorKind === 'rateLimit'
      ? t('aiAdvisor.errorRateLimit')
      : errorKind === 'network'
        ? t('aiAdvisor.errorNetwork')
        : errorKind === 'generic'
          ? t('aiAdvisor.errorGeneric')
          : null;

  const handleGenerate = async () => {
    setLoading(true);
    setErrorKind(null);
    setAdvice('');

    try {
      const response = await fetch(ADVISE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (response.status === 429) {
        setErrorKind('rateLimit');
        return;
      }

      if (!response.ok) {
        setErrorKind('generic');
        return;
      }

      const data = (await response.json()) as { advice?: string };
      setAdvice(data.advice ?? '');
      setGenerated(true);
    } catch {
      setErrorKind('network');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAdvice('');
    setGenerated(false);
    setErrorKind(null);
  };

  return (
    <Card>
      <CardHeader
        title={t('aiAdvisor.title')}
        action={
          generated ? (
            <Button variant="ghost" size="small" onClick={handleReset}>
              {t('aiAdvisor.refresh')}
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
            <p className={styles.introText}>{t('aiAdvisor.introText')}</p>
            <Button
              variant="primary"
              onClick={() => void handleGenerate()}
              disabled={disabled || loading}
              className={styles.generateButton}
            >
              {t('aiAdvisor.generate')}
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
            <p className={styles.loadingText}>{t('aiAdvisor.loading')}</p>
          </div>
        )}

        {errorMessage && (
          <div className={styles.error} role="alert">
            <WarningCircle size={16} weight="fill" />
            <span>{errorMessage}</span>
          </div>
        )}

        {advice && (
          <div className={styles.advice}>
            {advice.split('\n').map((line, i) => {
              if (!line.trim()) return null;
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
