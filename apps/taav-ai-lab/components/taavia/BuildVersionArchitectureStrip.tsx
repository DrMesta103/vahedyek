import {
  Activity,
  ArrowRight,
  Bot,
  CircleCheck,
  Code2,
  Database,
  Monitor,
  Network,
  type LucideIcon,
} from 'lucide-react';
import type { BuildVersionArchitectureIcon } from '@/app/lib/taavia-build-version-flow';
import { BUILD_VERSION_ARCHITECTURE } from '@/app/lib/taavia-build-version-flow';

const ARCHITECTURE_ICONS: Record<BuildVersionArchitectureIcon, LucideIcon> = {
  monitor: Monitor,
  code: Code2,
  database: Database,
  network: Network,
  bot: Bot,
  radio: Activity,
  check: CircleCheck,
};

export function BuildVersionArchitectureStrip() {
  return (
    <div className="overflow-x-auto rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-3.5 sm:p-4">
      <div dir="ltr" className="flex min-w-max items-stretch gap-2 sm:gap-2.5">
        {BUILD_VERSION_ARCHITECTURE.map((item, index) => {
          const Icon = ARCHITECTURE_ICONS[item.icon];
          const isLast = index === BUILD_VERSION_ARCHITECTURE.length - 1;

          return (
            <div key={item.id} className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex min-w-[7.5rem] flex-col items-center gap-2 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-3 py-3 text-center sm:min-w-[8.5rem]">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </span>
                <span className="text-[length:var(--taav-text-xs)] font-semibold leading-5 text-[var(--taav-text-strong)]">
                  {item.label}
                </span>
              </div>
              {!isLast ? (
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[var(--taav-text-subtle)]"
                  strokeWidth={1.8}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
