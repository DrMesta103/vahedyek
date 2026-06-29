import type { Tenant } from './simulator-store';

export function formatTokenCount(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function businessInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function fallbackLogoLabel(tenant: Pick<Tenant, 'name'>) {
  return businessInitials(tenant.name) || 'AI';
}

export function formatActivityLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'بدون فعالیت';
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
