import { type ReactNode } from 'react';
import styles from './styles.module.css';

type CardPadding = 'compact' | 'default' | 'spacious';

interface CardProps {
  padding?: CardPadding;
  children: ReactNode;
  className?: string;
}

export function Card({
  padding = 'default',
  children,
  className,
}: CardProps) {
  const classNames = [styles.card, styles[padding], className]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames}>{children}</div>;
}

/* ── Compound Components ── */

interface CardHeaderProps {
  title: string;
  action?: ReactNode;
}

export function CardHeader({ title, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <h3 className={styles.headerTitle}>{title}</h3>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  );
}

interface CardSlotProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardSlotProps) {
  const classNames = [styles.body, className].filter(Boolean).join(' ');
  return <div className={classNames}>{children}</div>;
}

export function CardFooter({ children, className }: CardSlotProps) {
  const classNames = [styles.footer, className].filter(Boolean).join(' ');
  return <div className={classNames}>{children}</div>;
}
