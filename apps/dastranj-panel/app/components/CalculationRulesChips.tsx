'use client';

import { useEffect, useState } from 'react';
import { Info, Lock, Settings2 } from 'lucide-react';
import { PanelFormModal, PanelFormModalActions } from './PanelFormModal';
import {
  PAYMENT_EFFECT_LABELS,
  compareCalculationRules,
  type CalculationRules,
  type PaymentEffect,
} from '../lib/payroll-business-settings';

// ─── Tooltips ─────────────────────────────────────────────────────────────────

const RULE_TOOLTIPS: Record<string, string> = {
  earning: 'این آیتم به مبلغ قابل پرداخت کارمند اضافه می‌شود.',
  deduction: 'این آیتم از مبلغ قابل پرداخت کارمند کسر می‌شود.',
  employer_cost: 'این آیتم هزینه شرکت است و از دریافتی کارمند کم نمی‌شود.',
  informational: 'این آیتم فقط در قرارداد یا گزارش نمایش داده می‌شود و وارد محاسبه پرداخت نمی‌شود.',
  insurance_yes: 'مبلغ این آیتم وارد مبنای محاسبه بیمه می‌شود.',
  insurance_no: 'مبلغ این آیتم وارد مبنای محاسبه بیمه نمی‌شود.',
  tax_yes: 'مبلغ این آیتم وارد مبنای محاسبه مالیات می‌شود.',
  tax_no: 'مبلغ این آیتم وارد مبنای محاسبه مالیات نمی‌شود.',
  system: 'این آیتم توسط سیستم یا قوانین محاسبه می‌شود و قواعد آن ممکن است قفل باشد.',
  locked: 'این آیتم خروجی محاسبه قانونی است و قواعد آن برای جلوگیری از محاسبه اشتباه قفل شده است.',
};

// ─── Read-only badge (non-interactive) ───────────────────────────────────────

function RuleBadge({ label, active, tooltip, variant = 'default' }: {
  label: string;
  active?: boolean;
  tooltip: string;
  variant?: 'default' | 'system' | 'diff';
}) {
  return (
    <span
      className={[
        'calc-badge',
        active ? 'is-active' : '',
        `is-${variant}`,
      ].filter(Boolean).join(' ')}
      title={tooltip}
      aria-label={`${label}: ${tooltip}`}
    >
      {label}
    </span>
  );
}

// ─── Read-only summary chips shown on item cards ──────────────────────────────

export function CalculationRulesBadges({ rules }: { rules: CalculationRules }) {
  const showBaseFlags = rules.paymentEffect !== 'informational';
  return (
    <div className="calc-badges-row" aria-label="قواعد محاسبه">
      {rules.systemGenerated ? (
        <span className="calc-badge is-system" title={RULE_TOOLTIPS.system}>
          <Lock className="h-3 w-3" aria-hidden />
          سیستمی
        </span>
      ) : null}
      <RuleBadge
        label={PAYMENT_EFFECT_LABELS[rules.paymentEffect]}
        active={rules.paymentEffect === 'earning'}
        tooltip={RULE_TOOLTIPS[rules.paymentEffect]}
      />
      <RuleBadge
        label={rules.includedInWageBase ? 'جزو مزد مبنا' : 'خارج از مزد مبنا'}
        active={rules.includedInWageBase}
        tooltip={rules.includedInWageBase ? 'این آیتم در محاسبه مزد مبنا لحاظ می‌شود.' : 'این آیتم در محاسبه مزد مبنا لحاظ نمی‌شود.'}
      />
      {showBaseFlags ? (
        <>
          <RuleBadge
            label={rules.includedInInsuranceBase ? 'مشمول بیمه' : 'غیرمشمول بیمه'}
            active={rules.includedInInsuranceBase}
            tooltip={rules.includedInInsuranceBase ? RULE_TOOLTIPS.insurance_yes : RULE_TOOLTIPS.insurance_no}
          />
          <RuleBadge
            label={rules.includedInTaxBase ? 'مشمول مالیات' : 'غیرمشمول مالیات'}
            active={rules.includedInTaxBase}
            tooltip={rules.includedInTaxBase ? RULE_TOOLTIPS.tax_yes : RULE_TOOLTIPS.tax_no}
          />
        </>
      ) : null}
    </div>
  );
}

// ─── Diff badge ───────────────────────────────────────────────────────────────

