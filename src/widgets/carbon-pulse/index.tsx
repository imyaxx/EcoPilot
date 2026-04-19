import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

interface CarbonPulseProps {
  /**
   * Annual electricity consumption for the region, in mln kWh.
   * Used to calculate a realistic per-second emission rate.
   */
  annualEnergyMlnKwh: number;
}

const CARBON_FACTOR_KG_PER_KWH = 0.5;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const TICK_INTERVAL_MS = 50;

function formatNumber(value: number): string {
  return Math.floor(value).toLocaleString();
}

export function CarbonPulse({ annualEnergyMlnKwh }: CarbonPulseProps) {
  const { t } = useTranslation('dashboard');
  const [emittedKg, setEmittedKg] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const totalAnnualKgCarbon =
    annualEnergyMlnKwh * 1_000_000 * CARBON_FACTOR_KG_PER_KWH;
  const kgPerSecond = totalAnnualKgCarbon / SECONDS_PER_YEAR;

  useEffect(() => {
    if (annualEnergyMlnKwh <= 0) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const step = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
        lastTickRef.current = timestamp;
      }

      if (reducedMotion) {
        const elapsedSec = (timestamp - startRef.current) / 1000;
        setEmittedKg(elapsedSec * kgPerSecond);
        return;
      }

      if (timestamp - lastTickRef.current >= TICK_INTERVAL_MS) {
        const elapsedSec = (timestamp - startRef.current) / 1000;
        setEmittedKg(elapsedSec * kgPerSecond);
        lastTickRef.current = timestamp;
      }
      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      startRef.current = null;
    };
  }, [annualEnergyMlnKwh, kgPerSecond]);

  return (
    <section className={styles.pulse} aria-live="polite">
      <div className={styles.decorGrid} aria-hidden="true" />

      <div className={styles.header}>
        <div className={styles.eyebrow}>{t('carbonPulse.title')}</div>
      </div>

      <div className={styles.counter}>
        <span className={styles.counterValue}>{formatNumber(emittedKg)}</span>
        <span className={styles.counterUnit}>{t('carbonPulse.unit')}</span>
      </div>

      <p className={styles.subtitle}>{t('carbonPulse.subtitle')}</p>

      <div className={styles.footer}>
        <span className={styles.basedOn}>
          {t('carbonPulse.basedOn', {
            value: annualEnergyMlnKwh.toLocaleString(),
          })}
        </span>
        <span className={styles.footnote}>{t('carbonPulse.footnote')}</span>
      </div>
    </section>
  );
}
