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

export function InsightsPanel({ title, items }: InsightsPanelProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>

      {items.map((item) => (
        <article key={item.id} className={styles.insightItem}>
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
