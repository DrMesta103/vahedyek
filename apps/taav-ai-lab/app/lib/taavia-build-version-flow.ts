export const BUILD_VERSION_FLOW_META = {
  slug: 'build-version',
  title: 'Build و Version',
  description: 'مرور کامل ۲۰ مرحله فلو Build اولیه، Progress، Result، Version و Activation',
  statusLabel: 'فعال',
  productLabel: 'محصول تاویا',
} as const;

export const BUILD_VERSION_SUMMARY_CHIPS = [
  { id: 'steps', label: '۲۰ مرحله', icon: 'list' },
  { id: 'sections', label: '۶ بخش', icon: 'grid' },
  { id: 'audience', label: 'مناسب PO و Developer', icon: 'users' },
] as const;

export type BuildVersionSummaryChipIcon = (typeof BUILD_VERSION_SUMMARY_CHIPS)[number]['icon'];

export const BUILD_VERSION_ARCHITECTURE = [
  { id: 'frontend', label: 'Frontend', icon: 'monitor' },
  { id: 'dotnet', label: '.NET API', icon: 'code' },
  { id: 'sql-outbox', label: 'SQL Server / Outbox', icon: 'database' },
  { id: 'rabbitmq', label: 'RabbitMQ', icon: 'network' },
  { id: 'python-worker', label: 'Python / Worker', icon: 'bot' },
  { id: 'grpc-result', label: 'gRPC Result', icon: 'radio' },
  { id: 'import-activation', label: 'Import / Activation', icon: 'check' },
] as const;

export type BuildVersionArchitectureIcon = (typeof BUILD_VERSION_ARCHITECTURE)[number]['icon'];

export type BuildVersionSectionIcon =
  | 'code'
  | 'refresh'
  | 'signal'
  | 'file'
  | 'database'
  | 'shieldAlert'
  | 'shieldCheck';

export type BuildVersionStep = {
  number: number;
  slug: string;
  title: string;
};

export type BuildVersionSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: BuildVersionSectionIcon;
  steps: BuildVersionStep[];
};

export const BUILD_VERSION_SECTIONS: BuildVersionSection[] = [
  {
    id: 'start-build',
    title: '۱. شروع Build و انتشار (.NET)',
    subtitle: 'ثبت Build اولیه و انتشار Event از Outbox',
    icon: 'code',
    steps: [
      { number: 1, slug: 'start-build-from-frontend', title: 'شروع Build اولیه از Frontend' },
      { number: 2, slug: 'create-build-and-outbox', title: 'انتشار درخواست Build از Outbox به RabbitMQ' },
    ],
  },
  {
    id: 'python-job-progress',
    title: '۲. دریافت Job و Progress (Python)',
    subtitle: 'ثبت Inbox / Job، شروع Attempt و انتشار Progress',
    icon: 'refresh',
    steps: [
      { number: 3, slug: 'receive-event-and-create-inbox-job', title: 'دریافت Event در Python و ثبت Inbox / Job' },
      { number: 4, slug: 'start-worker-pool-and-attempt', title: 'برداشتن Job توسط Worker Pool و شروع Attempt' },
      { number: 5, slug: 'publish-python-outbox-to-rabbitmq', title: 'انتشار Event از Python Outbox به RabbitMQ' },
    ],
  },
  {
    id: 'frontend-status',
    title: '۳. وضعیت و ارتباط با Frontend',
    subtitle: 'دریافت Progress، SignalR و بازیابی REST',
    icon: 'signal',
    steps: [
      { number: 6, slug: 'receive-progress-in-dotnet', title: 'دریافت Progress در .NET' },
      { number: 7, slug: 'send-status-to-flutter-with-signalr', title: 'ارسال وضعیت به Flutter با SignalR' },
      { number: 8, slug: 'get-latest-build-status-with-rest', title: 'بازیابی آخرین وضعیت Build با REST' },
    ],
  },
  {
    id: 'sources-processing',
    title: '۴. منابع و پردازش Python',
    subtitle: 'دریافت Sources، Media و پردازش محتوا',
    icon: 'database',
    steps: [
      { number: 9, slug: 'receive-brand-sources', title: 'دریافت Sources از .NET با gRPC' },
      { number: 10, slug: 'get-temporary-media-link', title: 'دریافت لینک موقت Media و دانلود از MinIO' },
      { number: 11, slug: 'start-processing-and-send-progress', title: 'پردازش Sources و محاسبه Progress' },
    ],
  },
  {
    id: 'result-import',
    title: '۵. Result، Import و Version',
    subtitle: 'تولید نتیجه، Import و فعال‌سازی نسخه',
    icon: 'file',
    steps: [
      { number: 12, slug: 'generate-knowledge-base', title: 'تولید Knowledge Base در Python' },
      { number: 13, slug: 'persist-result-in-postgres', title: 'ذخیره Result پایدار در PostgreSQL' },
      { number: 14, slug: 'result-ready-from-python', title: 'اعلام ResultReady از Python' },
      { number: 15, slug: 'receive-result-ready-and-schedule-import', title: 'دریافت ResultReady در .NET و زمان‌بندی Import' },
      { number: 16, slug: 'get-result-from-python-grpc', title: 'دریافت Result از Python با gRPC' },
      { number: 17, slug: 'import-and-validation', title: 'Staging و Validation نتیجه در SQL Server' },
      { number: 18, slug: 'activate-first-version', title: 'Commit نهایی و فعال‌سازی Version اول' },
    ],
  },
  {
    id: 'completion-failure',
    title: '۶. Completion و Failure',
    subtitle: 'اقدامات پس از موفقیت و مدیریت خطا',
    icon: 'shieldCheck',
    steps: [
      { number: 19, slug: 'post-completion-actions', title: 'اقدامات پس از Completion' },
      { number: 20, slug: 'build-failure-retry-recovery', title: 'Failure، Retry، Recovery و Cleanup' },
    ],
  },
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

export function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function getBuildVersionStepCountLabel(count: number): string {
  return `${toPersianDigits(count)} مرحله`;
}

export function getAllBuildVersionSteps(): BuildVersionStep[] {
  return BUILD_VERSION_SECTIONS.flatMap((section) => section.steps);
}

export function getBuildVersionStepBySlug(slug: string): BuildVersionStep | null {
  return getAllBuildVersionSteps().find((step) => step.slug === slug) ?? null;
}

export function getBuildVersionSectionForStep(slug: string): BuildVersionSection | null {
  return BUILD_VERSION_SECTIONS.find((section) => section.steps.some((step) => step.slug === slug)) ?? null;
}
