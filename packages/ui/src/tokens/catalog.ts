export type TokenCategory =
  | 'color'
  | 'semantic'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'focus'
  | 'motion'
  | 'component'
  | 'business-sidebar'
  | 'module-card'
  | 'business-intro-card'
  | 'activation-switch'
  | 'details-link'
  | 'recommendation-card';

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
  { name: 'field-block-gap-md', cssVar: '--taav-field-block-gap-md', value: '12px', description: 'فاصله عمودی پیش‌فرض TaavFieldBlock', category: 'spacing', preview: 'spacing' },
  { name: 'field-block-label-md', cssVar: '--taav-field-block-label-md', value: '14px', description: 'تایپوگرافی label business form', category: 'typography', preview: 'text' },
  { name: 'field-block-support-md', cssVar: '--taav-field-block-support-md', value: '13px', description: 'تایپوگرافی متن راهنمای ثابت زیر فیلد', category: 'typography', preview: 'text' },
  { name: 'field-block-support-color', cssVar: '--taav-field-block-support-color', value: 'theme', description: 'رنگ متن راهنمای ثابت فیلد', category: 'color', preview: 'color', themeAware: true },
  { name: 'field-block-error-color', cssVar: '--taav-field-block-error-color', value: 'theme', description: 'رنگ پیام خطا در business field block', category: 'color', preview: 'color', themeAware: true },
  { name: 'field-grid-gap-md', cssVar: '--taav-field-grid-gap-md', value: '16px', description: 'گتر افقی پیش‌فرض TaavFieldGrid', category: 'spacing', preview: 'spacing' },
  { name: 'field-grid-responsive-gap', cssVar: '--taav-field-grid-responsive-gap', value: '16px', description: 'فاصله ریسپانسیو business forms', category: 'spacing', preview: 'spacing' },
  { name: 'choice-chip-height-md', cssVar: '--taav-choice-chip-height-md', value: '40px', description: 'ارتفاع پیش‌فرض TaavChoiceChip', category: 'component', preview: 'spacing' },
  { name: 'choice-chip-px-md', cssVar: '--taav-choice-chip-px-md', value: '16px', description: 'پدینگ افقی TaavChoiceChip', category: 'component', preview: 'spacing' },
  { name: 'choice-chip-radius-pill', cssVar: '--taav-choice-chip-radius-pill', value: '9999px', description: 'شعاع pill برای TaavChoiceChip', category: 'radius', preview: 'radius' },
  { name: 'choice-chip-bg', cssVar: '--taav-choice-chip-bg', value: 'theme', description: 'پس‌زمینه حالت عادی choice chip', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-border', cssVar: '--taav-choice-chip-border', value: 'theme', description: 'مرز حالت عادی choice chip', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-text', cssVar: '--taav-choice-chip-text', value: 'theme', description: 'رنگ متن حالت عادی choice chip', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-gap', cssVar: '--taav-choice-chip-gap', value: '8px', description: 'فاصله بین آیکن تیک و متن داخل choice chip', category: 'spacing', preview: 'spacing' },
  { name: 'choice-chip-selected-bg', cssVar: '--taav-choice-chip-selected-bg', value: '#ccfbf1', description: 'پس‌زمینه انتخاب‌شده choice chip', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-selected-border', cssVar: '--taav-choice-chip-selected-border', value: 'transparent', description: 'مرز حالت انتخاب‌شده choice chip', category: 'color', preview: 'color' },
  { name: 'choice-chip-selected-text', cssVar: '--taav-choice-chip-selected-text', value: 'theme', description: 'رنگ متن انتخاب‌شده choice chip', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-selected-icon', cssVar: '--taav-choice-chip-selected-icon', value: 'theme', description: 'رنگ آیکن تیک انتخاب‌شده', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-hover-bg', cssVar: '--taav-choice-chip-hover-bg', value: 'theme', description: 'پس‌زمینه hover حالت عادی choice chip', category: 'color', preview: 'color', themeAware: true },
  { name: 'choice-chip-focus-ring', cssVar: '--taav-choice-chip-focus-ring', value: 'brand ring', description: 'حلقه فوکوس TaavChoiceChip', category: 'focus', preview: 'none', themeAware: true },
  { name: 'choice-chip-group-gap-md', cssVar: '--taav-choice-chip-group-gap-md', value: '12px', description: 'فاصله بین choice chipها در گروه', category: 'spacing', preview: 'spacing' },
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

  /* Business sidebar tokens */
  { name: 'business-sidebar-width-default', cssVar: '--taav-business-sidebar-width-default', value: '192px', description: 'عرض سایدبار کسب‌وکار (DastRanj)', category: 'business-sidebar', preview: 'spacing' },
  { name: 'business-sidebar-width-collapsed', cssVar: '--taav-business-sidebar-width-collapsed', value: '52px', description: 'عرض سایدبار جمع‌شده', category: 'business-sidebar', preview: 'spacing' },
  { name: 'business-sidebar-bg', cssVar: '--taav-business-sidebar-bg', value: 'rgba navy', description: 'پس‌زمینه سایدبار enterprise', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-border', cssVar: '--taav-business-sidebar-border', value: 'rgba line', description: 'مرز سایدبار', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-text', cssVar: '--taav-business-sidebar-text', value: '#eef6ff', description: 'متن اصلی سایدبار', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-text-muted', cssVar: '--taav-business-sidebar-text-muted', value: '#97adc7', description: 'متن muted منو', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-icon', cssVar: '--taav-business-sidebar-icon', value: '#14b8a6', description: 'رنگ آیکون toolbar', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-active-bg', cssVar: '--taav-business-sidebar-active-bg', value: 'teal tint', description: 'پس‌زمینه آیتم فعال', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-toolbar-bg', cssVar: '--taav-business-sidebar-toolbar-bg', value: 'teal tint', description: 'پس‌زمینه نوار میانبر', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-menu-item-height', cssVar: '--taav-business-sidebar-menu-item-height', value: '32px', description: 'ارتفاع آیتم منو', category: 'business-sidebar', preview: 'spacing' },
  { name: 'business-sidebar-tenant-active-bg', cssVar: '--taav-business-sidebar-tenant-active-bg', value: 'gradient', description: 'پس‌زمینه پنل tenant فعال', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-tenant-btn-bg', cssVar: '--taav-business-sidebar-tenant-btn-bg', value: 'gradient', description: 'دکمه tenant', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-footer-bg', cssVar: '--taav-business-sidebar-footer-bg', value: 'teal tint', description: 'پس‌زمینه footer نسخه', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-badge-bg', cssVar: '--taav-business-sidebar-badge-bg', value: '#ef4444', description: 'نشان اعلان قرمز', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-scroll-thumb', cssVar: '--taav-business-sidebar-scroll-thumb', value: 'rgba subtle', description: 'رنگ thumb scrollbar منو', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-scroll-thumb-hover', cssVar: '--taav-business-sidebar-scroll-thumb-hover', value: 'rgba subtle', description: 'hover thumb scrollbar منو', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-header-back-bg', cssVar: '--taav-business-sidebar-header-back-bg', value: 'teal tint', description: 'پس‌زمینه دکمه بازگشت هدر مسیر', category: 'business-sidebar', preview: 'color', themeAware: true },
  { name: 'business-sidebar-header-text', cssVar: '--taav-business-sidebar-header-text', value: 'theme', description: 'متن برچسب مسیر در هدر', category: 'business-sidebar', preview: 'color', themeAware: true },
  { name: 'business-nav-path-bg', cssVar: '--taav-business-nav-path-bg', value: '#f4f7f8', description: 'پس‌زمینه breadcrumb کنار سایدبار', category: 'business-sidebar', preview: 'color', themeAware: true },
  { name: 'business-nav-path-text-current', cssVar: '--taav-business-nav-path-text-current', value: 'theme', description: 'متن صفحه فعلی در breadcrumb', category: 'business-sidebar', preview: 'color', themeAware: true },
  { name: 'business-sidebar-preview-bg', cssVar: '--taav-business-sidebar-preview-bg', value: '#0a1018', description: 'پس‌زمینه mock viewport در Lab', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-preview-border', cssVar: '--taav-business-sidebar-preview-border', value: 'rgba line', description: 'مرز mock viewport در Lab', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-collapsed-item-height', cssVar: '--taav-business-sidebar-collapsed-item-height', value: '36px', description: 'ارتفاع آیتم منو در collapsed', category: 'business-sidebar', preview: 'spacing' },
  { name: 'business-sidebar-collapsed-icon-size', cssVar: '--taav-business-sidebar-collapsed-icon-size', value: '14px', description: 'اندازه آیکون collapsed', category: 'business-sidebar', preview: 'spacing' },
  { name: 'business-sidebar-collapsed-active-bg', cssVar: '--taav-business-sidebar-collapsed-active-bg', value: 'teal tint', description: 'پس‌زمینه آیتم فعال collapsed', category: 'business-sidebar', preview: 'color' },
  { name: 'business-sidebar-collapsed-tenant-strip-height', cssVar: '--taav-business-sidebar-collapsed-tenant-strip-height', value: '36px', description: 'ارتفاع نوار tenant در collapsed', category: 'business-sidebar', preview: 'spacing' },
  { name: 'scroll-minimal-size', cssVar: '--taav-scroll-minimal-size', value: '3px', description: 'عرض scrollbar مینیمال', category: 'business-sidebar', preview: 'spacing' },
  { name: 'scroll-minimal-thumb', cssVar: '--taav-scroll-minimal-thumb', value: 'rgba low', description: 'thumb scrollbar مینیمال', category: 'business-sidebar', preview: 'color' },
  { name: 'scroll-minimal-thumb-hover', cssVar: '--taav-scroll-minimal-thumb-hover', value: 'rgba hover', description: 'hover thumb scrollbar مینیمال', category: 'business-sidebar', preview: 'color' },
  { name: 'scroll-thumb', cssVar: '--taav-scroll-thumb', value: 'rgba subtle', description: 'thumb عمومی taav-scrollarea', category: 'component', preview: 'color' },
  { name: 'module-card-surface', cssVar: '--taav-module-card-surface', value: 'theme', description: 'سطح کارت ماژول ERP', category: 'module-card', preview: 'color', themeAware: true },
  { name: 'module-card-border', cssVar: '--taav-module-card-border', value: 'theme', description: 'مرز کارت ماژول', category: 'module-card', preview: 'color', themeAware: true },
  { name: 'module-card-radius', cssVar: '--taav-module-card-radius', value: 'var(--taav-radius-lg)', description: 'شعاع گوشه کارت ماژول', category: 'module-card', preview: 'radius' },
  { name: 'module-card-shadow', cssVar: '--taav-module-card-shadow', value: 'theme', description: 'سایه پیش‌فرض کارت ماژول', category: 'module-card', preview: 'shadow', themeAware: true },
  { name: 'module-card-shadow-hover', cssVar: '--taav-module-card-shadow-hover', value: 'theme', description: 'سایه hover کارت ماژول', category: 'module-card', preview: 'shadow', themeAware: true },
  { name: 'module-card-header-height', cssVar: '--taav-module-card-header-height', value: '52px', description: 'ارتفاع هدر الگویی کارت ماژول', category: 'module-card', preview: 'spacing' },
  { name: 'module-card-header-pattern-geometric', cssVar: '--taav-module-card-header-pattern-geometric', value: 'gradient', description: 'الگوی هندسی هدر (light/dark)', category: 'module-card', preview: 'color', themeAware: true },
  { name: 'module-card-title-md', cssVar: '--taav-module-card-title-md', value: 'var(--taav-text-md)', description: 'تایپوگرافی عنوان کارت ماژول', category: 'module-card', preview: 'text' },
  { name: 'module-card-description-md', cssVar: '--taav-module-card-description-md', value: 'var(--taav-text-sm)', description: 'تایپوگرافی توضیح کارت ماژول', category: 'module-card', preview: 'text' },
  { name: 'module-card-body-padding-md', cssVar: '--taav-module-card-body-padding-md', value: '18px 18px 20px', description: 'padding بدنه کارت ماژول', category: 'module-card', preview: 'spacing' },
  { name: 'module-card-surface-hover', cssVar: '--taav-module-card-surface-hover', value: 'theme', description: 'پس‌زمینه hover کارت ماژول', category: 'module-card', preview: 'color', themeAware: true },
  { name: 'module-card-surface-selected', cssVar: '--taav-module-card-surface-selected', value: 'theme', description: 'پس‌زمینه انتخاب‌شده کارت ماژول', category: 'module-card', preview: 'color', themeAware: true },
  { name: 'module-card-disabled-opacity', cssVar: '--taav-module-card-disabled-opacity', value: '0.58', description: 'شفافیت حالت disabled/locked', category: 'module-card', preview: 'none' },
  { name: 'module-card-grid-gap-md', cssVar: '--taav-module-card-grid-gap-md', value: 'var(--taav-space-4)', description: 'فاصله پیش‌فرض گرید کارت ماژول', category: 'module-card', preview: 'spacing' },
  { name: 'module-card-preview-bg-dark', cssVar: '--taav-module-card-preview-bg-dark', value: '#0a1018', description: 'پس‌زمینه mock تیره در Lab', category: 'module-card', preview: 'color' },
  { name: 'module-card-preview-bg-light', cssVar: '--taav-module-card-preview-bg-light', value: '#f2f5f7', description: 'پس‌زمینه mock روشن در Lab', category: 'module-card', preview: 'color' },
  { name: 'business-intro-card-surface', cssVar: '--taav-business-intro-card-surface', value: 'theme', description: 'سطح کارت معرفی بخش بیزینسی', category: 'business-intro-card', preview: 'color', themeAware: true },
  { name: 'business-intro-card-border', cssVar: '--taav-business-intro-card-border', value: 'theme', description: 'مرز کارت معرفی بخش', category: 'business-intro-card', preview: 'color', themeAware: true },
  { name: 'business-intro-card-radius', cssVar: '--taav-business-intro-card-radius', value: 'var(--taav-radius-xl)', description: 'شعاع گوشه کارت معرفی', category: 'business-intro-card', preview: 'radius' },
  { name: 'business-intro-card-padding-md', cssVar: '--taav-business-intro-card-padding-md', value: '18px 20px', description: 'padding پیش‌فرض کارت معرفی', category: 'business-intro-card', preview: 'spacing' },
  { name: 'business-intro-card-title-md', cssVar: '--taav-business-intro-card-title-md', value: 'var(--taav-text-lg)', description: 'تایپوگرافی عنوان کارت معرفی', category: 'business-intro-card', preview: 'text' },
  { name: 'business-intro-card-description-md', cssVar: '--taav-business-intro-card-description-md', value: 'var(--taav-text-sm)', description: 'تایپوگرافی توضیح کارت معرفی', category: 'business-intro-card', preview: 'text' },
  { name: 'business-intro-card-icon-bg', cssVar: '--taav-business-intro-card-icon-bg', value: 'teal tint', description: 'پس‌زمینه آیکون کارت معرفی', category: 'business-intro-card', preview: 'color', themeAware: true },
  { name: 'business-intro-card-icon-color', cssVar: '--taav-business-intro-card-icon-color', value: 'brand strong', description: 'رنگ آیکون کارت معرفی', category: 'business-intro-card', preview: 'color', themeAware: true },
  { name: 'business-intro-card-action-color', cssVar: '--taav-business-intro-card-action-color', value: 'theme', description: 'رنگ اکشن برگشت/ورود', category: 'business-intro-card', preview: 'color', themeAware: true },
  { name: 'business-intro-card-action-hover-bg', cssVar: '--taav-business-intro-card-action-hover-bg', value: 'theme', description: 'پس‌زمینه hover اکشن', category: 'business-intro-card', preview: 'color', themeAware: true },
  { name: 'business-intro-card-max-width-normal', cssVar: '--taav-business-intro-card-max-width-normal', value: '720px', description: 'عرض محدود پیش‌فرض کارت معرفی', category: 'business-intro-card', preview: 'spacing' },
  { name: 'business-intro-card-preview-bg-dark', cssVar: '--taav-business-intro-card-preview-bg-dark', value: '#0a1018', description: 'پس‌زمینه mock تیره در Lab', category: 'business-intro-card', preview: 'color' },
  { name: 'activation-switch-active-bg', cssVar: '--taav-activation-switch-active-bg', value: '#14b8a6', description: 'پس‌زمینه سگمنت فعال', category: 'activation-switch', preview: 'color', themeAware: true },
  { name: 'activation-switch-inactive-bg', cssVar: '--taav-activation-switch-inactive-bg', value: 'gray', description: 'پس‌زمینه سگمنت غیرفعال', category: 'activation-switch', preview: 'color', themeAware: true },
  { name: 'details-link-text', cssVar: '--taav-details-link-text', value: 'muted gray', description: 'متن لینک جزئیات', category: 'details-link', preview: 'color', themeAware: true },
  { name: 'recommendation-card-surface', cssVar: '--taav-recommendation-card-surface', value: 'theme', description: 'سطح کارت پیشنهاد تنظیمات', category: 'recommendation-card', preview: 'color', themeAware: true },
  { name: 'recommendation-card-border', cssVar: '--taav-recommendation-card-border', value: 'theme', description: 'مرز کارت پیشنهاد', category: 'recommendation-card', preview: 'color', themeAware: true },
  { name: 'recommendation-card-max-width-wide', cssVar: '--taav-recommendation-card-max-width-wide', value: '1040px', description: 'عرض wide کارت پیشنهاد', category: 'recommendation-card', preview: 'spacing' },
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
  { id: 'business-sidebar', title: 'Business Sidebar', titleFa: 'سایدبار کسب‌وکار', categories: ['business-sidebar'] },
  { id: 'module-card', title: 'Module Card', titleFa: 'کارت ماژول ERP', categories: ['module-card'] },
  { id: 'business-intro-card', title: 'Business Intro Card', titleFa: 'کارت معرفی بخش', categories: ['business-intro-card'] },
  { id: 'activation-switch', title: 'Activation Switch', titleFa: 'سوییچ فعال‌سازی', categories: ['activation-switch'] },
  { id: 'details-link', title: 'Details Link', titleFa: 'لینک جزئیات', categories: ['details-link'] },
  { id: 'recommendation-card', title: 'Recommendation Card', titleFa: 'کارت پیشنهاد تنظیمات', categories: ['recommendation-card'] },
];
