import * as React from 'react';
import { CSSProperties, ReactNode, ElementType } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
export { DataTable, EmptyState, FormCard, PageIntro, PrimaryLink, StatGrid } from './server.js';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    startAdornmentClassName?: string;
    endAdornmentClassName?: string;
    containerClassName?: string;
    startAdornmentWrapperClassName?: string;
    endAdornmentWrapperClassName?: string;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

interface PersianDatePickerProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
    withCalendarIcon?: boolean;
    calendarIconAriaLabel?: string;
}
declare function PersianDatePicker({ value, onChange, placeholder, className, containerClassName, withCalendarIcon, calendarIconAriaLabel, }: PersianDatePickerProps): react_jsx_runtime.JSX.Element;

/** @deprecated Use `BusinessSwitch` — this export wraps it for backwards compatibility. */
declare function SegmentedToggle({ checked, onChange, activeLabel, inactiveLabel, }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    activeLabel?: string;
    inactiveLabel?: string;
}): react_jsx_runtime.JSX.Element;

declare const formControlStyle: CSSProperties;
declare const compactTextareaStyle: CSSProperties;
declare const formControlMutedDisabledStyle: CSSProperties;
declare const formLabelStyle: CSSProperties;
declare const formMetaLabelStyle: CSSProperties;
declare const formErrorStyle: CSSProperties;
declare const outlineButtonStyle: CSSProperties;
declare const primaryButtonStyle: CSSProperties;

declare const formStyles_compactTextareaStyle: typeof compactTextareaStyle;
declare const formStyles_formControlMutedDisabledStyle: typeof formControlMutedDisabledStyle;
declare const formStyles_formControlStyle: typeof formControlStyle;
declare const formStyles_formErrorStyle: typeof formErrorStyle;
declare const formStyles_formLabelStyle: typeof formLabelStyle;
declare const formStyles_formMetaLabelStyle: typeof formMetaLabelStyle;
declare const formStyles_outlineButtonStyle: typeof outlineButtonStyle;
declare const formStyles_primaryButtonStyle: typeof primaryButtonStyle;
declare namespace formStyles {
  export { formStyles_compactTextareaStyle as compactTextareaStyle, formStyles_formControlMutedDisabledStyle as formControlMutedDisabledStyle, formStyles_formControlStyle as formControlStyle, formStyles_formErrorStyle as formErrorStyle, formStyles_formLabelStyle as formLabelStyle, formStyles_formMetaLabelStyle as formMetaLabelStyle, formStyles_outlineButtonStyle as outlineButtonStyle, formStyles_primaryButtonStyle as primaryButtonStyle };
}

declare function BusinessSwitch({ checked, onChange, activeLabel, inactiveLabel, className, }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    activeLabel?: string;
    inactiveLabel?: string;
    className?: string;
}): react_jsx_runtime.JSX.Element;

declare function RuleAmountInput({ value, onChange, placeholder, suffix, }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    suffix?: string;
}): react_jsx_runtime.JSX.Element;

/** Single-line text fields without a leading suffix chip. */
declare const RULE_PANEL_TEXT_INPUT_CLASSNAME: string;
/** Native `<select>` in the same panels. */
declare const RULE_PANEL_SELECT_CLASSNAME = "h-14 w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-0 text-right text-lg font-bold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--theme-action-border)] focus:ring-2 focus:ring-[color:var(--theme-action-bg)]/20";
/**
 * Numeric / formatted amount fields; optional gutter on the physical left (`left-4`) for `%` / `تومان` chip text.
 */
declare function rulePanelNumericInputClassName(suffixPosition: 'left' | 'right' | 'none'): string;

