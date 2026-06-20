import { TaavSkeleton } from '@repo/ui/taav/data-display';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { SKELETON_PROPS } from '@/lib/docs/component-props';

export default function SkeletonDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'اسکلت' }]}>
      <DocPageHeader eyebrow="Loading" title="TaavSkeleton" description="Placeholder استاندارد برای list/card/table." importCode={`import { TaavSkeleton } from "@repo/ui/taav/data-display";`} />
      <DocSection title="Variants">
        <DocPreview label="Light/dark safe">
          <div className="grid max-w-md gap-4">
            <TaavSkeleton variant="title" />
            <TaavSkeleton variant="text" lines={3} />
            <TaavSkeleton variant="row" count={3} />
            <TaavSkeleton variant="avatar" />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={SKELETON_PROPS} /></DocSection>
    </DocPageShell>
  );
}
