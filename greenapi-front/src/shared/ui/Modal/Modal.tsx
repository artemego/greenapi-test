import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode, SubmitEvent } from 'react';
import styles from './Modal.module.scss';

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  onSubmit?: () => void;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  onSubmit,
}: ModalProps) {
  const content = (
    <>
      {children && <div className={styles.body}>{children}</div>}
      {footer && <div className={styles.footer}>{footer}</div>}
    </>
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {description && (
            <Dialog.Description className={styles.description}>{description}</Dialog.Description>
          )}
          {onSubmit ? (
            <form onSubmit={handleSubmit} noValidate>
              {content}
            </form>
          ) : (
            content
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
