import { type ReactNode } from 'react';
import styles from './styles.module.css';

type InsightSeverity = 'warning' | 'danger' | 'info';

interface InsightItem {
  id: string;
  severity: InsightSeverity;
  icon: ReactNode;
  title: string;
  description: string;
}

interface InsightsPanelProps {
  title: string;
  items: InsightItem[];
}

const severityIconMap: Record<InsightSeverity, string> = {
  warning: styles.iconWarning,
  danger: styles.iconDanger,
  info: styles.iconInfo,
};

const entryDelayClassMap = [styles.delay0, styles.delay1, styles.delay2];

export function InsightsPanel({ title, items }: InsightsPanelProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>

      {items.map((item, index) => (
        <article
          key={item.id}
          className={`${styles.insightItem} ${
            entryDelayClassMap[index] ?? styles.delay2
          }`}
        >
          <div
            className={`${styles.insightIcon} ${severityIconMap[item.severity]}`}
          >
            {item.icon}
          </div>
          <div className={styles.insightContent}>
            <h3 className={styles.insightTitle}>{item.title}</h3>
            <p className={styles.insightDescription}>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
