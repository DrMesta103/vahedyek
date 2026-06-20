import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavSwitchThumbClasses,
  getTaavSwitchTrackClasses,
  taavChoiceDescriptionTextClass,
  taavChoiceLabelLayoutClass,
  taavChoiceLabelTextClass,
  taavChoiceTextBlockClass,
  type TaavChoiceSize,
  type TaavChoiceTone,
} from '../shared/choice-control.variants';

export type TaavSwitchProps = {
  size?: TaavChoiceSize;
  tone?: TaavChoiceTone;
  invalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  wrapperClassName?: string;
  controlClassName?: string;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type' | 'onChange'>;

export function TaavSwitch({
  size = 'md',
  tone = 'brand',
  invalid = false,
  label,
  description,
  disabled,
  wrapperClassName,
  controlClassName,
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  onChange,
  ...props
}: TaavSwitchProps) {
  const track = (
    <span
      className={cn(
        getTaavSwitchTrackClasses(size, tone),
        invalid && 'ring-1 ring-[color:var(--taav-control-invalid-border)]',
      )}
      aria-hidden
    >
      <span className={getTaavSwitchThumbClasses(size)} />
    </span>
  );

  if (!label && !description) {
    return (
      <label
        className={cn('group inline-flex shrink-0 items-center', disabled && 'cursor-not-allowed opacity-60', wrapperClassName)}
      >
        <input
          id={id}
          type="checkbox"
          role="switch"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          checked={checked}
          defaultChecked={defaultChecked}
          className={cn('peer sr-only', controlClassName)}
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
          {...props}
        />
        {track}
      </label>
    );
  }

  return (
    <label
      className={cn(
        taavChoiceLabelLayoutClass,
        'group items-center',
        disabled && 'cursor-not-allowed opacity-60',
        wrapperClassName,
      )}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        checked={checked}
        defaultChecked={defaultChecked}
        className={cn('peer sr-only', controlClassName)}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
        {...props}
      />
      {track}
      <span className={taavChoiceTextBlockClass}>
        {label ? <span className={taavChoiceLabelTextClass}>{label}</span> : null}
        {description ? <span className={taavChoiceDescriptionTextClass}>{description}</span> : null}
      </span>
    </label>
  );
}
