import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_FORM_NAV } from '@/lib/navigation';

export default function FormsOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms' }]}>
      <DocPageHeader
        eyebrow="Forms · Phase 2"
        title="فرم‌های TaavUI"
        description="Text fields، form controls و field composition — بدون React Hook Form / Zod / DatePicker."
        importCode={`import { TaavSelect, TaavCheckbox, TaavFormField } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {LAB_FORM_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <TaavCard variant="outlined" padding="md" radius="lg" interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black">{item.label}</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    مستندات کامل + props table
                  </p>
                </div>
                {item.badge ? (
                  <TaavBadge tone="brand" variant="soft" size="sm">
                    {item.badge}
                  </TaavBadge>
                ) : null}
              </div>
            </TaavCard>
          </Link>
        ))}
      </div>
      <TaavCard variant="soft" padding="md" radius="lg">
        <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          همچنین export شده: <code className="lab-code">TaavLabel</code>,{' '}
          <code className="lab-code">TaavRequiredMark</code>, <code className="lab-code">TaavFormMessage</code>,{' '}
          <code className="lab-code">TaavFormDescription</code>, <code className="lab-code">TaavRadioGroup</code>
        </p>
      </TaavCard>
    </DocPageShell>
  );
}
