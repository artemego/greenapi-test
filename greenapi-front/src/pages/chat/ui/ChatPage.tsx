import { Outlet, useMatch } from 'react-router';
import { useLiveEvents } from '../model/useLiveEvents';
import { Sidebar } from './Sidebar';
import styles from './ChatPage.module.scss';

export function ChatPage() {
  const openChatId = useMatch('/chats/:chatId')?.params.chatId;
  const { connection, unread } = useLiveEvents(openChatId);

  return (
    <div className={styles.layout}>
      <Sidebar selectedId={openChatId} connection={connection} unread={unread} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
