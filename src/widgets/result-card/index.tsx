/**
 * ResultCard — compact KPI tile for the calculator results grid. Five nearly
 * identical article blocks previously lived inline in the calculator page;
 * this widget is their single source of truth. Colour accent, highlighted
 * state, and optional footnote are all driven by props.
 */

import type { ReactNode } from 'react';
import styles from './styles.module.css';

export type ResultCardAccent = 'energy' | 'water' | 'brand' | 'carbon';

interface ResultCardProps {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  accent: ResultCardAccent;
  highlighted?: boolean;
  footnote?: ReactNode;
}

const ACCENT_CLASS: Record<ResultCardAccent, string> = {
  energy: styles.iconEnergy,
  water: styles.iconWater,
  brand: styles.iconBrand,
  carbon: styles.iconCarbon,
};

export function ResultCard({
  label,
  value,
  unit,
  icon,
  accent,
  highlighted,
  footnote,
}: ResultCardProps) {
  const cardClass = [styles.card, highlighted ? styles.cardHighlight : '']
    .filter(Boolean)
    .join(' ');
  const valueClass = [styles.value, highlighted ? styles.valueHighlight : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass}>
      <div className={`${styles.icon} ${ACCENT_CLASS[accent]}`}>{icon}</div>
      <p className={styles.label}>{label}</p>
      <p className={valueClass}>{value}</p>
      <p className={styles.unit}>{unit}</p>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </article>
  );
}
