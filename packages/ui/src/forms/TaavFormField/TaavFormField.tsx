import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TaavFormDescription } from '../TaavFormDescription';
import { TaavFormMessage, type TaavFormMessageTone } from '../TaavFormMessage';
import { TaavLabel } from '../TaavLabel';

export type TaavFormFieldProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  message?: ReactNode;
  messageTone?: TaavFormMessageTone;
  error?: ReactNode;
  htmlFor?: string;
  disabled?: boolean;
  children: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
};

export function TaavFormField({
  label,
  required = false,
  optional = false,
  description,
  message,
  messageTone = 'neutral',
  error,
  htmlFor,
  disabled = false,
  children,
  wrapperClassName,
  contentClassName,
}: TaavFormFieldProps) {
  const resolvedMessage = error ?? message;
  const resolvedTone: TaavFormMessageTone = error ? 'danger' : messageTone;

  return (
    <div
      className={cn('grid gap-[var(--taav-form-field-gap)]', wrapperClassName)}
      data-disabled={disabled || undefined}
    >
      {label ? (
        <TaavLabel htmlFor={htmlFor} required={required} optional={optional} disabled={disabled} tone={error ? 'danger' : 'default'}>
          {label}
        </TaavLabel>
      ) : null}
      {description ? <TaavFormDescription>{description}</TaavFormDescription> : null}
      <div className={cn(contentClassName)}>{children}</div>
      {resolvedMessage ? <TaavFormMessage tone={resolvedTone}>{resolvedMessage}</TaavFormMessage> : null}
    </div>
  );
}
