import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './styles.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const isIconOnly = icon && !children;

  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    isIconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} {...rest}>
      {icon}
      {children}
    </button>
  );
}
