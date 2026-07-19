'use client';

import { TaavProjectStructureCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ProjectStructureCardShowcase } from '@/components/lab/ProjectStructureCardShowcase';

const PROPS = [
  { name: 'variant', type: '"full" | "compact" | "usageOnly" | "report" | "minimal"', description: 'بخش‌های قابل نمایش کارت' },
  { name: 'tone', type: '"teal" | "gold" | "gray" | "custom"', description: 'توکن‌های رنگی کارت' },
  { name: 'entityType', type: '"block" | "floor" | "unit" | "plate" | "area" | "custom"', description: 'نوع موجودیت ساختار پروژه' },
  { name: 'usageTypes', type: 'Array<{ key; label; tone? }>', description: 'چیپ‌های نوع کاربری به‌صورت data-driven' },
  { name: 'activeUsageType', type: 'string', description: 'کلید چیپ فعال' },
  { name: 'progressReport', type: '{ title; description?; statusLabel?; status?; onClick? }', description: 'گزارش پیشرفت اختیاری' },
  { name: 'showMenu / onMenuClick', type: 'boolean / function', description: 'نمایش و کنترل منوی کارت' },
  { name: 'showNavigate / onNavigate', type: 'boolean / function', description: 'نمایش و کنترل فلش جزئیات' },
  { name: 'disabled / loading / className', type: 'boolean / boolean / string', description: 'حالت‌های عمومی کارت' },
];

export default function ProjectStructureCardPage() {
  return <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Business', href: '/business' }, { label: 'کارت ساختار پروژه' }]}>
    <DocPageHeader eyebrow="Business Components" title="کارت ساختار پروژه" description="نمایش کارت‌های بلوک، طبقه، پلاک، واحد و نوع کاربری با حالت‌های کامل، خلاصه، کاربری‌محور، گزارشی و مینیمال" importCode={'import { TaavProjectStructureCard } from "@repo/ui/taav/business";'} />
    <DocSection title="نمونه‌های کامپوننت">
      <ProjectStructureCardShowcase />
    </DocSection>
    <DocSection title="استفاده">
      <TaavProjectStructureCard variant="minimal" tone="gray" title="نمونه قابل توسعه" usageTypes={[{ key: 'one', label: 'نوع اول' }, { key: 'two', label: 'نوع دوم' }]} />
    </DocSection>
    <DocSection title="Props"><DocPropsTable rows={PROPS} /></DocSection>
  </DocPageShell>;
}
