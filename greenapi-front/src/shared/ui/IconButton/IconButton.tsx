import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { Icon, type IconName } from '../Icon';
import { Ripple } from '../Ripple';
import styles from './IconButton.module.scss';

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  icon: IconName;
  label: string;
  variant?: 'plain' | 'primary' | 'raised';
  size?: 'small' | 'medium' | 'large';
};

const iconSizes = { small: 20, medium: 24, large: 28 };

export function IconButton({
  icon,
  label,
  variant = 'plain',
  size = 'medium',
  type = 'button',
  disabled,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={clsx(styles.button, styles[variant], styles[size], className)}
      {...rest}
    >
      <Icon name={icon} size={iconSizes[size]} />
      {!disabled && <Ripple />}
    </button>
  );
}
