import { Avatar, IconButton } from '@/shared/ui';
import { chatSubtitle, chatTitle } from '../../lib/chatTitle';
import type { Chat } from '../../model/types';
import styles from './ChatHeader.module.scss';

type ChatHeaderProps = {
  chat: Chat;
  onBack?: () => void;
};

export function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  const title = chatTitle(chat);

  return (
    <header className={styles.header}>
      {onBack && (
        <IconButton icon="arrowLeft" label="Back" onClick={onBack} className={styles.back} />
      )}
      <Avatar name={title} seed={chat.chatId} size="medium" />
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{chatSubtitle(chat)}</div>
      </div>
    </header>
  );
}
