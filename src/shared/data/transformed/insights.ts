import type { SystemInsight } from './types';

export const systemInsights: SystemInsight[] = [
  {
    id: 'water-usage-spike-zone-b',
    title: 'Water usage spike detected',
    description: "Zone B water consumption increased 23% compared to last week's average.",
    severity: 'warning',
    category: 'water',
  },
  {
    id: 'unusual-night-energy-usage',
    title: 'Unusual night energy usage',
    description: 'HVAC systems ran 4.2 hours longer than scheduled between 11 PM and 5 AM.',
    severity: 'critical',
    category: 'energy',
  },
  {
    id: 'cooling-inefficiency-zone-a',
    title: 'Cooling inefficiency in Zone A',
    description: 'Temperature differential suggests a possible air leak near the east corridor.',
    severity: 'info',
    category: 'efficiency',
  },
];