import { TaavCard } from '@repo/ui/taav/primitives';
import { DocCodeBlock, DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

export default function GettingStartedPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'شروع سریع' }]}>
      <DocPageHeader
        eyebrow="Consumption Contract"
        title="چگونه TaavUI را مصرف کنیم"
        description="قرارداد رسمی برای استفاده از TaavUI در اپ‌های DastRanj و VahedYek — بدون مهاجرت در این commit."
        importCode={`import { TaavInput, TaavFormField } from "@repo/ui/taav";`}
      />

      <DocSection title="۱. Import توکن‌های CSS (الزامی)">
        <TaavCard variant="outlined" padding="md" radius="lg">
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
            در <code className="lab-code">app/globals.css</code> (یا entry CSS لودشده از root layout):
          </p>
          <DocCodeBlock>{`@import "@repo/ui/taav-tokens.css";`}</DocCodeBlock>
        </TaavCard>
        <TaavCard variant="soft" padding="md" radius="lg">
          <strong className="text-[var(--taav-warning-strong)]">اگر import نکنید:</strong>
          <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            متغیرهای <code className="lab-code">--taav-*</code> تعریف نمی‌شوند و ارتفاع، رنگ، border و focus ring
            کامپوننت‌ها درست render نمی‌شوند.
          </p>
        </TaavCard>
      </DocSection>

      <DocSection title="۲. Import کامپوننت‌ها (توصیه‌شده)">
        <DocCodeBlock>{`import {
  TaavButton,
  TaavInput,
  TaavFormField,
} from "@repo/ui/taav";`}</DocCodeBlock>
        <p className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          در Next.js App Router از <code className="lab-code">@repo/ui/taav</code> استفاده کنید تا bundle کامل legacy
          (date picker، dev-doc و ...) وارد server component نشود.
        </p>
        <DocCodeBlock>{`// Server components — primitives only
import { TaavButton, TaavCard } from "@repo/ui/taav/primitives";

// Client form fields
import { TaavInput, TaavFormField } from "@repo/ui/taav/forms";

// Overlays & navigation (client)
import { TaavDialog } from "@repo/ui/taav/overlays";
import { TaavTabs } from "@repo/ui/taav/navigation";

// Data display (mostly server-safe; interactive: ChipGroup, Pagination, FilterBar)
import { TaavChip, TaavTableShell } from "@repo/ui/taav/data-display";`}</DocCodeBlock>
      </DocSection>

      <DocSection title="۳. Tailwind @source">
        <DocCodeBlock>{`@source "../../../packages/ui/src/**/*.{js,ts,jsx,tsx}";`}</DocCodeBlock>
      </DocSection>

      <DocSection title="۴. Legacy — برای کار TaavUI جدید استفاده نکنید">
        <ul className="grid gap-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          <li>• `Input`, `PersianDatePicker`, `formStyles`</li>
          <li>• کامپوننت‌های business/rule/contract</li>
          <li>• `DevDocThreadsBoard`</li>
        </ul>
        <p className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          این‌ها همچنان از `@repo/ui` export می‌شوند برای backward compatibility.
        </p>
      </DocSection>
    </DocPageShell>
  );
}
