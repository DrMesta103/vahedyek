export const TAAVIA_TECHNICAL_FLOW_GROUPS = [
  {
    slug: 'build-version',
    title: 'Build و Version',
    description: 'مدیریت Build اولیه، Progress، Result و نسخه‌سازی',
    icon: 'code',
  },
  {
    slug: 'rebuild',
    title: 'Rebuild',
    description: 'Rebuild روی نسخه فعال و ساخت نسخه جدید',
    icon: 'refresh',
  },
  {
    slug: 'sources',
    title: 'Sourceها',
    description: 'مدیریت Brand Info، Product، FAQ و Needs Rebuild',
    icon: 'database',
  },
  {
    slug: 'manual-knowledge-base',
    title: 'ویرایش دستی Knowledge Base',
    description: 'ایجاد، ویرایش، حذف و جابه‌جایی Nodeها',
    icon: 'network',
  },
  {
    slug: 'versions',
    title: 'Versionها',
    description: 'فعال‌سازی، Rollback، Preview و حذف نسخه‌های غیرفعال',
    icon: 'history',
  },
  {
    slug: 'python-contracts',
    title: 'Python و قراردادها',
    description: 'Inbox، Job و Result، Event Contracts، gRPC Contracts و Retry',
    icon: 'cloud',
  },
] as const;

export type TaaviaTechnicalFlowSlug = (typeof TAAVIA_TECHNICAL_FLOW_GROUPS)[number]['slug'];
export type TaaviaTechnicalFlowIcon = (typeof TAAVIA_TECHNICAL_FLOW_GROUPS)[number]['icon'];

export function getTaaviaTechnicalFlowBySlug(slug: string) {
  return TAAVIA_TECHNICAL_FLOW_GROUPS.find((flow) => flow.slug === slug) ?? null;
}
