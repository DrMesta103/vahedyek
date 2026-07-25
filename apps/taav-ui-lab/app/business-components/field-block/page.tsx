'use client';

import { Search, X } from 'lucide-react';
import { TaavCurrencyInput, TaavFieldBlock, TaavInput, TaavPercentageInput } from '@repo/ui/taav/forms';
import { TaavBankAccountInfoInputCard } from '@repo/ui/taav/business';
import { useState, type ReactNode } from 'react';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { FIELD_BLOCK_PROPS } from '@/lib/docs/component-props';

function LightPreview({ children }: { children: ReactNode }) {
  return <div data-taav-theme="light" dir="rtl" className="bg-[#f7f8f8] p-4">{children}</div>;
}

function FieldSupport({ children, count, maxLength }: { children: ReactNode; count: number; maxLength: number }) {
  return (
    <span dir="rtl" className="flex items-center justify-between gap-3 text-[12px] leading-4 text-[#707070]">
      <span>{children}</span>
      <span dir="ltr" className="shrink-0 text-[#777]">{count.toLocaleString('fa-IR')} / {maxLength.toLocaleString('fa-IR')}</span>
    </span>
  );
}

function MainFieldBlockPreview() {
  const [taxFileNumber, setTaxFileNumber] = useState('');
  const [economicCode, setEconomicCode] = useState('');
  const onlyDigits = (value: string) => value.replace(/[^0-9۰-۹]/g, '');

  return (
    <div className="mx-auto grid w-full max-w-[672px] gap-4 md:grid-cols-2">
      <TaavFieldBlock
        label="شماره پرونده مالیاتی"
        htmlFor="components-tax-file-number"
        supportText={<FieldSupport count={taxFileNumber.length} maxLength={50}>شماره اختصاصی در اداره مالیات</FieldSupport>}
        wrapperClassName="group gap-2"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="-mt-1 text-[12px] text-[#707070]"
      >
        <TaavInput
          id="components-tax-file-number"
          value={taxFileNumber}
          onChange={(event) => setTaxFileNumber(onlyDigits(event.target.value).slice(0, 50))}
          autoComplete="off"
          inputMode="numeric"
          maxLength={50}
          size="md"
          radius="md"
          wrapperClassName="h-[37px] min-h-0 border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] focus-within:!border-[#009da8] group-focus-within:!shadow-none focus-within:!shadow-none"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
      <TaavFieldBlock
        label="کد اقتصادی"
        required
        htmlFor="components-economic-code"
        supportText={<FieldSupport count={economicCode.length} maxLength={12}>کد اقتصادی ۱۲ رقمی صادر شده توسط سازمان امور مالیاتی</FieldSupport>}
        wrapperClassName="group gap-2"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="-mt-1 text-[12px] text-[#707070]"
      >
        <TaavInput
          id="components-economic-code"
          value={economicCode}
          onChange={(event) => setEconomicCode(onlyDigits(event.target.value).slice(0, 12))}
          autoComplete="off"
          inputMode="numeric"
          maxLength={12}
          size="md"
          radius="md"
          wrapperClassName="h-[37px] min-h-0 border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] focus-within:!border-[#009da8] group-focus-within:!shadow-none focus-within:!shadow-none"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
    </div>
  );
}

type IdentityFieldsState = 'filled' | 'invalid' | 'empty';

