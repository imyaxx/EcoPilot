import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  SystemInsight,
  SystemInsightCategory,
  SystemInsightSeverity,
} from '../../shared/data/transformed';
import styles from './styles.module.css';

interface InsightsPanelProps {
  insights: SystemInsight[];
  categoryIconMap: Record<SystemInsightCategory, ReactNode>;
}

const severityIconClassMap: Record<SystemInsightSeverity, string> = {
  warning: styles.iconWarning,
  critical: styles.iconCritical,
  info: styles.iconInfo,
};

const severityBadgeClassMap: Record<SystemInsightSeverity, string> = {
  warning: styles.badgeWarning,
  critical: styles.badgeCritical,
  info: styles.badgeInfo,
};

const entryDelayClassMap = [
  styles.delay0,
  styles.delay1,
  styles.delay2,
  styles.delay3,
];

export function InsightsPanel({ insights, categoryIconMap }: InsightsPanelProps) {
  const { t } = useTranslation('dashboard');

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{t('insights.title')}</h2>
        <span className={styles.panelCount}>
          {insights.length}
        </span>
      </div>

      <div className={styles.list}>
        {insights.map((insight, index) => {
          const title = t(`insights.items.${insight.id}.title`, insight.values);
          const description = t(
            `insights.items.${insight.id}.description`,
            insight.values,
          );
          const severityLabel = t(`insights.severity.${insight.severity}`);
          const delayClass =
            entryDelayClassMap[index] ?? styles.delay3;

          return (
            <article
              key={insight.id}
              className={`${styles.insightItem} ${delayClass}`}
            >
              <div
                className={`${styles.insightIcon} ${severityIconClassMap[insight.severity]}`}
                aria-hidden="true"
              >
                {categoryIconMap[insight.category]}
              </div>
              <div className={styles.insightContent}>
                <div className={styles.insightTitleRow}>
                  <h3 className={styles.insightTitle}>{title}</h3>
                  <span
                    className={`${styles.severityBadge} ${severityBadgeClassMap[insight.severity]}`}
                  >
                    {severityLabel}
                  </span>
                </div>
                <p className={styles.insightDescription}>{description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
