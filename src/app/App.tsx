import { AppProviders } from './providers';
import { DashboardPage } from '../pages/dashboard';

import './styles/base.css';

export function App() {
  return (
    <AppProviders>
      <DashboardPage />
    </AppProviders>
  );
}