function IdentityFieldsToken({ state }: { state: IdentityFieldsState }) {
  const values = state === 'filled'
    ? { firstName: 'محمد کاظم', lastName: 'عباسی', nationalId: '۲۲۹۱۸۷۵۵۹' }
    : state === 'invalid'
      ? { firstName: 'محمد کاظم', lastName: 'عباسی', nationalId: '۲۲۲۲' }
      : { firstName: '', lastName: '', nationalId: '' };
  const invalid = state === 'invalid';

  return (
    <div dir="rtl" className="grid w-full max-w-[430px] gap-3">
      <TaavFieldBlock
        label="نام"
        required
        htmlFor={`identity-first-name-${state}`}
        wrapperClassName="group gap-1"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
      >
        <TaavInput
          id={`identity-first-name-${state}`}
          value={values.firstName}
          readOnly
          autoComplete="off"
          size="md"
          radius="md"
          wrapperClassName="!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8]"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
      <TaavFieldBlock
        label="نام خانوادگی"
        required
        htmlFor={`identity-last-name-${state}`}
        wrapperClassName="group gap-1"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
      >
        <TaavInput
          id={`identity-last-name-${state}`}
          value={values.lastName}
          readOnly
          autoComplete="off"
          size="md"
          radius="md"
          wrapperClassName="!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8]"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
      <TaavFieldBlock
        label="کد ملی"
        required
        invalid={invalid}
        htmlFor={`identity-national-id-${state}`}
        wrapperClassName="group gap-1"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
      >
        <TaavInput
          id={`identity-national-id-${state}`}
          value={values.nationalId}
          readOnly
          autoComplete="off"
          size="md"
          radius="md"
          invalid={invalid}
          wrapperClassName="!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
    </div>
  );
}

function InteractiveIdentityFieldsToken() {
  const [values, setValues] = useState({ firstName: '', lastName: '', nationalId: '' });
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const nationalIdInvalid = values.nationalId.length > 0 && values.nationalId.length !== 10;

  return (
    <div dir="rtl" className="grid w-full max-w-[430px] gap-3">
      <TaavFieldBlock label="نام" required htmlFor="interactive-identity-first-name" wrapperClassName="group gap-1" labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]" controlClassName="min-h-0">
        <TaavInput
          id="interactive-identity-first-name"
          value={values.firstName}
          onChange={(event) => update('firstName', event.target.value)}
          autoComplete="off"
          size="md"
          radius="md"
          wrapperClassName="!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8]"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
      <TaavFieldBlock label="نام خانوادگی" required htmlFor="interactive-identity-last-name" wrapperClassName="group gap-1" labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]" controlClassName="min-h-0">
        <TaavInput
          id="interactive-identity-last-name"
          value={values.lastName}
          onChange={(event) => update('lastName', event.target.value)}
          autoComplete="off"
          size="md"
          radius="md"
          wrapperClassName="!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8]"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
      <TaavFieldBlock label="کد ملی" required invalid={nationalIdInvalid} error={nationalIdInvalid ? 'کد ملی معتبر نیست' : undefined} htmlFor="interactive-identity-national-id" wrapperClassName="group gap-1" labelClassName={`text-[16px] font-semibold ${nationalIdInvalid ? 'text-[#c62828] group-focus-within:text-[#c62828]' : 'text-[#555] group-focus-within:text-[#009da8]'}`} controlClassName="min-h-0">
        <TaavInput
          id="interactive-identity-national-id"
          value={values.nationalId}
          onChange={(event) => update('nationalId', event.target.value.replace(/[^0-9۰-۹]/g, '').slice(0, 10))}
          autoComplete="off"
          inputMode="numeric"
          maxLength={10}
          size="md"
          radius="md"
          invalid={nationalIdInvalid}
          wrapperClassName={`!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none ${nationalIdInvalid ? '!border-[#e3262f] focus-within:!border-[#e3262f]' : 'group-focus-within:!border-[#009da8]'}`}
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
    </div>
  );
}

