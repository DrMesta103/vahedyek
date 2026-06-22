'use client';

import {
  TaavModuleCard,
  TaavModuleCardGrid,
  TaavModuleCardGridItem,
  type TaavModuleCardStatus,
} from '@repo/ui/taav/business';
import { useRouter } from 'next/navigation';
import type { BusinessSettingsCategory, BusinessSettingsItem } from '../../../lib/business-settings';
import type { TenantSetupHealth } from '../../../lib/setup-health';

const STATUS_BADGE_BY_ROUTE = {
  '/locations': 'workplace',
  '/calendars': 'calendar',
  '/policies': 'work_policy',
  '/employees': 'employees',
  '/work-groups': 'work_groups',
} as const;

export function formatCategoryCardDescription(items: BusinessSettingsItem[]) {
  return items.map((item) => item.title).join('، ');
}

function resolveItemEyebrow(item: BusinessSettingsItem) {
  const priorityBadge = item.badges?.find((badge) => badge.tone === 'critical' || badge.tone === 'important');
  return priorityBadge?.label;
}

function resolveItemModuleCardStatus(
  item: BusinessSettingsItem,
  criticalStatusMap: Map<string, string>,
): TaavModuleCardStatus {
  if (item.comingSoon) return 'locked';

  const statusKey = STATUS_BADGE_BY_ROUTE[item.href as keyof typeof STATUS_BADGE_BY_ROUTE];
  const setupStatus = statusKey ? criticalStatusMap.get(statusKey) : null;

  if (setupStatus === 'completed') return 'complete';
  if (setupStatus === 'incomplete') return 'incomplete';

  return 'default';
}

function resolveItemDescription(item: BusinessSettingsItem, status: TaavModuleCardStatus) {
  if (status === 'incomplete') {
    return `( تکمیل نشده ) ${item.description}`;
  }

  return item.description;
}

type BusinessSettingsCategoryCardsProps = {
  categories: BusinessSettingsCategory[];
  onCategorySelect: (categoryId: BusinessSettingsCategory['id']) => void;
};

export function BusinessSettingsCategoryCards({ categories, onCategorySelect }: BusinessSettingsCategoryCardsProps) {
  return (
    <TaavModuleCardGrid columns={2} gap="md" className="business-settings-module-grid">
      {categories.map((category) => (
        <TaavModuleCardGridItem key={category.id}>
          <TaavModuleCard
            title={category.title}
            description={formatCategoryCardDescription(category.items)}
            themeMode="auto"
            width="full"
            onClick={() => onCategorySelect(category.id)}
          />
        </TaavModuleCardGridItem>
      ))}
    </TaavModuleCardGrid>
  );
}

type BusinessSettingsItemCardsProps = {
  items: BusinessSettingsItem[];
  setupHealth: TenantSetupHealth | null;
};

export function BusinessSettingsItemCards({ items, setupHealth }: BusinessSettingsItemCardsProps) {
  const router = useRouter();
  const criticalStatusMap = new Map(setupHealth?.criticalItems.map((item) => [item.key, item.status]) ?? []);

  return (
    <TaavModuleCardGrid columns={2} gap="md" className="business-settings-module-grid">
      {items.map((item) => {
        const status = resolveItemModuleCardStatus(item, criticalStatusMap);
        const description = resolveItemDescription(item, status);
        const eyebrow = resolveItemEyebrow(item);
        const isInteractive = !item.comingSoon;

        return (
          <TaavModuleCardGridItem key={`${item.href}-${item.icon}-${item.title}`}>
            <TaavModuleCard
              title={item.title}
              description={description}
              eyebrow={eyebrow}
              status={status}
              themeMode="auto"
              width="full"
              onClick={isInteractive ? () => router.push(item.href) : undefined}
            />
          </TaavModuleCardGridItem>
        );
      })}
    </TaavModuleCardGrid>
  );
}
