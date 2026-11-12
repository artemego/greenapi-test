import clsx from 'clsx';
import { Icon } from '../Icon';
import { Ripple } from '../Ripple';
import styles from './ScrollDownButton.module.scss';

type ScrollDownButtonProps = {
  visible: boolean;
  onClick: () => void;
  unreadCount?: number;
  className?: string;
};

export function ScrollDownButton({
  visible,
  onClick,
  unreadCount,
  className,
}: ScrollDownButtonProps) {
  return (
    <button
      type="button"
      className={clsx(styles.button, visible && styles.visible, className)}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Scroll to bottom"
    >
      <Icon name="chevronDown" size={28} />
      {unreadCount ? <span className={styles.badge}>{unreadCount}</span> : null}
      <Ripple />
    </button>
  );
}
