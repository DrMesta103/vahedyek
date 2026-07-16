export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import 'clsx';

type TaavActivationSwitchValue = 'active' | 'inactive';
type TaavActivationSwitchSize = 'sm' | 'md' | 'lg';
type TaavActivationSwitchTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
type TaavActivationSwitchProps = {
    value?: TaavActivationSwitchValue;
    defaultValue?: TaavActivationSwitchValue;
    onValueChange?: (value: TaavActivationSwitchValue) => void;
    activeLabel?: ReactNode;
    inactiveLabel?: ReactNode;
    disabled?: boolean;
    loading?: boolean;
    size?: TaavActivationSwitchSize;
    tone?: TaavActivationSwitchTone;
    ariaLabel?: string;
    wrapperClassName?: string;
    unsafeClassName?: string;
};
declare function TaavActivationSwitch({ value, defaultValue, onValueChange, activeLabel, inactiveLabel, disabled, loading, size, tone, ariaLabel, wrapperClassName, unsafeClassName, }: TaavActivationSwitchProps): react_jsx_runtime.JSX.Element;

type TaavBusinessIntroCardSize = 'sm' | 'md' | 'lg';
type TaavBusinessIntroCardWidth = 'normal' | 'wide' | 'full';
type TaavBusinessIntroCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TaavBusinessIntroCardVariant = 'default' | 'soft' | 'outlined';
type TaavBusinessIntroCardThemeMode = 'auto' | 'light' | 'dark';
type TaavBusinessIntroCardLayout = 'standard' | 'hub';
type TaavBusinessIntroCardHeadingLevel = 'h1' | 'h2';
type TaavBusinessIntroCardProps = {
    title: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    badge?: ReactNode;
    footnote?: ReactNode;
    icon?: ReactNode;
    actionIcon?: ReactNode;
    actionLabel?: string;
    href?: string;
    onAction?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: TaavBusinessIntroCardSize;
    width?: TaavBusinessIntroCardWidth;
    tone?: TaavBusinessIntroCardTone;
    variant?: TaavBusinessIntroCardVariant;
    themeMode?: TaavBusinessIntroCardThemeMode;
    layout?: TaavBusinessIntroCardLayout;
    headingLevel?: TaavBusinessIntroCardHeadingLevel;
    showPattern?: boolean;
    children?: ReactNode;
    wrapperClassName?: string;
    contentClassName?: string;
    actionClassName?: string;
    unsafeClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBusinessIntroCard({ title, description, eyebrow, badge, footnote, icon, actionIcon, actionLabel, href, onAction, disabled, loading, size, width, tone, variant, themeMode, layout, headingLevel, showPattern, children, wrapperClassName, contentClassName, actionClassName, unsafeClassName, ...rest }: TaavBusinessIntroCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessHeaderCardVariant = 'toggleWithLink' | 'toggle' | 'action' | 'actionWithSearch' | 'navigation';
type TaavBusinessHeaderCardToggleLabels = {
    enabled?: ReactNode;
    disabled?: ReactNode;
};
type TaavBusinessHeaderCardAction = {
    label: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
};
type TaavBusinessHeaderCardDetailLink = {
    label: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
};
type TaavBusinessHeaderCardSearch = {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
};
type TaavBusinessHeaderCardProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    variant?: TaavBusinessHeaderCardVariant;
    showArrow?: boolean;
    href?: string;
    onNavigate?: () => void;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
    enabled?: boolean;
    defaultEnabled?: boolean;
    onToggle?: (enabled: boolean) => void;
    toggleLabels?: TaavBusinessHeaderCardToggleLabels;
    action?: TaavBusinessHeaderCardAction;
    detailLink?: TaavBusinessHeaderCardDetailLink;
    search?: TaavBusinessHeaderCardSearch;
    arrowTooltipDefaultOpen?: boolean;
    className?: string;
    wrapperClassName?: string;
    contentClassName?: string;
    actionClassName?: string;
    searchClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick' | 'onToggle' | 'children'>;
declare function TaavBusinessHeaderCard({ title, description, icon, variant, showArrow, href, onNavigate, onClick, disabled, loading, themeMode, enabled, defaultEnabled, onToggle, toggleLabels, action, detailLink, search, arrowTooltipDefaultOpen, className, wrapperClassName, contentClassName, actionClassName, searchClassName, ...rest }: TaavBusinessHeaderCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessSectionToolbarCardProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    showArrow?: boolean;
    onArrowClick?: () => void;
    href?: string;
    search?: {
        value?: string;
        placeholder?: string;
        onChange?: (value: string) => void;
    };
    action?: {
        label: string;
        icon?: ReactNode;
        onClick?: () => void;
        disabled?: boolean;
    };
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBusinessSectionToolbarCard({ title, description, icon, showArrow, onArrowClick, href, search, action, className, ...rest }: TaavBusinessSectionToolbarCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessProfileSummaryCardProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'title' | 'onClick' | 'children'>;
declare function TaavBusinessProfileSummaryCard({ title, description, icon, href, onClick, disabled, className, children, ...rest }: TaavBusinessProfileSummaryCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessOwnershipValue = 'individual' | 'legal';
type TaavBusinessOwnershipCardProps = {
    title?: ReactNode;
    description?: ReactNode;
    value?: TaavBusinessOwnershipValue;
    defaultValue?: TaavBusinessOwnershipValue;
    onValueChange?: (value: TaavBusinessOwnershipValue) => void;
    individualLabel?: ReactNode;
    legalLabel?: ReactNode;
    individualIcon?: ReactNode;
    legalIcon?: ReactNode;
    infoLabel?: string;
    onInfoClick?: () => void;
    continueLabel?: string;
    continueHref?: string;
    onContinue?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;
declare function TaavBusinessOwnershipCard({ title, description, value, defaultValue, onValueChange, individualLabel, legalLabel, individualIcon, legalIcon, infoLabel, onInfoClick, continueLabel, continueHref, onContinue, disabled, loading, className, ...rest }: TaavBusinessOwnershipCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessFormDialogField = {
    id: string;
    label: ReactNode;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    helperText?: ReactNode;
    required?: boolean;
    multiline?: boolean;
    onChange?: (value: string) => void;
};
type TaavBusinessFormDialogCardProps = {
    title: ReactNode;
    description?: ReactNode;
    fields: TaavBusinessFormDialogField[];
    secondaryToggle?: {
        selected?: boolean;
        defaultSelected?: boolean;
        label?: ReactNode;
        onChange?: (selected: boolean) => void;
    };
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    disabled?: boolean;
    loading?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;
declare function TaavBusinessFormDialogCard({ title, description, fields, secondaryToggle, confirmLabel, cancelLabel, onConfirm, onCancel, disabled, loading, themeMode, className, ...rest }: TaavBusinessFormDialogCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessOwnerCardProps = {
    title?: ReactNode;
    description?: ReactNode;
    ownerName: ReactNode;
    phone?: ReactNode;
    secondaryText?: ReactNode;
    avatar?: ReactNode;
    editLabel?: string;
    callLabel?: string;
    phoneBadge?: ReactNode;
    onEdit?: () => void;
    onCall?: () => void;
    disabled?: boolean;
    loading?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBusinessOwnerCard({ title, description, ownerName, phone, secondaryText, avatar, editLabel, callLabel, phoneBadge, onEdit, onCall, disabled, loading, themeMode, className, ...rest }: TaavBusinessOwnerCardProps): react_jsx_runtime.JSX.Element;

type TaavFormStep = {
    id: string;
    label: ReactNode;
    description?: ReactNode;
};
type TaavFormStepIndicatorProps = {
    steps: TaavFormStep[];
    activeStep?: string | number;
    defaultActiveStep?: string | number;
    completedSteps?: string[];
    intro?: ReactNode;
    onStepChange?: (stepId: string, index: number) => void;
    clickable?: boolean;
    disabled?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'onChange'>;
declare function TaavFormStepIndicator({ steps, activeStep, defaultActiveStep, completedSteps, intro, onStepChange, clickable, disabled, themeMode, className, ...rest }: TaavFormStepIndicatorProps): react_jsx_runtime.JSX.Element;

type TaavCommunicationChannel = {
    id: string;
    label: ReactNode;
    content?: ReactNode;
    emptyText?: ReactNode;
    disabled?: boolean;
};
type TaavCommunicationChannelsProps = {
    channels?: TaavCommunicationChannel[];
    expandedId?: string;
    defaultExpandedId?: string;
    onExpandedChange?: (channelId: string) => void;
    onBack?: () => void;
    backLabel?: string;
    emptyText?: ReactNode;
    themeMode?: 'auto' | 'light' | 'dark';
    disabled?: boolean;
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'onChange'>;
declare function TaavCommunicationChannels({ channels, expandedId, defaultExpandedId, onExpandedChange, onBack, backLabel, emptyText, themeMode, disabled, className, ...rest }: TaavCommunicationChannelsProps): react_jsx_runtime.JSX.Element;

type TaavCommunicationChannelsCardItem = {
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    value?: ReactNode;
};
type TaavCommunicationChannelsCardProps = {
    title?: ReactNode;
    primaryLabel?: ReactNode;
    primaryDescription?: ReactNode;
    primaryEnabled?: boolean;
    onPrimaryChange?: (enabled: boolean) => void;
    postalCode?: ReactNode;
    mapLabel?: ReactNode;
    onMapClick?: () => void;
    location?: ReactNode;
    phoneBadge?: ReactNode;
    items?: TaavCommunicationChannelsCardItem[];
    onMenuClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;
declare function TaavCommunicationChannelsCard({ title, primaryLabel, primaryDescription, primaryEnabled, onPrimaryChange, postalCode, mapLabel, onMapClick, location, phoneBadge, items, onMenuClick, disabled, loading, themeMode, className, ...rest }: TaavCommunicationChannelsCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessRecommendationCardSize = 'sm' | 'md' | 'lg';
type TaavBusinessRecommendationCardWidth = 'normal' | 'wide' | 'full';
type TaavBusinessRecommendationCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TaavBusinessRecommendationCardVariant = 'default' | 'soft' | 'outlined';
type TaavBusinessRecommendationCardThemeMode = 'auto' | 'light' | 'dark';
type TaavBusinessRecommendationCardActivationValue = TaavActivationSwitchValue;
type TaavBusinessRecommendationCardProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    actionIcon?: ReactNode;
    actionLabel?: string;
    href?: string;
    onAction?: () => void;
    activationValue?: TaavBusinessRecommendationCardActivationValue;
    defaultActivationValue?: TaavBusinessRecommendationCardActivationValue;
    onActivationChange?: (value: TaavBusinessRecommendationCardActivationValue) => void;
    activeLabel?: ReactNode;
    inactiveLabel?: ReactNode;
    activationDisabled?: boolean;
    detailsLabel?: ReactNode;
    detailsHref?: string;
    onDetailsClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: TaavBusinessRecommendationCardSize;
    width?: TaavBusinessRecommendationCardWidth;
    tone?: TaavBusinessRecommendationCardTone;
    variant?: TaavBusinessRecommendationCardVariant;
    themeMode?: TaavBusinessRecommendationCardThemeMode;
    wrapperClassName?: string;
    contentClassName?: string;
    actionClassName?: string;
    unsafeClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBusinessRecommendationCard({ title, description, icon, actionIcon, actionLabel, href, onAction, activationValue, defaultActivationValue, onActivationChange, activeLabel, inactiveLabel, activationDisabled, detailsLabel, detailsHref, onDetailsClick, disabled, loading, size, width, tone, variant, themeMode, wrapperClassName, contentClassName, actionClassName, unsafeClassName, ...rest }: TaavBusinessRecommendationCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessSidebarNavPathItem = {
    label: string;
    id?: string;
    href?: string;
    onClick?: () => void;
};
declare const DEFAULT_BUSINESS_SIDEBAR_NAV_PATH: TaavBusinessSidebarNavPathItem[];
/** @deprecated Use `TaavBusinessSidebarNavPathItem` */
type TaavBusinessNavPathItem = TaavBusinessSidebarNavPathItem;
/** @deprecated Use `DEFAULT_BUSINESS_SIDEBAR_NAV_PATH` */
declare const DEFAULT_BUSINESS_NAV_PATH: TaavBusinessSidebarNavPathItem[];

type TaavBusinessSidebarUser = {
    name: string;
    subtitle?: string;
    avatarUrl?: string;
    avatarFallback?: string;
};
type TaavBusinessSidebarTenantStatus = 'active' | 'loading' | 'inactive' | 'error';
type TaavBusinessSidebarTenant = {
    label: string;
    name: string;
    avatarText?: string;
    status?: TaavBusinessSidebarTenantStatus;
    statusLabel?: string;
};
type TaavBusinessSidebarQuickAction = {
    id: string;
    label: string;
    icon: ReactNode;
    active?: boolean;
    badge?: string | number;
    onClick?: () => void;
    href?: string;
};
type TaavBusinessSidebarItem = {
    id: string;
    label: string;
    icon: ReactNode;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    badge?: string | number;
    children?: TaavBusinessSidebarItem[];
};
type TaavBusinessSidebarVariant = 'dastranj' | 'default';
type TaavBusinessSidebarWidth = 'compact' | 'default' | 'wide';
type TaavBusinessSidebarPlacement = 'left' | 'right';
type TaavBusinessSidebarProps = {
    user: TaavBusinessSidebarUser;
    tenant: TaavBusinessSidebarTenant;
    quickActions?: TaavBusinessSidebarQuickAction[];
    items: TaavBusinessSidebarItem[];
    activeItemId?: string;
    version?: string;
    width?: TaavBusinessSidebarWidth;
    variant?: TaavBusinessSidebarVariant;
    placement?: TaavBusinessSidebarPlacement;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    collapsible?: boolean;
    lockCollapsed?: boolean;
    loading?: boolean;
    /** Breadcrumb above main content, top-aligned with the sidebar rail. Defaults to خانه. */
    navPath?: TaavBusinessSidebarNavPathItem[];
    /** When false, the nav path bar is hidden. */
    showNavPath?: boolean;
    children?: ReactNode;
    shellClassName?: string;
    contentClassName?: string;
    navPathClassName?: string;
    onNavigate?: (item: TaavBusinessSidebarItem) => void;
    onTenantSwitch?: () => void;
    onTenantPanelClick?: () => void;
    onLogout?: () => void;
    onCollapsedChange?: (collapsed: boolean) => void;
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className'>;
declare function TaavBusinessSidebar({ user, tenant, quickActions, items, activeItemId, version, width, variant, placement: placementProp, collapsed: collapsedProp, defaultCollapsed, collapsible, lockCollapsed, loading, navPath, showNavPath, children, shellClassName, contentClassName, navPathClassName, onNavigate, onTenantSwitch, onTenantPanelClick, onLogout, onCollapsedChange, className, ...props }: TaavBusinessSidebarProps): react_jsx_runtime.JSX.Element;

type TaavMobileNumberInputCardProps = {
    title?: ReactNode;
    description?: ReactNode;
    label?: ReactNode;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    helperText?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;
    loading?: boolean;
    maxLength?: number;
    icon?: ReactNode;
    className?: string;
    wrapperClassName?: string;
    inputClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;
declare function TaavMobileNumberInputCard({ title, description, label, placeholder, value, defaultValue, onValueChange, helperText, error, required, disabled, readOnly, autoFocus, loading, maxLength, icon, className, wrapperClassName, inputClassName, ...rest }: TaavMobileNumberInputCardProps): react_jsx_runtime.JSX.Element;

type TaavDetailsLinkSize = 'sm' | 'md' | 'lg';
type TaavDetailsLinkTone = 'neutral' | 'brand' | 'info';
type TaavDetailsLinkUnderline = 'always' | 'hover' | 'none';
type TaavDetailsLinkProps = {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    tone?: TaavDetailsLinkTone;
    size?: TaavDetailsLinkSize;
    underline?: TaavDetailsLinkUnderline;
    hoverEffect?: boolean;
    ariaLabel?: string;
    wrapperClassName?: string;
    unsafeClassName?: string;
};
declare function TaavDetailsLink({ children, href, onClick, disabled, icon, tone, size, underline, hoverEffect, ariaLabel, wrapperClassName, unsafeClassName, }: TaavDetailsLinkProps): react_jsx_runtime.JSX.Element;

type TaavModuleCardStatus = 'default' | 'active' | 'complete' | 'incomplete' | 'locked' | 'disabled' | 'warning' | 'error';
type TaavModuleCardVariant = 'default' | 'setup' | 'imageHeader' | 'compact' | 'flat';
type TaavModuleCardTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type TaavModuleCardThemeMode = 'auto' | 'light' | 'dark';
type TaavModuleCardSize = 'sm' | 'md' | 'lg';
type TaavModuleCardWidth = 'auto' | 'full';
type TaavModuleCardHeaderPattern = 'geometric' | 'subtle' | 'none';
type TaavModuleCardAlign = 'start' | 'center' | 'end';
type TaavModuleCardDirection = 'enter' | 'back';
type TaavModuleCardProps = {
    title: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    status?: TaavModuleCardStatus;
    statusLabel?: ReactNode;
    icon?: ReactNode;
    arrowIcon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    selected?: boolean;
    variant?: TaavModuleCardVariant;
    tone?: TaavModuleCardTone;
    themeMode?: TaavModuleCardThemeMode;
    size?: TaavModuleCardSize;
    width?: TaavModuleCardWidth;
    headerPattern?: TaavModuleCardHeaderPattern;
    align?: TaavModuleCardAlign;
    direction?: TaavModuleCardDirection;
    ariaLabel?: string;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'title' | 'onClick'>;
declare function TaavModuleCard({ title, description, eyebrow, status, statusLabel, icon, arrowIcon, href, onClick, disabled: disabledProp, loading, selected, variant, tone, themeMode, size, width, headerPattern, align, direction, ariaLabel, className, headerClassName, bodyClassName, ...rest }: TaavModuleCardProps): react_jsx_runtime.JSX.Element;

type TaavModuleCardGridColumns = 1 | 2 | 3 | 4;
type TaavModuleCardGridGap = 'sm' | 'md' | 'lg' | 'xl';
type TaavModuleCardGridDensity = 'compact' | 'comfortable' | 'spacious';
type TaavModuleCardGridSpan = 1 | 2 | 3 | 4;
type TaavModuleCardGridProps = {
    columns?: TaavModuleCardGridColumns;
    gap?: TaavModuleCardGridGap;
    density?: TaavModuleCardGridDensity;
    responsive?: boolean;
    children: ReactNode;
    className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;
type TaavModuleCardGridItemProps = {
    span?: TaavModuleCardGridSpan;
    responsive?: boolean;
    children: ReactNode;
    className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;
declare function TaavModuleCardGrid({ columns, gap, density, responsive, children, className, ...rest }: TaavModuleCardGridProps): react_jsx_runtime.JSX.Element;
declare function TaavModuleCardGridItem({ span, responsive, children, className, ...rest }: TaavModuleCardGridItemProps): react_jsx_runtime.JSX.Element;

type TaavBusinessModuleLinkItem = {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    ariaLabel?: string;
};
type TaavBusinessModuleLinkGridProps = {
    items: TaavBusinessModuleLinkItem[];
    columns?: 1 | 2;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'onClick'>;
declare function TaavBusinessModuleLinkGrid({ items, columns, gap, className, ...rest }: TaavBusinessModuleLinkGridProps): react_jsx_runtime.JSX.Element;

type TaavBusinessAccountInfoCardProps = {
    bankName?: ReactNode;
    contractLabel?: ReactNode;
    logo?: ReactNode;
    formattedAccountNumber?: ReactNode;
    accountNumber?: ReactNode;
    iban?: ReactNode;
    accountLabel?: ReactNode;
    ibanLabel?: ReactNode;
    displayLabel?: ReactNode;
    displayDescription?: ReactNode;
    showInContract?: boolean;
    onShowInContractChange?: (value: boolean) => void;
    ownerLabel?: ReactNode;
    ownerName?: ReactNode;
    ownerNames?: ReactNode[];
    onMenuClick?: () => void;
    onRefresh?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    disabled?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;
declare function TaavBusinessAccountInfoCard({ bankName, contractLabel, logo, formattedAccountNumber, accountNumber, iban, accountLabel, ibanLabel, displayLabel, displayDescription, showInContract, onShowInContractChange, ownerLabel, ownerName, ownerNames, onMenuClick, onRefresh, onEdit, onDelete, disabled, themeMode, className, ...rest }: TaavBusinessAccountInfoCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessIconOption = {
    value: string;
    label: ReactNode;
    icon: ReactNode;
    disabled?: boolean;
};
type TaavBusinessIconChoiceGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    items: TaavBusinessIconOption[];
    selected?: string;
    defaultSelected?: string;
    onSelectedChange?: (value: string) => void;
    ariaLabel?: string;
    themeMode?: 'auto' | 'light' | 'dark';
};
declare function TaavBusinessIconChoiceGroup({ items, selected, defaultSelected, onSelectedChange, ariaLabel, themeMode, className, ...rest }: TaavBusinessIconChoiceGroupProps): react_jsx_runtime.JSX.Element;

type TaavBusinessToggleCardVariant = 'simple' | 'action';
type TaavBusinessToggleCardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
    title?: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    variant?: TaavBusinessToggleCardVariant;
    icon?: ReactNode;
    onAction?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
    actionLabel?: string;
    disabled?: boolean;
    themeMode?: 'auto' | 'light' | 'dark';
};
declare function TaavBusinessToggleCard({ title, description, checked, defaultChecked, onCheckedChange, variant, icon, onAction, actionLabel, disabled, themeMode, className, ...rest }: TaavBusinessToggleCardProps): react_jsx_runtime.JSX.Element;

type SharedProps = {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    onValueChange?: (value: string) => void;
    className?: string;
};
type TaavBankCardNumberInputProps = SharedProps & {
    value?: string;
    defaultValue?: string;
    autoFocus?: boolean;
};
declare function TaavBankCardNumberInput({ value, defaultValue, onValueChange, label, helperText, error, required, disabled, readOnly, autoFocus, className }: TaavBankCardNumberInputProps): react_jsx_runtime.JSX.Element;
type TaavShebaNumberInputProps = SharedProps & {
    value?: string;
    defaultValue?: string;
    autoFocus?: boolean;
    placeholder?: string;
};
declare function TaavShebaNumberInput({ value, defaultValue, onValueChange, label, helperText, error, required, disabled, readOnly, autoFocus, placeholder, className }: TaavShebaNumberInputProps): react_jsx_runtime.JSX.Element;
type TaavBankAccountNumberInputProps = SharedProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'className'> & {
    value?: string;
    defaultValue?: string;
};
declare function TaavBankAccountNumberInput({ value, defaultValue, onValueChange, label, helperText, error, required, disabled, readOnly, className, ...props }: TaavBankAccountNumberInputProps): react_jsx_runtime.JSX.Element;

type TaavBankAccountInfoInputCardProps = {
    title?: ReactNode;
    description?: ReactNode;
    cardNumber?: TaavBankCardNumberInputProps;
    shebaNumber?: TaavShebaNumberInputProps;
    accountNumber?: TaavBankAccountNumberInputProps;
    variant?: 'compact' | 'showcase';
    themeMode?: 'auto' | 'light' | 'dark';
    className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBankAccountInfoInputCard({ title, description, cardNumber, shebaNumber, accountNumber, variant, themeMode, className, ...rest }: TaavBankAccountInfoInputCardProps): react_jsx_runtime.JSX.Element;

export { DEFAULT_BUSINESS_NAV_PATH, DEFAULT_BUSINESS_SIDEBAR_NAV_PATH, TaavActivationSwitch, type TaavActivationSwitchProps, type TaavActivationSwitchSize, type TaavActivationSwitchTone, type TaavActivationSwitchValue, TaavBankAccountInfoInputCard, type TaavBankAccountInfoInputCardProps, TaavBankAccountNumberInput, type TaavBankAccountNumberInputProps, TaavBankCardNumberInput, type TaavBankCardNumberInputProps, TaavBusinessAccountInfoCard, type TaavBusinessAccountInfoCardProps, TaavBusinessFormDialogCard, type TaavBusinessFormDialogCardProps, type TaavBusinessFormDialogField, TaavBusinessHeaderCard, type TaavBusinessHeaderCardAction, type TaavBusinessHeaderCardDetailLink, type TaavBusinessHeaderCardProps, type TaavBusinessHeaderCardSearch, type TaavBusinessHeaderCardToggleLabels, type TaavBusinessHeaderCardVariant, TaavBusinessIconChoiceGroup, type TaavBusinessIconChoiceGroupProps, type TaavBusinessIconOption, TaavBusinessIntroCard, type TaavBusinessIntroCardHeadingLevel, type TaavBusinessIntroCardLayout, type TaavBusinessIntroCardProps, type TaavBusinessIntroCardSize, type TaavBusinessIntroCardThemeMode, type TaavBusinessIntroCardTone, type TaavBusinessIntroCardVariant, type TaavBusinessIntroCardWidth, TaavBusinessModuleLinkGrid, type TaavBusinessModuleLinkGridProps, type TaavBusinessModuleLinkItem, type TaavBusinessNavPathItem, TaavBusinessOwnerCard, type TaavBusinessOwnerCardProps, TaavBusinessOwnershipCard, type TaavBusinessOwnershipCardProps, type TaavBusinessOwnershipValue, TaavBusinessProfileSummaryCard, type TaavBusinessProfileSummaryCardProps, TaavBusinessRecommendationCard, type TaavBusinessRecommendationCardActivationValue, type TaavBusinessRecommendationCardProps, type TaavBusinessRecommendationCardSize, type TaavBusinessRecommendationCardThemeMode, type TaavBusinessRecommendationCardTone, type TaavBusinessRecommendationCardVariant, type TaavBusinessRecommendationCardWidth, TaavBusinessSectionToolbarCard, type TaavBusinessSectionToolbarCardProps, TaavBusinessSidebar, type TaavBusinessSidebarItem, type TaavBusinessSidebarNavPathItem, type TaavBusinessSidebarPlacement, type TaavBusinessSidebarProps, type TaavBusinessSidebarQuickAction, type TaavBusinessSidebarTenant, type TaavBusinessSidebarTenantStatus, type TaavBusinessSidebarUser, type TaavBusinessSidebarVariant, type TaavBusinessSidebarWidth, TaavBusinessToggleCard, type TaavBusinessToggleCardProps, type TaavBusinessToggleCardVariant, type TaavCommunicationChannel, TaavCommunicationChannels, TaavCommunicationChannelsCard, type TaavCommunicationChannelsCardItem, type TaavCommunicationChannelsCardProps, type TaavCommunicationChannelsProps, TaavDetailsLink, type TaavDetailsLinkProps, type TaavDetailsLinkSize, type TaavDetailsLinkTone, type TaavDetailsLinkUnderline, type TaavFormStep, TaavFormStepIndicator, type TaavFormStepIndicatorProps, TaavMobileNumberInputCard, type TaavMobileNumberInputCardProps, TaavModuleCard, type TaavModuleCardAlign, type TaavModuleCardDirection, TaavModuleCardGrid, type TaavModuleCardGridColumns, type TaavModuleCardGridDensity, type TaavModuleCardGridGap, TaavModuleCardGridItem, type TaavModuleCardGridItemProps, type TaavModuleCardGridProps, type TaavModuleCardGridSpan, type TaavModuleCardHeaderPattern, type TaavModuleCardProps, type TaavModuleCardSize, type TaavModuleCardStatus, type TaavModuleCardThemeMode, type TaavModuleCardTone, type TaavModuleCardVariant, type TaavModuleCardWidth, TaavShebaNumberInput, type TaavShebaNumberInputProps };