export function CalcRulesDiffBadge({
  baseRules,
  currentRules,
  baseLabel,
  differenceLabel = 'متفاوت با قواعد مبنا',
}: {
  baseRules: CalculationRules;
  currentRules: CalculationRules;
  baseLabel: string;
  differenceLabel?: string;
}) {
  if (!compareCalculationRules(baseRules, currentRules)) return null;

  const parts: string[] = [];
  if (baseRules.paymentEffect !== currentRules.paymentEffect) {
    parts.push(`اثر پرداخت: ${PAYMENT_EFFECT_LABELS[baseRules.paymentEffect]}`);
  }
  if (baseRules.includedInInsuranceBase !== currentRules.includedInInsuranceBase) {
    parts.push(baseRules.includedInInsuranceBase ? 'مشمول بیمه' : 'غیرمشمول بیمه');
  }
  if (baseRules.includedInTaxBase !== currentRules.includedInTaxBase) {
    parts.push(baseRules.includedInTaxBase ? 'مشمول مالیات' : 'غیرمشمول مالیات');
  }
  if (baseRules.includedInWageBase !== currentRules.includedInWageBase) {
    parts.push(baseRules.includedInWageBase ? 'جزو مزد مبنا' : 'خارج از مزد مبنا');
  }

  const tooltip = `در ${baseLabel}، این آیتم با قواعد: ${parts.join('، ')} تعریف شده است.`;

  return (
    <span className="calc-badge is-diff" title={tooltip}>
      <Info className="h-3 w-3" aria-hidden />
      {differenceLabel}
    </span>
  );
}

// ─── Dialog selectable chip ───────────────────────────────────────────────────

