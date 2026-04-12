import type { ResourceTrendPoint, WaterPeriod } from './types';

export const waterTrend: Record<WaterPeriod, ResourceTrendPoint[]> = {
  year: [
    { label: '2019', value: 143.1, unit: 'млн м³' },
    { label: '2020', value: 148.0, unit: 'млн м³' },
    { label: '2021', value: 172.0, unit: 'млн м³' },
    { label: '2022', value: 185.0, unit: 'млн м³' },
    { label: '2023', value: 196.0, unit: 'млн м³' },
    { label: '2024', value: 234.0, unit: 'млн м³' },
  ],
};
