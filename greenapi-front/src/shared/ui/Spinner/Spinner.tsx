import clsx from 'clsx';
import styles from './Spinner.module.scss';

type SpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'current';
  className?: string;
};

export function Spinner({ size = 'medium', color = 'primary', className }: SpinnerProps) {
  return (
    <span
      className={clsx(styles.spinner, styles[size], styles[color], className)}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </span>
  );
}
