import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { Ripple } from '../Ripple';
import { Spinner } from '../Spinner';
import styles from './Button.module.scss';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'text' | 'danger';
  size?: 'default' | 'small';
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth,
  loading,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size="small" color={variant === 'primary' ? 'white' : 'current'} />
      ) : (
        children
      )}
      {!disabled && !loading && <Ripple />}
    </button>
  );
}
