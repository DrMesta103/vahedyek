import type { DocPropRow } from './shared';

export const BUTTON_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'success' | 'warning' | 'link'", defaultValue: 'primary', description: 'سبک بصری دکمه' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", defaultValue: 'md', description: 'ارتفاع و تایپوگرافی استاندارد' },
  { name: 'width', type: "'auto' | 'full' | 'fit' | 'icon'", defaultValue: 'auto', description: 'عرض دکمه یا حالت آیکونی' },
  { name: 'tone', type: "'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'", defaultValue: 'brand', description: 'نقش رنگی معنادار' },
  { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'غیرفعال‌سازی تعامل و نمایش اسپینر' },
  { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'حالت غیرفعال' },
  { name: 'iconStart', type: 'ReactNode', description: 'آیکون ابتدای متن (RTL)' },
  { name: 'iconEnd', type: 'ReactNode', description: 'آیکون انتهای متن (RTL)' },
  { name: 'aria-label', type: 'string', description: 'الزامی برای دکمه آیکونی بدون متن' },
];

export const BADGE_PROPS: DocPropRow[] = [
  { name: 'tone', type: "'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple'", defaultValue: 'neutral', description: 'معنای وضعیت' },
  { name: 'variant', type: "'solid' | 'soft' | 'outline' | 'subtle'", defaultValue: 'soft', description: 'شدت بصری' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'ارتفاع و فونت استاندارد' },
  { name: 'shape', type: "'pill' | 'rounded' | 'square'", defaultValue: 'pill', description: 'شکل گوشه‌ها' },
  { name: 'width', type: "'auto' | 'fixed' | 'full'", defaultValue: 'auto', description: 'عرض محتوا، ثابت یا کامل' },
  { name: 'iconStart', type: 'ReactNode', description: 'آیکون قبل از متن' },
  { name: 'iconEnd', type: 'ReactNode', description: 'آیکون بعد از متن' },
];

export const CARD_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'elevated' | 'outlined' | 'soft' | 'ghost'", defaultValue: 'outlined', description: 'نوع سطح' },
  { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'فاصله داخلی' },
  { name: 'radius', type: "'md' | 'lg' | 'xl' | 'xxl'", defaultValue: 'lg', description: 'شعاع گوشه' },
  { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'hover و حس قابل کلیک' },
  { name: 'selected', type: 'boolean', defaultValue: 'false', description: 'حالت انتخاب‌شده' },
  { name: 'header', type: 'ReactNode', description: 'بخش بالایی' },
  { name: 'footer', type: 'ReactNode', description: 'بخش پایینی' },
];

export const TOOLTIP_PROPS: DocPropRow[] = [
  { name: 'content', type: 'ReactNode', required: true, description: 'متن راهنما' },
  { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", defaultValue: 'top', description: 'موقعیت نسبت به trigger' },
  { name: 'align', type: "'start' | 'center' | 'end'", defaultValue: 'center', description: 'تراز در محور جانبی' },
  { name: 'delayDuration', type: 'number', defaultValue: '200', description: 'تاخیر نمایش (ms)' },
  { name: 'children', type: 'ReactNode', required: true, description: 'عنصر trigger' },
];

export const FIELD_HINT_PROPS: DocPropRow[] = [
  { name: 'tone', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", defaultValue: 'neutral', description: 'نوع پیام' },
  { name: 'size', type: "'sm' | 'md'", defaultValue: 'md', description: 'تراکم متن' },
  { name: 'icon', type: 'ReactNode', description: 'آیکون راهنما' },
  { name: 'title', type: 'string', description: 'عنوان کوتاه' },
  { name: 'children', type: 'ReactNode', description: 'متن راهنما یا خطا' },
];

export const INPUT_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'ارتفاع و padding' },
  { name: 'variant', type: "'default' | 'filled' | 'soft' | 'ghost'", defaultValue: 'default', description: 'پس‌زمینه سطح' },
  { name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger'", defaultValue: 'neutral', description: 'رنگ مرز معنادار' },
  { name: 'width', type: "'auto' | 'full'", defaultValue: 'full', description: 'عرض کنترل' },
  { name: 'invalid', type: 'boolean', defaultValue: 'false', description: 'حالت خطا' },
  { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'اسپینر و غیرفعال‌سازی' },
  { name: 'iconStart / iconEnd', type: 'ReactNode', description: 'آیکون RTL' },
  { name: 'prefix / suffix', type: 'ReactNode', description: 'متن یا واحد کنار input' },
];

export const TEXTAREA_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'padding و min-height' },
  { name: 'variant', type: "'default' | 'filled' | 'soft' | 'ghost'", defaultValue: 'default', description: 'پس‌زمینه' },
  { name: 'invalid', type: 'boolean', defaultValue: 'false', description: 'حالت خطا' },
  { name: 'rows / minRows', type: 'number', description: 'ارتفاع اولیه' },
  { name: 'maxLength', type: 'number', description: 'حداکثر کاراکتر' },
  { name: 'showCount', type: 'boolean', defaultValue: 'false', description: 'شمارنده با maxLength' },
];

