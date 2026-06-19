import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';
import { cn } from '../../utils/cn';
import { TaavFormDescription } from '../TaavFormDescription';
import { TaavFormMessage, type TaavFormMessageTone } from '../TaavFormMessage';
import { TaavLabel } from '../TaavLabel';
import {
  taavFieldBlockControlVariants,
  taavFieldBlockFeedbackVariants,
  taavFieldBlockLabelVariants,
  taavFieldBlockSupportVariants,
  taavFieldBlockVariants,
  type TaavFieldBlockAlign,
  type TaavFieldBlockSize,
  type TaavFieldTextAlign,
} from '../shared/field-layout.variants';

export type TaavFieldBlockProps = {
  label: ReactNode;
  required?: boolean;
  optional?: boolean;
  tooltip?: ReactNode;
  hint?: ReactNode;
  supportText?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  warning?: ReactNode;
  htmlFor?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: TaavFieldBlockSize;
  align?: TaavFieldBlockAlign;
  tooltipAlign?: TaavFieldTextAlign;
  labelAlign?: TaavFieldTextAlign;
  children: ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  controlClassName?: string;
  supportClassName?: string;
  unsafeClassName?: string;
};

function withDescribedBy(children: ReactNode, describedBy: string | undefined, invalid: boolean) {
  if (!isValidElement(children)) return children;

  const element = children as ReactElement<Record<string, unknown>>;
  const existingDescribedBy =
    typeof element.props['aria-describedby'] === 'string' ? element.props['aria-describedby'] : undefined;

  const mergedDescribedBy = [existingDescribedBy, describedBy].filter(Boolean).join(' ') || undefined;

  return cloneElement(element, {
    'aria-describedby': mergedDescribedBy,
    'aria-invalid': invalid || undefined,
  });
}

export function TaavFieldBlock({
  label,
  required = false,
  optional = false,
  tooltip,
  hint,
  supportText,
  description,
  error,
  success,
  warning,
  htmlFor,
  disabled = false,
  invalid = false,
  size = 'md',
  align = 'stretch',
  tooltipAlign = 'start',
  labelAlign = 'start',
  children,
  wrapperClassName,
  labelClassName,
  controlClassName,
  supportClassName,
  unsafeClassName,
}: TaavFieldBlockProps) {
  const generatedId = useId();
  const supportId = `${generatedId}-support`;
  const messageId = `${generatedId}-message`;
  const resolvedSupport = supportText ?? hint ?? tooltip ?? description;
  const resolvedStatus = error ?? warning ?? success;
  const resolvedTone: TaavFormMessageTone | undefined = error
    ? 'danger'
    : warning
      ? 'warning'
      : success
        ? 'success'
        : undefined;
  const describedBy = [resolvedSupport ? supportId : null, resolvedStatus ? messageId : null]
    .filter(Boolean)
    .join(' ');
  const isInvalid = invalid || Boolean(error);

  return (
    <div
      className={cn(taavFieldBlockVariants({ size, align }), wrapperClassName, unsafeClassName)}
      data-disabled={disabled || undefined}
      data-invalid={isInvalid || undefined}
      data-required={required || undefined}
    >
      <TaavLabel
        htmlFor={htmlFor}
        required={required}
        optional={optional}
        disabled={disabled}
        tone={isInvalid ? 'danger' : 'default'}
        wrapperClassName={cn(taavFieldBlockLabelVariants({ size, align: labelAlign }), labelClassName)}
      >
        {label}
      </TaavLabel>

      <div className={cn(taavFieldBlockControlVariants({ size }), controlClassName)}>
        {withDescribedBy(children, describedBy || undefined, isInvalid)}
      </div>

      {resolvedSupport ? (
        <TaavFormDescription
          size={size === 'sm' ? 'sm' : 'md'}
          unsafeClassName={cn(taavFieldBlockSupportVariants({ size, align: tooltipAlign }), supportClassName)}
        >
          <span id={supportId}>{resolvedSupport}</span>
        </TaavFormDescription>
      ) : null}

      {resolvedStatus && resolvedTone ? (
        <TaavFormMessage
          tone={resolvedTone}
          size={size === 'sm' ? 'sm' : 'md'}
          unsafeClassName={cn(
            taavFieldBlockFeedbackVariants({ size, align: tooltipAlign }),
            resolvedTone === 'danger' && 'text-[var(--taav-field-block-error-color)]',
          )}
        >
          <span id={messageId}>{resolvedStatus}</span>
        </TaavFormMessage>
      ) : null}
    </div>
  );
}
