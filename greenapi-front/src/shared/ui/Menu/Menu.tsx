import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Menu.module.scss';

type MenuProps = {
  trigger: ReactElement;
  children: ReactNode;
  align?: 'start' | 'end';
};

export function Menu({ trigger, children, align = 'start' }: MenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} align={align} sideOffset={6}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

type MenuItemProps = {
  icon: IconName;
  children: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
};

export function MenuItem({ icon, children, onSelect, danger }: MenuItemProps) {
  return (
    <DropdownMenu.Item className={clsx(styles.item, danger && styles.danger)} onSelect={onSelect}>
      <Icon name={icon} size={22} className={styles.icon} />
      {children}
    </DropdownMenu.Item>
  );
}
