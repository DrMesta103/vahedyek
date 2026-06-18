import { TaavBadge } from '@repo/ui/taav/primitives';
import { DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ROADMAP_STAGES, ROADMAP_STATUS_LABEL } from '@/lib/roadmap';

export default function RoadmapPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'نقشه راه' }]}>
      <DocPageHeader
        eyebrow="Roadmap"
        title="نقشه راه TaavUI"
        description="برنامه مرحله‌ای توسعه سیستم طراحی. مهاجرت اپ‌ها در فاز Migration Pilot شروع می‌شود."
        importCode={`// فعلاً بدون import — این صفحه وضعیت پروژه را نشان می‌دهد`}
      />

      <DocSection title="مراحل" description="وضعیت فعلی هر لایه">
        <div className="grid gap-4">
          {ROADMAP_STAGES.map((stage) => (
            <article key={stage.id} className="lab-roadmap-item">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    {stage.titleFa}
                  </h3>
                  <p className="m-0 mt-1 text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-subtle)]">
                    {stage.title}
                  </p>
                </div>
                <span
                  className={`lab-status-pill ${stage.status === 'done' ? 'is-done' : stage.status === 'in_progress' ? 'is-progress' : 'is-planned'}`}
                >
                  {ROADMAP_STATUS_LABEL[stage.status]}
                </span>
              </div>
              <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                {stage.description}
              </p>
              <ul className="m-0 grid list-none gap-2 p-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                {stage.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <TaavBadge tone="neutral" variant="subtle" size="sm">
                      •
                    </TaavBadge>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </DocSection>
    </DocPageShell>
  );
}
