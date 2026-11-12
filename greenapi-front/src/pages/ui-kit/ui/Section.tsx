import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './UiKitPage.module.scss';

type SectionProps = {
  title: string;
  children: ReactNode;
  surface?: 'plain' | 'wallpaper';
};

export function Section({ title, children, surface = 'plain' }: SectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={clsx(styles.surface, surface === 'wallpaper' && styles.wallpaper)}>
        {children}
      </div>
    </section>
  );
}
