export type LabNavItem = {
  href: string;
  label: string;
  badge?: string;
  description?: string;
  keywords?: string[];
};

export const LAB_MAIN_NAV: LabNavItem[] = [
  { href: '/', label: 'خانه' },
  { href: '/components', label: 'Primitives' },
  { href: '/forms', label: 'Forms' },
  { href: '/overlays', label: 'Overlays' },
  { href: '/navigation', label: 'Navigation' },
  { href: '/data-display', label: 'Data Display' },
  { href: '/layout', label: 'Layout' },
  { href: '/business', label: 'Business' },
  { href: '/business-components', label: 'Components' },
];

export const LAB_FOUNDATION_NAV: LabNavItem[] = [
  { href: '/getting-started', label: 'شروع سریع' },
  { href: '/foundation/principles', label: 'اصول', badge: 'Principles' },
  { href: '/tokens', label: 'توکن‌ها' },
  { href: '/roadmap', label: 'نقشه راه' },
];

export const LAB_COMPONENT_NAV: LabNavItem[] = [
  { href: '/components/button', label: 'دکمه', badge: 'TaavButton' },
  { href: '/components/badge', label: 'نشان', badge: 'TaavBadge' },
  { href: '/components/card', label: 'کارت', badge: 'TaavCard' },
  { href: '/components/tooltip', label: 'راهنمای شناور', badge: 'TaavTooltip' },
  { href: '/components/field-hint', label: 'راهنمای فیلد', badge: 'TaavFieldHint' },
];

export const LAB_FORM_NAV: LabNavItem[] = [
  { href: '/forms/input', label: 'ورودی', badge: 'TaavInput' },
  { href: '/forms/currency-input', label: 'ورودی مبلغ', badge: 'TaavCurrencyInput' },
  { href: '/forms/percentage-input', label: 'ورودی درصد', badge: 'TaavPercentageInput' },
  { href: '/forms/textarea', label: 'متن چندخطی', badge: 'TaavTextarea' },
  { href: '/forms/select', label: 'انتخاب', badge: 'TaavSelect' },
  { href: '/forms/checkbox', label: 'چک‌باکس', badge: 'TaavCheckbox' },
  { href: '/forms/radio', label: 'رادیو', badge: 'TaavRadio' },
  { href: '/forms/switch', label: 'سوییچ', badge: 'TaavSwitch' },
  { href: '/forms/segmented-control', label: 'سگمنت', badge: 'TaavSegmentedControl' },
  { href: '/forms/option-card', label: 'کارت گزینه', badge: 'TaavOptionCard' },
  { href: '/forms/form-field', label: 'فیلد فرم', badge: 'TaavFormField' },
  { href: '/forms/field-block', label: 'بلوک فیلد', badge: 'TaavFieldBlock' },
  { href: '/forms/field-grid', label: 'گرید فیلد', badge: 'TaavFieldGrid' },
  { href: '/forms/choice-chip', label: 'چیپ انتخابی', badge: 'TaavChoiceChipGroup' },
];

export const LAB_OVERLAY_NAV: LabNavItem[] = [
  { href: '/overlays/dialog', label: 'دیالوگ', badge: 'TaavDialog' },
  { href: '/overlays/drawer', label: 'دراور', badge: 'TaavDrawer' },
  { href: '/overlays/popover', label: 'پاپ‌اور', badge: 'TaavPopover' },
  { href: '/overlays/dropdown', label: 'منو', badge: 'TaavDropdown' },
];

export const LAB_NAVIGATION_NAV: LabNavItem[] = [
  { href: '/navigation/tabs', label: 'تب‌ها', badge: 'TaavTabs' },
  { href: '/navigation/stepper', label: 'استپر', badge: 'TaavStepper' },
];

