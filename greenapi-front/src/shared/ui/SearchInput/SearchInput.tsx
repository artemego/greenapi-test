import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { Icon } from '../Icon';
import styles from './SearchInput.module.scss';

type SearchInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  onClear?: () => void;
};

export function SearchInput({
  className,
  value,
  onClear,
  placeholder = 'Search',
  ...rest
}: SearchInputProps) {
  return (
    <div className={clsx(styles.search, className)}>
      <Icon name="search" size={22} className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        {...rest}
      />
      {value && onClear && (
        <button type="button" className={styles.clear} onClick={onClear} aria-label="Clear">
          <Icon name="close" size={18} />
        </button>
      )}
    </div>
  );
}
