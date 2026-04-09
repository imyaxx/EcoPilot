import { useTranslation } from 'react-i18next';
import { Leaf } from '@phosphor-icons/react';
import { AppProviders } from './providers';
import { Button, Badge, Card, CardHeader, CardBody, SkeletonText, SkeletonCard } from '../shared/ui';

import './styles/base.css';

function DashboardPreview() {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-8)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Leaf size={28} weight="duotone" color="var(--color-brand-primary)" />
          {t('dashboard:title')}
        </h1>
        <p className="body-small" style={{ marginTop: 'var(--space-2)' }}>
          {t('dashboard:subtitle')}
        </p>
      </header>

      <section style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <Badge variant="success">{t('dashboard:status.optimal')}</Badge>
        <Badge variant="warning">{t('dashboard:status.warning')}</Badge>
        <Badge variant="danger">{t('dashboard:status.critical')}</Badge>
        <Badge variant="neutral">{t('common:status.offline')}</Badge>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <Card>
          <CardHeader title={t('dashboard:totalEnergy')} />
          <CardBody>
            <span className="metric-large" style={{ color: 'var(--color-energy)' }}>2,847</span>
            <span className="body-small" style={{ marginLeft: 'var(--space-2)' }}>{t('common:units.kwh')}</span>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('dashboard:totalWater')} />
          <CardBody>
            <span className="metric-large" style={{ color: 'var(--color-water)' }}>1,203</span>
            <span className="body-small" style={{ marginLeft: 'var(--space-2)' }}>{t('common:units.cubicMeters')}</span>
          </CardBody>
        </Card>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <SkeletonCard height="140px" />
        <SkeletonCard height="140px" />
      </section>

      <section style={{ marginBottom: 'var(--space-6)' }}>
        <Card padding="spacious">
          <CardHeader title={t('common:loading')} />
          <CardBody>
            <SkeletonText lines={3} />
          </CardBody>
        </Card>
      </section>

      <section style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button variant="primary">{t('dashboard:title')}</Button>
        <Button variant="secondary">{t('common:filter')}</Button>
        <Button variant="ghost">{t('common:reset')}</Button>
        <Button variant="primary" size="small" icon={<Leaf size={16} weight="bold" />} />
      </section>
    </div>
  );
}

export function App() {
  return (
    <AppProviders>
      <DashboardPreview />
    </AppProviders>
  );
}
