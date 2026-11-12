import { useState, type SubmitEvent } from 'react';
import Logo from '@/shared/assets/logo.svg?react';
import { Button, IconButton, TextField } from '@/shared/ui';
import { useLogin, type LoginInput } from '../api/useLogin';
import { toLoginErrors, validateLogin, type LoginErrors } from '../model/loginErrors';
import styles from './LoginPage.module.scss';

export function LoginPage() {
  const [values, setValues] = useState<LoginInput>({ idInstance: '', apiTokenInstance: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showToken, setShowToken] = useState(false);
  const login = useLogin();

  function handleChange(field: keyof LoginInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
    };
    const validation = validateLogin(input);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    login.mutate(input, { onError: (error) => setErrors(toLoginErrors(error)) });
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
            value={values.idInstance}
            error={errors.idInstance}
            onChange={(event) => handleChange('idInstance', event.target.value)}
          />
          <TextField
            label="apiTokenInstance"
            type={showToken ? 'text' : 'password'}
            autoComplete="current-password"
            value={values.apiTokenInstance}
            error={errors.apiTokenInstance}
            onChange={(event) => handleChange('apiTokenInstance', event.target.value)}
            endAdornment={
              <IconButton
                icon={showToken ? 'eyeOff' : 'eye'}
                label={showToken ? 'Hide token' : 'Show token'}
                onClick={() => setShowToken((value) => !value)}
              />
            }
          />
        </div>
        <Button type="submit" fullWidth loading={login.isPending} className={styles.submit}>
          Next
        </Button>
        {errors.form && (
          <p className={styles.formError} role="alert">
            {errors.form}
          </p>
        )}
      </form>
    </div>
  );
}
