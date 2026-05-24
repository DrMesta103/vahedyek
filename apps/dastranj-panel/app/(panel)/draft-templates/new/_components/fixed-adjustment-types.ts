export type FixedAdjustmentItemType = 'addition' | 'deduction';

export type FixedAdjustmentCalculationMethod = 'fixed_amount' | 'base_coefficient';

export type FixedAdjustmentItem = {
  id: string;
  title: string;
  itemType: FixedAdjustmentItemType;
  calculationMethod: FixedAdjustmentCalculationMethod;
  amount: string;
  coefficient: string;
  insurance: boolean;
  tax: boolean;
  inBase: boolean;
};

export function createEmptyFixedAdjustment(itemType: FixedAdjustmentItemType): FixedAdjustmentItem {
  return {
    id: crypto.randomUUID(),
    title: '',
    itemType,
    calculationMethod: 'fixed_amount',
    amount: '',
    coefficient: '',
    insurance: true,
    tax: true,
    inBase: false,
  };
}

export function parseFixedAdjustments(value: unknown): FixedAdjustmentItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is FixedAdjustmentItem => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Partial<FixedAdjustmentItem>;
    return (
      typeof row.id === 'string' &&
      typeof row.title === 'string' &&
      (row.itemType === 'addition' || row.itemType === 'deduction') &&
      (row.calculationMethod === 'fixed_amount' || row.calculationMethod === 'base_coefficient')
    );
  });
}
