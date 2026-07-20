import Link from 'next/link';
import {
  ChevronLeft,
  Code2,
  Database,
  FileText,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  getBuildVersionStepCountLabel,
  type BuildVersionSection,
  type BuildVersionSectionIcon,
  type BuildVersionStep,
} from '@/app/lib/taavia-build-version-flow';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';

const SECTION_ICONS: Record<BuildVersionSectionIcon, LucideIcon> = {
  code: Code2,
  refresh: RefreshCw,
  signal: Radio,
  file: FileText,
  database: Database,
  shieldAlert: ShieldAlert,
  shieldCheck: ShieldCheck,
};

type BuildVersionStepRowProps = {
  businessId: string;
  step: BuildVersionStep;
};

function BuildVersionStepRow({ businessId, step }: BuildVersionStepRowProps) {
  const href = `/businesses/${businessId}/products/taavia/technical-flows/build-version/${step.slug}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[var(--taav-radius-lg)] border border-transparent px-2.5 py-2.5 transition hover:border-[var(--taav-border-subtle)] hover:bg-[var(--taav-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)]"
    >
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--taav-brand-soft)] text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-brand-strong)]">
        {step.number}
      </span>
      <span className="min-w-0 flex-1 text-[length:var(--taav-text-sm)] font-semibold leading-6 text-[var(--taav-text-strong)]">
        {step.title}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-muted)] transition group-hover:text-[var(--taav-text-strong)]">
        <span className="hidden sm:inline">مشاهده جزئیات</span>
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </Link>
  );
}

type BuildVersionSectionCardProps = {
  businessId: string;
  section: BuildVersionSection;
};

export function BuildVersionSectionCard({ businessId, section }: BuildVersionSectionCardProps) {
  const Icon = SECTION_ICONS[section.icon];

  return (
    <TaavCard
      variant="outlined"
      padding="md"
      radius="xl"
      wrapperClassName="h-full"
      contentClassName="grid content-start gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">
            <Icon className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <div className="grid min-w-0 gap-1">
            <h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">
              {section.title}
            </h2>
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-6 text-[var(--taav-text-muted)]">
              {section.subtitle}
            </p>
          </div>
        </div>
        <TaavBadge tone="success" variant="soft" size="sm">
          {getBuildVersionStepCountLabel(section.steps.length)}
        </TaavBadge>
      </div>

      <div className="grid gap-1">
        {section.steps.map((step) => (
          <BuildVersionStepRow key={step.slug} businessId={businessId} step={step} />
        ))}
      </div>
    </TaavCard>
  );
}
