import Link from 'next/link';
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  Network,
  Shield,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { BusinessSettingsIcon } from '../../../lib/business-settings';

const ICONS: Record<BusinessSettingsIcon, LucideIcon> = {
  profile: Building2,
  subscription: CreditCard,
  location: MapPin,
  calendar: CalendarDays,
  shift: Clock3,
  draft: FileText,
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
};

export function BusinessSettingsCard({ title, description, href, icon }: BusinessSettingsCardProps) {
  const Icon = ICONS[icon];

  return (
    <Link
      href={href}
      className="group flex w-full cursor-pointer flex-row items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/55 px-5 py-4 text-inherit no-underline shadow-[0_10px_28px_rgba(2,6,23,0.22)] transition hover:-translate-y-px hover:border-teal-500/35 hover:bg-slate-900/80 hover:shadow-[0_14px_32px_rgba(2,6,23,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/60 [html[data-theme=light]_&]:border-slate-200/90 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_8px_24px_rgba(15,23,42,0.06)] [html[data-theme=light]_&]:hover:bg-white [html[data-theme=light]_&]:hover:border-teal-600/30"
    >
      <span
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition group-hover:border-teal-500/25 group-hover:text-teal-200"
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <h2 className="m-0 text-[15px] font-extrabold leading-snug text-white [html[data-theme=light]_&]:text-slate-900">
          {title}
        </h2>
        <p className="m-0 mt-1.5 text-[13px] font-medium leading-7 text-slate-400 [html[data-theme=light]_&]:text-slate-500">
          {description}
        </p>
      </div>

      <ChevronLeft
        className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:text-teal-400"
        aria-hidden
      />
    </Link>
  );
}
