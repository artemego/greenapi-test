import clsx from 'clsx';
import { formatListDate } from '@/shared/lib';
import { Avatar, Ripple } from '@/shared/ui';
import { chatTitle } from '../../lib/chatTitle';
import type { Chat } from '../../model/types';
import styles from './ChatListItem.module.scss';

type ChatListItemProps = {
  chat: Chat;
  selected?: boolean;
  unreadCount?: number;
  onSelect?: (chat: Chat) => void;
};

export function ChatListItem({ chat, selected, unreadCount, onSelect }: ChatListItemProps) {
  const title = chatTitle(chat);

  return (
    <button
      type="button"
      className={clsx(styles.item, selected && styles.selected)}
      onClick={() => onSelect?.(chat)}
      aria-current={selected || undefined}
    >
      <Avatar name={title} seed={chat.chatId} />
      <div className={styles.info}>
        <div className={styles.row}>
          <span className={styles.title}>{title}</span>
          {chat.lastMessageAt && (
            <span className={styles.time}>{formatListDate(chat.lastMessageAt)}</span>
          )}
        </div>
        <div className={styles.row}>
          <span className={styles.preview}>{chat.lastMessage ?? 'No messages yet'}</span>
          {unreadCount ? <span className={styles.badge}>{unreadCount}</span> : null}
        </div>
      </div>
      <Ripple />
    </button>
  );
}

export function ChatListItemSkeleton() {
  return (
    <div className={clsx(styles.item, styles.skeleton)} aria-hidden>
      <div className={styles.skeletonAvatar} />
      <div className={styles.info}>
        <div className={styles.skeletonLine} style={{ width: '45%' }} />
        <div className={styles.skeletonLine} style={{ width: '75%' }} />
      </div>
    </div>
  );
}
