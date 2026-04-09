import { type ReactNode } from 'react';
import styles from './styles.module.css';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  icon,
  children,
  className,
}: BadgeProps) {
  const classNames = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {icon}
      {children}
    </span>
  );
}
