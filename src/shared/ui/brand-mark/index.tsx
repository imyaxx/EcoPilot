/**
 * BrandMark — the leaf-in-a-gradient-tile that appears in the top nav and the
 * footer. Single source so the icon and tile proportions stay in sync across
 * surfaces; `size` scales both the tile and the icon weight.
 */

import { Leaf } from '@phosphor-icons/react';
import styles from './styles.module.css';

type BrandMarkSize = 'sm' | 'md' | 'lg';

interface BrandMarkProps {
  size?: BrandMarkSize;
  className?: string;
}

const SIZE_MAP: Record<BrandMarkSize, { box: string; icon: number }> = {
  sm: { box: styles.boxSm, icon: 14 },
  md: { box: styles.boxMd, icon: 16 },
  lg: { box: styles.boxLg, icon: 20 },
};

export function BrandMark({ size = 'md', className }: BrandMarkProps) {
  const { box, icon } = SIZE_MAP[size];
  const classNames = [styles.mark, box, className].filter(Boolean).join(' ');
  return (
    <div className={classNames} aria-hidden="true">
      <Leaf size={icon} weight="fill" />
    </div>
  );
}
