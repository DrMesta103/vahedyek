'use client';

import { useId } from 'react';
import { TaavInput } from '../../forms/TaavInput';
import { TaavTextarea } from '../../forms/TaavTextarea';
import { cn } from '../../utils/cn';
import {
  taavDialogFormFieldClass,
  taavDialogFormInputClass,
  taavDialogFormInputTextClass,
  taavDialogFormLabelClass,
  taavDialogFormRequiredClass,
} from '../shared/dialog-form.styles';

export type TaavProjectTechnicalInfoFormProps = {
  titleValue?: string;
  descriptionValue?: string;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  titleLabel?: string;
  descriptionLabel?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  formIntro?: string;
  className?: string;
};

export function TaavProjectTechnicalInfoForm({
  titleValue,
  descriptionValue,
  onTitleChange,
  onDescriptionChange,
  titleLabel = 'عنوان',
  descriptionLabel = 'توضیحات',
  titlePlaceholder,
  descriptionPlaceholder,
  required = true,
  disabled = false,
  formIntro,
  className,
}: TaavProjectTechnicalInfoFormProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  return (
    <div className={cn('grid gap-[8px]', className)}>
      {formIntro ? <p className="m-0 text-right text-[12px] leading-5 text-[#686b6e]">{formIntro}</p> : null}

      <div className={taavDialogFormFieldClass}>
        <label htmlFor={titleId} className={taavDialogFormLabelClass}>
          <span>{titleLabel}</span>
          {required ? <span className={taavDialogFormRequiredClass}>*</span> : null}
        </label>
        <TaavInput
          id={titleId}
          value={titleValue}
          onChange={(event) => onTitleChange?.(event.target.value)}
          placeholder={titlePlaceholder}
          required={required}
          disabled={disabled}
          wrapperClassName={taavDialogFormInputClass}
          inputClassName={taavDialogFormInputTextClass}
        />
      </div>

      <div className={taavDialogFormFieldClass}>
        <label htmlFor={descriptionId} className={taavDialogFormLabelClass}>
          <span>{descriptionLabel}</span>
          {required ? <span className={taavDialogFormRequiredClass}>*</span> : null}
        </label>
        <TaavTextarea
          id={descriptionId}
          value={descriptionValue}
          onChange={(event) => onDescriptionChange?.(event.target.value)}
          placeholder={descriptionPlaceholder}
          required={required}
          disabled={disabled}
          rows={3}
          wrapperClassName="!min-h-[80px] !rounded-[9px] !border-[#6f7274] !bg-transparent !shadow-none transition-colors group-focus-within:!border-[#009b9f]"
          inputClassName="!min-h-[78px] !resize-none !p-[10px_12px] !text-right !text-[15px] !font-normal !leading-6 !text-[#55585b] placeholder:!text-[#a0a3a5]"
        />
      </div>
    </div>
  );
}
