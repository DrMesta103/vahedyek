import Link from 'next/link';
import {
  ArrowLeft,
  Cloud,
  Code2,
  Database,
  History,
  Network,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import type { TaaviaTechnicalFlowIcon } from '@/app/lib/taavia-technical-flows';

const FLOW_ICONS: Record<TaaviaTechnicalFlowIcon, LucideIcon> = {
  code: Code2,
  refresh: RefreshCw,
  database: Database,
  network: Network,
  history: History,
  cloud: Cloud,
};

type TechnicalFlowGroupCardProps = {
  href: string;
  title: string;
  description: string;
  icon: TaaviaTechnicalFlowIcon;
};

export function TechnicalFlowGroupCard({ href, title, description, icon }: TechnicalFlowGroupCardProps) {
  const Icon = FLOW_ICONS[icon];

  return (
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <TaavCard
        variant="outlined"
        padding="md"
        radius="xl"
        interactive
        wrapperClassName="h-full transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[var(--taav-brand)]"
      >
        <div className="grid h-full grid-rows-[auto_1fr_auto] gap-5">
          <div className="relative flex min-h-14 items-start justify-center pt-1">
            <div className="absolute start-0 top-0">
              <TaavBadge tone="brand" variant="soft">
                فعال
              </TaavBadge>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-text-strong)]">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </div>
          </div>

          <div className="grid gap-2 text-center">
            <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
              {title}
            </h2>
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              {description}
            </p>
          </div>

          <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border)] bg-[var(--taav-surface-subtle)] px-4 text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)] transition group-hover:border-[var(--taav-border-strong)] group-hover:bg-[var(--taav-surface-muted)]">
            <ArrowLeft className="h-4 w-4" />
            مشاهده
          </span>
        </div>
      </TaavCard>
    </Link>
  );
}
