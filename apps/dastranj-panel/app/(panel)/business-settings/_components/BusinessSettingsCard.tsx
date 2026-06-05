import Link from 'next/link';
import {
  Building2,
  Calculator,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Clock3,
  Construction,
  CreditCard,
  FileCode2,
  FileText,
  LockKeyhole,
  MapPin,
  Network,
  Shield,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { BusinessSettingsBadgeTone, BusinessSettingsIcon } from '../../../lib/business-settings';

const ICONS: Record<BusinessSettingsIcon, LucideIcon> = {
  profile: Building2,
  subscription: CreditCard,
  location: MapPin,
  calendar: CalendarDays,
  shift: Clock3,
  draft: FileText,
  naming: FileCode2,
  payroll: Calculator,
  policy: Shield,
  request: ClipboardList,
  'work-group': UsersRound,
  employee: Users,
  'org-unit': Network,
};

export type BusinessSettingsCardProps = {
  title: string;
  description: string;
  href: string;
  icon: BusinessSettingsIcon;
  comingSoon?: boolean;
  badges?: Array<{ label: string; tone?: BusinessSettingsBadgeTone; tooltip?: string }>;
};

function badgeClass(tone: BusinessSettingsBadgeTone = 'info') {
  if (tone === 'critical') {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-300 [html[data-theme=light]_&]:border-rose-400/40 [html[data-theme=light]_&]:bg-rose-50 [html[data-theme=light]_&]:text-rose-700';
  }
  if (tone === 'important') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300 [html[data-theme=light]_&]:border-amber-400/40 [html[data-theme=light]_&]:bg-amber-50 [html[data-theme=light]_&]:text-amber-700';
  }
  if (tone === 'success') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 [html[data-theme=light]_&]:border-emerald-400/40 [html[data-theme=light]_&]:bg-emerald-50 [html[data-theme=light]_&]:text-emerald-700';
  }
  if (tone === 'warning') {
    return 'border-violet-500/30 bg-violet-500/10 text-violet-300 [html[data-theme=light]_&]:border-violet-400/40 [html[data-theme=light]_&]:bg-violet-50 [html[data-theme=light]_&]:text-violet-700';
  }
  if (tone === 'muted') {
    return 'border-white/10 bg-white/[0.05] text-slate-300 [html[data-theme=light]_&]:border-slate-300 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:text-slate-700';
  }
  return 'border-sky-500/30 bg-sky-500/10 text-sky-300 [html[data-theme=light]_&]:border-sky-400/40 [html[data-theme=light]_&]:bg-sky-50 [html[data-theme=light]_&]:text-sky-700';
}

export function BusinessSettingsCard({ title, description, href, icon, comingSoon, badges = [] }: BusinessSettingsCardProps) {
  const Icon = ICONS[icon];

  return (
    <Link
      href={href}
      className={`group flex min-h-[58px] w-full cursor-pointer flex-row items-center gap-3 rounded-[18px] border border-white/10 px-4 py-3 text-inherit no-underline shadow-[0_8px_22px_rgba(2,6,23,0.2)] transition hover:-translate-y-px hover:border-teal-500/35 hover:bg-slate-900/80 hover:shadow-[0_12px_28px_rgba(2,6,23,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/60 [html[data-theme=light]_&]:border-slate-200/90 [html[data-theme=light]_&]:shadow-[0_6px_18px_rgba(15,23,42,0.05)] [html[data-theme=light]_&]:hover:bg-white [html[data-theme=light]_&]:hover:border-teal-600/30 ${comingSoon ? 'bg-slate-900/35 [html[data-theme=light]_&]:bg-white/80' : 'bg-slate-900/55 [html[data-theme=light]_&]:bg-white'}`}
    >
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border text-slate-300 transition group-hover:border-teal-500/25 group-hover:text-teal-200 ${comingSoon ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' : 'border-white/10 bg-white/[0.04]'}`}
        aria-hidden
      >
        {comingSoon ? <LockKeyhole className="h-4 w-4" strokeWidth={2.2} /> : <Icon className="h-4 w-4" strokeWidth={2.2} />}
      </span>

      <div className="min-w-0 flex-1 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className={`m-0 text-[13px] font-extrabold leading-snug ${comingSoon ? 'text-white/85 [html[data-theme=light]_&]:text-slate-700' : 'text-white [html[data-theme=light]_&]:text-slate-900'}`}>
            {title}
          </h2>
          {comingSoon ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 [html[data-theme=light]_&]:border-amber-400/40 [html[data-theme=light]_&]:bg-amber-50 [html[data-theme=light]_&]:text-amber-600">
              <Construction className="h-2.5 w-2.5" strokeWidth={2.5} />
              در حال توسعه
            </span>
          ) : null}
          {badges.map((badge) => (
            <span key={`${title}-${badge.label}`} className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeClass(badge.tone)}`} title={badge.tooltip}>
              {badge.label}
            </span>
          ))}
        </div>
        <p className={`m-0 mt-1 text-[11px] font-medium leading-6 ${comingSoon ? 'text-slate-500 [html[data-theme=light]_&]:text-slate-500' : 'text-slate-400 [html[data-theme=light]_&]:text-slate-500'}`}>
          {description}
        </p>
      </div>

      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-teal-400" aria-hidden />
    </Link>
  );
}
