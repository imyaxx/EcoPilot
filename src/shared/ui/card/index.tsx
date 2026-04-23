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

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  const classNames = [styles.body, className].filter(Boolean).join(' ');
  return <div className={classNames}>{children}</div>;
}
