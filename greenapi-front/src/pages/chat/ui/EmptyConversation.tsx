import styles from './EmptyConversation.module.scss';

export function EmptyConversation() {
  return (
    <div className={styles.empty}>
      <span className={styles.pill}>Select a chat to start messaging</span>
    </div>
  );
}
