import type { BusinessSettingsHintStatus } from '../contractSettingsReference';

/** Mid-flow «سازگار کردن با تنظیمات» is only actionable when draft differs from settings. */
export function canAlignWithSettings(status: BusinessSettingsHintStatus | null | undefined): boolean {
  return status === 'different' || status === 'info';
}

/** Prefer different > info > equal > missing when aggregating card/section statuses. */
export function aggregateAlignmentStatuses(
  statuses: Array<BusinessSettingsHintStatus | null | undefined>,
): BusinessSettingsHintStatus | null {
  const list = statuses.filter((status): status is BusinessSettingsHintStatus => Boolean(status));
  if (!list.length) return null;
  if (list.some((status) => status === 'different')) return 'different';
  if (list.some((status) => status === 'info')) return 'info';
  if (list.some((status) => status === 'equal')) return 'equal';
  if (list.some((status) => status === 'missing')) return 'missing';
  return list[0] ?? null;
}
