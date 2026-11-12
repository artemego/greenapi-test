import { Outlet } from 'react-router';
import styles from './ChatPage.module.scss';

export function ChatPage() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>Chats</aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