function AmountInputState({ id, value, invalid = false, error }: { id: string; value?: number; invalid?: boolean; error?: string }) {
  const helperText = 'این مقدار به صورت عدد ثابت برای هزینه یا پرداخت مشخص شده و مستقل از درصد یا شرایط دیگر است.';

  return (
    <TaavFieldBlock
      label="مبلغ منظور"
      required
      invalid={invalid}
      error={error}
      htmlFor={id}
      supportText={invalid ? undefined : helperText}
      wrapperClassName="group gap-1"
      labelClassName={`text-[16px] font-semibold ${invalid ? 'text-[#e3262f] group-focus-within:text-[#e3262f]' : 'text-[#555] group-focus-within:text-[#009da8]'}`}
      controlClassName="min-h-0"
      supportClassName="text-[12px] text-[#707070]"
    >
      <TaavCurrencyInput
        id={id}
        defaultValue={value}
        currency="toman"
        size="md"
        invalid={invalid}
        wrapperClassName={`!h-[40px] !min-h-0 !rounded-[8px] !border-[#555] !bg-white !shadow-none ${invalid ? '!border-[#e3262f] focus-within:!border-[#e3262f]' : 'group-focus-within:!border-[#009da8]'}`}
        inputClassName="!text-[14px] !font-normal leading-5 !text-[#555]"
        autoComplete="off"
        ariaLabel="مبلغ منظور"
      />
    </TaavFieldBlock>
  );
}

function InteractiveAmountInputToken() {
  const [amount, setAmount] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const invalid = touched && (amount === null || amount <= 0);
  const helperText = 'این مقدار به صورت عدد ثابت برای هزینه یا پرداخت مشخص شده و مستقل از درصد یا شرایط دیگر است.';

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-[912px]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setTouched(true);
      }}
    >
      <TaavFieldBlock
        label="مبلغ منظور"
        required
        invalid={invalid}
        error={invalid ? 'لطفاً مبلغ منظور را وارد کنید.' : undefined}
        htmlFor="interactive-amount-input"
        supportText={invalid ? undefined : helperText}
        wrapperClassName="group gap-1"
        labelClassName={`text-[16px] font-semibold ${invalid ? 'text-[#e3262f] group-focus-within:text-[#e3262f]' : 'text-[#555] group-focus-within:text-[#009da8]'}`}
        controlClassName="min-h-0"
        supportClassName="text-[12px] text-[#707070]"
      >
        <TaavCurrencyInput
          id="interactive-amount-input"
          value={amount ?? undefined}
          onValueChange={setAmount}
          currency="toman"
          currencyLabel="تومان"
          size="md"
          invalid={invalid}
          wrapperClassName={`!h-[40px] !min-h-0 !rounded-[8px] !border-[#555] !bg-[#fafafa] !shadow-none [&>span]:!font-normal [&>span]:!text-[#555] ${invalid ? '!border-[#e3262f] focus-within:!border-[#e3262f]' : 'group-focus-within:!border-[#009da8]'}`}
          inputClassName="!text-[14px] !font-normal leading-5 !text-[#555]"
          autoComplete="off"
          ariaLabel="مبلغ منظور"
        />
      </TaavFieldBlock>
    </div>
  );
}

