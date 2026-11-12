import { useLayoutEffect, useRef, type ChangeEvent, type ComponentProps } from 'react';
import { formatPhone, PHONE_MAX_DIGITS, phoneCountry, phoneDigits } from '@/shared/lib';
import { TextField } from '../TextField';
import styles from './PhoneField.module.scss';

type PhoneFieldProps = Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChange' | 'type' | 'endAdornment' | 'ref' | 'label'
> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

function flagEmoji(country: string) {
  return String.fromCodePoint(...Array.from(country, (char) => 0x1f1a5 + char.charCodeAt(0)));
}

function caretAfterDigits(text: string, count: number) {
  if (count === 0) return text.startsWith('+') ? 1 : 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text[index]) && ++seen === count) return index + 1;
  }
  return text.length;
}

export function PhoneField({ value, onChange, label = 'Phone number', ...rest }: PhoneFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const country = phoneCountry(phoneDigits(value));

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current === null || !input || input !== document.activeElement) return;
    input.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    let digits = phoneDigits(raw);
    let digitsBeforeCaret = phoneDigits(raw.slice(0, caret)).length;

    const deletedSeparator = digits === phoneDigits(value) && raw.length < value.length;
    if (deletedSeparator && digitsBeforeCaret > 0) {
      digits = digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret);
      digitsBeforeCaret -= 1;
    }

    digits = digits.slice(0, PHONE_MAX_DIGITS);
    const next = formatPhone(digits);
    pendingCaret.current = caretAfterDigits(next, Math.min(digitsBeforeCaret, digits.length));
    onChange(next);
  }

  return (
    <TextField
      ref={inputRef}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      label={label}
      value={value}
      onChange={handleChange}
      endAdornment={
        country && (
          <span className={styles.flag} aria-label={country}>
            {flagEmoji(country)}
          </span>
        )
      }
      {...rest}
    />
  );
}
