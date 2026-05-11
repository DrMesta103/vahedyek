'use client';

import { BadgePercent, ChartNoAxesCombined, SlidersHorizontal } from 'lucide-react';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { BusinessSwitch, ChoicePills as UiChoicePills, RuleFieldLabel, RuleTabButton } from '@repo/ui';
import { RuleTextInput as SharedRuleTextInput } from './RuleStylePrimitives';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function RuleTextInput({
  value,
  onChange,
  suffix,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
}) {
  return <SharedRuleTextInput value={value} onChange={onChange} suffix={suffix} placeholder={placeholder} />;
}

function AdjustmentChoicePills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <UiChoicePills
      options={options.map((option) => ({ value: option, label: option }))}
      value={value}
      onChange={(next) => onChange(next === value ? '' : next)}
      wrap
      className="justify-end flex-row-reverse"
    />
  );
}

function WeightRow({
  label,
  value,
  onToggle,
  onChange,
  hint,
  bordered = true,
}: {
  label: string;
  value: string;
  onToggle: (enabled: boolean) => void;
  onChange: (value: string) => void;
  hint: string;
  bordered?: boolean;
}) {
  const enabled = value !== '' && value !== '0';

  return (
    <div className={cn('space-y-4 pt-6', bordered && 'border-t border-[color:var(--border-soft)]')}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-right">
          <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">{label}</h4>
          <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">وزن این شاخص در محاسبه تعدیل</p>
        </div>
        <BusinessSwitch checked={enabled} onChange={onToggle} />
      </div>

      <RuleTextInput value={value} onChange={onChange} suffix="%" placeholder="۰" />
      <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">{hint}</p>
    </div>
  );
}

function getAdjustmentLead(tabId: string) {
  switch (tabId) {
    case 'fixed-percent':
      return 'در این روش چارچوب تعدیل قیمت قرارداد بر اساس یک درصد ثابت و در بازه‌های زمانی مشخص تعریف می‌شود.';
    case 'specific-indicator':
      return 'در این روش چارچوب تعدیل قیمت قرارداد بر اساس یک شاخص مشخص و منبع داده معین تعریف می‌شود.';
    case 'multi-indicator':
      return 'در این روش چارچوب تعدیل قیمت قرارداد بر اساس ترکیبی از چند شاخص با وزن‌های قابل تنظیم تعریف می‌شود.';
    default:
      return '';
  }
}

