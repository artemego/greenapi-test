import { useLayoutEffect, useRef, type SubmitEvent, type KeyboardEvent } from 'react';
import { IconButton } from '@/shared/ui';
import { MESSAGE_MAX_LENGTH } from '../../model/constants';
import { BubbleTail } from '../BubbleTail';
import styles from './Composer.module.scss';

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function Composer({ value, onChange, onSend, disabled, autoFocus }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && value.trim().length > 0;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  function send() {
    if (!canSend) return;
    onSend();
    textareaRef.current?.focus();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
          maxLength={MESSAGE_MAX_LENGTH}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label="Message"
        />
        <BubbleTail side="right" className={styles.tail} />
      </div>
      <IconButton
        type="submit"
        icon="send"
        label="Send message"
        variant="raised"
        size="large"
        disabled={!canSend}
      />
    </form>
  );
}
