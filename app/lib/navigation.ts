export type AppMenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  disabled?: boolean;
};

export const APP_MENU_ITEMS: AppMenuItem[] = [
  { id: 'business', label: 'جزئیات کسب و کار', icon: 'fa-briefcase', href: '#', disabled: true },
  { id: 'complex', label: 'جزئیات مجتمع', icon: 'fa-building', href: '/complex' },
  { id: 'units', label: 'فهرست واحد ها', icon: 'fa-list-ul', href: '#', disabled: true },
  { id: 'contracts', label: 'فهرست قرارداد ها', icon: 'fa-file-invoice', href: '/contracts' },
  { id: 'draft-templates', label: 'قالب های پیش نویس', icon: 'fa-copy', href: '/draft-templates', disabled: true },
  { id: 'payments', label: 'واریزی مشتریان', icon: 'fa-wallet', href: '#', disabled: true },
  { id: 'reports', label: 'گزارش های مدیریتی', icon: 'fa-chart-line', href: '#', disabled: true },
  { id: 'employees', label: 'کارمندان', icon: 'fa-users', href: '#', disabled: true },
  { id: 'account', label: 'حساب کاربری', icon: 'fa-user-circle', href: '#', disabled: true },
];
