export type TokenCategory =
  | 'color'
  | 'semantic'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'focus'
  | 'motion'
  | 'component';

export type TokenEntry = {
  name: string;
  cssVar: string;
  value: string;
  description: string;
  category: TokenCategory;
  preview?: 'color' | 'radius' | 'shadow' | 'spacing' | 'text' | 'none';
  themeAware?: boolean;
};

export const TAAV_TOKEN_CATALOG: TokenEntry[] = [
  // Semantic colors
  { name: 'bg', cssVar: '--taav-bg', value: 'theme', description: 'پس‌زمینه کلی صفحه و shell', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'surface', cssVar: '--taav-surface', value: 'theme', description: 'سطح اصلی کارت و پنل', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'surface-muted', cssVar: '--taav-surface-muted', value: 'theme', description: 'سطح ثانویه و پس‌زمینه بخش‌ها', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'border', cssVar: '--taav-border', value: 'theme', description: 'مرز پیش‌فرض اجزا', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'border-strong', cssVar: '--taav-border-strong', value: 'theme', description: 'مرز پررنگ‌تر برای تاکید', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'text-strong', cssVar: '--taav-text-strong', value: 'theme', description: 'عنوان و متن پررنگ', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'text-body', cssVar: '--taav-text-body', value: 'theme', description: 'متن اصلی', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'text-muted', cssVar: '--taav-text-muted', value: 'theme', description: 'متن ثانویه', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'text-subtle', cssVar: '--taav-text-subtle', value: 'theme', description: 'متن کم‌اهمیت و label', category: 'semantic', preview: 'color', themeAware: true },
  { name: 'brand', cssVar: '--taav-brand', value: 'theme', description: 'رنگ برند اصلی', category: 'color', preview: 'color', themeAware: true },
  { name: 'success', cssVar: '--taav-success', value: 'theme', description: 'وضعیت موفقیت', category: 'color', preview: 'color', themeAware: true },
  { name: 'warning', cssVar: '--taav-warning', value: 'theme', description: 'هشدار', category: 'color', preview: 'color', themeAware: true },
  { name: 'danger', cssVar: '--taav-danger', value: 'theme', description: 'خطر و خطا', category: 'color', preview: 'color', themeAware: true },
  { name: 'info', cssVar: '--taav-info', value: 'theme', description: 'اطلاعات', category: 'color', preview: 'color', themeAware: true },

  // Typography
  { name: 'text-xs', cssVar: '--taav-text-xs', value: '11px', description: 'برچسب و meta', category: 'typography', preview: 'text' },
  { name: 'text-sm', cssVar: '--taav-text-sm', value: '13px', description: 'متن رابط پیش‌فرض', category: 'typography', preview: 'text' },
  { name: 'text-md', cssVar: '--taav-text-md', value: '14px', description: 'متن بدنه استاندارد', category: 'typography', preview: 'text' },
  { name: 'text-lg', cssVar: '--taav-text-lg', value: '16px', description: 'متن برجسته', category: 'typography', preview: 'text' },
  { name: 'leading-normal', cssVar: '--taav-leading-normal', value: '1.6', description: 'فاصله خط پیش‌فرض فارسی', category: 'typography', preview: 'none' },
  { name: 'leading-relaxed', cssVar: '--taav-leading-relaxed', value: '1.8', description: 'فاصله خط برای توضیحات', category: 'typography', preview: 'none' },

  // Spacing
  { name: 'space-2', cssVar: '--taav-space-2', value: '8px', description: 'فاصله فشرده', category: 'spacing', preview: 'spacing' },
  { name: 'space-3', cssVar: '--taav-space-3', value: '12px', description: 'فاصله داخلی کوچک', category: 'spacing', preview: 'spacing' },
  { name: 'space-4', cssVar: '--taav-space-4', value: '16px', description: 'فاصله استاندارد', category: 'spacing', preview: 'spacing' },
  { name: 'space-5', cssVar: '--taav-space-5', value: '20px', description: 'فاصله کارت', category: 'spacing', preview: 'spacing' },
  { name: 'space-6', cssVar: '--taav-space-6', value: '24px', description: 'فاصله بخش‌ها', category: 'spacing', preview: 'spacing' },
  { name: 'space-8', cssVar: '--taav-space-8', value: '32px', description: 'فاصله صفحه', category: 'spacing', preview: 'spacing' },

  // Radius
  { name: 'radius-sm', cssVar: '--taav-radius-sm', value: '6px', description: 'کنترل‌های کوچک', category: 'radius', preview: 'radius' },
  { name: 'radius-md', cssVar: '--taav-radius-md', value: '10px', description: 'دکمه و input', category: 'radius', preview: 'radius' },
  { name: 'radius-lg', cssVar: '--taav-radius-lg', value: '14px', description: 'کارت استاندارد', category: 'radius', preview: 'radius' },
  { name: 'radius-xl', cssVar: '--taav-radius-xl', value: '18px', description: 'پنل و hero', category: 'radius', preview: 'radius' },
  { name: 'radius-pill', cssVar: '--taav-radius-pill', value: '9999px', description: 'badge و chip', category: 'radius', preview: 'radius' },

  // Shadow
  { name: 'shadow-xs', cssVar: '--taav-shadow-xs', value: 'subtle', description: 'سایه خیلی کم', category: 'shadow', preview: 'shadow' },
  { name: 'shadow-sm', cssVar: '--taav-shadow-sm', value: 'card', description: 'کارت برجسته', category: 'shadow', preview: 'shadow' },
  { name: 'shadow-md', cssVar: '--taav-shadow-md', value: 'dropdown', description: 'tooltip و منو', category: 'shadow', preview: 'shadow' },
  { name: 'shadow-lg', cssVar: '--taav-shadow-lg', value: 'modal', description: 'لایه بالاتر', category: 'shadow', preview: 'shadow' },

  // Focus & motion
  { name: 'focus-ring', cssVar: '--taav-focus-ring', value: '3px brand', description: 'حلقه فوکوس پیش‌فرض', category: 'focus', preview: 'none', themeAware: true },
  { name: 'duration-fast', cssVar: '--taav-duration-fast', value: '120ms', description: 'انیمیشن سریع', category: 'motion', preview: 'none' },
  { name: 'duration-normal', cssVar: '--taav-duration-normal', value: '180ms', description: 'انیمیشن استاندارد', category: 'motion', preview: 'none' },
  { name: 'duration-slow', cssVar: '--taav-duration-slow', value: '280ms', description: 'انیمیشن آهسته', category: 'motion', preview: 'none' },

  // Component sizing
  { name: 'btn-height-md', cssVar: '--taav-btn-height-md', value: '40px', description: 'ارتفاع دکمه md', category: 'component', preview: 'spacing' },
  { name: 'badge-height-md', cssVar: '--taav-badge-height-md', value: '28px', description: 'ارتفاع badge md', category: 'component', preview: 'spacing' },
  { name: 'card-padding-md', cssVar: '--taav-card-padding-md', value: '20px', description: 'padding کارت md', category: 'component', preview: 'spacing' },
  { name: 'tooltip-padding', cssVar: '--taav-tooltip-padding-x', value: '12px', description: 'padding افقی tooltip', category: 'component', preview: 'spacing' },

  /* Form tokens */
  { name: 'input-height-md', cssVar: '--taav-input-height-md', value: '42px', description: 'ارتفاع input md', category: 'component', preview: 'spacing' },
  { name: 'input-px-md', cssVar: '--taav-input-px-md', value: '14px', description: 'padding افقی input', category: 'component', preview: 'spacing' },
  { name: 'input-border', cssVar: '--taav-input-border', value: 'theme', description: 'مرز پیش‌فرض input', category: 'component', preview: 'color', themeAware: true },
  { name: 'input-bg-disabled', cssVar: '--taav-input-bg-disabled', value: 'theme', description: 'پس‌زمینه disabled', category: 'component', preview: 'color', themeAware: true },
  { name: 'input-placeholder', cssVar: '--taav-input-placeholder', value: 'theme', description: 'رنگ placeholder', category: 'component', preview: 'color', themeAware: true },
  { name: 'input-focus-ring', cssVar: '--taav-input-focus-ring', value: 'brand ring', description: 'حلقه فوکوس input', category: 'focus', preview: 'none', themeAware: true },
  { name: 'textarea-min-height-md', cssVar: '--taav-textarea-min-height-md', value: '108px', description: 'حداقل ارتفاع textarea', category: 'component', preview: 'spacing' },
  { name: 'form-label-md', cssVar: '--taav-form-label-md', value: '13px', description: 'تایپوگرافی label', category: 'typography', preview: 'text' },
  { name: 'form-message-sm', cssVar: '--taav-form-message-sm', value: '11px', description: 'پیام خطا/راهنما', category: 'typography', preview: 'text' },
  { name: 'required-mark', cssVar: '--taav-required-mark', value: 'theme', description: 'رنگ ستاره الزامی', category: 'color', preview: 'color', themeAware: true },
  { name: 'control-size-md', cssVar: '--taav-control-size-md', value: '18px', description: 'اندازه checkbox/radio md', category: 'component', preview: 'spacing' },
  { name: 'control-focus-ring', cssVar: '--taav-control-focus-ring', value: 'brand ring', description: 'حلقه فوکوس کنترل‌ها', category: 'focus', preview: 'none', themeAware: true },
  { name: 'switch-track-w-md', cssVar: '--taav-switch-track-w-md', value: '42px', description: 'عرض track سوییچ', category: 'component', preview: 'spacing' },
  { name: 'switch-track-on-brand', cssVar: '--taav-switch-track-on-brand', value: 'theme', description: 'رنگ track روشن', category: 'color', preview: 'color', themeAware: true },
  { name: 'segmented-height-md', cssVar: '--taav-segmented-height-md', value: '38px', description: 'ارتفاع segmented control', category: 'component', preview: 'spacing' },
  { name: 'segmented-selected-bg', cssVar: '--taav-segmented-selected-bg', value: 'theme', description: 'پس‌زمینه گزینه انتخاب‌شده', category: 'component', preview: 'color', themeAware: true },
  { name: 'option-card-selected-border', cssVar: '--taav-option-card-selected-border', value: 'theme', description: 'مرز option card انتخاب‌شده', category: 'color', preview: 'color', themeAware: true },
  { name: 'overlay-backdrop', cssVar: '--taav-overlay-backdrop', value: 'rgba', description: 'پس‌زمینه modal/drawer', category: 'color', preview: 'color' },
  { name: 'overlay-surface', cssVar: '--taav-overlay-surface', value: 'theme', description: 'سطح dialog/dropdown', category: 'component', preview: 'color', themeAware: true },
  { name: 'dialog-width-md', cssVar: '--taav-dialog-width-md', value: '480px', description: 'عرض dialog md', category: 'component', preview: 'spacing' },
  { name: 'drawer-width-md', cssVar: '--taav-drawer-width-md', value: '400px', description: 'عرض drawer md', category: 'component', preview: 'spacing' },
  { name: 'dropdown-item-height-md', cssVar: '--taav-dropdown-item-height-md', value: '36px', description: 'ارتفاع آیتم dropdown', category: 'component', preview: 'spacing' },
  { name: 'tabs-height-md', cssVar: '--taav-tabs-height-md', value: '40px', description: 'ارتفاع tab trigger', category: 'component', preview: 'spacing' },
  { name: 'tabs-indicator', cssVar: '--taav-tabs-indicator', value: 'theme', description: 'رنگ indicator فعال', category: 'color', preview: 'color', themeAware: true },
  { name: 'stepper-current', cssVar: '--taav-stepper-current', value: 'theme', description: 'رنگ step فعلی', category: 'color', preview: 'color', themeAware: true },
  { name: 'stepper-connector', cssVar: '--taav-stepper-connector', value: 'theme', description: 'خط اتصال stepper', category: 'color', preview: 'color', themeAware: true },
  { name: 'chip-height-md', cssVar: '--taav-chip-height-md', value: '30px', description: 'ارتفاع chip md', category: 'component', preview: 'spacing' },
  { name: 'chip-selected-ring', cssVar: '--taav-chip-selected-ring', value: 'brand ring', description: 'حلقه chip انتخاب‌شده', category: 'color', preview: 'color', themeAware: true },
  { name: 'skeleton-bg', cssVar: '--taav-skeleton-bg', value: 'theme', description: 'پس‌زمینه skeleton', category: 'component', preview: 'color', themeAware: true },
  { name: 'table-row-height-comfortable', cssVar: '--taav-table-row-height-comfortable', value: '48px', description: 'ارتفاع row جدول', category: 'component', preview: 'spacing' },
  { name: 'table-header-bg', cssVar: '--taav-table-header-bg', value: 'theme', description: 'پس‌زمینه header جدول', category: 'component', preview: 'color', themeAware: true },
  { name: 'kv-label-size-md', cssVar: '--taav-kv-label-size-md', value: '13px', description: 'تایپوگرافی label', category: 'typography', preview: 'text' },

  /* Layout tokens */
  { name: 'page-bg', cssVar: '--taav-page-bg', value: 'theme', description: 'پس‌زمینه page shell', category: 'component', preview: 'color', themeAware: true },
  { name: 'page-container-normal', cssVar: '--taav-page-container-normal', value: '960px', description: 'عرض container استاندارد', category: 'component', preview: 'spacing' },
  { name: 'page-container-wide', cssVar: '--taav-page-container-wide', value: '1200px', description: 'عرض container گسترده', category: 'component', preview: 'spacing' },
  { name: 'page-padding-md', cssVar: '--taav-page-padding-md', value: '24px', description: 'padding page shell md', category: 'component', preview: 'spacing' },
  { name: 'layout-gap-comfortable', cssVar: '--taav-layout-gap-comfortable', value: '24px', description: 'فاصله بین بخش‌های layout', category: 'spacing', preview: 'spacing' },
  { name: 'section-padding-md', cssVar: '--taav-section-padding-md', value: '20px', description: 'padding section md', category: 'component', preview: 'spacing' },
  { name: 'section-surface-card', cssVar: '--taav-section-surface-card', value: 'theme', description: 'سطح section card', category: 'component', preview: 'color', themeAware: true },
  { name: 'header-title-md', cssVar: '--taav-header-title-md', value: '20px', description: 'تایپوگرافی عنوان page header', category: 'typography', preview: 'text' },
  { name: 'action-bar-height', cssVar: '--taav-action-bar-height', value: '64px', description: 'ارتفاع sticky action bar', category: 'component', preview: 'spacing' },
  { name: 'action-bar-surface', cssVar: '--taav-action-bar-surface', value: 'theme', description: 'سطح sticky action bar', category: 'component', preview: 'color', themeAware: true },
  { name: 'sidebar-width-md', cssVar: '--taav-sidebar-width-md', value: '320px', description: 'عرض sidebar panel md', category: 'component', preview: 'spacing' },
  { name: 'stats-value-md', cssVar: '--taav-stats-value-md', value: '24px', description: 'تایپوگرافی مقدار stats card', category: 'typography', preview: 'text' },
  { name: 'stats-tone-brand', cssVar: '--taav-stats-tone-brand', value: 'theme', description: 'سطح stats card brand', category: 'component', preview: 'color', themeAware: true },
  { name: 'progress-height-md', cssVar: '--taav-progress-height-md', value: '8px', description: 'ارتفاع progress bar', category: 'component', preview: 'spacing' },
  { name: 'progress-bg', cssVar: '--taav-progress-bg', value: 'theme', description: 'پس‌زمینه progress bar', category: 'component', preview: 'color', themeAware: true },
  { name: 'progress-fill-brand', cssVar: '--taav-progress-fill-brand', value: 'theme', description: 'رنگ fill progress brand', category: 'color', preview: 'color', themeAware: true },
];

export const TAAV_TOKEN_SECTIONS: Array<{ id: string; title: string; titleFa: string; categories: TokenCategory[] }> = [
  { id: 'semantic', title: 'Semantic Colors', titleFa: 'رنگ‌های معنایی', categories: ['semantic', 'color'] },
  { id: 'typography', title: 'Typography', titleFa: 'تایپوگرافی', categories: ['typography'] },
  { id: 'spacing', title: 'Spacing', titleFa: 'فاصله‌گذاری', categories: ['spacing'] },
  { id: 'radius', title: 'Radius', titleFa: 'شعاع', categories: ['radius'] },
  { id: 'shadow', title: 'Shadow', titleFa: 'سایه', categories: ['shadow'] },
  { id: 'focus', title: 'Focus Ring', titleFa: 'حلقه فوکوس', categories: ['focus'] },
  { id: 'motion', title: 'Motion', titleFa: 'حرکت', categories: ['motion'] },
  { id: 'component', title: 'Component Sizing', titleFa: 'اندازه کامپوننت', categories: ['component'] },
];
