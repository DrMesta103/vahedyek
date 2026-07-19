import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const IMPORT_AND_VALIDATION_META: BuildVersionStepDocMeta = {
  slug: 'import-and-validation',
  title: '۱۷. Staging و Validation نتیجه در SQL Server',
  description:
    'Result دریافتی مستقیماً جداول اصلی Knowledge Base را تغییر نمی‌دهد. هر Attempt در Staging مستقل ذخیره می‌شود و فقط Attempt کامل و معتبر ReadyToCommit می‌شود.',
  status: 'فعال',
  pills: ['Staging', 'Validation', 'ReadyToCommit'],
};

export const IMPORT_AND_VALIDATION_OVERVIEW_STEPS = [
  'Attempt Loading',
  'Batch Insert Staging',
  'Validation @95%',
  'ReadyToCommit @97%',
] as const;

export const IMPORT_AND_VALIDATION_OVERVIEW_NOTE =
  'جداول اصلی Version/Node/Snapshot فقط بعد از Commit نهایی (سندهای بعدی) تغییر می‌کنند.';

export const IMPORT_AND_VALIDATION_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Result ابتدا در Staging مستقل per Attempt ذخیره می‌شود؛ نه در جداول زنده KB.',
      'فقط Attempt کامل و معتبر وارد Transaction نهایی می‌شود.',
    ],
    actionLabel: 'جداول اصلی بدون تغییر',
    detail: {
      type: 'bullet-list',
      title: 'جداول زنده که هنوز دست نمی‌خورند',
      description: 'تغییر این جداول در Commit نهایی (اسناد بعدی) است.',
      items: [
        'TaaviaKnowledgeBaseVersion',
        'TaaviaKnowledgeNode',
        'TaaviaKnowledgeSourceSnapshot',
        'TaaviaKnowledgeNodeReference',
        'TaaviaKnowledgeBaseVersionActivation',
      ],
    },
  },
  {
    id: 'import-attempt',
    order: 2,
    title: 'Import Attempt',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Entity: TaaviaKnowledgeBaseResultImportAttempt با Countها و CalculatedManifestHash.',
      'Status: Loading → Validating → ReadyToCommit | Failed؛ Failed دوباره فعال نمی‌شود.',
    ],
    actionLabel: 'دلیل Attempt مستقل',
    detail: {
      type: 'bullet-list',
      title: 'Attempt و وضعیت‌ها',
      description: 'اگر Stream قطع شود، Attempt ناقص می‌ماند و Attempt جدید مجموعه مستقل می‌سازد؛ داده‌ها ترکیب نمی‌شوند.',
      items: [
        'UNIQUE(ImportId, AttemptNumber)',
        'Loading: Stream در حال دریافت',
        'Validating: بعد از Completed',
        'ReadyToCommit: همه Validationها موفق',
        'Failed: Stream ناقص یا Result نامعتبر',
      ],
    },
  },
  {
    id: 'staging-source',
    order: 3,
    title: 'Staging Source',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'UNIQUE(Attempt, SourceType, SourceId)',
      'SourceData JSON معتبر',
      'SourceContentHash = SHA-256',
      'ProcessedContent غیرخالی',
    ],
    actionLabel: 'قواعد Source',
    detail: {
      type: 'kv-list',
      title: 'قواعد Staging Source',
      description: 'SourceData همان Canonical JSON است؛ .NET دوباره Serialize و ذخیره نمی‌کند.',
      items: [
        { label: 'Revision / Schema', value: '≥ 1 و پشتیبانی‌شده' },
        { label: 'SourceData', value: 'nvarchar(max) + ISJSON = 1' },
        { label: 'Hashes', value: 'SourceContentHash و ProcessedContentHash قابل بازمحاسبه' },
      ],
    },
  },
  {
    id: 'staging-node',
    order: 4,
    title: 'Staging Node و Title',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'UNIQUE(Attempt, ExternalId)',
      'Root: ParentExternalId = null',
      'Child: Parent = Root',
      'Filtered Unique NormalizedTitle',
    ],
    actionLabel: 'Index عنوان Sibling',
    detail: {
      type: 'kv-list',
      title: 'Node و Unique Title',
      description: 'NormalizedTitle فقط Validation/Index است و وارد Entity اصلی Node نمی‌شود.',
      items: [
        { label: 'Root title UX', value: '(Attempt, NormalizedTitle) WHERE Parent IS NULL' },
        { label: 'Child title UX', value: '(Attempt, ParentExternalId, NormalizedTitle) WHERE Parent NOT NULL' },
        { label: 'DisplayOrder', value: '≥ 1' },
      ],
    },
  },
  {
    id: 'staging-reference',
    order: 5,
    title: 'Staging Reference',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'هویت Contract: RootNodeExternalId + SourceType + SourceId.',
      'UNIQUE per Attempt؛ Mapping به PK نهایی هنگام Commit است نه FK Staging.',
    ],
    actionLabel: 'قواعد Reference Staging',
    detail: {
      type: 'bullet-list',
      title: 'Reference در Staging',
      description: 'به‌جای Foreign Key مستقیم، هویت بیزینسی نگهداری می‌شود.',
      items: [
        'UNIQUE(Attempt, RootExternalId, SourceType, SourceId)',
        'نگاشت RootExternalId → Staging Node و SourceType+Id → Staging Source در Commit',
      ],
    },
  },
  {
    id: 'stream-persist',
    order: 6,
    title: 'ذخیره Stream',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'کل Stream در یک TX طولانی نیست؛ Batch کوتاه ۱۰۰–۵۰۰ رکورد (Configurable).',
      'تکرار Source/Node/Ref در همان Attempt → Contract Violation؛ Attempt Failed؛ بدون Update جایگزین.',
    ],
    actionLabel: 'Idempotency داخل Attempt',
    detail: {
      type: 'bullet-list',
      title: 'Batch و Duplicate',
      description: 'SqlBulkCopy یا Bulk Insert کنترل‌شده برای حجم زیاد قابل استفاده است.',
      items: [
        'Insert Source / Node / Reference در Batchهای کوتاه',
        'Constraint یکتا مانع Duplicate است',
        'Duplicate در Stream → Attempt = Failed',
      ],
    },
  },
  {
    id: 'start-validation',
    order: 7,
    title: 'شروع Validation',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'دریافت Completed',
      'Attempt + Import = Validating',
      'Build.Stage = ValidatingResult',
      'Progress ≥ 95 + SignalR بعد از Commit',
    ],
    note: 'SignalR فقط بعد از Commit SQL Server ارسال می‌شود.',
  },
  {
    id: 'validation-metadata',
    order: 8,
    title: 'Validation Metadata و Counts',
    tag: 'بک',
    kind: 'checklist',
    items: [
      'ResultReady Event = Import Expected',
      'Stream Header = Stream Completed',
      'Count واقعی Staging برابر Expected',
      'ResultReferenceId / Schema / ManifestHash یکسان',
      'Root/Child/Total/UsedSource/Reference Counts',
    ],
  },
  {
    id: 'validation-structure',
    order: 9,
    title: 'Validation Source/Node/Structure',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Hashهای Source/Processed/Node بازمحاسبه می‌شوند؛ ساختار فقط Root→Child.',
      'DisplayOrder ریشه و فرزند هر Root متوالی ۱..N بدون فاصله/تکرار؛ اصلاح خاموش ممنوع.',
    ],
    actionLabel: 'جزئیات ساختار',
    detail: {
      type: 'bullet-list',
      title: 'قواعد Structure',
      description: 'Child→Child، Parent خودش، یا Cycle نامعتبر است.',
      items: [
        'Parent Child باید Root موجود در همان Attempt باشد',
        'Title/Content غیرخالی؛ ExternalId یکتا',
        'Normalization عنوان مطابق Contract مشترک Python/.NET',
      ],
    },
  },
  {
    id: 'refs-manifest',
    order: 10,
    title: 'References و ManifestHash',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'هر Root ≥1 Ref؛ هر Source ≥1 Ref؛ Child بدون Ref مستقیم؛ بدون تکراری.',
      'Manifest: خطوط S/N/R مرتب → SHA-256؛ برابر Expected/Header/Completed.',
    ],
    actionLabel: 'فرمت خطوط Manifest',
    detail: {
      type: 'bullet-list',
      title: 'الگوریتم Manifest (سند ۱۳)',
      description: 'خطوط با \\n و UTF-8 Hash می‌شوند؛ خروجی hex lowercase ۶۴ کاراکتر.',
      items: [
        'S|SourceType|SourceId|Revision|SourceContentHash|ProcessedContentHash',
        'N|ExternalId|ParentExternalId|DisplayOrder|ContentHash',
        'R|RootNodeExternalId|SourceType|SourceId',
        'مرتب‌سازی SourceType/Id ، ExternalId ، سپس Root+Source',
      ],
    },
  },
  {
    id: 'success-errors',
    order: 11,
    title: 'موفقیت، Immutability و خطا',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'موفق: Attempt/Import ReadyToCommit؛ Progress ≥97؛ Staging فقط خواندنی.',
      'موقت Stream → Attempt Failed + Import RetryScheduled؛ Validation Integrity معمولاً Non-Retryable.',
    ],
    actionLabel: 'رفتار خطاها',
    detail: {
      type: 'bullet-list',
      title: 'Immutability و Failure',
      description: 'نیاز به دریافت مجدد → Attempt جدید. Cleanup Failed طبق Retention سند ۲۰؛ Attempt شکست‌خورده وارد Commit نمی‌شود.',
      items: [
        'ReadyToCommit: Sources/Nodes/Refs/Hash/Countها Immutable',
        'Unavailable/Timeout → RetryScheduled؛ Build همچنان Importing',
        'Hash/Count/Parent/Ref نامعتبر → Import Failed + Failure Flow + Sentry',
      ],
    },
  },
  {
    id: 'progress-acceptance',
    order: 12,
    title: 'Progress، Cleanup و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Stream 91–94؛ Validation شروع ۹۵؛ موفق ۹۷؛ درصد Monotonic؛ SignalR بعد از Commit.',
      'موفق سند ۱۷: ReadyToCommit؛ Staging کامل؛ Manifest با Python برابر.',
    ],
    actionLabel: 'معیارهای پذیرش ۱۶ و ۱۷',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Worker بدون Lease معتبر Staging یا Build را تغییر نمی‌دهد.',
      items: [
        'Result مستقیم وارد جداول اصلی نشود؛ gRPC طولانی در Consumer نباشد',
        'هر Stream Attempt Staging مستقل؛ Attempt ناقص ترکیب نشود',
        'فقط Rootها Reference؛ Source بدون Reference رد شود',
        'ManifestHash در .NET بازتولید شود؛ Staging فقط بعد از Validation کامل ReadyToCommit',
        'Progress دریافت ۹۱–۹۴ و Validation ۹۵–۹۷؛ Retry درصد را کم نکند',
      ],
    },
  },
];