export const LAB_DATA_DISPLAY_NAV: LabNavItem[] = [
  { href: '/data-display/chip', label: 'چیپ', badge: 'TaavChip' },
  { href: '/data-display/status-badge', label: 'وضعیت', badge: 'TaavStatusBadge' },
  { href: '/data-display/empty-state', label: 'خالی', badge: 'TaavEmptyState' },
  { href: '/data-display/skeleton', label: 'اسکلت', badge: 'TaavSkeleton' },
  { href: '/data-display/pagination', label: 'صفحه‌بندی', badge: 'TaavPagination' },
  { href: '/data-display/filter-bar', label: 'فیلتر', badge: 'TaavFilterBar' },
  { href: '/data-display/table-shell', label: 'جدول', badge: 'TaavTableShell' },
  { href: '/data-display/key-value', label: 'کلید/مقدار', badge: 'TaavKeyValue' },
];

export const LAB_LAYOUT_NAV: LabNavItem[] = [
  { href: '/layout/page-shell', label: 'پوسته صفحه', badge: 'TaavPageShell' },
  { href: '/layout/page-header', label: 'سرصفحه', badge: 'TaavPageHeader' },
  { href: '/layout/section', label: 'بخش', badge: 'TaavSection' },
  { href: '/layout/settings-section', label: 'بخش تنظیمات', badge: 'TaavSettingsSection' },
  { href: '/layout/detail-header', label: 'سرصفحه جزئیات', badge: 'TaavDetailHeader' },
  { href: '/layout/sticky-action-bar', label: 'نوار اقدام', badge: 'TaavStickyActionBar' },
  { href: '/layout/sidebar-panel', label: 'پنل کناری', badge: 'TaavSidebarPanel' },
  { href: '/layout/stats-card', label: 'کارت آمار', badge: 'TaavStatsCard' },
  { href: '/layout/progress-summary', label: 'خلاصه پیشرفت', badge: 'TaavProgressSummary' },
];

export const LAB_BUSINESS_NAV: LabNavItem[] = ([
  {
    href: '/business/sidebar',
    label: 'سایدبار کسب‌وکار',
    badge: 'TaavBusinessSidebar',
    description: 'سایدبار ERP با nav path، tenant و quick actions',
    keywords: ['sidebar', 'navigation', 'dastranj'],
  },
  {
    href: '/business/section-toolbar-card',
    label: 'کارت سربرگ مدیریتی بخش',
    badge: 'TaavBusinessSectionToolbarCard',
    description: 'الگوی مشترک برای سربرگ‌های مدیریتی با جستجو و اقدام',
    keywords: ['toolbar card', 'section header', 'business management'],
  },
  {
    href: '/business/section-toolbar-card',
    label: 'کارت سربرگ مدیریتی بخش',
    badge: 'TaavBusinessSectionToolbarCard',
    description: 'الگوی مشترک برای سربرگ‌های مدیریتی با جست‌وجو و اقدام',
    keywords: ['toolbar card', 'section header', 'business management'],
  },
  {
    href: '/business/header-card',
    label: 'سربرگ',
    badge: 'TaavBusinessHeaderCard',
    description: 'کارت سربرگ بیزینسی برای عنوان، توضیح، آیکن، سوییچ، دکمه و جستجو',
    keywords: ['header card', 'section header', 'toggle', 'action', 'search'],
  },
  {
    href: '/business/mobile-number-input',
    label: '???? ???? ????? ??????',
    badge: 'TaavMobileNumberInputCard',
    description: '???? ???? ???? ????? ?????? ?? ????? ??????? ? ???? ???',
    keywords: ['mobile', 'phone', 'input', 'form', 'business'],
  },
  {
    href: '/business/module-card',
    label: 'کارت ماژول',
    badge: 'TaavModuleCard',
    description: 'کارت navigation برای ماژول‌ها و مراحل راه‌اندازی',
    keywords: ['setup', 'module', 'navigation card'],
  },
  {
    href: '/business/currency-input',
    label: 'ورودی مبلغ',
    badge: 'TaavCurrencyInput',
    description: 'ورود مبلغ با جداکننده سه‌رقمی و واحد پول — قرارداد، حقوق، وام',
    keywords: ['currency', 'rial', 'toman', 'amount', 'payroll', 'contract'],
  },
  {
    href: '/business/percentage-input',
    label: 'ورودی درصد',
    badge: 'TaavPercentageInput',
    description: 'ورود درصد با affix و محدوده min/max — پیش‌پرداخت، جریمه، تخفیف',
    keywords: ['percent', 'rate', 'contract', 'discount', 'penalty'],
  },
  {
    href: '/business/field-block',
    label: 'بلوک فیلد',
    badge: 'TaavFieldBlock',
    description: 'الگوی فیلد کسب‌وکاری با label، tooltip ثابت و پیام وضعیت',
    keywords: ['field block', 'business form', 'label', 'tooltip', 'validation'],
  },
  {
    href: '/business/choice-chip',
    label: 'چیپ انتخابی',
    badge: 'TaavChoiceChipGroup',
    description: 'انتخاب محدود کسب‌وکار — نوع شرکت، نوع قرارداد، وضعیت ساده',
    keywords: ['choice chip', 'company type', 'contract type', 'selection'],
  },
]);

