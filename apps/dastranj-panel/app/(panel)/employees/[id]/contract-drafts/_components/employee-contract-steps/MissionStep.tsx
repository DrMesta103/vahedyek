'use client';

import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../../../../components/PanelFormModal';
import { formatFaNumber } from '../../../../../../lib/format-fa';
import type { MissionRule, MissionSettings, PayrollDerivedValues } from '../../../../../../lib/payroll-business-settings';
import type { BaseDifference } from '../../../../../../lib/payroll-business-settings';
import { buildToggleCompareDifference, type PayrollComparisonMode } from '../../../../../../lib/payroll-comparison-labels';
import { differenceBadge, EmployeeContractStepShell, fieldBadge, SectionPlaceholder } from './employee-contract-ui';

function money(value: number) {
  return `${formatFaNumber(Math.round(value))} ریال`;
}

function moneyInput(value: number) {
  return Number.isFinite(value) ? formatFaNumber(value) : '';
}

function parseNumber(value: string) {
  const normalized = value.replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareMissionRuleDifference(
  rule: MissionRule,
  baseRule: MissionRule | undefined,
  mode?: PayrollComparisonMode,
  referenceWord = 'مبنا',
): BaseDifference | null {
  if (!mode) return null;
  if (!baseRule) {
    return {
      isDifferent: true,
      direction: 'added',
      message: `اختصاصی ${referenceWord}`,
      tooltip: `این قانون در ${referenceWord} وجود نداشت.`,
    };
  }

  const currentActive = rule.active !== false;
  const baseActive = baseRule.active !== false;
  const sharedComparison = {
    title: rule.title,
    coefficient: rule.coefficient,
    paymentBase: rule.paymentBase,
  };
  const baseComparison = {
    title: baseRule.title,
    coefficient: baseRule.coefficient,
    paymentBase: baseRule.paymentBase,
  };

  if (JSON.stringify(sharedComparison) === JSON.stringify(baseComparison)) {
    if (currentActive === baseActive) return null;
    return {
      isDifferent: true,
      direction: currentActive ? 'added' : 'removed',
      message: currentActive ? `فعال شده نسبت به ${referenceWord}` : `غیرفعال نسبت به ${referenceWord}`,
      tooltip: `${rule.title} در ${referenceWord} ${baseActive ? 'فعال' : 'غیرفعال'} بود.`,
    };
  }

  if (currentActive !== baseActive && baseRule.active !== rule.active) {
    return {
      isDifferent: true,
      direction: currentActive ? 'added' : 'removed',
      message: currentActive ? `فعال شده نسبت به ${referenceWord}` : `غیرفعال نسبت به ${referenceWord}`,
      tooltip: `${rule.title} در ${referenceWord} ${baseActive ? 'فعال' : 'غیرفعال'} بود.`,
    };
  }

  return {
    isDifferent: true,
    direction: 'changed',
    message: `متفاوت با ${referenceWord}`,
    tooltip: `قانون ماموریت «${rule.title}» با ${referenceWord} انتخاب‌شده متفاوت است.`,
  };
}

function compareRule(
  rule: MissionRule,
  baseRule: MissionRule | undefined,
  mode?: PayrollComparisonMode,
  referenceWord = 'مبنا',
  exclusiveLabel = 'اختصاصی',
) {
  const difference = compareMissionRuleDifference(rule, baseRule, mode, referenceWord);
  if (!difference) return null;
  if (difference.message.startsWith('اختصاصی')) return fieldBadge(difference.message, 'warning');
  if (difference.direction === 'added' || difference.direction === 'removed') {
    return fieldBadge(difference.message, difference.direction === 'added' ? 'success' : 'warning');
  }
  return differenceBadge(difference.message, difference.tooltip, mode === 'tenant_base' ? 'tenant_base' : 'diff');
}

export function MissionRuleDialog({
  open,
  initialRule,
  monthlyBaseSalary,
  grossPay,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialRule: MissionRule | null;
  monthlyBaseSalary: number;
  grossPay: number;
  onClose: () => void;
  onSubmit: (rule: MissionRule) => void;
}) {
  const [rule, setRule] = useState<MissionRule>(
    initialRule ?? {
      id: `mission-${Date.now()}`,
      title: 'ماموریت جدید',
      coefficient: 1,
      paymentBase: 'base_salary',
      active: true,
    },
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setRule(
      initialRule ?? {
        id: `mission-${Date.now()}`,
        title: 'ماموریت جدید',
        coefficient: 1,
        paymentBase: 'base_salary',
        active: true,
      },
    );
    setError('');
  }, [initialRule, open]);

  const previewBase = rule.paymentBase === 'total_payable' ? grossPay : monthlyBaseSalary;
  const previewAmount = Math.round(previewBase * rule.coefficient);

  const submit = () => {
    if (!rule.title.trim()) return setError('عنوان الزامی است');
    if (!Number.isFinite(rule.coefficient) || rule.coefficient <= 0) return setError('ضریب باید عددی مثبت باشد');
    if (!rule.paymentBase) return setError('مبنای پرداخت را انتخاب کنید');
    onSubmit({ ...rule, active: initialRule?.active ?? true });
  };

  return (
    <PanelFormModal
      open={open}
      title="ماموریت"
      lead="قانون پرداخت ماموریت را برای این قرارداد تنظیم کنید."
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت" onSubmit={submit} onCancel={onClose} />}
    >
      <div className="business-payroll-editor variable">
        <label className="business-payroll-field">
          <span className="business-payroll-field-label">عنوان</span>
          <input value={rule.title} onChange={(event) => setRule((value) => ({ ...value, title: event.target.value }))} />
        </label>
        <label className="business-payroll-field">
          <span className="business-payroll-field-label">ضریب محاسبه / درصد</span>
          <span className="business-payroll-input">
            <input
              value={moneyInput(rule.coefficient)}
              onChange={(event) => setRule((value) => ({ ...value, coefficient: parseNumber(event.target.value) }))}
            />
            <b>ضریب</b>
          </span>
        </label>
        <label className="business-payroll-field">
          <span className="business-payroll-field-label">مبنای پرداخت</span>
          <select
            value={rule.paymentBase}
            onChange={(event) => setRule((value) => ({ ...value, paymentBase: event.target.value as MissionRule['paymentBase'] }))}
          >
            <option value="base_salary">بر مبنای حقوق پایه</option>
            <option value="total_payable">بر مبنای جمع حقوق دریافتی</option>
          </select>
        </label>
        <div className="business-payroll-formula">پیش‌نمایش مبلغ: {money(previewAmount)}</div>
      </div>
    </PanelFormModal>
  );
}

