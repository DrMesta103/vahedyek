'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import {
  TaavDropdown,
  TaavDropdownContent,
  TaavDropdownItem,
  TaavDropdownLabel,
  TaavDropdownSeparator,
  TaavDropdownTrigger,
} from '@repo/ui/taav/overlays';
import {
  DocApiNote,
  DocDoDont,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { DROPDOWN_PROPS } from '@/lib/docs/component-props';

export default function DropdownDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Overlays', href: '/overlays' }, { label: 'منو' }]}>
      <DocPageHeader
        eyebrow="Overlay Primitive"
        title="TaavDropdown"
        description="منوی action — row actions، page actions، danger items."
        importCode={`import { TaavDropdown, TaavDropdownItem } from "@repo/ui/taav/overlays";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavDropdown>
            <TaavDropdownTrigger asChild>
              <TaavButton variant="outline" tone="neutral">
                عملیات
              </TaavButton>
            </TaavDropdownTrigger>
            <TaavDropdownContent align="start">
              <TaavDropdownLabel>اقدامات ردیف</TaavDropdownLabel>
              <TaavDropdownItem iconStart={<Pencil className="h-4 w-4" />} shortcut="⌘E">
                ویرایش
              </TaavDropdownItem>
              <TaavDropdownItem iconStart={<Copy className="h-4 w-4" />}>کپی</TaavDropdownItem>
              <TaavDropdownSeparator />
              <TaavDropdownItem tone="danger" iconStart={<Trash2 className="h-4 w-4" />} description="غیرقابل بازگشت">
                حذف
              </TaavDropdownItem>
            </TaavDropdownContent>
          </TaavDropdown>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={DROPDOWN_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Item height md', value: 'var(--taav-dropdown-item-height-md)' },
            { label: 'Hover', value: 'var(--taav-dropdown-item-hover)' },
            { label: 'Min width', value: 'var(--taav-dropdown-min-width)' },
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای action list از TaavDropdown استفاده کنید']} dontItems={['منوی absolute دستی در DastRanj نسازید']} />
      </DocSection>
    </DocPageShell>
  );
}