declare function RuleFieldLabel({ label, required, rightSlot }: {
    label: ReactNode;
    required?: boolean;
    rightSlot?: ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function RuleTabButton({ title, icon: Icon, active, onClick, }: {
    title: string;
    icon: ElementType;
    active: boolean;
    onClick: () => void;
}): react_jsx_runtime.JSX.Element;

declare function TagPills<T extends string>({ options, value, onChange, wrap, className, }: {
    options: {
        value: T;
        label: string;
    }[];
    value: T;
    onChange: (value: T) => void;
    wrap?: boolean;
    className?: string;
}): react_jsx_runtime.JSX.Element;

type ExpandableTagGroupItem = {
    id: string;
    name: string;
    sub?: string;
    disabled?: boolean;
};
declare function ExpandableTagGroup({ label, items, selectedId, onSelect, emptyText, itemsPerRow, required, className, showSearch, invalid, onDisabledSelect, }: {
    label: string;
    items: ExpandableTagGroupItem[];
    selectedId: string;
    onSelect: (id: string) => void;
    emptyText: string;
    itemsPerRow?: number;
    required?: boolean;
    className?: string;
    showSearch?: boolean;
    invalid?: boolean;
    onDisabledSelect?: (id: string) => void;
}): react_jsx_runtime.JSX.Element;

type ContractType = 'sale' | 'pre-sale';
declare function ContractTypeTags({ value, onChange, }: {
    value: ContractType;
    onChange: (value: ContractType) => void;
}): react_jsx_runtime.JSX.Element;

type ContractIssuerType = 'self' | 'former' | 'staff';
declare function ContractIssuerTags({ value, onChange, }: {
    value: ContractIssuerType;
    onChange: (value: ContractIssuerType) => void;
}): react_jsx_runtime.JSX.Element;

type ShareMode = 'percent' | 'dang';
declare function ShareModePills({ label, value, onChange, className, }: {
    label?: string;
    value: ShareMode;
    onChange: (value: ShareMode) => void;
    className?: string;
}): react_jsx_runtime.JSX.Element;

type SearchableSelectOption = {
    value: string;
    label: string;
};
declare function SearchableSelect({ options, value, onSelect, placeholder, searchPlaceholder, emptyText, disabled, className, }: {
    options: SearchableSelectOption[];
    value: string;
    onSelect: (value: string) => void;
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    disabled?: boolean;
    className?: string;
}): react_jsx_runtime.JSX.Element;

declare function StickySubmitBar({ label, onClick, disabled, loadingLabel, embedded, submitId, }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loadingLabel?: string;
    embedded?: boolean;
    submitId?: string;
}): react_jsx_runtime.JSX.Element;

type ChoicePillsOption<T extends string> = {
    value: T;
    label: string;
};
declare function ChoicePills<T extends string>({ options, value, onChange, ariaLabel, wrap, className, pillClassName, showActiveIndicator, }: {
    options: ReadonlyArray<ChoicePillsOption<T>>;
    value: T;
    onChange: (value: NoInfer<T>) => void;
    ariaLabel?: string;
    wrap?: boolean;
    className?: string;
    pillClassName?: string;
    showActiveIndicator?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function ChoicePillsField<T extends string>({ label, labelAs: LabelAs, ariaLabel, options, value, onChange, wrap, className, labelClassName, pillsClassName, pillClassName, showActiveIndicator, invalid, }: {
    label: string;
    labelAs?: ElementType;
    ariaLabel?: string;
    options: ReadonlyArray<ChoicePillsOption<T>>;
    value: T;
    onChange: (value: NoInfer<T>) => void;
    wrap?: boolean;
    className?: string;
    labelClassName?: string;
    pillsClassName?: string;
    pillClassName?: string;
    showActiveIndicator?: boolean;
    invalid?: boolean;
}): react_jsx_runtime.JSX.Element;

declare const DEV_DOC_THREAD_PRIORITIES: readonly ["p0", "p1", "p2", "p3"];
declare const DEV_DOC_THREAD_STATUSES: readonly ["todo", "in_progress", "done"];
type DevDocThreadPriority = (typeof DEV_DOC_THREAD_PRIORITIES)[number];
type DevDocThreadStatus = (typeof DEV_DOC_THREAD_STATUSES)[number];
type DevDocThreadRecord = {
    id: string;
    appId: string;
    tenantId: string | null;
    tenantName: string | null;
    tenantSlug: string | null;
    pageKey: string;
    pagePathSample: string;
    title: string;
    docType: string;
    priority: DevDocThreadPriority;
    status: DevDocThreadStatus;
    labels: string[];
    isOpened: boolean;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        fullName: string;
        email: string;
    } | null;
    updatedBy: {
        id: string;
        fullName: string;
        email: string;
    } | null;
};
declare const DEV_DOC_PRIORITY_LABELS: Record<DevDocThreadPriority, string>;
declare function normalizeDevDocThreadPriority(value: unknown): DevDocThreadPriority;
declare function normalizeDevDocThreadStatus(value: unknown): DevDocThreadStatus;
declare function normalizeDevDocLabels(input: unknown): string[];

type DevDocThreadsBoardProps = {
    appName: string;
    listEndpoint: string;
    updateEndpoint: (threadId: string) => string;
    deleteEndpoint?: (threadId: string) => string;
    title?: string;
    description?: string;
};
declare function DevDocThreadsBoard({ appName, listEndpoint, updateEndpoint, deleteEndpoint, title, description, }: DevDocThreadsBoardProps): react_jsx_runtime.JSX.Element;

type AppThemeTokens = {
    primary: string;
    accent: string;
    radius: string;
};

export { type AppThemeTokens, BusinessSwitch, ChoicePills, ChoicePillsField, type ChoicePillsOption, ContractIssuerTags, type ContractIssuerType, type ContractType, ContractTypeTags, DEV_DOC_PRIORITY_LABELS, DEV_DOC_THREAD_PRIORITIES, DEV_DOC_THREAD_STATUSES, type DevDocThreadPriority, type DevDocThreadRecord, type DevDocThreadStatus, DevDocThreadsBoard, type DevDocThreadsBoardProps, ExpandableTagGroup, type ExpandableTagGroupItem, Input, type InputProps, PersianDatePicker, type PersianDatePickerProps, RULE_PANEL_SELECT_CLASSNAME, RULE_PANEL_TEXT_INPUT_CLASSNAME, RuleAmountInput, RuleFieldLabel, RuleTabButton, SearchableSelect, type SearchableSelectOption, SegmentedToggle, type ShareMode, ShareModePills, StickySubmitBar, TagPills, compactTextareaStyle, formControlMutedDisabledStyle, formControlStyle, formErrorStyle, formLabelStyle, formMetaLabelStyle, formStyles, normalizeDevDocLabels, normalizeDevDocThreadPriority, normalizeDevDocThreadStatus, outlineButtonStyle, primaryButtonStyle, rulePanelNumericInputClassName };