function SelectChip({ label, active, onClick, tooltip, disabled = false }: {
  label: string;
  active: boolean;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`calc-select-chip ${active ? 'is-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      title={tooltip}
    >
      {label}
    </button>
  );
}

// ─── CalculationRulesDialog ───────────────────────────────────────────────────

export type PaymentEffectContext = 'benefit_or_addition' | 'deduction' | 'any';

const EFFECT_OPTIONS: Record<PaymentEffectContext, PaymentEffect[]> = {
  benefit_or_addition: ['earning', 'employer_cost', 'informational'],
  deduction: ['deduction', 'employer_cost', 'informational'],
  any: ['earning', 'deduction', 'employer_cost', 'informational'],
};

export function CalculationRulesDialog({
  open,
  itemTitle,
  rules,
  baseRules,
  baseLabel,
  differenceLabel = 'متفاوت با قواعد مبنا',
  effectContext,
  onClose,
  onSubmit,
}: {
  open: boolean;
  itemTitle?: string;
  rules: CalculationRules;
  baseRules?: CalculationRules | null;
  baseLabel?: string;
  differenceLabel?: string;
  effectContext?: PaymentEffectContext;
  onClose: () => void;
  onSubmit: (next: CalculationRules) => void;
}) {
  const [draft, setDraft] = useState<CalculationRules>(rules);
  const locked = rules.lockedRules;
  const context = effectContext ?? 'any';
  const allowedEffects = EFFECT_OPTIONS[context];

  // Sync draft each time dialog opens
  useEffect(() => {
    if (open) setDraft(rules);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setEffect = (effect: PaymentEffect) => {
    if (locked) return;
    let next = { ...draft, paymentEffect: effect };
    if (effect !== 'earning') {
      next = {
        ...next,
        includedInInsuranceBase: false,
        includedInTaxBase: false,
        includedInWageBase: false,
      };
    }
    setDraft(next);
  };

  const toggleInsurance = () => {
    if (locked || draft.paymentEffect === 'informational') return;
    setDraft((d) => ({ ...d, includedInInsuranceBase: !d.includedInInsuranceBase }));
  };

  const toggleTax = () => {
    if (locked || draft.paymentEffect === 'informational') return;
    setDraft((d) => ({ ...d, includedInTaxBase: !d.includedInTaxBase }));
  };

  const showDeductionWarning =
    !locked &&
    draft.paymentEffect === 'deduction' &&
    (draft.includedInInsuranceBase || draft.includedInTaxBase);

  const showEmployerCostWarning =
    !locked &&
    draft.paymentEffect === 'employer_cost' &&
    (draft.includedInInsuranceBase || draft.includedInTaxBase);
  const showWageBaseSection = draft.paymentEffect === 'earning';

  const hasDiff = baseRules ? compareCalculationRules(baseRules, draft) : false;

  return (
    <PanelFormModal
      open={open}
      title={itemTitle ? `قواعد محاسبه: ${itemTitle}` : 'قواعد محاسبه'}
      lead={locked
        ? 'این آیتم خروجی محاسبه قانونی است و قواعد آن برای جلوگیری از محاسبه اشتباه قفل شده است.'
        : 'اثر این آیتم در پرداخت، بیمه و مالیات را مشخص کنید.'}
      onClose={onClose}
      footer={
        locked
          ? <PanelFormModalActions submitLabel="بستن" onSubmit={onClose} onCancel={onClose} />
          : <PanelFormModalActions submitLabel="ثبت" onSubmit={() => onSubmit(draft)} onCancel={onClose} />
      }
    >
      <div className="calc-dialog-body">
        {locked ? (
          <div className="calc-dialog-locked-notice">
            <Lock className="h-4 w-4" aria-hidden />
            <span>قواعد این آیتم قفل است و قابل ویرایش نیست.</span>
          </div>
        ) : null}

        {/* Payment effect */}
        <div className="calc-dialog-section">
          <span className="calc-dialog-section-label">اثر در پرداخت</span>
          <div className="calc-dialog-chips">
            {allowedEffects.map((effect) => (
              <SelectChip
                key={effect}
                label={PAYMENT_EFFECT_LABELS[effect]}
                active={draft.paymentEffect === effect}
                onClick={() => setEffect(effect)}
                tooltip={RULE_TOOLTIPS[effect]}
                disabled={locked}
              />
            ))}
          </div>
          <p className="calc-dialog-helper">{RULE_TOOLTIPS[draft.paymentEffect]}</p>
        </div>

        {/* Insurance / tax base */}
        <div className="calc-dialog-section">
          <span className="calc-dialog-section-label">مبنای محاسبه</span>
          <div className="calc-dialog-chips">
            <SelectChip
              label="مشمول بیمه"
              active={draft.includedInInsuranceBase}
              onClick={toggleInsurance}
              tooltip={draft.includedInInsuranceBase ? RULE_TOOLTIPS.insurance_yes : RULE_TOOLTIPS.insurance_no}
              disabled={locked || draft.paymentEffect === 'informational'}
            />
            <SelectChip
              label="مشمول مالیات"
              active={draft.includedInTaxBase}
              onClick={toggleTax}
              tooltip={draft.includedInTaxBase ? RULE_TOOLTIPS.tax_yes : RULE_TOOLTIPS.tax_no}
              disabled={locked || draft.paymentEffect === 'informational'}
            />
          </div>
        {draft.paymentEffect === 'informational' ? (
          <p className="calc-dialog-helper">آیتم‌های فقط قراردادی وارد محاسبات بیمه، مالیات یا پرداخت نمی‌شوند.</p>
        ) : null}
      </div>

        {showWageBaseSection ? (
          <div className="calc-dialog-section">
            <span className="calc-dialog-section-label">جزو مزد مبنا</span>
            <div className="calc-dialog-chips">
              <SelectChip
                label="جزو مزد مبنا"
                active={draft.includedInWageBase}
                onClick={() => {
                  if (locked) return;
                  setDraft((current) => ({ ...current, includedInWageBase: true }));
                }}
                tooltip={locked ? 'فقط آیتم‌های افزاینده دریافتی می‌توانند جزو مزد مبنا باشند.' : 'این آیتم در محاسبه مزد مبنا لحاظ می‌شود.'}
                disabled={locked}
              />
              <SelectChip
                label="خارج از مزد مبنا"
                active={!draft.includedInWageBase}
                onClick={() => {
                  if (locked) return;
                  setDraft((current) => ({ ...current, includedInWageBase: false }));
                }}
                tooltip={locked ? 'فقط آیتم‌های افزاینده دریافتی می‌توانند جزو مزد مبنا باشند.' : 'این آیتم در محاسبه مزد مبنا لحاظ نمی‌شود.'}
                disabled={locked}
              />
            </div>
            <p className="calc-dialog-helper">این آیتم در محاسبه مزد مبنا لحاظ می‌شود.</p>
          </div>
        ) : null}

        {/* Warnings */}
        {showDeductionWarning ? (
          <p className="calc-dialog-warning">
            کسورات معمولاً وارد مبنای بیمه یا مالیات نمی‌شوند. لطفاً از صحت این تنظیم مطمئن شوید.
          </p>
        ) : null}
        {showEmployerCostWarning ? (
          <p className="calc-dialog-warning">
            هزینه کارفرما معمولاً در دریافتی کارمند لحاظ نمی‌شود. مبنای بیمه و مالیات را بررسی کنید.
          </p>
        ) : null}

        {/* Comparison */}
        {baseRules && baseLabel ? (
          <div className="calc-dialog-compare">
            <span className="calc-dialog-compare-label">قواعد {baseLabel}:</span>
            <CalculationRulesBadges rules={baseRules} />
            <span className="calc-dialog-compare-label">قواعد فعلی:</span>
            <CalculationRulesBadges rules={draft} />
            {hasDiff ? (
              <span className="calc-badge is-diff">
                <Info className="h-3 w-3" aria-hidden />
                {differenceLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </PanelFormModal>
  );
}

// ─── Trigger button shown on item cards ──────────────────────────────────────

export function CalcRulesEditButton({
  locked,
  onClick,
}: {
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="calc-rules-edit-btn"
      onClick={onClick}
      title={locked ? RULE_TOOLTIPS.locked : 'برای ویرایش اثر این آیتم در پرداخت، بیمه و مالیات کلیک کنید.'}
      aria-label="ویرایش قواعد محاسبه"
    >
      <Settings2 className="h-3.5 w-3.5" aria-hidden />
      قواعد محاسبه
    </button>
  );
}
