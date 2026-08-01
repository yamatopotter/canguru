import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'secondary' | 'danger';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: styles.primary,
  outline: styles.outline,
  secondary: styles.secondary,
  danger: styles.danger,
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={[styles.button, VARIANT_CLASS[variant], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

interface LinkButtonProps extends LinkProps {
  variant?: Variant;
}

export function LinkButton({ variant = 'primary', className, ...props }: LinkButtonProps) {
  return (
    <Link
      className={[styles.button, VARIANT_CLASS[variant], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
