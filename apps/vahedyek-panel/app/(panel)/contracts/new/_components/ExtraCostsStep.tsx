'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Input, StickySubmitBar } from '@repo/ui';
import { ensureActiveDraftId, getStepData } from '../../../../lib/contractDraftClient';
import { computeContractTotalRialFromFinancial } from '../../../../lib/contractFinancialPricing';
import type { ContractFinancialData } from '../../../../types/contract';
import { getContractExtraCosts, upsertContractExtraCosts, type ContractRelatedExpense, type ContractRelatedExpenseCalculationMethod, type ContractRelatedExpenseType } from '../../../../actions/contractSteps789';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { BusinessSwitch, FieldGroup, SectionCard, SectionHeader, TagPills } from './ContractFormPrimitives';

type ExpenseUiState = ContractRelatedExpense & { enabled: boolean };

const EXPENSE_DEFS: Array<{ type: ContractRelatedExpenseType; title: string }> = [
  { type: 'COMMISSION', title: 'کمیسیون فروش' },
  { type: 'NOTARY', title: 'هزینه دفترخانه' },
  { type: 'LEGAL', title: 'هزینه وکالت' },
] as const;

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toNumberOrZero(raw: string) {
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function computeContractTotal(financial: ContractFinancialData | null) {
  return computeContractTotalRialFromFinancial(financial);
}

function formatFaNumber(value: number) {
  try {
    return new Intl.NumberFormat('fa-IR').format(value);
  } catch {
    return String(value);
  }
}

function normalizeInitial(remote: ContractRelatedExpense[] | null): ExpenseUiState[] {
  const list = Array.isArray(remote) ? remote : [];
  const byType = new Map(list.map((item) => [item.type, item]));

  return EXPENSE_DEFS.map((def) => {
    const existing = byType.get(def.type);
    const buyer = clampPercent(existing?.buyerSharePercentage ?? 50);
    const seller = 100 - buyer;
    const method: ContractRelatedExpenseCalculationMethod = existing?.calculationMethod ?? 'AMOUNT';
    const totalValue = Number.isFinite(existing?.totalValue) ? Number(existing?.totalValue) : 0;
    const sellerName = existing?.sellerName ?? '';

    return {
      type: def.type,
      enabled: Boolean(existing),
      calculationMethod: method,
      totalValue,
      buyerSharePercentage: buyer,
      sellerSharePercentage: seller,
      sellerName,
    };
  });
}

function buildPayload(items: ExpenseUiState[]): ContractRelatedExpense[] {
  return items
    .filter((i) => i.enabled)
    .map((i) => ({
      type: i.type,
      calculationMethod: i.calculationMethod,
      totalValue: Number(i.totalValue || 0),
      buyerSharePercentage: clampPercent(i.buyerSharePercentage),
      sellerSharePercentage: 100 - clampPercent(i.buyerSharePercentage),
      sellerName: (i.sellerName ?? '').trim(),
    }));
}

function ExpenseSection({
  state,
  title,
  contractTotal,
  onChange,
}: {
  state: ExpenseUiState;
  title: string;
  contractTotal: number;
  onChange: (next: ExpenseUiState) => void;
}) {
  const percentageAmount = state.calculationMethod === 'PERCENTAGE' ? (contractTotal * (Number(state.totalValue || 0) / 100)) : 0;

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[14px] font-extrabold text-slate-900">{title}</div>
          <div className="text-[12px] text-slate-500">
            مقدار هزینه و نحوه تقسیم آن بین خریدار و فروشنده را مشخص کنید.
          </div>
        </div>
        <BusinessSwitch
          checked={state.enabled}
          onChange={(enabled) => onChange({ ...state, enabled })}
          onLabel="فعال"
          offLabel="غیرفعال"
        />
      </div>

      {state.enabled ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <FieldGroup label="روش محاسبه">
              <TagPills
                options={[
                  { value: 'AMOUNT', label: 'مبلغ' },
                  { value: 'PERCENTAGE', label: 'درصد' },
                ]}
                value={state.calculationMethod}
                onChange={(value) => onChange({ ...state, calculationMethod: value as ContractRelatedExpenseCalculationMethod })}
              />
            </FieldGroup>

            <FieldGroup
              label={state.calculationMethod === 'AMOUNT' ? 'مبلغ هزینه' : 'درصد از مبلغ قرارداد'}
            >
              <div className="flex items-center gap-2">
                <Input
                  value={state.totalValue ? String(state.totalValue) : ''}
                  onChange={(e) => onChange({ ...state, totalValue: toNumberOrZero(e.target.value) })}
                  inputMode="decimal"
                  dir="ltr"
                  placeholder="0"
                />
                <span className="text-[12px] font-bold text-slate-500">{state.calculationMethod === 'AMOUNT' ? 'تومان' : '%'}</span>
              </div>
              {state.calculationMethod === 'AMOUNT' ? (
                <div className="mt-2 text-[11px] text-slate-400">
                  مبلغ وارد شده: {formatFaNumber(Math.round(Number(state.totalValue || 0)))} تومان
                </div>
              ) : null}
              {state.calculationMethod === 'PERCENTAGE' ? (
                <div className="mt-2 text-[11px] text-slate-400">
                  برآورد مبلغ: {formatFaNumber(Math.round(percentageAmount))} تومان
                </div>
              ) : null}
            </FieldGroup>
          </div>

          <div className="rounded-[8px] border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-3 text-[13px] font-extrabold text-slate-700">تقسیم هزینه</div>
            <div className="grid gap-4 md:grid-cols-3">
              <FieldGroup label="سهم خریدار (%)">
                <Input
                  value={String(state.buyerSharePercentage)}
                  onChange={(e) => {
                    const buyer = clampPercent(toNumberOrZero(e.target.value));
                    onChange({ ...state, buyerSharePercentage: buyer, sellerSharePercentage: 100 - buyer });
                  }}
                  inputMode="numeric"
                  dir="ltr"
                />
              </FieldGroup>

              <FieldGroup label="سهم فروشنده (%)">
                <Input
                  value={String(state.sellerSharePercentage)}
                  onChange={(e) => {
                    const seller = clampPercent(toNumberOrZero(e.target.value));
                    const buyer = 100 - seller;
                    onChange({ ...state, sellerSharePercentage: seller, buyerSharePercentage: buyer });
                  }}
                  inputMode="numeric"
                  dir="ltr"
                />
              </FieldGroup>

              <FieldGroup label="به نام (سهم فروشنده)" hint="نام شخص/شرکت دریافت‌کننده یا پرداخت‌کننده سهم فروشنده">
                <Input
                  value={state.sellerName}
                  onChange={(e) => onChange({ ...state, sellerName: e.target.value })}
                  placeholder="مثال: دفترخانه..."
                />
              </FieldGroup>
            </div>

            <div className="mt-3 text-[11px] text-slate-400">
              جمع سهم‌ها باید ۱۰۰٪ باشد. با تغییر یکی، دیگری خودکار تنظیم می‌شود.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ExtraCostsStep({ title }: { title: string }) {
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [contractTotal, setContractTotal] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseUiState[]>(() => normalizeInitial(null));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [remote, financial] = await Promise.all([
          getContractExtraCosts(id),
          getStepData<ContractFinancialData>(id, 'financial').catch(() => null),
        ]);
        if (!mounted) return;
        setDraftId(id);
        setContractTotal(computeContractTotal(financial));
        if (remote.ok) {
          setExpenses(normalizeInitial(remote.payload));
        } else {
          setFormError('message' in remote ? remote.message : 'بارگذاری اطلاعات انجام نشد.');
          setExpenses(normalizeInitial(null));
        }
      } catch (error) {
        if (mounted) setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const payload = useMemo(() => buildPayload(expenses), [expenses]);
  const snapshot = useMemo(() => JSON.stringify(payload), [payload]);

  useEffect(() => {
    if (loading) return;
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty('extraCosts', false);
      return;
    }
    dispatchContractFlowDirty('extraCosts', snapshot !== initialSnapshotRef.current);
  }, [loading, snapshot]);

  const handleSubmit = async () => {
    if (!draftId) return;
    setSaving(true);
    setFormError('');
    try {
      const remote = await upsertContractExtraCosts(draftId, payload);
      if (!remote.ok) throw new Error('message' in remote ? remote.message : 'ذخیره اطلاعات انجام نشد.');
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty('extraCosts', false);
      dispatchContractFlowSavedForDraft(draftId, 'extraCosts', Date.now(), payload);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره اطلاعات انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {formError ? (
        <div className="flex items-start gap-2.5 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      <SectionCard>
        <SectionHeader
          label={title}
          description="هزینه‌های مرتبط با انعقاد قرارداد (کمیسیون، دفترخانه و وکالت) را مشخص کنید. هر هزینه می‌تواند مبلغ ثابت یا درصدی از مبلغ کل قرارداد باشد و بین خریدار و فروشنده تقسیم شود."
        />

        <div className="space-y-4 px-5 py-4">
          {EXPENSE_DEFS.map((def) => {
            const item = expenses.find((e) => e.type === def.type)!;
            return (
              <ExpenseSection
                key={def.type}
                state={item}
                title={def.title}
                contractTotal={contractTotal}
                onChange={(next) => setExpenses((current) => current.map((c) => (c.type === def.type ? next : c)))}
              />
            );
          })}
        </div>
      </SectionCard>

      <StickySubmitBar
        label="ذخیره هزینه‌های قرارداد"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving || !draftId}
        onClick={handleSubmit}
        submitId="extraCosts"
        embedded
      />
    </div>
  );
}


