import { useMemo } from 'react';
import { groupMessages } from '../../lib/groupMessages';
import type { ChatMessage } from '../../model/types';
import { DateSeparator } from '../DateSeparator';
import { MessageBubble } from '../MessageBubble';
import styles from './MessageList.module.scss';

type MessageListProps = {
  messages: ChatMessage[];
  onFailedClick?: (message: ChatMessage) => void;
};

export function MessageList({ messages, onFailedClick }: MessageListProps) {
  const days = useMemo(() => groupMessages(messages), [messages]);

  return (
    <div className={styles.list}>
      {days.map((day) => (
        <section key={day.key} className={styles.day}>
          <DateSeparator label={day.label} />
          {day.groups.map((group) =>
            group.messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                first={index === 0}
                last={index === group.messages.length - 1}
                onFailedClick={onFailedClick}
              />
            )),
          )}
        </section>
      ))}
    </div>
  );
}