export const FORM_FIELD_PROPS: DocPropRow[] = [
  { name: 'label', type: 'ReactNode', description: 'برچسب فیلد' },
  { name: 'required / optional', type: 'boolean', description: 'نمایش الزامی/اختیاری' },
  { name: 'description', type: 'ReactNode', description: 'متن راهنما' },
  { name: 'message', type: 'ReactNode', description: 'پیام info/success/warning' },
  { name: 'error', type: 'ReactNode', description: 'پیام خطا — tone را danger می‌کند' },
  { name: 'htmlFor', type: 'string', description: 'اتصال label به control' },
  { name: 'children', type: 'ReactNode', required: true, description: 'TaavInput یا TaavTextarea' },
];

export const SELECT_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'ارتفاع و padding' },
  { name: 'variant', type: "'default' | 'filled' | 'soft' | 'ghost'", defaultValue: 'default', description: 'پس‌زمینه' },
  { name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger'", defaultValue: 'neutral', description: 'رنگ مرز' },
  { name: 'invalid', type: 'boolean', defaultValue: 'false', description: 'حالت خطا' },
  { name: 'placeholder', type: 'string', description: 'گزینه placeholder غیرقابل انتخاب' },
  { name: 'options', type: 'TaavSelectOption[]', required: true, description: 'لیست label/value' },
  { name: 'iconStart', type: 'ReactNode', description: 'آیکون RTL' },
];

export const CHECKBOX_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'اندازه control' },
  { name: 'tone', type: "'brand' | 'neutral' | 'success' | 'warning' | 'danger'", defaultValue: 'brand', description: 'رنگ checked' },
  { name: 'indeterminate', type: 'boolean', defaultValue: 'false', description: 'حالت نیمه‌انتخاب' },
  { name: 'invalid', type: 'boolean', defaultValue: 'false', description: 'حالت خطا' },
  { name: 'label / description', type: 'ReactNode', description: 'چیدمان استاندارد label' },
];

export const RADIO_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'اندازه radio' },
  { name: 'tone', type: "'brand' | 'neutral' | 'success' | 'warning' | 'danger'", defaultValue: 'brand', description: 'رنگ dot' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: 'vertical', description: 'چیدمان TaavRadioGroup' },
  { name: 'options', type: 'TaavRadioOption[]', required: true, description: 'گزینه‌های گروه' },
  { name: 'onValueChange', type: '(value: string) => void', description: 'تغییر مقدار گروه' },
];

export const SWITCH_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'ابعاد track/thumb' },
  { name: 'tone', type: "'brand' | 'neutral' | 'success' | 'warning' | 'danger'", defaultValue: 'brand', description: 'رنگ track روشن' },
  { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'تغییر boolean' },
  { name: 'label / description', type: 'ReactNode', description: 'برچسب تنظیمات' },
];

export const SEGMENTED_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'ارتفاع segment' },
  { name: 'tone', type: "'brand' | 'neutral'", defaultValue: 'brand', description: 'نقش رنگی' },
  { name: 'variant', type: "'solid' | 'soft' | 'outline'", defaultValue: 'solid', description: 'سبک segment' },
  { name: 'width', type: "'auto' | 'full'", defaultValue: 'auto', description: 'عرض کنترل' },
  { name: 'options', type: 'TaavSegmentedOption[]', required: true, description: 'label/value/icon' },
];

export const OPTION_CARD_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'padding و title' },
  { name: 'tone', type: "'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'", defaultValue: 'brand', description: 'حالت selected' },
  { name: 'selected', type: 'boolean', defaultValue: 'false', description: 'حالت انتخاب‌شده' },
  { name: 'inputType', type: "'radio' | 'checkbox' | 'none'", defaultValue: 'none', description: 'نوع input پنهان' },
  { name: 'title / description / meta', type: 'ReactNode', description: 'محتوای کارت' },
  { name: 'icon / badge', type: 'ReactNode', description: 'آیکون یا badge' },
];

