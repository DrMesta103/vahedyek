import type { AreaPricingMode, ContractFinancialData } from '../types/contract';

export const DEFAULT_AREA_PRICING_MODE: AreaPricingMode = 'unit-only';

export function normalizeAreaPricingMode(value: string | null | undefined): AreaPricingMode {
  if (
    value === 'unit-plus-parking' ||
    value === 'unit-plus-storage' ||
    value === 'unit-plus-storage-parking' ||
    value === 'unit-only'
  ) {
    return value;
  }
  return DEFAULT_AREA_PRICING_MODE;
}

export function getAreaPricingModePresentation(mode: AreaPricingMode) {
  switch (mode) {
    case 'unit-plus-parking':
      return {
        label: 'واحد + پارکینگ',
        hint: '',
      };
    case 'unit-plus-storage':
      return {
        label: 'واحد + انبار',
        hint: '',
      };
    case 'unit-plus-storage-parking':
      return {
        label: 'واحد + انبار + پارکینگ',
        hint: '',
      };
    default:
      return {
        label: 'فقط واحد',
        hint: '',
      };
  }
}

export function getAreaPricingModeConfig(mode: AreaPricingMode) {
  return {
    includeParkingInBase: mode === 'unit-plus-parking' || mode === 'unit-plus-storage-parking',
    includeStorageInBase: mode === 'unit-plus-storage' || mode === 'unit-plus-storage-parking',
  };
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}

export function computeMeteredContractTotal(data: {
  areaPricingMode?: AreaPricingMode | string | null;
  unitArea?: string | number | null;
  parkingArea?: string | number | null;
  storageArea?: string | number | null;
  pricePerMeter?: string | number | null;
  parkingPricePerMeter?: string | number | null;
  storagePricePerMeter?: string | number | null;
}) {
  const areaPricingMode = normalizeAreaPricingMode(data.areaPricingMode);
  const unitArea = toNumber(data.unitArea);
  const parkingArea = toNumber(data.parkingArea);
  const storageArea = toNumber(data.storageArea);
  const pricePerMeter = toNumber(data.pricePerMeter);
  const parkingPricePerMeter = toNumber(data.parkingPricePerMeter);
  const storagePricePerMeter = toNumber(data.storagePricePerMeter);
  const config = getAreaPricingModeConfig(areaPricingMode);
  const baseArea =
    unitArea +
    (config.includeParkingInBase ? parkingArea : 0) +
    (config.includeStorageInBase ? storageArea : 0);

  return (
    baseArea * pricePerMeter +
    (config.includeParkingInBase ? 0 : parkingArea * parkingPricePerMeter) +
    (config.includeStorageInBase ? 0 : storageArea * storagePricePerMeter)
  );
}

export function computeFixedContractTotal(data: {
  areaPricingMode?: AreaPricingMode | string | null;
  fixedTotalAmount?: string | number | null;
  parkingFixedAmount?: string | number | null;
  storageFixedAmount?: string | number | null;
}) {
  const areaPricingMode = normalizeAreaPricingMode(data.areaPricingMode);
  const fixedTotalAmount = toNumber(data.fixedTotalAmount);
  const parkingFixedAmount = toNumber(data.parkingFixedAmount);
  const storageFixedAmount = toNumber(data.storageFixedAmount);
  const config = getAreaPricingModeConfig(areaPricingMode);

  return (
    fixedTotalAmount +
    (config.includeParkingInBase ? 0 : parkingFixedAmount) +
    (config.includeStorageInBase ? 0 : storageFixedAmount)
  );
}

export function computeContractTotalRialFromFinancial(data: ContractFinancialData | null) {
  if (!data) return 0;
  if (data.pricingType === 'metered') return computeMeteredContractTotal(data);
  return computeFixedContractTotal(data);
}
