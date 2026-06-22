import { BookOpen, CheckCircle2, Layers, LibraryBig, ShieldCheck } from 'lucide-react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const REFERENCE_SYSTEMS = [
  {
    name: 'IBM Carbon',
    goodFor: 'Token discipline, accessibility, and data-heavy enterprise UI.',
    learn: 'Govern components through tokens, states, and documented usage rules.',
    avoid: 'Carbon branding and desktop-first assumptions that do not fit Persian ERP flows.',
  },
  {
    name: 'Ant Design',
    goodFor: 'Broad admin patterns, forms, tables, and practical React ergonomics.',
    learn: 'Document enterprise patterns across forms, filters, and data views as a system.',
    avoid: 'Visual identity, API sprawl, and LTR-first assumptions.',
  },
  {
    name: 'SAP Fiori / Fundamental',
    goodFor: 'ERP workflows, object pages, list reports, and operational structure.',
    learn: 'Treat list reports, object details, and review flows as first-class TaavUI patterns.',
    avoid: 'SAP vocabulary, heavyweight workflow assumptions, and copied structure.',
  },
  {
    name: 'Fluent UI',
    goodFor: 'Productivity flows, accessibility, panels, and command surfaces.',
    learn: 'Build clear action hierarchy, keyboard support, and consistent secondary panels.',
    avoid: 'Microsoft visual branding and desktop-product metaphors that do not fit ERP tasks.',
  },
  {
    name: 'Atlassian',
    goodFor: 'Workflow clarity, progress, status communication, and product governance.',
    learn: 'Make operational state, review, and collaboration signals explicit and reusable.',
    avoid: 'Jira-shaped UX assumptions and visual identity.',
  },
  {
    name: 'GOV.UK',
    goodFor: 'Clear forms, helper text, validation, and accessible service writing.',
    learn: 'Keep helper/error hierarchy plain, stable, and trustworthy in complex forms.',
    avoid: 'Government service visual language and public-service simplifications.',
  },
];

const PRINCIPLES = [
  'RTL-first and Persian-enterprise readable.',
  'Token-first styling with controlled variants.',
  'No arbitrary app-local styling on shared components.',
  'Business logic stays outside UI primitives.',
  'Business components stay data-driven and compositional.',
  'Accessibility and keyboard navigation are default requirements.',
  'Loading, empty, and error states are part of the API contract.',
  'Long forms and dense ERP screens must remain stable and readable.',
  'Dark and light themes are supported at the system level.',
  'Migration stays gradual, never a big-bang rewrite.',
];

const LAYERS = [
  { title: 'Tokens', description: 'Color, spacing, typography, motion, and semantic system variables.' },
  { title: 'Primitives', description: 'Low-level visual building blocks such as buttons, badges, cards, and hints.' },
  { title: 'Forms', description: 'Field composition rules, labels, helper text, and repeatable form layout.' },
  { title: 'Form Controls', description: 'Inputs, selects, switches, chips, and selectable business controls.' },
  { title: 'Overlays', description: 'Dialog, drawer, dropdown, and popover interaction surfaces.' },
  { title: 'Navigation', description: 'Tabs, steppers, side navigation structures, and orientation patterns.' },
  { title: 'Data Display', description: 'Table shell, filter bar, status, key-value, empty, loading, and pagination.' },
  { title: 'Layout Patterns', description: 'Page shells, headers, sections, side panels, summaries, and sticky actions.' },
  { title: 'Business Components', description: 'Shared business-facing assemblies such as TaavBusinessSidebar.' },
  { title: 'App Composition', description: 'Final route-aware assembly inside DastRanj and VahedYek only.' },
];

const CHECKLIST = [
  'این الگو در کدام لایه قرار می‌گیرد؟',
  'آیا بین DastRanj و VahedYek قابل استفاده‌ی مجدد است؟',
  'آیا همین حالا در TaavUI راه‌حل موجودی داریم؟',
  'کدام سیستم مرجع همین الگو را خوب حل کرده است؟',
  'variant / size / tone / density / state های لازم چیست؟',
  'حالت‌های loading / disabled / error / empty چگونه‌اند؟',
  'رفتار accessibility و keyboard navigation چیست؟',
  'نیازهای RTL و متن/عدد فارسی چیست؟',
  'چه token جدیدی لازم است؟',
  'برای TaavUI Lab چه صفحه یا مثال مستندی لازم است؟',
  'چه چیزهایی عمداً نباید وارد این کامپوننت شوند؟',
];

