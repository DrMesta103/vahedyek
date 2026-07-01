import type { Tenant } from './types/domain';

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

export function formatRelativeActivityLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'بدون فعالیت';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMinutes < 60) {
    return `${new Intl.NumberFormat('fa-IR').format(diffMinutes)} دقیقه پیش`;
  }

  if (diffHours < 24) {
    return `${new Intl.NumberFormat('fa-IR').format(diffHours)} ساعت پیش`;
  }

  return `${new Intl.NumberFormat('fa-IR').format(diffDays)} روز پیش`;
}

export function formatPackageLabel(packageKey?: string | null, billingCycle?: 'monthly' | 'yearly' | null) {
  const packageLabels: Record<string, string> = {
    starter: 'استارتر',
    growth: 'رشد',
    scale: 'اسکیل',
    enterprise: 'سازمانی',
  };

  const packageLabel = packageKey ? packageLabels[packageKey] ?? packageKey : 'بدون بسته';
  const cycleLabel = billingCycle === 'monthly' ? 'ماهانه' : billingCycle === 'yearly' ? 'سالانه' : null;

  return cycleLabel ? `${packageLabel} · ${cycleLabel}` : packageLabel;
}

export function formatTokenRatioLabel(usedTokens: number, tokenLimit: number) {
  if (!tokenLimit) return '۰٪ مصرف';
  const ratio = Math.max(0, Math.min(1, usedTokens / tokenLimit));
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(ratio * 100)}٪ مصرف`;
}