export function MissionStep({
  mission,
  baseMission,
  secondaryBaseMission,
  derived,
  onMissionChange,
  onEditRule,
  onDeleteRule,
  onAddRule,
  title = 'ماموریت',
  tag,
  description = 'قوانین پرداخت ماموریت را برای این قرارداد تنظیم کنید.',
  comparisonMode,
  secondaryComparisonMode,
  comparisonReferenceWord = comparisonMode === 'template' ? 'قالب' : 'مبنا',
  secondaryComparisonReferenceWord = 'مبنای تنظیمات',
  exclusiveLabel = comparisonMode === 'tenant' ? 'کسب و کار' : comparisonMode === 'template' ? 'این قالب' : 'این قرارداد',
  showEnabledToggle = true,
}: {
  mission: MissionSettings | undefined;
  baseMission?: MissionSettings | null;
  secondaryBaseMission?: MissionSettings | null;
  derived: PayrollDerivedValues;
  onMissionChange: (patch: Partial<MissionSettings>) => void;
  onEditRule: (rule: MissionRule) => void;
  onDeleteRule: (rule: MissionRule) => void;
  onAddRule: () => void;
  title?: string;
  tag?: string;
  description?: string;
  comparisonMode?: PayrollComparisonMode;
  secondaryComparisonMode?: PayrollComparisonMode;
  comparisonReferenceWord?: string;
  secondaryComparisonReferenceWord?: string;
  exclusiveLabel?: string;
  showEnabledToggle?: boolean;
}) {
  if (!mission) return <SectionPlaceholder />;

  const baseRules = baseMission?.rules ?? [];
  const secondaryBaseRules = secondaryBaseMission?.rules ?? [];
  const comparisonLabel = comparisonReferenceWord;
  const removedFromBase = baseMission
    ? baseRules.filter((baseRule) => !mission.rules.some((rule) => rule.id === baseRule.id))
    : [];
  const enabledDifference = showEnabledToggle && comparisonMode && baseMission
    ? buildToggleCompareDifference(comparisonMode, mission.enabled, baseMission.enabled, title)
    : null;

  return (
    <EmployeeContractStepShell title={title} tag={tag} description={description} icon={<Building2 className="h-4 w-4" />}>
      {showEnabledToggle ? (
        <section className="business-payroll-subcard">
          <div className="business-payroll-subcard-head">
            <div>
              <h3>وضعیت ماموریت</h3>
              <p>با غیر فعال‌سازی، قواعد ماموریت در محاسبات این قرارداد لحاظ نمی‌شود.</p>
              {enabledDifference ? (
                <div className="employee-contract-mission-badges">
                  {differenceBadge(enabledDifference.message, enabledDifference.tooltip)}
                </div>
              ) : null}
            </div>
            <div className="business-payroll-toggle">
              <button type="button" className={mission.enabled ? 'is-selected' : ''} onClick={() => onMissionChange({ enabled: true })}>
                فعال
              </button>
              <button type="button" className={!mission.enabled ? 'is-selected' : ''} onClick={() => onMissionChange({ enabled: false })}>
                غیرفعال
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="business-payroll-subcard">
        <div className="business-draft-section-title">
          <h3>قواعد ماموریت</h3>
          <button type="button" className="business-payroll-outline-button" onClick={onAddRule}>
            <Plus className="h-4 w-4" /> افزودن ماموریت
          </button>
        </div>
        {mission.rules.length === 0 ? (
          <p className="contract-benefit-section-lead">هنوز قاعده‌ای ثبت نشده است.</p>
        ) : (
          <div className="business-payroll-items">
            {mission.rules.map((rule) => {
              const base = rule.paymentBase === 'total_payable' ? derived.grossPay : derived.monthlyBaseSalary;
              const baseRule = baseRules.find((item) => item.id === rule.id);
              const secondaryBaseRule = secondaryBaseRules.find((item) => item.id === rule.id);
              const templateDiff = compareRule(rule, baseRule, comparisonMode, comparisonLabel, exclusiveLabel);
              const tenantBaseDifference = compareMissionRuleDifference(
                rule,
                secondaryBaseRule,
                secondaryComparisonMode,
                secondaryComparisonReferenceWord,
              );
              return (
                <article key={rule.id} className="business-payroll-transfer-rule">
                  <div className="business-payroll-transfer-rule-head">
                    <div>
                      <strong>{rule.title}</strong>
                      <p className="contract-benefit-section-lead">
                        ضریب {formatFaNumber(rule.coefficient)} ·{' '}
                        {rule.paymentBase === 'total_payable' ? 'بر مبنای جمع حقوق دریافتی' : 'بر مبنای حقوق پایه'}
                      </p>
                      <div className="employee-contract-mission-badges">
                        {templateDiff ?? (rule.active ? null : fieldBadge(`غیرفعال نسبت به ${comparisonLabel || 'مبنا'}`, 'warning'))}
                        {tenantBaseDifference ? differenceBadge(tenantBaseDifference.message, tenantBaseDifference.tooltip, 'tenant_base') : null}
                      </div>
                    </div>
                    <div className="business-payroll-item-actions">
                      <button type="button" aria-label="ویرایش" onClick={() => onEditRule(rule)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="حذف" onClick={() => onDeleteRule(rule)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="business-payroll-formula">پیش‌نمایش مبلغ: {money(base * rule.coefficient)}</div>
                </article>
              );
            })}
          </div>
        )}
        {removedFromBase.length > 0 ? (
          <div className="business-payroll-removed-items">
            {removedFromBase.map((baseRule) => (
              <span key={baseRule.id}>{fieldBadge(`حذف شده نسبت به ${comparisonLabel || 'مبنا'}: ${baseRule.title}`, 'warning')}</span>
            ))}
          </div>
        ) : null}
      </section>
    </EmployeeContractStepShell>
  );
}
