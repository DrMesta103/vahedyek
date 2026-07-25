'use client';

import { useId, useState } from 'react';
import { TaavInput } from '../../forms/TaavInput';
import { cn } from '../../utils/cn';
import {
  taavDialogFormFieldClass,
  taavDialogFormHelperClass,
  taavDialogFormInputClass,
  taavDialogFormInputTextClass,
  taavDialogFormLabelClass,
  taavDialogFormRequiredClass,
} from '../shared/dialog-form.styles';

export type TaavPlateFormProps = {
  mainPlateValue?: string;
  subPlateValue?: string;
  subPlateValues?: string[];
  onMainPlateChange?: (value: string) => void;
  onSubPlateChange?: (value: string) => void;
  onSubPlateValuesChange?: (values: string[]) => void;
  mainPlateLabel?: string;
  subPlateLabel?: string;
  mainPlatePlaceholder?: string;
  subPlatePlaceholder?: string;
  mainPlateHelperText?: string;
  subPlateHelperText?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

function PlateCheckIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#009b9f] text-white"
    >
      <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none">
        <path
          d="m5.5 12.5 4 4 9-10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function TaavPlateForm({
  mainPlateValue,
  subPlateValue,
  subPlateValues,
  onMainPlateChange,
  onSubPlateChange,
  onSubPlateValuesChange,
  mainPlateLabel = 'پلاک اصلی',
  subPlateLabel = 'پلاک فرعی',
  mainPlatePlaceholder,
  subPlatePlaceholder,
  mainPlateHelperText = 'لطفا عدد را وارد کنید.',
  subPlateHelperText = 'لطفا عدد را وارد کنید.',
  maxLength = 255,
  required = true,
  disabled = false,
  className,
}: TaavPlateFormProps) {
  const generatedId = useId();
  const [internalSubPlateValue, setInternalSubPlateValue] = useState('');
  const [internalSubPlateValues, setInternalSubPlateValues] = useState<string[]>([]);
  const [subPlateInvalid, setSubPlateInvalid] = useState(false);
  const mainId = `${generatedId}-main`;
  const subId = `${generatedId}-sub`;
  const mainCount = mainPlateValue?.length ?? 0;
  const resolvedSubPlateValue = subPlateValue ?? internalSubPlateValue;
  const resolvedSubPlateValues = subPlateValues ?? internalSubPlateValues;
  const subCount = resolvedSubPlateValue.length;

  const updateSubPlateValue = (value: string) => {
    if (subPlateValue === undefined) setInternalSubPlateValue(value);
    onSubPlateChange?.(value);
    if (value.trim()) setSubPlateInvalid(false);
  };

  const updateSubPlateValues = (values: string[]) => {
    if (subPlateValues === undefined) setInternalSubPlateValues(values);
    onSubPlateValuesChange?.(values);
  };

  const addSubPlate = () => {
    const normalizedValue = resolvedSubPlateValue.trim();
    if (!normalizedValue) {
      setSubPlateInvalid(true);
      return;
    }

    if (!resolvedSubPlateValues.includes(normalizedValue)) {
      updateSubPlateValues([...resolvedSubPlateValues, normalizedValue]);
    }
    updateSubPlateValue('');
    setSubPlateInvalid(false);
  };

  const removeSubPlate = (value: string) => {
    updateSubPlateValues(resolvedSubPlateValues.filter((item) => item !== value));
  };

  return (
    <div className={cn('grid gap-[21px]', className)}>
      <div className={taavDialogFormFieldClass}>
        <label htmlFor={mainId} className={taavDialogFormLabelClass}>
          <span>{mainPlateLabel}</span>
          {required ? <span className={taavDialogFormRequiredClass}>*</span> : null}
        </label>
        <TaavInput
          id={mainId}
          inputMode="numeric"
          value={mainPlateValue}
          onChange={(event) => onMainPlateChange?.(event.target.value)}
          placeholder={mainPlatePlaceholder}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          wrapperClassName={taavDialogFormInputClass}
          inputClassName={taavDialogFormInputTextClass}
        />
        <div className={taavDialogFormHelperClass}>
          <span>{mainPlateHelperText}</span>
          <span dir="ltr">{mainCount} / {maxLength}</span>
        </div>
      </div>

      <div className="h-px w-full bg-[#d4d7d9]" role="separator" />

      <div className={taavDialogFormFieldClass}>
        <label
          htmlFor={subId}
          className={cn(taavDialogFormLabelClass, subPlateInvalid && '!text-[#e3262f]')}
        >
          <span>{subPlateLabel}</span>
          {required ? <span className={taavDialogFormRequiredClass}>*</span> : null}
        </label>
        <div dir="ltr" className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={addSubPlate}
            disabled={disabled}
            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70c5c9] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="افزودن پلاک فرعی"
          >
            <PlateCheckIcon />
          </button>
          <TaavInput
            id={subId}
            dir="rtl"
            inputMode="numeric"
            value={resolvedSubPlateValue}
            onChange={(event) => updateSubPlateValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addSubPlate();
              }
            }}
            placeholder={subPlatePlaceholder}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            invalid={subPlateInvalid}
            wrapperClassName={cn(
              taavDialogFormInputClass,
              'flex-1',
              subPlateInvalid && '!border-[#e3262f] focus-within:!border-[#e3262f]',
            )}
            inputClassName={taavDialogFormInputTextClass}
          />
        </div>
        <div className={cn(taavDialogFormHelperClass, subPlateInvalid && '!text-[#e3262f]')}>
          <span>{subPlateInvalid ? 'پلاک فرعی اجباری است.' : subPlateHelperText}</span>
          <span dir="ltr">{subCount} / {maxLength}</span>
        </div>
        {resolvedSubPlateValues.length ? (
          <div className="flex flex-wrap items-center justify-start gap-[8px]" dir="rtl">
            {resolvedSubPlateValues.map((value) => (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => removeSubPlate(value)}
                className="inline-flex h-[37px] items-center gap-[7px] rounded-full border-0 bg-[#b8e3e7] px-[13px] text-[13px] font-medium text-[#187f84] transition-colors hover:bg-[#a9dadd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70c5c9] disabled:opacity-50"
                aria-label={`حذف پلاک فرعی ${value}`}
              >
                <span>{value}</span>
                <span aria-hidden="true" className="text-[18px] font-light leading-none">×</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
