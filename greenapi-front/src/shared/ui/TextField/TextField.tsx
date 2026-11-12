import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';
import styles from './TextField.module.scss';

type TextFieldProps = Omit<ComponentProps<'input'>, 'placeholder'> & {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
};

export function TextField({ label, error, endAdornment, id, className, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div
      className={clsx(
        styles.field,
        error && styles.error,
        endAdornment && styles.withAdornment,
        className,
      )}
    >
      <input
        id={inputId}
        className={styles.input}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      <label htmlFor={inputId} className={styles.label}>
        {error ?? label}
      </label>
      {endAdornment && <div className={styles.adornment}>{endAdornment}</div>}
    </div>
  );
}
