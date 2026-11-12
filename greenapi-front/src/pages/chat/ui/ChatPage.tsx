import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import styles from './ChatPage.module.scss';

export function ChatPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
