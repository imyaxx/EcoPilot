import { type ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <I18nProvider>{children}</I18nProvider>;
}
