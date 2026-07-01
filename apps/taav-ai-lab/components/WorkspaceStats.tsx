import { Coins, FileSearch, History, Orbit } from 'lucide-react';
import { TaavCard } from '@repo/ui/taav/primitives';
import { formatActivityLabel, formatTokenCount } from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabSectionLabel } from '@/components/AiLabTooltip';

const statCards = (business: Tenant) => [
  {
    label: 'سقف توکن',
    tooltip: AI_LAB_TOOLTIPS.workspace.tokenLimit,
    value: formatTokenCount(business.tokenLimit),
    note: 'بودجه اختصاص‌یافته به تست‌های این tenant',
    icon: Coins,
  },
  {
    label: 'توکن مصرف‌شده',
    tooltip: AI_LAB_TOOLTIPS.workspace.usedTokens,
    value: formatTokenCount(business.usedTokens),
    note: 'فعلا مقدار شبیه‌ساز است تا جریان OCR پیاده شود',
    icon: Orbit,
  },
  {
    label: 'تعداد تست OCR',
    tooltip: AI_LAB_TOOLTIPS.workspace.ocrTests,
    value: String(business.ocrTestsCount),
    note: 'در مرحله بعد با تست‌های واقعی تکمیل می‌شود',
    icon: FileSearch,
  },
  {
    label: 'آخرین فعالیت',
    tooltip: AI_LAB_TOOLTIPS.workspace.lastActivity,
    value: formatActivityLabel(business.lastActivity),
    note: 'آخرین نقطه تماس این فضای کاری',
    icon: History,
  },
];

export function WorkspaceStats({ business }: { business: Tenant }) {
  return (
    <div className="ai-lab-stat-grid">
      {statCards(business).map((item) => {
        const Icon = item.icon;
        return (
          <TaavCard key={item.label} variant="soft" padding="md" radius="xl">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <AiLabSectionLabel label={item.label} tooltip={item.tooltip} />
                <Icon className="h-4 w-4 text-[var(--taav-brand-strong)]" />
              </div>
              <strong className="text-[length:var(--taav-text-lg)] text-[var(--taav-text-strong)]">{item.value}</strong>
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{item.note}</span>
            </div>
          </TaavCard>
        );
      })}
    </div>
  );
}
