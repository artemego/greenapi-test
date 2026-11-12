import clsx from 'clsx';
import styles from './BubbleTail.module.scss';

type BubbleTailProps = {
  side: 'left' | 'right';
  className?: string;
};

export function BubbleTail({ side, className }: BubbleTailProps) {
  return (
    <svg
      width="9"
      height="20"
      viewBox="0 0 9 20"
      className={clsx(styles.tail, styles[side], className)}
      aria-hidden
    >
      {side === 'right' ? (
        <path d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 0 1 6 17Z" />
      ) : (
        <path d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 0 0 3 17Z" />
      )}
    </svg>
  );
}
