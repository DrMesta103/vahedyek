'use client';

import { DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ProjectStructureCardShowcase } from '@/components/lab/ProjectStructureCardShowcase';

const PROPS = [
  { name: 'token', type: '"floor" | "unit"', description: 'توکن تصویری طبقه یا واحد، ساخته‌شده بر پایه‌ی کارت بلوک' },
  { name: 'usageTypes', type: 'Array<{ key; label }>', description: 'چیپ‌های نوع کاربری به‌صورت data-driven' },
  { name: 'activeUsageType', type: 'string', description: 'کلید چیپ فعال' },
  { name: 'progressReport', type: '{ title; description?; statusLabel?; status?; onClick? }', description: 'گزارش پیشرفت اختیاری' },
  { name: 'showMenu / onMenuClick', type: 'boolean / function', description: 'نمایش و کنترل منوی کارت' },
  { name: 'showNavigate / onNavigate', type: 'boolean / function', description: 'نمایش و کنترل فلش جزئیات' },
  { name: 'disabled / loading / className', type: 'boolean / boolean / string', description: 'حالت‌های عمومی کارت' },
];

export default function ProjectStructureCardPage() {
  return <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Business', href: '/business' }, { label: 'کارت بلوک، واحد' }]}>
    <DocPageHeader eyebrow="Business Components" title="کارت بلوک، واحد" description="کارت پایه‌ی بلوک به‌همراه توکن طبقه، با ساختار قابل توسعه و داده‌محور" importCode={'import { TaavProjectStructureCard } from "@repo/ui/taav/business";'} />
    <DocSection title="کارت بلوک">
      <ProjectStructureCardShowcase />
    </DocSection>
    <DocSection title="Props"><DocPropsTable rows={PROPS} /></DocSection>
  </DocPageShell>;
}