export const LAB_CATEGORIES = [
  {
    title: 'Primitives',
    titleFa: 'پایه',
    description: 'دکمه، نشان، کارت و اجزای سطح پایین رابط کاربری',
    status: 'active' as const,
    count: 5,
  },
  {
    title: 'Forms',
    titleFa: 'فرم‌ها',
    description: 'Text fields، form controls و field composition استاندارد',
    status: 'active' as const,
    count: 18,
  },
  {
    title: 'Overlays',
    titleFa: 'اورلی',
    description: 'Dialog، Drawer، Popover و Dropdown',
    status: 'active' as const,
    count: 4,
  },
  {
    title: 'Navigation',
    titleFa: 'ناوبری',
    description: 'Tabs و Stepper برای صفحات و جریان‌های چندمرحله‌ای',
    status: 'active' as const,
    count: 2,
  },
  {
    title: 'Data Display',
    titleFa: 'نمایش داده',
    description: 'Chip، status، empty، skeleton، pagination، filter، table shell',
    status: 'active' as const,
    count: 9,
  },
  {
    title: 'Layout',
    titleFa: 'چیدمان',
    description: 'Page shell، header، section، settings، detail، sticky actions، sidebar، stats',
    status: 'active' as const,
    count: 9,
  },
  {
    title: 'Business Components',
    titleFa: 'کامپوننت‌های کسب‌وکار',
    description: 'اجزای تخصصی DastRanj و VahedYek',
    status: 'active' as const,
    count: 9,
  },
];

export const LAB_STATUS_ITEMS = [
  { key: 'foundation', label: 'Foundation', status: 'principles + refs', progress: 92 },
  { key: 'tokens', label: 'Tokens', status: 'form tokens', progress: 85 },
  { key: 'primitives', label: 'Primitives', status: '۵ کامپوننت', progress: 70 },
  { key: 'forms', label: 'Forms P2', status: '۱۶ کامپوننت', progress: 86 },
  { key: 'overlays', label: 'Overlays', status: '۴ primitive', progress: 70 },
  { key: 'navigation', label: 'Navigation', status: 'Tabs + Stepper', progress: 65 },
  { key: 'data-display', label: 'Data Display', status: '۹ کامپوننت', progress: 70 },
  { key: 'layout', label: 'Layout', status: '۹ الگو', progress: 75 },
  { key: 'business', label: 'Business', status: '۹ کامپوننت — layout + form patterns', progress: 65 },
  { key: 'ui-lab', label: 'UI Lab', status: 'مستندات', progress: 92 },
  { key: 'migration', label: 'Migration', status: 'شروع نشده', progress: 0 },
];

