import type { UtilityTariff } from './types';

export const utilityTariffs: UtilityTariff[] = [
  {
    utilityType: 'electricity',
    label: 'Electricity tariff for budget organizations',
    price: 111.72,
    unit: 'kWh',
    currency: 'KZT',
    sourceLabel: 'EnergoSbyt Almaty, 2026',
  },
  {
    utilityType: 'water',
    label: 'Water tariff baseline',
    price: 103.0,
    unit: 'm³',
    currency: 'KZT',
    sourceLabel: 'Almaty Su, 2025',
  },
];