export const DIALOG_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'", defaultValue: 'md', description: 'عرض dialog' },
  { name: 'variant', type: "'default' | 'elevated' | 'soft'", defaultValue: 'default', description: 'سطح بصری' },
  { name: 'tone', type: "'neutral' | 'danger' | 'success' | 'warning' | 'info'", defaultValue: 'neutral', description: 'مرز معنادار' },
  { name: 'showCloseButton', type: 'boolean', defaultValue: 'true', description: 'دکمه بستن RTL' },
  { name: 'open / onOpenChange', type: 'boolean / fn', description: 'controlled state' },
];

export const DRAWER_PROPS: DocPropRow[] = [
  { name: 'side', type: "'right' | 'left' | 'top' | 'bottom'", defaultValue: 'left', description: 'RTL default: left (start edge)' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", defaultValue: 'md', description: 'عرض/ارتفاع drawer' },
  { name: 'variant', type: "'default' | 'elevated' | 'soft'", defaultValue: 'default', description: 'سطح بصری' },
  { name: 'showCloseButton', type: 'boolean', defaultValue: 'true', description: 'دکمه بستن' },
];

export const POPOVER_PROPS: DocPropRow[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'عرض popover' },
  { name: 'variant', type: "'default' | 'elevated' | 'soft'", defaultValue: 'default', description: 'سطح' },
  { name: 'tone', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", defaultValue: 'neutral', description: 'مرز معنادار' },
  { name: 'side / align', type: 'Radix placement', description: 'موقعیت نسبت به trigger' },
];

export const DROPDOWN_PROPS: DocPropRow[] = [
  { name: 'tone', type: "'neutral' | 'danger' | 'success' | 'warning' | 'info'", defaultValue: 'neutral', description: 'رنگ آیتم' },
  { name: 'iconStart / iconEnd', type: 'ReactNode', description: 'آیکون RTL' },
  { name: 'shortcut', type: 'string', description: 'میانبر کیبورد' },
  { name: 'description', type: 'ReactNode', description: 'زیرعنوان آیتم' },
  { name: 'onSelect', type: '() => void', description: 'انتخاب آیتم' },
];

export const TABS_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'underline' | 'pill' | 'soft' | 'boxed'", defaultValue: 'underline', description: 'سبک tab list' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'ارتفاع trigger' },
  { name: 'tone', type: "'brand' | 'neutral'", defaultValue: 'brand', description: 'رنگ selected' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: 'horizontal', description: 'چیدمان' },
  { name: 'value / onValueChange', type: 'string / fn', description: 'controlled tab' },
];

export const STEPPER_PROPS: DocPropRow[] = [
  { name: 'steps', type: 'TaavStep[]', required: true, description: 'title/description/status/icon' },
  { name: 'currentStep', type: 'string', description: 'id step فعلی' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: 'horizontal', description: 'چیدمان RTL' },
  { name: 'variant', type: "'numbered' | 'icon' | 'compact'", defaultValue: 'numbered', description: 'نمایش indicator' },
  { name: 'showProgress', type: 'boolean', defaultValue: 'true', description: 'نوار پیشرفت' },
  { name: 'allowClick / onStepClick', type: 'boolean / fn', description: 'ناوبری کلیکی' },
];

export const CHIP_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'soft' | 'outline' | 'solid' | 'ghost'", defaultValue: 'soft', description: 'سبک chip' },
  { name: 'tone', type: "'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple'", defaultValue: 'neutral', description: 'نقش رنگی' },
  { name: 'behavior', type: "'static' | 'clickable' | 'selectable' | 'removable'", defaultValue: 'static', description: 'نوع تعامل' },
  { name: 'selected', type: 'boolean', defaultValue: 'false', description: 'حالت انتخاب' },
  { name: 'onRemove', type: '() => void', description: 'حذف chip' },
];

export const STATUS_BADGE_PROPS: DocPropRow[] = [
  { name: 'status', type: 'TaavStatus', required: true, description: 'active/pending/rejected/...' },
  { name: 'variant', type: "'soft' | 'solid' | 'outline' | 'subtle'", defaultValue: 'soft', description: 'شدت بصری' },
  { name: 'withDot', type: 'boolean', defaultValue: 'true', description: 'نقطه وضعیت' },
  { name: 'label / children', type: 'ReactNode', description: 'override برچسب فارسی' },
];

