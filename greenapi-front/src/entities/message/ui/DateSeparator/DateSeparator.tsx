import styles from './DateSeparator.module.scss';

export function DateSeparator({ label }: { label: string }) {
  return (
    <div className={styles.separator}>
      <span className={styles.pill}>{label}</span>
    </div>
  );
}
