'use client';

import { BadgePercent, CircleDollarSign, TrendingUp } from 'lucide-react';
import { ProfileAwareUnitInput } from '../../ProfileAwareUnitInput';
import { ContractRegistrationSwitch, FieldLabel, FinancialAmountInput, LoanSectionCard } from '../../../(panel)/business-settings/_components/LoanSettingsPrimitives';
import { MultiTagPills, TagPills } from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import { BUILDER_PENALTY_MODE_OPTIONS, BUILDER_PENALTY_PERCENT_BASIS_OPTIONS, BUILDER_PENALTY_PERIOD_OPTIONS, BUILDER_PENALTY_SECTION_META, type BuilderPenaltyMode, type BuilderPenaltySectionId } from '../../../lib/builderPenalty';
import {
  MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES,
  MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS,
  MATERIAL_SPECS_CHANGE_OUTCOMES,
  MATERIAL_SPECS_CHANGE_OUTCOME_DETAILS,
  MATERIAL_SPECS_CHANGE_REFERENCE_DETAILS,
  MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS,
  MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENT_DETAILS,
  MATERIAL_SPECS_CHANGE_TYPE_DETAILS,
  MATERIAL_SPECS_CHANGE_TYPES,
  parseStoredStringList,
  toggleStoredStringList,
} from '../../../lib/materialSpecsChangeRule';
import { sanitizeDecimalInput, sanitizePositiveIntegerInput } from '../../../lib/progressivePenalty';
import type { ContractRuleState } from '../../../lib/businessContractRules';

type AppendixBuilderPenaltySectionProps = {
  sectionId: BuilderPenaltySectionId;
  state: ContractRuleState;
  onChange: (next: ContractRuleState) => void;
};

function updateState(state: ContractRuleState, onChange: (next: ContractRuleState) => void, patch: Partial<ContractRuleState['values']>) {
  onChange({ ...state, values: { ...state.values, ...patch } });
}

function setValue(state: ContractRuleState, onChange: (next: ContractRuleState) => void, key: string, value: string | boolean) {
  updateState(state, onChange, { [key]: value });
}

function formatMoney(value: string) {
  const raw = String(value ?? '').replace(/,/g, '').trim();
  if (!raw) return '';
  const amount = Number(raw.replace(/[^\d.]/g, '')) || 0;
  return amount.toLocaleString('en-US');
}