function MobileOrEmailInputToken() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 50;
  const helperText = 'وارد کردن شماره موبایل یا ایمیل برای ثبت کاربر ضروری می‌باشد.';
  const counter = `${value.length}/${maxLength}`;
  const normalizedValue = value.trim().replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit).toString()).replace(/\s+/g, '');
  const mobileDigits = normalizedValue.replace(/\D/g, '');
  const emailLike = normalizedValue.includes('@');
  const clearable = normalizedValue.length > 0;
  const suggestionValue = emailLike ? normalizedValue : mobileDigits ? (mobileDigits.startsWith('0') ? mobileDigits.slice(1) : mobileDigits) : '';

  return (
    <div dir="rtl" className="mx-auto w-full max-w-[920px]">
      <TaavFieldBlock
        label="موبایل یا ایمیل"
        required
        htmlFor="mobile-or-email-input"
        supportText={(
          <span dir="rtl" className="flex w-full items-start justify-between gap-3">
            <span className="min-w-0 flex-1 text-right">{helperText}</span>
            <span dir="ltr" className="shrink-0 text-left text-[#777]">{counter}</span>
          </span>
        )}
        wrapperClassName="group gap-1"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="w-full text-[12px] leading-6 text-[#707070]"
      >
        <div className="space-y-2">
          <TaavInput
            id="mobile-or-email-input"
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, maxLength))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            inputMode="text"
            size="md"
            radius="md"
            maxLength={maxLength}
            iconEnd={(
              <span dir="ltr" className="inline-flex items-center gap-1.5 text-[#777]">
                <Search className="h-[19px] w-[19px]" strokeWidth={1.6} aria-hidden />
                {clearable ? (
                  <button
                    type="button"
                    aria-label="پاک کردن مقدار"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setValue('')}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-white transition-colors ${isFocused ? 'bg-[#009da8] hover:bg-[#00848d]' : 'bg-[#9da3a6] hover:bg-[#8c9295]'}`}
                  >
                    <X className="h-[13px] w-[13px]" strokeWidth={2.6} aria-hidden />
                  </button>
                ) : null}
              </span>
            )}
            wrapperClassName="!h-[40px] !min-h-0 !rounded-[13px] !border-[#666] !bg-white !shadow-none focus-within:!border-[#009da8]"
            inputClassName="text-[16px] font-normal leading-5 text-[#555] text-right"
          />
          {isFocused && suggestionValue ? (
            <div className="rounded-[12px] border border-[#e2e4e7] bg-white px-4 py-2 text-right text-[14px] leading-6 text-[#555] shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
              {suggestionValue}
            </div>
          ) : null}
        </div>
      </TaavFieldBlock>
    </div>
  );
}

function CalendarInputToken() {
  const [value, setValue] = useState('');
  const helperText = 'تاریخی که اقساط باید تا آن زمان به پایان برسند. تعداد و مبلغ اقساط بر اساس این تاریخ محاسبه می‌شود.';
  const inputId = 'last-installment-date';
  const selectedDate = '۱۴۰۵ / ۰۴ / ۰۹';
  const hasValue = value.length > 0;

  return (
    <div dir="rtl" className="mx-auto w-full max-w-[920px]">
      <TaavFieldBlock
        label="تاریخ آخرین قسط"
        required
        htmlFor={inputId}
        supportText={helperText}
        wrapperClassName="group gap-1"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="text-[12px] leading-6 text-[#707070]"
      >
        <div className="relative h-[40px] w-full">
          <input
            id={inputId}
            value=""
            readOnly
            aria-label="انتخاب تاریخ آخرین قسط"
            onClick={() => setValue(selectedDate)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setValue(selectedDate);
              }
            }}
            className="h-full w-full cursor-pointer rounded-[8px] border border-[#666] bg-white px-3 outline-none transition-colors hover:border-[#555] focus:border-[#009da8]"
          />

          <span
            dir="ltr"
            className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center gap-[10px] text-[#8a8a8a]"
          >
            <span className="inline-flex h-[22px] w-[22px] items-center justify-center" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 3v3M17 3v3M4 8.5h16M5.5 5h13A1.5 1.5 0 0 1 20 6.5v13A1.5 1.5 0 0 1 18.5 21h-13A1.5 1.5 0 0 1 4 19.5v-13A1.5 1.5 0 0 1 5.5 5Z"
                  stroke="currentColor"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            {hasValue ? <span className="h-6 w-px bg-[#d6d6d6]" aria-hidden /> : null}
            {hasValue ? (
              <>
                <button
                  type="button"
                  aria-label="پاک کردن تاریخ"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setValue('');
                  }}
                  className="pointer-events-auto inline-flex h-[22px] w-[22px] items-center justify-center rounded text-[#9a9a9a] transition-colors hover:bg-[#eeeeee] hover:text-[#666]"
                >
                  <X className="h-[17px] w-[17px]" strokeWidth={1.6} aria-hidden />
                </button>
                <span dir="ltr" className="whitespace-nowrap text-[16px] font-normal leading-5 text-[#555]">
                  {value}
                </span>
              </>
            ) : null}
          </span>
        </div>
      </TaavFieldBlock>
    </div>
  );
}

function PercentageDisplayToken() {
  return (
    <div dir="rtl" className="mx-auto w-full max-w-[912px]">
      <TaavFieldBlock
        label="درصد منظور"
        required
        htmlFor="interactive-percentage-input"
        supportText="این مقدار به صورت درصدی از مبلغ محاسبه می‌شود و با تغییر مبلغ قرارداد، به‌طور خودکار به‌روزرسانی می‌شود."
        wrapperClassName="group gap-1"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="text-[12px] leading-6 text-[#707070]"
      >
        <TaavPercentageInput
          id="interactive-percentage-input"
          defaultValue={22}
          size="md"
          inputMode="decimal"
          min={0}
          max={100}
          wrapperClassName="!h-[40px] !min-h-0 !rounded-[8px] !border-[#555] !bg-white !shadow-none group-focus-within:!border-[#009da8] focus-within:!border-[#009da8] [&>span]:!font-normal [&>span]:!text-[#555]"
          inputClassName="!text-[14px] !font-normal leading-5 !text-[#555]"
          autoComplete="off"
          ariaLabel="درصد منظور"
        />
      </TaavFieldBlock>
    </div>
  );
}

function NamingRangeInputToken() {
  const [values, setValues] = useState({ prefix: '', from: '1', to: '' });
  const [touched, setTouched] = useState({ prefix: false, from: false, to: false });

  const prefixInvalid = touched.prefix && !values.prefix.trim();
  const fromInvalid = touched.from && !values.from.trim();
  const toEmpty = touched.to && !values.to.trim();
  const fromValue = Number(values.from);
  const toValue = Number(values.to);
  const rangeInvalid = Boolean(values.from.trim() && values.to.trim() && Number.isFinite(fromValue) && Number.isFinite(toValue) && toValue < fromValue);
  const toInvalid = toEmpty || (touched.to && rangeInvalid);

  const setValue = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div dir="rtl" className="mx-auto w-full max-w-[960px]">
      <div className="grid items-start gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
        <TaavFieldBlock
          label="پیشوند نامگذاری"
          required
          htmlFor="naming-prefix"
          tooltip="مانند A"
          tooltipAlign="end"
          wrapperClassName="group gap-1"
          labelClassName={`text-[16px] font-semibold ${prefixInvalid ? 'text-[#e3262f] group-focus-within:text-[#e3262f]' : 'text-[#555] group-focus-within:text-[#009da8]'}`}
          controlClassName="min-h-0"
          supportClassName="text-right text-[12px] leading-6 text-[#707070]"
        >
          <TaavInput
            id="naming-prefix"
            value={values.prefix}
            onChange={(event) => setValue('prefix', event.target.value.slice(0, 1))}
            onBlur={() => setTouched((current) => ({ ...current, prefix: true }))}
            autoComplete="off"
            size="md"
            radius="md"
            invalid={prefixInvalid}
            wrapperClassName={`!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] ${prefixInvalid ? '!border-[#e3262f] focus-within:!border-[#e3262f]' : ''}`}
            inputClassName="text-[14px] leading-5 text-[#555] text-right"
          />
        </TaavFieldBlock>

        <TaavFieldBlock
          label="از"
          required
          htmlFor="naming-from"
          tooltip={fromInvalid ? 'اجباری' : 'شماره‌گذاری مانند از ۲ تا ۵'}
          tooltipAlign="end"
          wrapperClassName="group gap-1"
          labelClassName={`text-[16px] font-semibold ${fromInvalid ? 'text-[#e3262f] group-focus-within:text-[#e3262f]' : 'text-[#555] group-focus-within:text-[#009da8]'}`}
          controlClassName="min-h-0"
          supportClassName="text-right text-[12px] leading-6 text-[#707070]"
        >
          <TaavInput
            id="naming-from"
            value={values.from}
            onChange={(event) => setValue('from', event.target.value.replace(/[^0-9۰-۹]/g, ''))}
            onBlur={() => setTouched((current) => ({ ...current, from: true }))}
            autoComplete="off"
            inputMode="numeric"
            size="md"
            radius="md"
            invalid={fromInvalid}
            wrapperClassName={`!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] ${fromInvalid ? '!border-[#e3262f] focus-within:!border-[#e3262f]' : ''}`}
            inputClassName="text-[14px] leading-5 text-[#555] text-right"
          />
        </TaavFieldBlock>

        <TaavFieldBlock
          label="تا"
          required
          htmlFor="naming-to"
          wrapperClassName="group gap-1"
          labelClassName={`text-[16px] font-semibold ${toInvalid ? 'text-[#e3262f] group-focus-within:text-[#e3262f]' : 'text-[#555] group-focus-within:text-[#009da8]'}`}
          controlClassName="min-h-0"
          error={toInvalid ? 'اجباری' : undefined}
          supportClassName="text-right text-[12px] leading-6 text-[#707070]"
        >
          <TaavInput
            id="naming-to"
            value={values.to}
            onChange={(event) => setValue('to', event.target.value.replace(/[^0-9۰-۹]/g, ''))}
            onBlur={() => setTouched((current) => ({ ...current, to: true }))}
            autoComplete="off"
            inputMode="numeric"
            size="md"
            radius="md"
            invalid={toInvalid}
            wrapperClassName={`!h-[38px] !min-h-0 !rounded-[8px] !border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] ${toInvalid ? '!border-[#e3262f] focus-within:!border-[#e3262f]' : ''}`}
            inputClassName="text-[14px] leading-5 text-[#555] text-right"
          />
        </TaavFieldBlock>
      </div>
    </div>
  );
}

export default function ComponentsFieldBlockDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'inputs' }]}>
      <DocPageHeader
        eyebrow="Components"
        title="inputs"
        description="کامپوننت اصلی برای ساخت فیلدهای استاندارد کسب‌وکار با برچسب، کنترل و متن راهنما."
        importCode={`import { TaavFieldBlock } from "@repo/ui/taav/forms";`}
      />
      <DocSection title="کامپوننت اصلی">
        <LightPreview>
          <MainFieldBlockPreview />
        </LightPreview>
      </DocSection>
      <DocSection title="توکن identity-fields">
        <LightPreview>
          <div className="flex justify-center">
            <InteractiveIdentityFieldsToken />
          </div>
        </LightPreview>
      </DocSection>
      <DocSection title="توکن bank-account-input">
        <LightPreview>
          <div className="flex justify-center">
            <TaavBankAccountInfoInputCard
              className="w-full max-w-[900px] !rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
              themeMode="light"
              shebaNumber={{ showPrefixOnFocus: true }}
            />
          </div>
        </LightPreview>
      </DocSection>
      <DocSection title="توکن amount-input">
        <LightPreview>
          <InteractiveAmountInputToken />
        </LightPreview>
      </DocSection>
      <DocSection title="توکن percentage-input">
        <LightPreview>
          <PercentageDisplayToken />
        </LightPreview>
      </DocSection>
      <DocSection title="توکن naming-range-input">
        <LightPreview>
          <NamingRangeInputToken />
        </LightPreview>
      </DocSection>
      <DocSection title="توکن موبایل یا ایمیل">
        <LightPreview>
          <MobileOrEmailInputToken />
        </LightPreview>
      </DocSection>
      <DocSection title="توکن تاریخ آخرین قسط">
        <LightPreview>
          <CalendarInputToken />
        </LightPreview>
      </DocSection>
      <DocApiNote />
      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavFieldBlock
  label="کد اقتصادی"
  required
  htmlFor="economic-code"
  supportText="کد اقتصادی ۱۲ رقمی صادر شده توسط سازمان امور مالیاتی"
>
  <TaavInput id="economic-code" />
</TaavFieldBlock>`}</DocCodeBlock>
      </DocSection>
      <DocSection title="Props">
        <DocPropsTable rows={FIELD_BLOCK_PROPS} />
      </DocSection>
      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines
          items={[
            'برای اتصال برچسب به کنترل، htmlFor و id را با یک مقدار یکتا تنظیم کنید.',
            'متن راهنما از طریق aria-describedby به کنترل فرزند متصل می‌شود.',
            'required بودن فیلد با API و نشانه‌ی بصری ستاره نمایش داده می‌شود.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}

