import clsx from 'clsx';
import { useEffect } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router';
import { chatTitle } from '@/entities/chat';
import { useChats } from '../api/useChats';
import { useLiveEvents } from '../model/useLiveEvents';
import { Sidebar } from './Sidebar';
import styles from './ChatPage.module.scss';

const APP_TITLE = 'GREEN-API Chat';

export function ChatPage() {
  const openChatId = useMatch('/chats/:chatId')?.params.chatId;
  const { connection, unread } = useLiveEvents(openChatId);
  const chats = useChats();
  const navigate = useNavigate();

  const openChat = chats.data?.find((chat) => chat.id === openChatId);
  const unreadTotal = Object.values(unread).reduce((sum, count) => sum + count, 0);
  const title = `${unreadTotal > 0 ? `(${unreadTotal}) ` : ''}${openChat ? chatTitle(openChat) : APP_TITLE}`;

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(
    () => () => {
      document.title = APP_TITLE;
    },
    [],
  );

  useEffect(() => {
    if (!openChatId) return;
    function handleKeyDown(event: KeyboardEvent) {
      // Radix dialogs and menus call preventDefault on the Esc that closes them.
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      navigate('/');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openChatId, navigate]);

  return (
    <div className={clsx(styles.layout, openChatId && styles.chatOpen)}>
      <Sidebar selectedId={openChatId} connection={connection} unread={unread} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
