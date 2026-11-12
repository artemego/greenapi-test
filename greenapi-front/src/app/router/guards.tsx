import { Navigate, Outlet } from 'react-router';
import { useMe } from '@/shared/api';
import { Button, Spinner } from '@/shared/ui';
import styles from './guards.module.scss';

function Splash({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className={styles.splash}>
      {onRetry ? (
        <>
          <p className={styles.message}>Can't reach the server</p>
          <Button variant="text" onClick={onRetry}>
            Retry
          </Button>
        </>
      ) : (
        <Spinner size="large" />
      )}
    </div>
  );
}

export function RequireAuth() {
  const { data: me, isPending, isError, refetch } = useMe();
  if (isPending) return <Splash />;
  if (isError) return <Splash onRetry={() => refetch()} />;
  if (!me) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const { data: me, isPending } = useMe();
  if (isPending) return <Splash />;
  if (me) return <Navigate to="/" replace />;
  return <Outlet />;
}
