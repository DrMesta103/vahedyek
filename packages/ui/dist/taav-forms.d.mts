export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.mjs';
import * as react from 'react';
import { ReactNode, LabelHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import 'clsx';

type TaavLabelSize = 'sm' | 'md' | 'lg';
type TaavLabelTone = 'default' | 'muted' | 'danger';
type TaavLabelProps = {
    htmlFor?: string;
    children: ReactNode;
    size?: TaavLabelSize;
    tone?: TaavLabelTone;
    required?: boolean;
    optional?: boolean;
    disabled?: boolean;
    wrapperClassName?: string;
} & Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className' | 'children'>;
declare function TaavLabel({ htmlFor, children, size, tone, required, optional, disabled, wrapperClassName, ...props }: TaavLabelProps): react.JSX.Element;

type TaavRequiredMarkTone = 'danger' | 'muted';
type TaavRequiredMarkProps = {
    tone?: TaavRequiredMarkTone;
    /** Accessible label for screen readers */
    label?: string;
};
declare function TaavRequiredMark({ tone, label }: TaavRequiredMarkProps): react.JSX.Element;

type TaavFieldSize = 'sm' | 'md' | 'lg';
type TaavFieldVariant = 'default' | 'filled' | 'soft' | 'ghost';
type TaavFieldTone = 'neutral' | 'success' | 'warning' | 'danger';
type TaavFieldWidth = 'auto' | 'full';
type TaavFieldRadius = 'md' | 'lg' | 'xl';

type TaavInputProps = {
    size?: TaavFieldSize;
    variant?: TaavFieldVariant;
    tone?: TaavFieldTone;
    width?: TaavFieldWidth;
    radius?: TaavFieldRadius;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    required?: boolean;
    loading?: boolean;
    iconStart?: ReactNode;
    iconEnd?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    wrapperClassName?: string;
    inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'>;
declare function TaavInput({ size, variant, tone, width, radius, disabled, readOnly, invalid, required, loading, iconStart, iconEnd, prefix, suffix, wrapperClassName, inputClassName, type, ...props }: TaavInputProps): react.JSX.Element;

type TaavCurrencyInputProps = {
    value?: number | string;
    defaultValue?: number | string;
    onValueChange?: (value: number | null) => void;
    currency?: 'rial' | 'toman';
    currencyLabel?: ReactNode;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    required?: boolean;
    size?: TaavFieldSize;
    tone?: TaavFieldTone;
    name?: string;
    id?: string;
    inputMode?: 'numeric' | 'decimal';
    autoComplete?: string;
    ariaLabel?: string;
    wrapperClassName?: string;
    inputClassName?: string;
    unsafeClassName?: string;
};
declare function TaavCurrencyInput({ value, defaultValue, onValueChange, currency, currencyLabel, min, max, placeholder, disabled, readOnly, invalid, required, size, tone, name, id, inputMode, autoComplete, ariaLabel, wrapperClassName, inputClassName, unsafeClassName, }: TaavCurrencyInputProps): react.JSX.Element;

type TaavPercentageInputProps = {
    value?: number | string;
    defaultValue?: number | string;
    onValueChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    required?: boolean;
    size?: TaavFieldSize;
    tone?: TaavFieldTone;
    name?: string;
    id?: string;
    inputMode?: 'numeric' | 'decimal';
    autoComplete?: string;
    ariaLabel?: string;
    wrapperClassName?: string;
    inputClassName?: string;
    unsafeClassName?: string;
};
declare function TaavPercentageInput({ value, defaultValue, onValueChange, min, max, placeholder, disabled, readOnly, invalid, required, size, tone, name, id, inputMode, autoComplete, ariaLabel, wrapperClassName, inputClassName, unsafeClassName, }: TaavPercentageInputProps): react.JSX.Element;

type TaavTextareaProps = {
    size?: TaavFieldSize;
    variant?: TaavFieldVariant;
    tone?: TaavFieldTone;
    width?: TaavFieldWidth;
    radius?: TaavFieldRadius;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    required?: boolean;
    rows?: number;
    minRows?: number;
    maxLength?: number;
    showCount?: boolean;
    wrapperClassName?: string;
    inputClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'size'>;
declare function TaavTextarea({ size, variant, tone, width, radius, disabled, readOnly, invalid, required, rows, minRows, maxLength, showCount, wrapperClassName, inputClassName, value, defaultValue, onChange, ...props }: TaavTextareaProps): react.JSX.Element;

type TaavFormMessageTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type TaavFormMessageSize = 'sm' | 'md';
type TaavFormMessageProps = {
    tone?: TaavFormMessageTone;
    size?: TaavFormMessageSize;
    icon?: ReactNode;
    children?: ReactNode;
    unsafeClassName?: string;
};
declare function TaavFormMessage({ tone, size, icon, children, unsafeClassName, }: TaavFormMessageProps): react.JSX.Element | null;

type TaavFormFieldProps = {
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
declare function TaavFormField({ label, required, optional, description, message, messageTone, error, htmlFor, disabled, children, wrapperClassName, contentClassName, }: TaavFormFieldProps): react.JSX.Element;

type TaavFieldBlockSize = 'sm' | 'md' | 'lg';
type TaavFieldBlockAlign = 'start' | 'center' | 'end' | 'stretch';
type TaavFieldTextAlign = 'start' | 'center' | 'end';
type TaavFieldGridColumns = 1 | 2 | 3 | 4;
type TaavFieldGridGap = 'sm' | 'md' | 'lg' | 'xl';
type TaavFieldGridDensity = 'compact' | 'comfortable' | 'spacious';

type TaavFieldBlockProps = {
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
declare function TaavFieldBlock({ label, required, optional, tooltip, hint, supportText, description, error, success, warning, htmlFor, disabled, invalid, size, align, tooltipAlign, labelAlign, children, wrapperClassName, labelClassName, controlClassName, supportClassName, unsafeClassName, }: TaavFieldBlockProps): react.JSX.Element;

type TaavFieldGridProps = {
    columns?: TaavFieldGridColumns;
    gap?: TaavFieldGridGap;
    density?: TaavFieldGridDensity;
    responsive?: boolean;
    children: ReactNode;
};
declare function TaavFieldGrid({ columns, gap, density, responsive, children, }: TaavFieldGridProps): react.JSX.Element;

type TaavChoiceChipTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type TaavChoiceChipSize = 'sm' | 'md' | 'lg';
type TaavChoiceChipShape = 'pill' | 'rounded';
type TaavChoiceChipGap = 'sm' | 'md' | 'lg';

type TaavChoiceChipOption = {
    label: string;
    value: string;
    disabled?: boolean;
    icon?: ReactNode;
};
type TaavChoiceChipGroupProps = {
    options: TaavChoiceChipOption[];
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    selectionMode?: 'single' | 'multiple';
    label?: ReactNode;
    description?: ReactNode;
    hint?: ReactNode;
    required?: boolean;
    size?: TaavChoiceChipSize;
    tone?: TaavChoiceChipTone;
    disabled?: boolean;
    invalid?: boolean;
    wrap?: boolean;
    gap?: TaavChoiceChipGap;
    align?: 'start' | 'center' | 'end';
    ariaLabel?: string;
    className?: string;
    labelClassName?: string;
    descriptionClassName?: string;
};
declare function TaavChoiceChipGroup({ options, value, defaultValue, onValueChange, selectionMode, label, description, hint, required, size, tone, disabled, invalid, wrap, gap, align, ariaLabel, className, labelClassName, descriptionClassName, }: TaavChoiceChipGroupProps): react.JSX.Element;

type TaavFormDescriptionSize = 'sm' | 'md';
type TaavFormDescriptionTone = 'muted' | 'neutral' | 'info';
type TaavFormDescriptionProps = {
    size?: TaavFormDescriptionSize;
    tone?: TaavFormDescriptionTone;
    children?: ReactNode;
    unsafeClassName?: string;
};
declare function TaavFormDescription({ size, tone, children, unsafeClassName, }: TaavFormDescriptionProps): react.JSX.Element | null;

type TaavSelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};
type TaavSelectProps = {
    size?: TaavFieldSize;
    variant?: TaavFieldVariant;
    tone?: TaavFieldTone;
    width?: TaavFieldWidth;
    radius?: TaavFieldRadius;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    placeholder?: string;
    options: TaavSelectOption[];
    iconStart?: ReactNode;
    wrapperClassName?: string;
    controlClassName?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'size' | 'children'>;
declare function TaavSelect({ size, variant, tone, width, radius, disabled, invalid, required, placeholder, options, iconStart, wrapperClassName, controlClassName, value, defaultValue, ...props }: TaavSelectProps): react.JSX.Element;

type TaavChoiceSize = 'sm' | 'md' | 'lg';
type TaavChoiceTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
type TaavSegmentedTone = 'brand' | 'neutral';
type TaavSegmentedVariant = 'solid' | 'soft' | 'outline';
type TaavSegmentedWidth = 'auto' | 'full';

type TaavCheckboxProps = {
    size?: TaavChoiceSize;
    tone?: TaavChoiceTone;
    indeterminate?: boolean;
    invalid?: boolean;
    label?: ReactNode;
    description?: ReactNode;
    wrapperClassName?: string;
    controlClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type'>;
declare function TaavCheckbox({ size, tone, indeterminate, invalid, label, description, disabled, wrapperClassName, controlClassName, id, ...props }: TaavCheckboxProps): react.JSX.Element;

type TaavRadioProps = {
    size?: TaavChoiceSize;
    tone?: TaavChoiceTone;
    invalid?: boolean;
    label?: ReactNode;
    description?: ReactNode;
    wrapperClassName?: string;
    controlClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type'>;
declare function TaavRadio({ size, tone, invalid, label, description, disabled, wrapperClassName, controlClassName, id, ...props }: TaavRadioProps): react.JSX.Element;
type TaavRadioOption = {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
};
type TaavRadioGroupProps = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    name?: string;
    options: TaavRadioOption[];
    orientation?: 'horizontal' | 'vertical';
    size?: TaavChoiceSize;
    tone?: TaavChoiceTone;
    disabled?: boolean;
    invalid?: boolean;
    wrapperClassName?: string;
    contentClassName?: string;
};
declare function TaavRadioGroup({ value, defaultValue, onValueChange, name, options, orientation, size, tone, disabled, invalid, wrapperClassName, contentClassName, }: TaavRadioGroupProps): react.JSX.Element;

type TaavSwitchProps = {
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
declare function TaavSwitch({ size, tone, invalid, label, description, disabled, wrapperClassName, controlClassName, id, checked, defaultChecked, onCheckedChange, onChange, ...props }: TaavSwitchProps): react.JSX.Element;

type TaavSegmentedOption = {
    label: string;
    value: string;
    icon?: ReactNode;
    disabled?: boolean;
};
type TaavSegmentedControlProps = {
    size?: TaavChoiceSize;
    tone?: TaavSegmentedTone;
    variant?: TaavSegmentedVariant;
    width?: TaavSegmentedWidth;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    options: TaavSegmentedOption[];
    disabled?: boolean;
    wrapperClassName?: string;
    contentClassName?: string;
    'aria-label'?: string;
};
declare function TaavSegmentedControl({ size, tone, variant, width, value, defaultValue, onValueChange, options, disabled, wrapperClassName, contentClassName, 'aria-label': ariaLabel, }: TaavSegmentedControlProps): react.JSX.Element;

type TaavOptionCardSize = 'sm' | 'md' | 'lg';
type TaavOptionCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TaavOptionCardInputType = 'radio' | 'checkbox' | 'none';
type TaavOptionCardProps = {
    size?: TaavOptionCardSize;
    tone?: TaavOptionCardTone;
    selected?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    title: ReactNode;
    description?: ReactNode;
    meta?: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
    inputType?: TaavOptionCardInputType;
    name?: string;
    value?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onClick?: () => void;
    wrapperClassName?: string;
    contentClassName?: string;
    unsafeClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type' | 'value' | 'checked' | 'defaultChecked' | 'onChange'>;
declare function TaavOptionCard({ size, tone, selected, disabled, invalid, title, description, meta, icon, badge, inputType, name, value, checked, defaultChecked, onClick, wrapperClassName, contentClassName, unsafeClassName, id, ...inputProps }: TaavOptionCardProps): react.JSX.Element;

export { TaavCheckbox, type TaavCheckboxProps, type TaavChoiceChipGap, TaavChoiceChipGroup, type TaavChoiceChipGroupProps, type TaavChoiceChipOption, type TaavChoiceChipShape, type TaavChoiceChipSize, type TaavChoiceChipTone, type TaavChoiceSize, type TaavChoiceTone, TaavCurrencyInput, type TaavCurrencyInputProps, TaavFieldBlock, type TaavFieldBlockProps, TaavFieldGrid, type TaavFieldGridProps, type TaavFieldRadius, type TaavFieldSize, type TaavFieldTone, type TaavFieldVariant, type TaavFieldWidth, TaavFormDescription, type TaavFormDescriptionProps, type TaavFormDescriptionSize, type TaavFormDescriptionTone, TaavFormField, type TaavFormFieldProps, TaavFormMessage, type TaavFormMessageProps, type TaavFormMessageSize, type TaavFormMessageTone, TaavInput, type TaavInputProps, TaavLabel, type TaavLabelProps, type TaavLabelSize, type TaavLabelTone, TaavOptionCard, type TaavOptionCardInputType, type TaavOptionCardProps, type TaavOptionCardSize, type TaavOptionCardTone, TaavPercentageInput, type TaavPercentageInputProps, TaavRadio, TaavRadioGroup, type TaavRadioGroupProps, type TaavRadioOption, type TaavRadioProps, TaavRequiredMark, type TaavRequiredMarkProps, type TaavRequiredMarkTone, TaavSegmentedControl, type TaavSegmentedControlProps, type TaavSegmentedOption, type TaavSegmentedTone, type TaavSegmentedVariant, type TaavSegmentedWidth, TaavSelect, type TaavSelectOption, type TaavSelectProps, TaavSwitch, type TaavSwitchProps, TaavTextarea, type TaavTextareaProps };
