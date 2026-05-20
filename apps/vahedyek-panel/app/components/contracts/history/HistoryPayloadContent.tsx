'use client';

import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixDeliveryDatePayload,
  AppendixLoanPayload,
  AppendixPartiesPayload,
  AppendixSideCostsPayload,
  AppendixTagKey,
  ContractParty,
  FinancialCategoryData,
  FinancialDueItemData,
} from '../../../types/contract';
import { formatHistoryMoney } from './historyFormat';

export function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, val]) => `${key}:${stableSerialize(val)}`).join(',')}}`;
  }
  return String(value ?? '');
}

export function isSameHistoryPayload(a: Record<string, unknown>, b: Record<string, unknown>) {
  return stableSerialize(a) === stableSerialize(b);
}

function renderValueRow(label: string, value: string, accent = false) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/80 bg-white px-4 py-2.5">
      <div className={`min-w-0 text-right text-[12px] font-semibold ${accent ? 'text-slate-900' : 'text-slate-700'}`}>{value || '—'}</div>
      <div className="shrink-0 text-[11px] font-bold text-slate-400">{label}</div>
    </div>
  );
}

function renderPartyList(parties: ContractParty[]) {
  if (!parties.length) return renderValueRow('طرفین', '—');
  return (
    <div className="space-y-2">
      {parties.map((party, index) => (
        <div key={`${party.personId}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/80 bg-white px-4 py-2.5">
          <div className="min-w-0 text-right text-[12px] font-semibold text-slate-700">
            {party.name} ({party.share?.value ?? 0} {party.share?.mode === 'percent' ? 'درصد' : 'دانگ'})
          </div>
          <div className="shrink-0 text-[11px] font-bold text-slate-400">{index === 0 ? 'طرف قرارداد' : `شریک ${index.toLocaleString('fa-IR')}`}</div>
        </div>
      ))}
    </div>
  );
}

function renderDueItems(dueItems: FinancialDueItemData[]) {
  if (!dueItems.length) return null;
  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-3">
      <div className="mb-2 text-right text-[11px] font-black text-slate-500">سررسیدها</div>
      <div className="space-y-2">
        {dueItems.map((item) => (
          <div key={item.id} className="grid gap-2 rounded-2xl bg-white px-4 py-3">
            {renderValueRow('عنوان', item.title || '—')}
            {renderValueRow('مبلغ', formatHistoryMoney(item.amount))}
            {renderValueRow('تاریخ سررسید', item.dueDate || '—')}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderFinancialCategories(categories: FinancialCategoryData[]) {
  const visible = categories.filter((item) => Number(item.capAmount ?? 0) > 0 || Number(item.dueAmount ?? 0) > 0 || Number(item.noDueAmount ?? 0) > 0);
  if (!visible.length) return renderValueRow('ردیف مالی', 'موردی ثبت نشده است.');
  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <div key={item.id} className="grid gap-2 rounded-2xl bg-white px-4 py-3">
          {renderValueRow('عنوان ردیف', item.name || '—', true)}
          {renderValueRow('سقف مبلغ', formatHistoryMoney(item.capAmount))}
          {renderValueRow('مبلغ سررسیددار', formatHistoryMoney(item.dueAmount))}
          {renderValueRow('مبلغ بدون سررسید', formatHistoryMoney(item.noDueAmount))}
        </div>
      ))}
    </div>
  );
}

function renderDeliveryPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixDeliveryDatePayload & { deliveryDate?: string };
  return (
    <div className="space-y-2">
      {renderValueRow('تاریخ قبلی', String(row.previousDate ?? row.deliveryDate ?? '—'))}
      {renderValueRow('تاریخ جدید', String(row.nextDate ?? row.deliveryDate ?? '—'), true)}
      {String(row.reason ?? '').trim() ? renderValueRow('توضیحات', String(row.reason)) : null}
    </div>
  );
}

function renderPartiesPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixPartiesPayload;
  const parties = Array.isArray(row.parties) ? row.parties : [];
  return renderPartyList(parties);
}

function renderLoanPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixLoanPayload;
  const statusLabel =
    row.paymentStatus === 'full'
      ? 'پرداخت کامل'
      : row.paymentStatus === 'less'
        ? 'پرداخت کمتر از مبلغ قرارداد'
        : row.paymentStatus === 'more'
          ? 'پرداخت بیشتر از مبلغ قرارداد'
          : row.paymentStatus === 'none'
            ? 'بدون پرداخت'
            : 'مشخص نشده';

  return (
    <div className="space-y-2">
      {renderValueRow('وضعیت پرداخت', statusLabel, true)}
      {renderValueRow('مبلغ وام قرارداد', formatHistoryMoney(row.contractLoanAmount))}
      {renderValueRow('مبلغ وام', formatHistoryMoney(row.loanAmount))}
      {renderValueRow('بانک عامل', row.selectedBank || '—')}
      {renderValueRow(
        'زمان دریافت',
        row.loanTiming === 'before-contract'
          ? 'تاریخ دریافت وام قبل از انعقاد قرارداد است'
          : row.loanTiming === 'dated'
            ? 'وام دریافت نشده اما تاریخ مشخص دارد'
            : 'تاریخ وام همزمان با عقد قرارداد الحاقیه میباشد',
      )}
      {row.loanReceivedDate ? renderValueRow('تاریخ دریافت', row.loanReceivedDate) : null}
      {row.loanGracePeriodValue
        ? renderValueRow('مهلت تنفس', `${row.loanGracePeriodValue} ${row.loanGracePeriodUnit === 'day' ? 'روز' : 'ماه'}`)
        : null}
      {renderValueRow(
        'نرخ سود وام',
        row.loanBankInterestEnabled ? 'برابر سیاست های بانکی در زمان دریافت وام' : row.loanBankInterestRate ? `${row.loanBankInterestRate}%` : '—',
      )}
      {renderValueRow(
        'کارمزد وام بانکی',
        row.loanBankFeeBankPolicyEnabled
          ? 'برابر سیاست های بانکی در زمان دریافت وام'
          : row.loanBankFeeValue
            ? row.loanBankFeeMode === 'percent'
              ? `${row.loanBankFeeValue}%`
              : row.loanBankFeeMode === 'combined'
                ? `${row.loanBankFeeValue} ترکیبی`
                : `${row.loanBankFeeValue} مبلغ ثابت`
            : '—',
      )}
      {renderValueRow('پرداخت کارمزد وام بانکی', row.loanBankFeePayer === 'seller' ? 'با سازنده است' : 'با خریدار است')}
      {renderValueRow(
        'سود دوران مشارکت',
        row.loanParticipationBankPolicyEnabled ? 'برابر سیاست های بانکی در زمان دریافت وام' : row.loanParticipationRate ? `${row.loanParticipationRate}%` : '—',
      )}
      {renderValueRow('پرداخت سود دوران مشارکت', row.loanParticipationPayer === 'seller' ? 'با سازنده است' : 'با خریدار است')}
      {renderValueRow(
        'هزینه کارشناسی',
        row.loanExpertBankPolicyEnabled ? 'برابر سیاست های بانکی در زمان دریافت وام' : row.loanExpertRate ? `${row.loanExpertRate}%` : '—',
      )}
      {renderValueRow('پرداخت هزینه کارشناسی', row.loanExpertPayer === 'seller' ? 'با سازنده است' : 'با خریدار است')}
      {renderValueRow(
        'هزینه اوراق حق تقدم',
        row.loanPriorityBondBankPolicyEnabled ? 'برابر سیاست های بانکی در زمان دریافت وام' : row.loanPriorityBondRate ? `${row.loanPriorityBondRate}%` : '—',
      )}
      {renderValueRow('پرداخت هزینه اوراق حق تقدم', row.loanPriorityBondPayer === 'seller' ? 'با سازنده است' : 'با خریدار است')}
      {renderValueRow(
        'تخفیف وام',
        row.loanDiscountEnabled
          ? row.loanDiscountMode === 'percent'
            ? `${row.loanDiscountMinValue || '0'} تا ${row.loanDiscountMaxValue || '0'} درصد`
            : `${row.loanDiscountMinValue || '0'} تا ${row.loanDiscountMaxValue || '0'} مبلغ`
          : 'غیر مجاز',
      )}
      {row.loanDiscountConditionEnabled ? renderValueRow('شرط تخفیف', 'فعال') : null}
      {renderValueRow(
        'بخشودگی وام',
        row.loanForgivenessEnabled
          ? row.loanForgivenessMode === 'percent'
            ? `${row.loanForgivenessMinValue || '0'} تا ${row.loanForgivenessMaxValue || '0'} درصد`
            : `${row.loanForgivenessMinValue || '0'} تا ${row.loanForgivenessMaxValue || '0'} مبلغ`
          : 'غیر مجاز',
      )}
      {row.loanRemainingDebtPrepaymentAmount
        ? renderValueRow('پیش پرداخت مانده بدهی وام', `${row.loanRemainingDebtPrepaymentAmount} ریال`)
        : null}
      {row.loanRemainingDebtInstallmentAmount
        ? renderValueRow('اقساط مانده بدهی وام', `${row.loanRemainingDebtInstallmentAmount} ریال`)
        : null}
      {row.loanRemainingDebtUnitDeliveryAmount
        ? renderValueRow('مانده بدهی در تحویل واحد', `${row.loanRemainingDebtUnitDeliveryAmount} ریال`)
        : null}
      {row.loanRemainingDebtDocumentDeliveryAmount
        ? renderValueRow('مانده بدهی در تحویل سند', `${row.loanRemainingDebtDocumentDeliveryAmount} ریال`)
        : null}
      {renderValueRow(
        'زمان بازپرداخت',
        row.repaymentTiming === 'before-contract-started'
          ? 'قبل از عقد قرارداد، بازپرداخت وام شروع شده'
          : row.repaymentTiming === 'with-appendix-contract'
            ? 'همزمان با عقد الحاقیه قرارداد شروع میشود'
            : row.repaymentTiming === 'with-contract-bank-installments'
              ? 'همزمان با عقد قرارداد وام با بانک پرداخت اقساط شروع میشود'
              : 'تاریخ مشخصی ندارد',
      )}
      {row.repaymentTiming === 'before-contract-started'
        ? renderValueRow('اقساط پرداخت شده تا زمان عقد قرارداد', row.repaymentSettledBy === 'buyer' ? 'با خریدار است' : 'با سازنده است')
        : null}
      {row.repaymentTiming === 'before-contract-started' && row.repaymentFirstInstallmentDate
        ? renderValueRow('تاریخ شروع اولین قسط', row.repaymentFirstInstallmentDate)
        : null}
    </div>
  );
}

function renderFinancialPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixAdjustmentPayload | AppendixContractBaseCostsPayload | AppendixSideCostsPayload;
  const categories = Array.isArray(row.categories) ? row.categories : [];
  const dueItems = Array.isArray(row.dueItems) ? row.dueItems : [];

  return (
    <div className="space-y-3">
      {renderFinancialCategories(categories)}
      {renderDueItems(dueItems)}
    </div>
  );
}

function renderGenericPayload(payload: Record<string, unknown>) {
  const entries = Object.entries(payload ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!entries.length) return renderValueRow('محتوا', '—');
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => renderValueRow(key, typeof value === 'string' ? value : JSON.stringify(value)))}
    </div>
  );
}

export function HistoryPayloadContent({ payload, tagKey }: { payload: Record<string, unknown>; tagKey: AppendixTagKey }) {
  if (tagKey === 'unit-delivery-date') return renderDeliveryPayload(payload);
  if (tagKey === 'first-party' || tagKey === 'second-party') return renderPartiesPayload(payload);
  if (tagKey === 'loan') return renderLoanPayload(payload);
  if (tagKey === 'adjustment' || tagKey === 'contract-base-costs' || tagKey === 'side-costs') return renderFinancialPayload(payload);
  return renderGenericPayload(payload);
}
