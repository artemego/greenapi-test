import clsx from 'clsx';
import { formatTime } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import type { ChatMessage } from '../../model/types';
import { BubbleTail } from '../BubbleTail';
import styles from './MessageBubble.module.scss';

type MessageBubbleProps = {
  message: ChatMessage;
  first?: boolean;
  last?: boolean;
  onFailedClick?: (message: ChatMessage) => void;
};

export function MessageBubble({ message, first, last, onFailedClick }: MessageBubbleProps) {
  const outgoing = message.direction === 'outgoing';

  function renderStatus(interactive: boolean) {
    switch (message.status) {
      case 'sending':
        return <Icon name="clock" size={15} />;
      case 'read':
        return <Icon name="checkDouble" size={18} />;
      case 'failed':
        return interactive && message.local ? (
          <button
            type="button"
            className={styles.failed}
            onClick={() => onFailedClick?.(message)}
            aria-label="Not sent. Retry or delete"
          >
            <Icon name="alert" size={16} />
          </button>
        ) : (
          <Icon name="alert" size={16} className={styles.failedIcon} />
        );
      default:
        return <Icon name="check" size={17} />;
    }
  }

  function renderMeta(interactive: boolean) {
    return (
      <>
        <span>{formatTime(message.sentAt)}</span>
        {outgoing && renderStatus(interactive)}
      </>
    );
  }

  return (
    <div
      className={clsx(
        styles.row,
        outgoing ? styles.outgoing : styles.incoming,
        first && styles.first,
        last && styles.last,
      )}
    >
      <div className={styles.bubble}>
        <span className={styles.text}>{message.text}</span>
        <span className={styles.spacer} aria-hidden>
          {renderMeta(false)}
        </span>
        <span className={styles.meta}>{renderMeta(true)}</span>
        {last && <BubbleTail side={outgoing ? 'right' : 'left'} className={styles.tail} />}
      </div>
    </div>
  );
}
