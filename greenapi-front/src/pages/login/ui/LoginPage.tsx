import { useState, type SubmitEvent } from 'react';
import Logo from '@/shared/assets/logo.svg?react';
import { Button, IconButton, TextField } from '@/shared/ui';
import styles from './LoginPage.module.scss';

export function LoginPage() {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [showToken, setShowToken] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Logo className={styles.logo} aria-hidden />
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.note}>
          Enter the idInstance and apiTokenInstance of your Telegram instance. You can find them in
          the{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            GREEN-API console
          </a>
          .
        </p>
        <div className={styles.fields}>
          <TextField
            label="idInstance"
            inputMode="numeric"
            autoComplete="username"
            autoFocus
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
          />
          <TextField
            label="apiTokenInstance"
            type={showToken ? 'text' : 'password'}
            autoComplete="current-password"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            endAdornment={
              <IconButton
                icon={showToken ? 'eyeOff' : 'eye'}
                label={showToken ? 'Hide token' : 'Show token'}
                onClick={() => setShowToken((value) => !value)}
              />
            }
          />
        </div>
        <Button type="submit" fullWidth className={styles.submit}>
          Next
        </Button>
      </form>
    </div>
  );
}