export default function PrinciplesPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Foundation' },
        { label: 'اصول' },
      ]}
    >
      <DocPageHeader
        eyebrow="Foundation"
        title="اصول و لایه مرجع TaavUI"
        description="TaavUI برای این ساخته می‌شود که رابط‌های ERP فارسی را از حالت صفحه‌به‌صفحه و سلیقه‌ای خارج کند و به یک سیستم مشترک، مستند و قابل‌حکمرانی تبدیل کند."
        importCode={`See: packages/ui/TAAVUI_REFERENCES.md`}
      />

      <section className="lab-principles-hero">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <TaavCard variant="soft" padding="lg" radius="xl">
            <div className="grid gap-3">
              <TaavBadge tone="brand" variant="soft" iconStart={<BookOpen className="h-3.5 w-3.5" />}>
                Why TaavUI Exists
              </TaavBadge>
              <h2 className="m-0 text-[length:var(--taav-text-2xl)] font-black text-[var(--taav-text-strong)]">
                زبان مشترک DastRanj و VahedYek
              </h2>
              <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                TaavUI یک design system داخلی برای ERP/SaaS فارسی و RTL است تا فرم‌ها، جدول‌ها، ناوبری، وضعیت‌ها و
                الگوهای business به‌صورت تکرارپذیر، خوانا و قابل‌نگهداری ساخته شوند.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="lab-principle-chip">
                  <ShieldCheck className="h-4 w-4" />
                  <span>جلوگیری از UI محلی و تکراری داخل اپ‌ها</span>
                </div>
                <div className="lab-principle-chip">
                  <Layers className="h-4 w-4" />
                  <span>استانداردسازی فرم، داده، ناوبری و workflow</span>
                </div>
                <div className="lab-principle-chip">
                  <LibraryBig className="h-4 w-4" />
                  <span>ساخت لایه مرجع برای تصمیم‌های بعدی</span>
                </div>
                <div className="lab-principle-chip">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>مهاجرت تدریجی بدون تغییر business logic اپ‌ها</span>
                </div>
              </div>
            </div>
          </TaavCard>

          <TaavCard variant="outlined" padding="lg" radius="xl">
            <div className="grid gap-3">
              <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-subtle)]">
                Scope Guardrails
              </span>
              <ul className="m-0 grid list-none gap-2 p-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                <li>• بدون migration برای DastRanj یا VahedYek</li>
                <li>• بدون تغییر business logic یا backend calls</li>
                <li>• بدون جایگزینی TaavUI با design system آماده</li>
                <li>• تمرکز روی اصول، مستندسازی و governance</li>
              </ul>
            </div>
          </TaavCard>
        </div>
      </section>

      <DocSection title="سیستم‌های مرجع" description="یادگیری مفهومی از سیستم‌های بالغ enterprise بدون کپی کد یا هویت بصری">
        <div className="grid gap-4 xl:grid-cols-2">
          {REFERENCE_SYSTEMS.map((system) => (
            <TaavCard key={system.name} variant="outlined" padding="md" radius="lg">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    {system.name}
                  </h3>
                  <TaavBadge tone="neutral" variant="subtle" size="sm">
                    Reference
                  </TaavBadge>
                </div>
                <div className="grid gap-2 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                  <p className="m-0">
                    <strong className="text-[var(--taav-text-strong)]">قوت:</strong> {system.goodFor}
                  </p>
                  <p className="m-0">
                    <strong className="text-[var(--taav-text-strong)]">یادگیری برای TaavUI:</strong> {system.learn}
                  </p>
                  <p className="m-0">
                    <strong className="text-[var(--taav-text-strong)]">نباید کپی شود:</strong> {system.avoid}
                  </p>
                </div>
              </div>
            </TaavCard>
          ))}
        </div>
      </DocSection>

      <DocSection title="اصول TaavUI" description="قوانینی که باید قبل از ساخت هر component یا pattern در نظر گرفته شوند">
        <div className="grid gap-3 md:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <div key={item} className="lab-principle-row">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--taav-brand-strong)]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="لایه‌های کامپوننتی" description="هر جزء جدید باید جایگاه خودش را در این سلسله‌مراتب روشن کند">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LAYERS.map((layer, index) => (
            <TaavCard key={layer.title} variant="soft" padding="md" radius="lg">
              <div className="grid gap-2">
                <span className="text-[length:var(--taav-text-2xs)] font-bold text-[var(--taav-text-subtle)]">
                  Layer {index + 1}
                </span>
                <h3 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                  {layer.title}
                </h3>
                <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                  {layer.description}
                </p>
              </div>
            </TaavCard>
          ))}
        </div>
      </DocSection>

      <DocSection title="چک‌لیست ساخت کامپوننت" description="هر component جدید باید قبل از ورود به TaavUI از این فیلتر عبور کند">
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <ol className="m-0 grid gap-3 pr-5 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
            {CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </TaavCard>
      </DocSection>
    </DocPageShell>
  );
}
