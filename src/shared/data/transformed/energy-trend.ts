import type { EnergyPeriod, ResourceTrendPoint } from './types';

export const energyTrend: Record<EnergyPeriod, ResourceTrendPoint[]> = {
  month: [
    { label: 'Январь', value: 11299.6, unit: 'млн кВт·ч' },
    { label: 'Февраль', value: 10999.6, unit: 'млн кВт·ч' },
    { label: 'Март', value: 9999.7, unit: 'млн кВт·ч' },
    { label: 'Апрель', value: 8999.7, unit: 'млн кВт·ч' },
    { label: 'Май', value: 8499.7, unit: 'млн кВт·ч' },
    { label: 'Июнь', value: 8699.7, unit: 'млн кВт·ч' },
    { label: 'Июль', value: 9099.7, unit: 'млн кВт·ч' },
    { label: 'Август', value: 8999.7, unit: 'млн кВт·ч' },
    { label: 'Сентябрь', value: 9199.7, unit: 'млн кВт·ч' },
    { label: 'Октябрь', value: 9799.7, unit: 'млн кВт·ч' },
    { label: 'Ноябрь', value: 10599.6, unit: 'млн кВт·ч' },
    { label: 'Декабрь', value: 11199.6, unit: 'млн кВт·ч' },
  ],
  year: [
    { label: '2019', value: 103900, unit: 'млн кВт·ч' },
    { label: '2020', value: 105300, unit: 'млн кВт·ч' },
    { label: '2021', value: 110200, unit: 'млн кВт·ч' },
    { label: '2022', value: 112944, unit: 'млн кВт·ч' },
    { label: '2023', value: 115068, unit: 'млн кВт·ч' },
    { label: '2024', value: 119996, unit: 'млн кВт·ч' },
    { label: '2025', value: 124607, unit: 'млн кВт·ч' },
  ],
};