export const EMPTY_STATE_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'default' | 'search' | 'error' | 'permission' | 'setup' | 'compact'", defaultValue: 'default', description: 'نوع empty' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'تراکم' },
  { name: 'primaryAction / secondaryAction', type: 'ReactNode', description: 'اقدامات (TaavButton)' },
];

export const SKELETON_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'text' | 'title' | 'avatar' | 'button' | 'card' | 'row' | 'table' | 'custom'", defaultValue: 'text', description: 'شکل placeholder' },
  { name: 'lines / count', type: 'number', description: 'تعداد خط/بلوک' },
  { name: 'animated', type: 'boolean', defaultValue: 'true', description: 'pulse animation' },
];

export const PAGINATION_PROPS: DocPropRow[] = [
  { name: 'page / totalPages', type: 'number', required: true, description: 'controlled pagination' },
  { name: 'onPageChange', type: '(page: number) => void', required: true, description: 'تغییر صفحه' },
  { name: 'variant', type: "'default' | 'compact' | 'minimal'", defaultValue: 'default', description: 'نمایش page numbers' },
  { name: 'showPageSize / showTotal', type: 'boolean', description: 'کنترل‌های اضافه' },
];

export const FILTER_BAR_PROPS: DocPropRow[] = [
  { name: 'searchValue / onSearchChange', type: 'string / fn', description: 'جستجو با TaavInput' },
  { name: 'filters / activeFilters / actions', type: 'ReactNode', description: 'اسلات‌های filter/action' },
  { name: 'layout', type: "'inline' | 'stacked' | 'responsive'", defaultValue: 'responsive', description: 'چیدمان' },
  { name: 'resultCount / loading', type: 'number / boolean', description: 'خلاصه نتایج' },
];

export const TABLE_SHELL_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'default' | 'bordered' | 'striped' | 'card'", defaultValue: 'default', description: 'سبک جدول' },
  { name: 'density', type: "'compact' | 'comfortable' | 'spacious'", defaultValue: 'comfortable', description: 'ارتفاع row' },
  { name: 'loading / empty', type: 'boolean', description: 'حالت skeleton/empty' },
  { name: 'emptyState / footer', type: 'ReactNode', description: 'اسلات‌های سفارشی' },
];

export const KEY_VALUE_PROPS: DocPropRow[] = [
  { name: 'items', type: 'TaavKeyValueItem[]', description: 'label/value/description' },
  { name: 'layout', type: "'vertical' | 'horizontal' | 'grid'", defaultValue: 'vertical', description: 'چیدمان' },
  { name: 'size / density', type: 'sm|md|lg / compact|comfortable', description: 'تایپوگرافی و فاصله' },
  { name: 'separator', type: 'boolean', defaultValue: 'false', description: 'خط جداکننده' },
];

export const PAGE_SHELL_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'default' | 'dashboard' | 'settings' | 'detail' | 'form' | 'report'", defaultValue: 'default', description: 'الگوی صفحه' },
  { name: 'width', type: "'narrow' | 'normal' | 'wide' | 'full'", defaultValue: 'normal', description: 'حداکثر عرض container' },
  { name: 'padding / density', type: 'none|sm|md|lg / compact|comfortable|spacious', description: 'فاصله صفحه' },
  { name: 'withBackground / withContainer', type: 'boolean', defaultValue: 'true', description: 'پس‌زمینه و container' },
  { name: 'header / sidebar / footer', type: 'ReactNode', description: 'اسلات‌های layout' },
];

export const PAGE_HEADER_PROPS: DocPropRow[] = [
  { name: 'title / eyebrow / description', type: 'ReactNode', description: 'محتوای header' },
  { name: 'variant', type: "'default' | 'compact' | 'hero' | 'plain'", defaultValue: 'default', description: 'سبک header' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'اندازه عنوان' },
  { name: 'status', type: 'TaavStatus', description: 'نشان وضعیت استاندارد' },
  { name: 'actions / secondaryActions / backAction', type: 'ReactNode', description: 'اقدامات (TaavButton)' },
  { name: 'sticky / bordered / loading', type: 'boolean', description: 'حالت‌های header' },
];

