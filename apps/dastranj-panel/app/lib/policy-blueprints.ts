export type PolicyBlueprintKey = 'office' | 'restaurant' | 'retail' | 'custom';

export type PolicyBlueprint = {
  key: PolicyBlueprintKey;
  title: string;
  description: string;
  application: string;
};

/** Metadata only: saved rules remain independent in WorkPolicy.sectionValues. */
export const POLICY_BLUEPRINTS: readonly PolicyBlueprint[] = [
  { key: 'office', title: 'سیاست کاری اداری', description: 'ساعات کاری منظم و استاندارد', application: 'اداری' },
  { key: 'restaurant', title: 'سیاست کاری رستورانی', description: 'مدل کاری شیفتی و خدماتی', application: 'رستورانی' },
  { key: 'retail', title: 'سیاست کاری فروشگاهی', description: 'محیط کاری با شیفت‌های منعطف', application: 'فروشگاهی' },
  { key: 'custom', title: 'سیاست سفارشی', description: 'تعریف قواعد پایه توسط مدیر', application: 'سفارشی' },
];

export function isPolicyBlueprintKey(value: unknown): value is PolicyBlueprintKey {
  return POLICY_BLUEPRINTS.some((item) => item.key === value);
}

export function getPolicyBlueprint(key: unknown) {
  return POLICY_BLUEPRINTS.find((item) => item.key === key) ?? null;
}
