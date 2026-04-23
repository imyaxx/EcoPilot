import styles from './styles.module.css';

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

export function SkeletonCard({ height = '120px', className }: SkeletonCardProps) {
  const classNames = [styles.card, className].filter(Boolean).join(' ');

  return <div className={classNames} style={{ minHeight: height }} />;
}
