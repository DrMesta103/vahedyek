export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-NU-uTFUF.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
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
declare function TaavLabel({ htmlFor, children, size, tone, required, optional, disabled, wrapperClassName, ...props }: TaavLabelProps): react_jsx_runtime.JSX.Element;

type TaavRequiredMarkTone = 'danger' | 'muted';
type TaavRequiredMarkProps = {
    tone?: TaavRequiredMarkTone;
    /** Accessible label for screen readers */
    label?: string;
};
declare function TaavRequiredMark({ tone, label }: TaavRequiredMarkProps): react_jsx_runtime.JSX.Element;

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
declare function TaavInput({ size, variant, tone, width, radius, disabled, readOnly, invalid, required, loading, iconStart, iconEnd, prefix, suffix, wrapperClassName, inputClassName, type, ...props }: TaavInputProps): react_jsx_runtime.JSX.Element;

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
declare function TaavTextarea({ size, variant, tone, width, radius, disabled, readOnly, invalid, required, rows, minRows, maxLength, showCount, wrapperClassName, inputClassName, value, defaultValue, onChange, ...props }: TaavTextareaProps): react_jsx_runtime.JSX.Element;

type TaavFormMessageTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type TaavFormMessageSize = 'sm' | 'md';
type TaavFormMessageProps = {
    tone?: TaavFormMessageTone;
    size?: TaavFormMessageSize;
    icon?: ReactNode;
    children?: ReactNode;
    unsafeClassName?: string;
};
declare function TaavFormMessage({ tone, size, icon, children, unsafeClassName, }: TaavFormMessageProps): react_jsx_runtime.JSX.Element | null;

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
declare function TaavFormField({ label, required, optional, description, message, messageTone, error, htmlFor, disabled, children, wrapperClassName, contentClassName, }: TaavFormFieldProps): react_jsx_runtime.JSX.Element;

type TaavFormDescriptionSize = 'sm' | 'md';
type TaavFormDescriptionTone = 'muted' | 'neutral' | 'info';
type TaavFormDescriptionProps = {
    size?: TaavFormDescriptionSize;
    tone?: TaavFormDescriptionTone;
    children?: ReactNode;
    unsafeClassName?: string;
};
declare function TaavFormDescription({ size, tone, children, unsafeClassName, }: TaavFormDescriptionProps): react_jsx_runtime.JSX.Element | null;

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
declare function TaavSelect({ size, variant, tone, width, radius, disabled, invalid, required, placeholder, options, iconStart, wrapperClassName, controlClassName, value, defaultValue, ...props }: TaavSelectProps): react_jsx_runtime.JSX.Element;

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
declare function TaavCheckbox({ size, tone, indeterminate, invalid, label, description, disabled, wrapperClassName, controlClassName, id, ...props }: TaavCheckboxProps): react_jsx_runtime.JSX.Element;

type TaavRadioProps = {
    size?: TaavChoiceSize;
    tone?: TaavChoiceTone;
    invalid?: boolean;
    label?: ReactNode;
    description?: ReactNode;
    wrapperClassName?: string;
    controlClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type'>;
declare function TaavRadio({ size, tone, invalid, label, description, disabled, wrapperClassName, controlClassName, id, ...props }: TaavRadioProps): react_jsx_runtime.JSX.Element;
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
declare function TaavRadioGroup({ value, defaultValue, onValueChange, name, options, orientation, size, tone, disabled, invalid, wrapperClassName, contentClassName, }: TaavRadioGroupProps): react_jsx_runtime.JSX.Element;

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
declare function TaavSwitch({ size, tone, invalid, label, description, disabled, wrapperClassName, controlClassName, id, checked, defaultChecked, onCheckedChange, onChange, ...props }: TaavSwitchProps): react_jsx_runtime.JSX.Element;

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
declare function TaavSegmentedControl({ size, tone, variant, width, value, defaultValue, onValueChange, options, disabled, wrapperClassName, contentClassName, 'aria-label': ariaLabel, }: TaavSegmentedControlProps): react_jsx_runtime.JSX.Element;

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
declare function TaavOptionCard({ size, tone, selected, disabled, invalid, title, description, meta, icon, badge, inputType, name, value, checked, defaultChecked, onClick, wrapperClassName, contentClassName, unsafeClassName, id, ...inputProps }: TaavOptionCardProps): react_jsx_runtime.JSX.Element;

export { TaavCheckbox, type TaavCheckboxProps, type TaavChoiceSize, type TaavChoiceTone, type TaavFieldRadius, type TaavFieldSize, type TaavFieldTone, type TaavFieldVariant, type TaavFieldWidth, TaavFormDescription, type TaavFormDescriptionProps, type TaavFormDescriptionSize, type TaavFormDescriptionTone, TaavFormField, type TaavFormFieldProps, TaavFormMessage, type TaavFormMessageProps, type TaavFormMessageSize, type TaavFormMessageTone, TaavInput, type TaavInputProps, TaavLabel, type TaavLabelProps, type TaavLabelSize, type TaavLabelTone, TaavOptionCard, type TaavOptionCardInputType, type TaavOptionCardProps, type TaavOptionCardSize, type TaavOptionCardTone, TaavRadio, TaavRadioGroup, type TaavRadioGroupProps, type TaavRadioOption, type TaavRadioProps, TaavRequiredMark, type TaavRequiredMarkProps, type TaavRequiredMarkTone, TaavSegmentedControl, type TaavSegmentedControlProps, type TaavSegmentedOption, type TaavSegmentedTone, type TaavSegmentedVariant, type TaavSegmentedWidth, TaavSelect, type TaavSelectOption, type TaavSelectProps, TaavSwitch, type TaavSwitchProps, TaavTextarea, type TaavTextareaProps };
