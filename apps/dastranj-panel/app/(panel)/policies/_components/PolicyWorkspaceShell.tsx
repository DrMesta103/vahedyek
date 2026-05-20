import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import { POLICY_FAMILIES, type PolicyFamilyKey } from '../../../lib/policy-workspaces';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PolicyPageShell({
  title,
  subtitle,
  breadcrumb,
  banner,
  actionHref,
  actionLabel = 'ویرایش',
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumb: Array<{ label: string; href?: string }>;
  banner?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold text-slate-300">
        {breadcrumb.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {index < breadcrumb.length - 1 ? <ChevronLeft className="h-3.5 w-3.5 text-slate-500" /> : null}
          </span>
        ))}
      </nav>

      <header className="grid gap-2 text-right">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
            {subtitle ? <p className="max-w-3xl text-sm leading-7 text-slate-400">{subtitle}</p> : null}
          </div>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500"
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </header>

      {banner ? (
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/35 bg-indigo-500/8 px-4 py-3 text-right text-sm leading-7 text-slate-200">
          <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-100">
            <Info className="h-3.5 w-3.5" />
          </span>
          <p className="m-0">{banner}</p>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function PolicyFamilyNav({
  activeFamily,
}: {
  activeFamily?: PolicyFamilyKey;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {POLICY_FAMILIES.map((family) => {
        const active = activeFamily === family.key;
        return (
          <Link
            key={family.key}
            href={family.route}
            className={cn(
              'rounded-2xl border px-4 py-4 text-right transition-all',
              active
                ? 'border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/55',
            )}
          >
            <div className="flex h-full flex-col gap-2">
              <div className="text-sm font-extrabold text-white">{family.title}</div>
              <div className="text-xs leading-6 text-slate-400">{family.subtitle}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function PolicySectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.3)] sm:p-5">
      <div className="mb-4 grid gap-1 text-right">
        <h2 className="text-xl font-black text-white">{title}</h2>
        {description ? <p className="text-sm leading-7 text-slate-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function PolicyFieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="grid gap-1 text-right">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-100">
          {label}
          {required ? <span className="mr-1 text-rose-400">*</span> : null}
        </span>
      </div>
      {hint ? <p className="m-0 text-xs leading-6 text-slate-400">{hint}</p> : null}
    </div>
  );
}
