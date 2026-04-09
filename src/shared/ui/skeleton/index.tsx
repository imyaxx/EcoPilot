import { type CSSProperties } from 'react';
import styles from './styles.module.css';

interface SkeletonBlockProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonBlock({
  width,
  height,
  className,
}: SkeletonBlockProps) {
  const style: CSSProperties = {};
  if (width) style.width = width;
  if (height) style.minHeight = height;

  const classNames = [styles.block, className].filter(Boolean).join(' ');

  return <div className={classNames} style={style} />;
}

type TextWidth = 'short' | 'medium' | 'full';

const textWidthMap: Record<TextWidth, string> = {
  short: styles.textShort,
  medium: styles.textMedium,
  full: styles.textFull,
};

interface SkeletonTextProps {
  lines?: number;
  width?: TextWidth;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  width = 'full',
  className,
}: SkeletonTextProps) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
      {Array.from({ length: lines }, (_, index) => {
        const isLast = index === lines - 1 && lines > 1;
        const lineWidth = isLast ? 'medium' : width;
        const classNames = [styles.text, textWidthMap[lineWidth], className]
          .filter(Boolean)
          .join(' ');

        return <div key={index} className={classNames} />;
      })}
    </div>
  );
}

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

export function SkeletonCard({ height = '120px', className }: SkeletonCardProps) {
  const classNames = [styles.card, className].filter(Boolean).join(' ');

  return <div className={classNames} style={{ minHeight: height }} />;
}
