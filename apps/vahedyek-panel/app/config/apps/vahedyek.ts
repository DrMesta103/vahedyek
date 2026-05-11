export type AppPermission = {
  key: string;
  label: string;
  group: string;
};

export type AppMenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  requiredPermission?: string;
  disabled?: boolean;
  toolbarOnly?: boolean;
};

export type AppModule = {
  id: string;
  label: string;
  routePrefix: string;
  requiredPermission?: string;
};

export type AppThemeConfig = {
  primary: string;
  accent: string;
  radius: string;
};

export type AppConfig = {
  appId: string;
  appName: string;
  theme: AppThemeConfig;
  permissions: AppPermission[];
  menuItems: AppMenuItem[];
  modules: AppModule[];
};

export const currentAppConfig: AppConfig = {
  appId: 'vahedyek',
  appName: 'واحد یک',
  theme: {
    primary: '#008080',
    accent: '#fb923c',
    radius: '18px',
  },
  permissions: [
    { key: 'platform.settings.view', label: 'مشاهده تنظیمات کلی', group: 'platform' },
    { key: 'platform.settings.manageAccess', label: 'مدیریت نقش‌ها و دسترسی‌ها', group: 'platform' },
    { key: 'platform.users.view', label: 'مشاهده کاربران', group: 'platform' },
    { key: 'platform.users.create', label: 'ساخت کاربر', group: 'platform' },
    { key: 'platform.users.update', label: 'ویرایش کاربر', group: 'platform' },
    { key: 'platform.users.delete', label: 'حذف کاربر', group: 'platform' },
    { key: 'platform.reports.view', label: 'مشاهده گزارش‌های مدیریتی', group: 'platform' },
    { key: 'business.profile.view', label: 'مشاهده تنظیمات کسب‌وکار', group: 'business' },
    { key: 'business.profile.update', label: 'ویرایش تنظیمات کسب‌وکار', group: 'business' },
    { key: 'complex.view', label: 'مشاهده مجتمع', group: 'complex' },
    { key: 'complex.manage', label: 'مدیریت مجتمع', group: 'complex' },
    { key: 'contracts.view', label: 'مشاهده قراردادها', group: 'contracts' },
    { key: 'contracts.create', label: 'ساخت قرارداد', group: 'contracts' },
    { key: 'contracts.update', label: 'ویرایش قرارداد', group: 'contracts' },
    { key: 'contracts.delete', label: 'حذف قرارداد', group: 'contracts' },
    { key: 'contracts.sign', label: 'امضای قرارداد', group: 'contracts' },
    { key: 'contracts.export', label: 'خروجی قرارداد', group: 'contracts' },
    
    // Customer Portal Permissions
    { key: 'customer.portal.access', label: 'دسترسی به پنل خریدار', group: 'customer' },
    { key: 'customer.contracts.view', label: 'مشاهده قراردادهای خود', group: 'customer' },
    { key: 'customer.contracts.details', label: 'مشاهده جزئیات قرارداد', group: 'customer' },
    { key: 'customer.financial.view', label: 'مشاهده اطلاعات مالی', group: 'customer' },
    { key: 'customer.payments.view', label: 'مشاهده پرداخت‌ها', group: 'customer' },
    { key: 'customer.payments.submit', label: 'ثبت فیش پرداختی', group: 'customer' },
    { key: 'customer.documents.view', label: 'مشاهده اسناد و مدارک', group: 'customer' },
    { key: 'customer.support.view', label: 'مشاهده تیکت‌های پشتیبانی', group: 'customer' },
    { key: 'customer.support.create', label: 'ایجاد تیکت پشتیبانی', group: 'customer' },
    { key: 'customer.profile.view', label: 'مشاهده پروفایل', group: 'customer' },
    { key: 'customer.profile.update', label: 'ویرایش پروفایل', group: 'customer' },
  ],
  menuItems: [
    {
      id: 'business',
      label: 'تنظیمات کسب و کار',
      icon: 'fa-briefcase',
      href: '/business-settings',
      requiredPermission: 'business.profile.view',
    },
    {
      id: 'complex',
      label: 'جزئیات مجتمع',
      icon: 'fa-building',
      href: '/business-settings/project/blocks',
      requiredPermission: 'complex.view',
    },
    {
      id: 'units',
      label: 'فهرست واحدها',
      icon: 'fa-list-ul',
      href: '#',
      requiredPermission: 'complex.view',
      disabled: true,
    },
    {
      id: 'contracts',
      label: 'فهرست قراردادها',
      icon: 'fa-file-invoice',
      href: '/contracts',
      requiredPermission: 'contracts.view',
    },
    {
      id: 'buyers',
      label: 'خریداران',
      icon: 'fa-shopping-cart',
      href: '/business-settings/profile/buyers',
      requiredPermission: 'business.profile.view',
    },
    {
      id: 'draft-templates',
      label: 'قالب‌های پیش‌نویس',
      icon: 'fa-copy',
      href: '/draft-templates',
      requiredPermission: 'contracts.create',
      disabled: true,
    },
    {
      id: 'payments',
      label: 'واریزی مشتریان',
      icon: 'fa-wallet',
      href: '#',
      requiredPermission: 'contracts.view',
      disabled: true,
    },
    {
      id: 'reports',
      label: 'گزارش‌های مدیریتی',
      icon: 'fa-chart-line',
      href: '#',
      requiredPermission: 'platform.reports.view',
      disabled: true,
    },
    {
      id: 'employees',
      label: 'کارمندان',
      icon: 'fa-users',
      href: '/employees',
      requiredPermission: 'platform.users.view',
    },
    {
      id: 'account',
      label: 'حساب کاربری',
      icon: 'fa-user-circle',
      href: '#',
      disabled: true,
    },
    {
      id: 'settings',
      label: 'تنظیمات کلی',
      icon: 'fa-cog',
      href: '/settings',
      requiredPermission: 'platform.settings.view',
      toolbarOnly: true,
    },
    // Customer Portal Menu Items (4 گزینه اصلی)
    {
      id: 'customer-contracts',
      label: 'قراردادهای من',
      icon: 'fa-file-contract',
      href: '/customer-portal/contracts',
      requiredPermission: 'customer.contracts.view',
    },
    {
      id: 'customer-payment-methods',
      label: 'روش‌های پرداخت بدهی',
      icon: 'fa-credit-card',
      href: '/customer-portal/payment-methods',
      requiredPermission: 'customer.payments.view',
    },
    {
      id: 'customer-due-dates',
      label: 'سررسیدهای من',
      icon: 'fa-calendar-check',
      href: '/customer-portal/due-dates',
      requiredPermission: 'customer.payments.view',
    },
    {
      id: 'customer-account',
      label: 'حساب کاربری',
      icon: 'fa-user-circle',
      href: '/customer-portal/account',
      requiredPermission: 'customer.profile.view',
    },
  ],
  modules: [
    { id: 'business', label: 'تنظیمات کسب و کار', routePrefix: '/business-settings', requiredPermission: 'business.profile.view' },
    { id: 'complex', label: 'مجتمع', routePrefix: '/complex', requiredPermission: 'complex.view' },
    { id: 'contracts', label: 'قراردادها', routePrefix: '/contracts', requiredPermission: 'contracts.view' },
    { id: 'settings', label: 'تنظیمات کلی', routePrefix: '/settings', requiredPermission: 'platform.settings.view' },
    { id: 'customer-portal', label: 'پنل خریدار', routePrefix: '/customer-portal', requiredPermission: 'customer.portal.access' },
  ],
};