function parsePercent(value: string | boolean | undefined) {
  if (typeof value !== 'string') return 0;
  const normalized = Number(value.toString().replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
}

export function AdjustmentRuleSection({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const periodOptions = ['روزانه', 'ماهانه', 'سه ماهه', 'شش ماهه', 'سالانه'];
  const roundRuleOptions = ['۵۰', '۵۰۰', 'کسر ۱۰۰', 'کسر ۱۰۰۰'];
  const sourceOptions = ['بانک مرکزی', 'مرکز آمار', 'نظام مهندسی'];
  const indicatorOptions = ['تورم بانک مرکزی', 'شاخص ساخت‌وساز', 'ارز توافقی'];
  const extraIndicatorsExpanded = Boolean(state.values.adjustMultiManualOverride);
  const activeTab = state.activeTab;
  const selectedPeriod = String(state.activeChip || '');
  const selectedRoundRule = String(state.values.adjustFixedRound || '');
  const multiIndicatorTotal =
    parsePercent(state.values.adjustMultiHousingWeight) +
    parsePercent(state.values.adjustMultiLaborWeight) +
    parsePercent(state.values.adjustMultiMaterialWeight) +
    parsePercent(state.values.adjustMultiMaterialsOtherWeight) +
    parsePercent(state.values.adjustMultiWageWeight) +
    parsePercent(state.values.adjustMultiEnergyWeight) +
    parsePercent(state.values.adjustMultiGeneralPriceWeight);
  const multiIndicatorOverflow = multiIndicatorTotal > 100;

  return (
    <div className="space-y-8 text-right">
      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="space-y-5">
          <div className="text-right">
            <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">انتخاب بازه زمانی اعمال تعدیل</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
              بازه زمانی اعمال تعدیل مشخص می‌کند تعدیل قیمت در چه دوره‌هایی و بر اساس شاخص‌های جدید محاسبه شود.
            </p>
          </div>

          <AdjustmentChoicePills options={periodOptions} value={selectedPeriod} onChange={(value) => onValueChange('activeChip', value)} />
        </div>
      </section>

      <section className="overflow-visible rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          <RuleTabButton title="درصد ثابت" icon={BadgePercent} active={activeTab === 'fixed-percent'} onClick={() => onValueChange('activeTab', 'fixed-percent')} />
          <RuleTabButton title="یک شاخص مشخص" icon={ChartNoAxesCombined} active={activeTab === 'specific-indicator'} onClick={() => onValueChange('activeTab', 'specific-indicator')} />
          <RuleTabButton title="چند شاخص" icon={SlidersHorizontal} active={activeTab === 'multi-indicator'} onClick={() => onValueChange('activeTab', 'multi-indicator')} />
        </div>

        <div className="space-y-8 p-5">
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">{getAdjustmentLead(activeTab)}</p>
          <div className="border-t border-[color:var(--border-soft)]" />

          {activeTab === 'fixed-percent' ? (
            <>
              <div className="space-y-4">
                <RuleFieldLabel label="درصد ثابت تعدیل قیمت" required />
                <RuleTextInput value={String(state.values.adjustFixedPercent ?? '')} onChange={(value) => onValueChange('adjustFixedPercent', value)} suffix="%" placeholder="۱۰" />
                <p className="text-sm leading-7 text-[color:var(--text-muted)]">درصدی که به‌عنوان مبنای محاسبه تعدیل در هر دوره در نظر گرفته می‌شود را در این بخش وارد کنید.</p>
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-6">
                <div className="text-right">
                  <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ تعدیل</h4>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">در صورت نیاز، یک قاعده گرد کردن برای مبلغ تعدیل انتخاب کنید. با کلیک دوباره روی تگ فعال، انتخاب برداشته می‌شود.</p>
                </div>

                <AdjustmentChoicePills options={roundRuleOptions} value={selectedRoundRule} onChange={(value) => onValueChange('adjustFixedRound', value)} />
              </div>
            </>
          ) : null}

          {activeTab === 'specific-indicator' ? (
            <>
              <div className="space-y-5">
                <div className="text-right">
                  <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">منبع شاخص تعدیل</h4>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">منبع داده‌ای که مبنای محاسبه تعدیل قیمت است را مشخص کنید.</p>
                </div>

                <AdjustmentChoicePills options={sourceOptions} value={String(state.values.adjustIndicatorSource || '')} onChange={(value) => onValueChange('adjustIndicatorSource', value)} />
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-6">
                <div className="text-right">
                  <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">شاخص انتخابی</h4>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">شاخصی که بر اساس آن تعدیل قیمت محاسبه می‌شود را انتخاب کنید.</p>
                </div>

                <AdjustmentChoicePills options={indicatorOptions} value={String(state.values.adjustIndicatorName || '')} onChange={(value) => onValueChange('adjustIndicatorName', value)} />
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-6">
                <div className="text-right">
                  <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ تعدیل</h4>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">در صورت نیاز، یک قاعده گرد کردن برای مبلغ تعدیل انتخاب کنید. با کلیک دوباره روی تگ فعال، انتخاب برداشته می‌شود.</p>
                </div>

                <AdjustmentChoicePills options={roundRuleOptions} value={selectedRoundRule} onChange={(value) => onValueChange('adjustFixedRound', value)} />
              </div>
            </>
          ) : null}

          {activeTab === 'multi-indicator' ? (
            <>
              <div className="space-y-5">
                <div className="text-right">
                  <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">پیکربندی شاخص‌های ترکیبی</h4>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">وزن هر شاخص را برای محاسبه تعدیل تعیین کنید. با خاموش کردن هر سوییچر، آن شاخص از فرمول حذف می‌شود.</p>
                </div>

                <WeightRow
                  label="بانک مرکزی"
                  value={String(state.values.adjustMultiHousingWeight ?? '')}
                  onToggle={(enabled) => onValueChange('adjustMultiHousingWeight', enabled ? String(state.values.adjustMultiHousingWeight || '50') : '0')}
                  onChange={(value) => onValueChange('adjustMultiHousingWeight', value)}
                  hint="این وزن میزان تاثیر شاخص بانک مرکزی را در محاسبه تعدیل قیمت مشخص می‌کند."
                  bordered={false}
                />
                <WeightRow
                  label="مرکز آمار"
                  value={String(state.values.adjustMultiLaborWeight ?? '')}
                  onToggle={(enabled) => onValueChange('adjustMultiLaborWeight', enabled ? String(state.values.adjustMultiLaborWeight || '49') : '0')}
                  onChange={(value) => onValueChange('adjustMultiLaborWeight', value)}
                  hint="این وزن میزان تاثیر شاخص مرکز آمار را در محاسبه تعدیل قیمت مشخص می‌کند."
                />
                <WeightRow
                  label="نظام مهندسی"
                  value={String(state.values.adjustMultiMaterialWeight ?? '')}
                  onToggle={(enabled) => onValueChange('adjustMultiMaterialWeight', enabled ? String(state.values.adjustMultiMaterialWeight || '0') : '0')}
                  onChange={(value) => onValueChange('adjustMultiMaterialWeight', value)}
                  hint="این وزن میزان تاثیر شاخص نظام مهندسی را در محاسبه تعدیل قیمت مشخص می‌کند."
                />
              </div>

              <div className="border-t border-[color:var(--border-soft)] pt-6 text-center">
                <button
                  type="button"
                  onClick={() => onValueChange('adjustMultiManualOverride', !extraIndicatorsExpanded)}
                  className="inline-flex items-center rounded-full border border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] px-4 py-2 text-sm font-bold text-[color:var(--theme-action-text)] transition hover:opacity-90"
                >
                  {extraIndicatorsExpanded ? 'بستن سایر شاخص‌ها' : 'نمایش سایر شاخص‌ها'}
                </button>
              </div>

              {extraIndicatorsExpanded ? (
                <div className="space-y-1">
                  <WeightRow
                    label="مصالح"
                    value={String(state.values.adjustMultiMaterialsOtherWeight ?? '')}
                    onToggle={(enabled) => onValueChange('adjustMultiMaterialsOtherWeight', enabled ? String(state.values.adjustMultiMaterialsOtherWeight || '1') : '0')}
                    onChange={(value) => onValueChange('adjustMultiMaterialsOtherWeight', value)}
                    hint="این وزن میزان تاثیر شاخص مصالح را در محاسبه تعدیل قیمت مشخص می‌کند."
                  />
                  <WeightRow
                    label="دستمزد"
                    value={String(state.values.adjustMultiWageWeight ?? '')}
                    onToggle={(enabled) => onValueChange('adjustMultiWageWeight', enabled ? String(state.values.adjustMultiWageWeight || '0') : '0')}
                    onChange={(value) => onValueChange('adjustMultiWageWeight', value)}
                    hint="این وزن میزان تاثیر شاخص دستمزد را در محاسبه تعدیل قیمت مشخص می‌کند."
                  />
                  <WeightRow
                    label="انرژی"
                    value={String(state.values.adjustMultiEnergyWeight ?? '')}
                    onToggle={(enabled) => onValueChange('adjustMultiEnergyWeight', enabled ? String(state.values.adjustMultiEnergyWeight || '0') : '0')}
                    onChange={(value) => onValueChange('adjustMultiEnergyWeight', value)}
                    hint="این وزن میزان تاثیر شاخص انرژی را در محاسبه تعدیل قیمت مشخص می‌کند."
                  />
                  <WeightRow
                    label="شاخص عمومی قیمت"
                    value={String(state.values.adjustMultiGeneralPriceWeight ?? '')}
                    onToggle={(enabled) => onValueChange('adjustMultiGeneralPriceWeight', enabled ? String(state.values.adjustMultiGeneralPriceWeight || '0') : '0')}
                    onChange={(value) => onValueChange('adjustMultiGeneralPriceWeight', value)}
                    hint="این وزن میزان تاثیر شاخص عمومی قیمت را در محاسبه تعدیل قیمت مشخص می‌کند."
                  />
                </div>
              ) : null}

              <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-4 text-right">
                <div className="text-sm font-black text-[color:var(--text-strong)]">جمع درصد شاخص‌ها: {multiIndicatorTotal}٪</div>
                <p className={cn('mt-2 text-sm leading-7', multiIndicatorOverflow ? 'text-rose-600' : 'text-[color:var(--text-muted)]')}>
                  مجموع وزن همه شاخص‌های فعال نباید از ۱۰۰٪ بیشتر باشد.
                </p>
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-6">
                <div className="text-right">
                  <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ تعدیل</h4>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">در صورت نیاز، یک قاعده گرد کردن برای مبلغ تعدیل انتخاب کنید. با کلیک دوباره روی تگ فعال، انتخاب برداشته می‌شود.</p>
                </div>

                <AdjustmentChoicePills options={roundRuleOptions} value={selectedRoundRule} onChange={(value) => onValueChange('adjustFixedRound', value)} />
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
