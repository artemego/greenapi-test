import { QueryProvider } from './providers/QueryProvider';
import { AppRouter } from './router/AppRouter';
import './styles/index.scss';

export function App() {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  );
}
