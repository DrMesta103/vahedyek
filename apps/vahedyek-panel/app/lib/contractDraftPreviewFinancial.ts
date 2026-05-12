import type { ContractFinancialData } from '../types/contract';
import { computeContractTotalRialFromFinancial } from './contractFinancialPricing';

const FIXED_FINANCIAL_COLORS = {
  advance: '#f2c94c',
  installment: '#1e3a8a',
  loan: '#f97316',
  document: '#6cabdd',
  handover: '#8b5cf6',
} as const;

const OTHER_FINANCIAL_COLORS = ['#0f766e', '#e11d48', '#0891b2', '#65a30d', '#db2777', '#475569', '#14b8a6', '#dc2626'];

export type FinancialSlice = { id: string; name: string; value: number; color: string };

function getFinancialSliceKind(item: { id: string; name: string }) {
  if (item.id === 'advance' || item.name.includes('پیش پرداخت') || item.name.includes('پیش‌پرداخت')) return 'advance';
  if (item.id === 'installment' || item.name.includes('اقساط')) return 'installment';
  if (item.id === 'document' || item.name.includes('تحویل سند')) return 'document';
  if (item.id === 'handover' || item.name.includes('تحویل واحد')) return 'handover';
  if (item.id.includes('loan') || item.name.includes('وام')) return 'loan';
  return 'other';
}

export function computeContractTotalRial(data: ContractFinancialData | null): number {
  return computeContractTotalRialFromFinancial(data);
}

export function buildFinancialSlices(data: ContractFinancialData | null): FinancialSlice[] {
  if (!data?.categories?.length) return [];
  let otherColorIndex = 0;

  return data.categories
    .filter((item) => item.capAmount > 0)
    .map((item) => {
      const kind = getFinancialSliceKind(item);
      const color =
        kind === 'other' ? OTHER_FINANCIAL_COLORS[otherColorIndex++ % OTHER_FINANCIAL_COLORS.length] : FIXED_FINANCIAL_COLORS[kind];

      return {
        id: item.id,
        name: item.name,
        value: item.capAmount,
        color,
      };
    });
}