function ModeCard({
  value,
  active,
  onSelect,
}: {
  value: BuilderPenaltyMode;
  active: boolean;
  onSelect: (mode: BuilderPenaltyMode) => void;
}) {
  const meta = BUILDER_PENALTY_MODE_OPTIONS.find((item) => item.value === value);
  const Icon = value === 'fixed' ? CircleDollarSign : value === 'percent' ? BadgePercent : TrendingUp;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex min-h-[124px] items-center gap-3 rounded-[22px] border px-4 py-4 text-right transition ${
        active ? 'border-cyan-300 bg-cyan-50/80 shadow-[0_4px_18px_rgba(34,211,238,0.10)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
          active ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[14px] font-black leading-6 ${active ? 'text-cyan-900' : 'text-slate-800'}`}>{meta?.label ?? value}</span>
        <span className="mt-1 block text-[12px] font-semibold leading-6 text-slate-500">
          {value === 'fixed'
            ? 'برای هر دوره مبلغ ثابتی ثبت می‌شود.'
            : value === 'percent'
              ? 'جریمه به‌صورت درصدی محاسبه می‌شود.'
              : 'مبلغ جریمه با افزایش مدت تأخیر بیشتر می‌شود.'}
        </span>
      </span>
    </button>
  );
}

function ProgressiveGrid({
  rows,
  values,
  periodLabel,
  onValueChange,
}: {
  rows: Array<{ fromKey: string; toKey: string; rateKey: string }>;
  values: ContractRuleState['values'];
  periodLabel: string;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const getOpenEndedKey = (toKey: string) => toKey.replace(/To$/, 'OpenEnded');
  let nextFrom = 1;

  const normalizedRows = rows.map((row) => {
    const openEndedKey = getOpenEndedKey(row.toKey);
    const to = String(values[row.toKey] ?? '');
    const openEnded = Boolean(values[openEndedKey]);
    const from = String(nextFrom);
    const toNumber = Number(to.replace(/\D/g, ''));
    if (!openEnded && Number.isFinite(toNumber) && toNumber >= nextFrom) nextFrom = toNumber + 1;

    return {
      ...row,
      openEndedKey,
      from,
      to,
      openEnded,
      amount: String(values[row.rateKey] ?? ''),
    };
  });

  const visibleUntil = normalizedRows.findIndex((row) => row.openEnded);
  const visibleRows = visibleUntil >= 0 ? normalizedRows.slice(0, visibleUntil + 1) : normalizedRows;

  const sync = (updates: Partial<Record<string, string | boolean>>) => {
    let from = 1;
    let closed = false;

    normalizedRows.forEach((row) => {
      onValueChange(row.fromKey, String(from));
      if (closed) return;

      const openEnded = Boolean(updates[row.openEndedKey] ?? row.openEnded);
      onValueChange(row.openEndedKey, openEnded);
      if (openEnded) {
        onValueChange(row.toKey, '');
        closed = true;
        return;
      }

      const to = String(updates[row.toKey] ?? row.to).replace(/\D/g, '');
      onValueChange(row.toKey, to);
      const toNumber = Number(to);
      if (Number.isFinite(toNumber) && toNumber >= from) from = toNumber + 1;
    });
  };

  return (
    <div className="space-y-4">
      {visibleRows.map((row, index) => (
        <div key={row.fromKey} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1.25fr_1.75fr]">
          <div className="space-y-2">
            <FieldLabel label={`مبلغ جریمه ${periodLabel} - پله ${index + 1}`} />
            <FinancialAmountInput value={row.amount} onChange={(value) => onValueChange(row.rateKey, value)} suffix="تومان" />
          </div>

          <div className="space-y-2">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,132px)_minmax(0,132px)] sm:justify-end">
              <div className="space-y-2">
                <FieldLabel label="از" />
                <ProfileAwareUnitInput value={row.from} onChange={() => undefined} suffix="روز" numericMode="integer" disabled />
              </div>
              <div className="space-y-2">
                <FieldLabel label="تا" />
                <ProfileAwareUnitInput
                  value={row.to}
                  disabled={row.openEnded}
                  onChange={(value) => sync({ [row.toKey]: value.replace(/\D/g, ''), [row.openEndedKey]: false })}
                  placeholder={row.openEnded ? 'به بعد' : '30'}
                  suffix="روز"
                  numericMode="integer"
                />
              </div>
            </div>

            <label className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
              <input
                type="checkbox"
                checked={row.openEnded}
                onChange={(event) => sync({ [row.openEndedKey]: event.target.checked, [row.toKey]: '' })}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600"
              />
              به بعد
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function BuilderPenaltySectionCard({ sectionId, state, onChange }: AppendixBuilderPenaltySectionProps) {
  const section = BUILDER_PENALTY_SECTION_META[sectionId];
  const enabled = Boolean(state.values[section.stateKey]);
  const activeMode = String(state.values[section.modeKey] ?? 'fixed') as BuilderPenaltyMode;
  const periodLabel = String(state.values[section.periodKey] ?? BUILDER_PENALTY_PERIOD_OPTIONS[0].value);
  const selectedPercentBasis = section.percentBasisKey ? String(state.values[section.percentBasisKey] ?? BUILDER_PENALTY_PERCENT_BASIS_OPTIONS[0]) : '';

  const setSectionValue = (key: string, value: string | boolean) => setValue(state, onChange, key, value);

  const renderCommonFields = () => (
    <div className="space-y-8 p-5 md:p-10">
      <div className="grid gap-3 md:grid-cols-3">
        {BUILDER_PENALTY_MODE_OPTIONS.map((mode) => (
          <ModeCard key={mode.value} value={mode.value} active={activeMode === mode.value} onSelect={(value) => setSectionValue(section.modeKey, value)} />
        ))}
      </div>

      <section className="space-y-5">
        <h5 className="text-right text-[17px] font-black text-slate-800">دوره محاسبه جریمه</h5>
        <p className="text-right text-sm leading-7 text-slate-600">دوره را برای محاسبه جریمه انتخاب کنید.</p>
        <TagPills
          options={BUILDER_PENALTY_PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          value={periodLabel}
          onChange={(value) => setSectionValue(section.periodKey, value)}
          className="justify-end flex-row-reverse"
        />
      </section>

      {activeMode === 'fixed' ? (
        <div className="space-y-3">
          <FieldLabel label="مبلغ ثابت جریمه" />
          <FinancialAmountInput value={String(state.values[section.fixedAmountKey] ?? '')} onChange={(value) => setSectionValue(section.fixedAmountKey, value)} suffix="تومان" />
        </div>
      ) : null}

      {activeMode === 'percent' ? (
        <div className="space-y-4">
          <div className="space-y-3">
            <FieldLabel label="درصد جریمه" />
            <FinancialAmountInput value={String(state.values[section.percentAmountKey] ?? '')} onChange={(value) => setSectionValue(section.percentAmountKey, sanitizeDecimalInput(value))} suffix="%" />
          </div>

          {section.percentBasisKey ? (
            <div className="space-y-3">
              <div className="text-right">
                <h5 className="text-sm font-extrabold text-slate-800">مبنای محاسبه درصد</h5>
                <p className="mt-1 text-xs leading-6 text-slate-500">مشخص کنید درصد جریمه از چه مبنایی محاسبه شود.</p>
              </div>
              <TagPills
                options={BUILDER_PENALTY_PERCENT_BASIS_OPTIONS.map((option) => ({ value: option, label: option }))}
                value={selectedPercentBasis}
                onChange={(value) => setSectionValue(section.percentBasisKey!, value)}
                className="justify-end flex-row-reverse"
              />
            </div>
          ) : null}

          {selectedPercentBasis === 'ارزش روز واحد' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <FieldLabel label="مبلغ ارزش روز واحد" />
                <FinancialAmountInput value={String(state.values[section.marketValueAmountKey!] ?? '')} onChange={(value) => setSectionValue(section.marketValueAmountKey!, value)} suffix="تومان" />
              </div>
              <div className="space-y-3">
                <FieldLabel label="مرجع / توضیح ارزش روز" />
                <input
                  value={String(state.values[section.marketValueReferenceKey!] ?? '')}
                  onChange={(event) => setSectionValue(section.marketValueReferenceKey!, event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-slate-900"
                />
              </div>
            </div>
          ) : null}

          {selectedPercentBasis === 'مبلغ تعیین‌شده توسط کارشناس' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <FieldLabel label="مبلغ تعیین‌شده توسط کارشناس" />
                <FinancialAmountInput value={String(state.values[section.expertAmountKey!] ?? '')} onChange={(value) => setSectionValue(section.expertAmountKey!, value)} suffix="تومان" />
              </div>
              <div className="space-y-3">
                <FieldLabel label="نام کارشناس / شماره گزارش" />
                <input
                  value={String(state.values[section.expertReferenceKey!] ?? '')}
                  onChange={(event) => setSectionValue(section.expertReferenceKey!, event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-slate-900"
                />
              </div>
            </div>
          ) : null}

          {selectedPercentBasis === 'سفارشی' ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-3">
                <FieldLabel label="عنوان مبنای سفارشی" />
                <input
                  value={String(state.values[section.customBasisTitleKey!] ?? '')}
                  onChange={(event) => setSectionValue(section.customBasisTitleKey!, event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-slate-900"
                />
              </div>
              <div className="space-y-3">
                <FieldLabel label="مبلغ مبنای سفارشی" />
                <FinancialAmountInput value={String(state.values[section.customBasisAmountKey!] ?? '')} onChange={(value) => setSectionValue(section.customBasisAmountKey!, value)} suffix="تومان" />
              </div>
              <div className="space-y-3">
                <FieldLabel label="توضیح / مرجع سفارشی" />
                <input
                  value={String(state.values[section.customBasisReferenceKey!] ?? '')}
                  onChange={(event) => setSectionValue(section.customBasisReferenceKey!, event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-slate-900"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeMode === 'progressive' ? (
        <div className="space-y-3">
          <h5 className="text-right text-[17px] font-black text-slate-800">پله‌های جریمه تصاعدی</h5>
          <p className="text-right text-sm leading-7 text-slate-600">مبالغ هر بازه را ثبت کنید.</p>
          <ProgressiveGrid
            rows={section.progressiveRows}
            values={state.values}
            periodLabel={periodLabel}
            onValueChange={(key, value) => setSectionValue(key, value)}
          />
        </div>
      ) : null}

      {sectionId === 'unit-delivery-delay' ? (
        <>
          <div className="space-y-3">
            <FieldLabel label="مهلت تنفس بدون جریمه (بر حسب روز)" />
            <FinancialAmountInput
              value={String(state.values[section.graceDaysKey!] ?? '')}
              onChange={(value) => setSectionValue(section.graceDaysKey!, sanitizePositiveIntegerInput(value))}
              suffix="روز"
            />
          </div>

          <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2 text-right">
                <h4 className="text-sm font-bold text-slate-700">سقف جریمه</h4>
                <p className="text-xs leading-6 text-slate-500">در صورت فعال بودن، جریمه فقط تا سقف مشخص محاسبه می‌شود.</p>
              </div>
              <div className="self-start lg:self-auto">
                <ContractRegistrationSwitch checked={!Boolean(state.values[section.unlimitedCapKey!])} variant="segmented" onChange={(value) => setSectionValue(section.unlimitedCapKey!, !value)} />
              </div>
            </div>
            {!Boolean(state.values[section.unlimitedCapKey!]) ? (
              <div className="space-y-3">
                <FieldLabel label="مبلغ سقف جریمه *" />
                <FinancialAmountInput value={String(state.values[section.capKey] ?? '')} onChange={(value) => setSectionValue(section.capKey, value)} suffix="" />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {sectionId === 'material-specs-change' ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="text-right">
              <h5 className="text-[17px] font-black text-slate-800">نوع تغییرات</h5>
              <p className="mt-1 text-sm leading-7 text-slate-500">دامنه تغییرات را مشخص کنید.</p>
            </div>
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_TYPES.map((item) => ({ value: item, label: item, tooltip: MATERIAL_SPECS_CHANGE_TYPE_DETAILS[item]?.description ?? item }))}
              values={parseStoredStringList(String(state.values.materialSpecsChangeIncludedTypes ?? ''))}
              onChange={(nextValues) => {
                const currentSet = new Set(parseStoredStringList(String(state.values.materialSpecsChangeIncludedTypes ?? '')));
                const nextSet = new Set(nextValues);
                const changed = MATERIAL_SPECS_CHANGE_TYPES.find((option) => currentSet.has(option) !== nextSet.has(option));
                if (changed) setSectionValue('materialSpecsChangeIncludedTypes', toggleStoredStringList(String(state.values.materialSpecsChangeIncludedTypes ?? ''), changed));
              }}
              className="justify-end flex-row-reverse"
            />
          </div>

          <div className="space-y-3">
            <div className="text-right">
              <h5 className="text-[17px] font-black text-slate-800">سطح اهمیت</h5>
            </div>
            <TagPills
              options={MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS.map((option) => ({ value: option.value, label: option.label }))}
              value={String(state.values.materialSpecsChangeImportanceLevel ?? MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS[0].value)}
              onChange={(value) => setSectionValue('materialSpecsChangeImportanceLevel', value)}
              className="justify-end flex-row-reverse"
            />
          </div>

          <div className="space-y-3">
            <div className="text-right">
              <h5 className="text-[17px] font-black text-slate-800">مراجع مقایسه</h5>
              <p className="mt-1 text-sm leading-7 text-slate-500">حداقل یک مرجع برای ارزیابی تغییر انتخاب کنید.</p>
            </div>
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES.map((item) => ({ value: item, label: item, tooltip: MATERIAL_SPECS_CHANGE_REFERENCE_DETAILS[item]?.description ?? item }))}
              values={parseStoredStringList(String(state.values.materialSpecsChangeComparisonReferences ?? ''))}
              onChange={(nextValues) => {
                const currentSet = new Set(parseStoredStringList(String(state.values.materialSpecsChangeComparisonReferences ?? '')));
                const nextSet = new Set(nextValues);
                const changed = MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES.find((option) => currentSet.has(option) !== nextSet.has(option));
                if (changed) setSectionValue('materialSpecsChangeComparisonReferences', toggleStoredStringList(String(state.values.materialSpecsChangeComparisonReferences ?? ''), changed));
              }}
              className="justify-end flex-row-reverse"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <MaterialToggle
              title="جایگزینی هم‌ارزش مجاز"
              description="در صورت فعال بودن، جایگزینی هم‌ارزش قابل بررسی است."
              checked={Boolean(state.values.materialSpecsChangeEquivalentReplacementAllowed)}
              onChange={(checked) => setSectionValue('materialSpecsChangeEquivalentReplacementAllowed', checked)}
            />
            <MaterialToggle
              title="جایگزینی هم‌ارزش اعمال شده"
              description="مشخص کنید جایگزینی هم‌ارزش عملاً اعمال شده است یا خیر."
              checked={Boolean(state.values.materialSpecsChangeEquivalentReplacementApplied)}
              onChange={(checked) => setSectionValue('materialSpecsChangeEquivalentReplacementApplied', checked)}
            />
            <MaterialToggle
              title="نیاز به تایید خریدار"
              description="اگر تغییر مهم باشد، خریدار باید آن را تایید کند."
              checked={Boolean(state.values.materialSpecsChangeBuyerApprovalRequired)}
              onChange={(checked) => setSectionValue('materialSpecsChangeBuyerApprovalRequired', checked)}
            />
          </div>

          <div className="space-y-3">
            <div className="text-right">
              <h5 className="text-[17px] font-black text-slate-800">نتایج قابل اعمال</h5>
            </div>
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_OUTCOMES.map((item) => ({ value: item, label: item, tooltip: MATERIAL_SPECS_CHANGE_OUTCOME_DETAILS[item]?.description ?? item }))}
              values={parseStoredStringList(String(state.values.materialSpecsChangeSelectedOutcomes ?? ''))}
              onChange={(nextValues) => {
                const currentSet = new Set(parseStoredStringList(String(state.values.materialSpecsChangeSelectedOutcomes ?? '')));
                const nextSet = new Set(nextValues);
                const changed = MATERIAL_SPECS_CHANGE_OUTCOMES.find((option) => currentSet.has(option) !== nextSet.has(option));
                if (changed) setSectionValue('materialSpecsChangeSelectedOutcomes', toggleStoredStringList(String(state.values.materialSpecsChangeSelectedOutcomes ?? ''), changed));
              }}
              className="justify-end flex-row-reverse"
            />
          </div>

          <div className="space-y-3">
            <div className="text-right">
              <h5 className="text-[17px] font-black text-slate-800">مدارک لازم</h5>
            </div>
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS.map((item) => ({ value: item, label: item, tooltip: MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENT_DETAILS[item]?.description ?? item }))}
              values={parseStoredStringList(String(state.values.materialSpecsChangeRequiredDocuments ?? ''))}
              onChange={(nextValues) => {
                const currentSet = new Set(parseStoredStringList(String(state.values.materialSpecsChangeRequiredDocuments ?? '')));
                const nextSet = new Set(nextValues);
                const changed = MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS.find((option) => currentSet.has(option) !== nextSet.has(option));
                if (changed) setSectionValue('materialSpecsChangeRequiredDocuments', toggleStoredStringList(String(state.values.materialSpecsChangeRequiredDocuments ?? ''), changed));
              }}
              className="justify-end flex-row-reverse"
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <LoanSectionCard className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">{section.title}</div>
          <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{section.description}</p>
        </div>
        <ContractRegistrationSwitch checked={enabled} variant="segmented" onChange={(active) => setSectionValue(section.stateKey, active)} />
      </div>

      {!enabled ? (
        <div className="px-5 py-5 text-right text-sm font-semibold leading-7 text-slate-500">
          این بخش غیرفعال است. اگر می‌خواهید جرائم سازنده در این الحاقیه ثبت شود، آن را فعال کنید.
        </div>
      ) : (
        renderCommonFields()
      )}
    </LoanSectionCard>
  );
}

function MaterialToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2 text-right">
        <div className="text-sm font-extrabold text-slate-800">{title}</div>
        <p className="text-xs leading-6 text-slate-500">{description}</p>
      </div>
      <div className="self-start lg:self-auto">
        <ContractRegistrationSwitch checked={checked} variant="segmented" onChange={onChange} />
      </div>
    </div>
  );
}

export function AppendixBuilderPenaltyEditor({
  value,
  onChange,
}: {
  value: ContractRuleState;
  onChange: (next: ContractRuleState) => void;
}) {
  return (
    <div className="space-y-6 rounded-[24px] border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6">
      <div className="rounded-2xl border border-[color-mix(in_srgb,var(--dark-teal)_16%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)] px-4 py-3 text-right">
        <div className="text-[13px] font-black text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">این بخش با منطق جریمه سازنده در پیش‌نویس هم‌ساخت است.</div>
        <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-600">
          هر دو زیر‌بخش جریمه سازنده، یعنی تأخیر در تحویل واحد و تغییر مصالح و مشخصات، از همین‌جا در الحاقیه ثبت می‌شوند.
        </p>
      </div>

      <BuilderPenaltySectionCard sectionId="unit-delivery-delay" state={value} onChange={onChange} />
      <BuilderPenaltySectionCard sectionId="material-specs-change" state={value} onChange={onChange} />
    </div>
  );
}
