import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import { Spinner } from '../Spinner';
import styles from './Banner.module.scss';

type BannerProps = {
  children: ReactNode;
  tone?: 'info' | 'warning';
  loading?: boolean;
  action?: { label: string; onClick: () => void };
};

export function Banner({ children, tone = 'info', loading, action }: BannerProps) {
  return (
    <div className={clsx(styles.banner, styles[tone])} role="status">
      {loading ? <Spinner size="small" color="current" /> : <Icon name="info" size={20} />}
      <span className={styles.text}>{children}</span>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
