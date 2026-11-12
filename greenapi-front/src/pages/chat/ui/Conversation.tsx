import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ChatHeader } from '@/entities/chat';
import { Composer, MessageList, type ChatMessage } from '@/entities/message';
import { ApiError, queryKeys } from '@/shared/api';
import { Button, Modal, ScrollDownButton, Spinner } from '@/shared/ui';
import { useChats } from '../api/useChats';
import { useMessages } from '../api/useMessages';
import { useSendMessage } from '../api/useSendMessage';
import { flattenPages, removeMessage, type MessagePages } from '../model/messagesCache';
import { useLoadOlder } from '../model/useLoadOlder';
import { useStickToBottom } from '../model/useStickToBottom';
import styles from './Conversation.module.scss';

export function Conversation() {
  const { chatId = '' } = useParams();
  return <ConversationView key={chatId} chatId={chatId} />;
}

function ConversationView({ chatId }: { chatId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chats = useChats();
  const messages = useMessages(chatId);
  const sendMessage = useSendMessage(chatId);
  const [draft, setDraft] = useState('');
  const [failedMessage, setFailedMessage] = useState<ChatMessage | null>(null);

  const chat = chats.data?.find((item) => item.id === chatId);
  const list = useMemo(() => flattenPages(messages.data), [messages.data]);
  const { containerRef, handleScroll, scrolledUp, scrollToBottom } = useStickToBottom(list);
  const sentinelRef = useLoadOlder({
    containerRef,
    hasNextPage: messages.hasNextPage,
    isFetchingNextPage: messages.isFetchingNextPage,
    fetchNextPage: messages.fetchNextPage,
  });

  const notFound =
    (chats.isSuccess && !chat) ||
    (messages.error instanceof ApiError && messages.error.status === 404);
  if (notFound) return <Navigate to="/" replace />;

  function send(text: string, localId = `local-${crypto.randomUUID()}`) {
    sendMessage.mutate({ text, localId });
  }

  function handleSend() {
    if (!messages.isSuccess) return;
    send(draft.trim());
    setDraft('');
  }

  function handleRetry() {
    if (failedMessage) send(failedMessage.text, failedMessage.id);
    setFailedMessage(null);
  }

  function handleDelete() {
    if (failedMessage) {
      queryClient.setQueryData<MessagePages>(
        queryKeys.messages(chatId),
        (data) => data && removeMessage(data, failedMessage.id),
      );
    }
    setFailedMessage(null);
  }

  function renderMessages() {
    if (messages.isPending) {
      return (
        <div className={styles.center}>
          <Spinner />
        </div>
      );
    }
    if (messages.isError) {
      return (
        <div className={styles.center}>
          <span className={styles.pill}>Couldn't load messages</span>
          <Button variant="text" size="small" onClick={() => messages.refetch()}>
            Retry
          </Button>
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className={styles.center}>
          <span className={styles.pill}>No messages here yet</span>
        </div>
      );
    }
    return <MessageList messages={list} onFailedClick={setFailedMessage} />;
  }

  return (
    <div className={styles.conversation}>
      {chat ? (
        <ChatHeader chat={chat} onBack={() => navigate('/')} />
      ) : (
        <div className={styles.headerPlaceholder} />
      )}

      <div className={styles.messages} ref={containerRef} onScroll={handleScroll}>
        <div className={styles.inner}>
          {messages.hasNextPage && (
            <div ref={sentinelRef} className={styles.older}>
              {messages.isFetchingNextPage && <Spinner size="small" />}
            </div>
          )}
          {renderMessages()}
        </div>
      </div>

      <div className={styles.bottom}>
        <ScrollDownButton
          visible={scrolledUp}
          onClick={scrollToBottom}
          className={styles.scrollDown}
        />
        <Composer value={draft} onChange={setDraft} onSend={handleSend} autoFocus />
      </div>

      <Modal
        open={failedMessage !== null}
        onOpenChange={(open) => !open && setFailedMessage(null)}
        title="Message not sent"
        description="Try sending it again or delete it."
        footer={
          <>
            <Button variant="danger" size="small" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="text" size="small" onClick={handleRetry}>
              Retry
            </Button>
          </>
        }
      />
    </div>
  );
}