export const SECTION_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'card' | 'plain' | 'outlined' | 'soft'", defaultValue: 'card', description: 'سطح section' },
  { name: 'padding / density', type: 'none|sm|md|lg / compact|comfortable|spacious', description: 'فاصله داخلی' },
  { name: 'collapsible / defaultCollapsed', type: 'boolean', description: 'بخش تاشو' },
  { name: 'title / description / actions / footer', type: 'ReactNode', description: 'اسلات‌های section' },
  { name: 'disabled / loading', type: 'boolean', description: 'حالت‌ها' },
];

export const SETTINGS_SECTION_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'default' | 'card' | 'split' | 'compact'", defaultValue: 'default', description: 'الگوی settings' },
  { name: 'title / description / aside', type: 'ReactNode', description: 'ستون توضیحات' },
  { name: 'status / completion / warning', type: 'ReactNode / TaavStatus', description: 'وضعیت تکمیل' },
  { name: 'required / optional', type: 'boolean', description: 'برچسب الزامی/اختیاری' },
  { name: 'density', type: "'compact' | 'comfortable'", defaultValue: 'comfortable', description: 'تراکم' },
];

export const DETAIL_HEADER_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'default' | 'card' | 'compact' | 'hero'", defaultValue: 'default', description: 'سبک detail header' },
  { name: 'title / subtitle / avatar / icon', type: 'ReactNode', description: 'هویت رکورد' },
  { name: 'status / meta / tags', type: 'TaavStatus / ReactNode', description: 'وضعیت و meta' },
  { name: 'actions / backAction / tabs / summary', type: 'ReactNode', description: 'اقدامات و tabs (بدون routing)' },
  { name: 'loading', type: 'boolean', description: 'حالت loading' },
];

export const STICKY_ACTION_BAR_PROPS: DocPropRow[] = [
  { name: 'position', type: "'bottom' | 'top'", defaultValue: 'bottom', description: 'موقعیت sticky' },
  { name: 'variant', type: "'default' | 'elevated' | 'soft' | 'transparent'", defaultValue: 'default', description: 'سطح action bar' },
  { name: 'align', type: "'start' | 'end' | 'between' | 'center'", defaultValue: 'end', description: 'تراز اقدامات RTL' },
  { name: 'primaryAction / secondaryAction / tertiaryAction', type: 'ReactNode', description: 'دکمه‌های اصلی' },
  { name: 'summary / dirty / loading / disabled', type: 'boolean / ReactNode', description: 'خلاصه و حالت dirty' },
];

export const SIDEBAR_PANEL_PROPS: DocPropRow[] = [
  { name: 'variant', type: "'card' | 'soft' | 'outlined' | 'plain'", defaultValue: 'card', description: 'سطح panel' },
  { name: 'width', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'عرض panel' },
  { name: 'sticky / collapsible', type: 'boolean', description: 'panel چسبان/تاشو' },
  { name: 'title / description / status / actions / footer', type: 'ReactNode', description: 'اسلات‌های panel' },
  { name: 'density', type: "'compact' | 'comfortable'", defaultValue: 'comfortable', description: 'تراکم' },
];

export const STATS_CARD_PROPS: DocPropRow[] = [
  { name: 'title / value / description', type: 'ReactNode', description: 'محتوای metric' },
  { name: 'tone', type: "'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple'", defaultValue: 'neutral', description: 'تن رنگ' },
  { name: 'size / variant', type: 'sm|md|lg / card|soft|outline|ghost', description: 'اندازه و سطح' },
  { name: 'trend', type: 'TaavStatsTrend', description: 'روند (value, direction, tone, label)' },
  { name: 'loading / footer / action', type: 'boolean / ReactNode', description: 'حالت‌ها و footer' },
];

export const PROGRESS_SUMMARY_PROPS: DocPropRow[] = [
  { name: 'value / max / percent', type: 'number', description: 'پیشرفت محاسبه‌شده توسط caller' },
  { name: 'variant', type: "'bar' | 'ring' | 'list' | 'compact'", defaultValue: 'bar', description: 'نمایش progress' },
  { name: 'tone / size', type: 'TaavLayoutTone / sm|md|lg', description: 'رنگ و اندازه' },
  { name: 'items', type: 'TaavProgressSummaryItem[]', description: 'لیست مراحل تکمیل' },
  { name: 'status / showPercent / loading', type: 'TaavStatus / boolean', description: 'وضعیت و درصد' },
];
