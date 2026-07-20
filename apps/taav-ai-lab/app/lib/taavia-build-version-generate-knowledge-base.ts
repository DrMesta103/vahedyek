import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const GENERATE_KNOWLEDGE_BASE_META: BuildVersionStepDocMeta = {
  slug: 'generate-knowledge-base',
  title: '۱۲. تولید Knowledge Base در Python',
  description:
    'پس از تکمیل پردازش Sourceها، Python محتوای پردازش‌شده را به Knowledge Base دو سطحی تبدیل می‌کند و نتیجه معتبر را در PostgreSQL پایدار می‌کند. ذخیره در SQL Server و Import توسط .NET در مراحل بعدی با gRPC انجام می‌شود.',
  status: 'فعال',
  pills: ['GeneratingKnowledgeBase', 'Root/Child', 'Result Ready'],
};

export const GENERATE_KNOWLEDGE_BASE_OVERVIEW_STEPS = [
  'Generation Attempt',
  'ساخت Nodes + References',
  'Validation',
  'Result Ready @ 90%',
] as const;

export const GENERATE_KNOWLEDGE_BASE_OVERVIEW_NOTE =
  'نتیجه ناقص به .NET ارائه نمی‌شود؛ Python بیش از ۹۰٪ گزارش نمی‌کند.';

export const GENERATE_KNOWLEDGE_BASE_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'خروجی: دسته‌های اصلی، زیر‌دسته‌ها، محتوای Node، DisplayOrder، ارتباط Root با Sourceهای استفاده‌شده.',
      'ابتدا Result پایدار در PostgreSQL؛ هنوز چیزی در SQL Server ذخیره نمی‌شود.',
    ],
    actionLabel: 'خارج از این مرحله',
    detail: {
      type: 'bullet-list',
      title: 'در این مرحله انجام نمی‌شود',
      description: 'دریافت Result توسط .NET و Event آماده‌شدن در سند ۱۴ است.',
      items: [
        'ذخیره مستقیم در SQL Server',
        'فعال‌سازی Version یا ساخت TaaviaKnowledgeBaseVersion',
        'ارسال Nodeها داخل RabbitMQ',
        'تغییر Sourceهای اصلی',
        'ساخت Snapshot در .NET',
      ],
    },
  },
  {
    id: 'prereq-responsibility',
    order: 2,
    title: 'پیش‌شرط و مسئولیت',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'ورود فقط با Stage=GeneratingKnowledgeBase و Progress=60 و همه ProcessedSource=Completed.',
      'Python: خواندن ProcessedContent، ساخت ساختار دو سطحی، Reference، Validation، ذخیره Result.',
    ],
    actionLabel: 'مانع‌های شروع',
    detail: {
      type: 'bullet-list',
      title: 'پیش‌شرط‌ها',
      description: 'وجود حتی یک Source در Pending/Processing/RetryScheduled/Failed مانع شروع است.',
      items: [
        'Job.Status = Processing',
        'ActiveInputBatchId مقدار داشته باشد',
        'تمام ProcessedSourceهای Batch = Completed',
      ],
    },
  },
  {
    id: 'two-level-structure',
    order: 3,
    title: 'ساختار دو سطحی',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Root: Parent=null + ≥1 Source Ref',
      'Child: Parent=Root؛ بدون Ref مستقیم',
      'سطح سوم ممنوع',
      'ExternalId = uuid4.hex',
    ],
    actionLabel: 'قواعد فیلدهای Node',
    detail: {
      type: 'kv-list',
      title: 'ExternalId، Title، Content، DisplayOrder',
      description: 'ExternalId شناسه مشترک Python/.NET است و بعد از ذخیره Result تغییر نمی‌کند.',
      items: [
        { label: 'ExternalId', value: 'یکتا در Result؛ Guid/uuid hex؛ نه PK داخلی PG' },
        { label: 'Title', value: 'Trim؛ غیرخالی؛ MaxTitleLength≈300' },
        { label: 'Content', value: 'غیرخالی؛ بدون Presigned/Credential؛ MaxContentLength≈100000' },
        { label: 'DisplayOrder', value: 'از ۱؛ متوالی؛ بدون تکرار میان Siblingها' },
      ],
    },
  },
  {
    id: 'title-hash',
    order: 4,
    title: 'عنوان و ContentHash',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'NormalizedTitle میان Siblingها یکتا؛ فقط برای Validation (ارسال به .NET نمی‌شود).',
      'ContentHash مشترک: Canonical JSON title+content → SHA-256 hex 64.',
    ],
    actionLabel: 'Normalization و Canonical Hash',
    detail: {
      type: 'bullet-list',
      title: 'قواعد عنوان و Hash',
      description: 'ParentId و DisplayOrder داخل ContentHash نیستند. .NET هنگام Import همان Hash را بازتولید می‌کند.',
      items: [
        'Normalize: Unicode، Trim، فاصله‌ها، Lowercase لاتین، یکسان‌سازی ي/ی و ك/ک',
        'Canonical: {"title":"...","content":"..."} بدون whitespace اضافه، UTF-8',
        'ContentHash = SHA-256(CanonicalNodeJsonUtf8)',
      ],
    },
  },
  {
    id: 'sources-refs',
    order: 5,
    title: 'Sources و References',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط Sourceهای واقعاً استفاده‌شده در ResultSources؛ فقط Rootها Reference دارند.',
      'Reference Child به Root منتقل می‌شود؛ یک Source می‌تواند به چند Root وصل شود.',
    ],
    actionLabel: 'قواعد Reference',
    detail: {
      type: 'bullet-list',
      title: 'قواعد Source و Reference',
      description: 'Source بدون Reference در Input/Processed می‌ماند ولی به .NET و Snapshot منتقل نمی‌شود.',
      items: [
        'هر Root ≥1 Reference؛ Child بدون Reference مستقیم',
        'هر ResultSource ≥1 Reference؛ بدون Reference تکراری',
        'Source از همان Job و Active Batch و Completed باشد',
      ],
    },
  },
  {
    id: 'size-limits',
    order: 6,
    title: 'محدودیت اندازه',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'MaxRootNodes = 100',
      'MaxChildrenPerRoot = 100',
      'MaxTotalNodes = 2000',
      'MaxReferencesPerRoot = 500',
    ],
    actionLabel: 'رفتار عبور از حد',
    detail: {
      type: 'kv-list',
      title: 'محدودیت‌ها و Failure',
      description: 'عبور از حد باعث کوچک‌کردن خاموش نتیجه نمی‌شود.',
      items: [
        { label: 'رفتار', value: 'Result Validation Failed → Generation Attempt Failed' },
        { label: 'بعدی', value: 'Retry یا شکست Job بر اساس نوع خطا' },
      ],
    },
  },
  {
    id: 'generation-attempt',
    order: 7,
    title: 'Generation Attempt',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Job.GenerationAttemptCount += 1',
      'Create Result Status=Generating',
      'Pipeline ساخت Nodes و Refs',
      'Validation سپس Ready یا Failed',
    ],
    note: 'Result ناقص یا نیمه‌ساخته هیچ‌گاه به .NET ارائه نمی‌شود.',
  },
  {
    id: 'pipeline-progress',
    order: 8,
    title: 'Pipeline و Progress 60–90',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildProgressedV1',
    eventChips: [
      '60 ورود',
      '60–70 تحلیل',
      '70–78 ساختار',
      '78–90 محتوا/Refs/Validate',
    ],
    note: 'Throttle سند ۱۱ معتبر است؛ مرزهای مهم: 70، 78، 84، 87، 90. بدون Event per Token/Node.',
    actionLabel: 'نمونه Progress Event',
    detail: {
      type: 'json',
      title: 'نمونه Progress در Generation',
      description:
        'Pipeline: خواندن Processed → موضوعات → Root/Child → Title/Content → Sources → Refs → Order → Hash → Validation → ذخیره.',
      code: `{
  "eventId": "a44515089e174430bd2d1bef1bbc7927",
  "eventType": "TaaviaKnowledgeBaseBuildProgressedV1",
  "occurredAt": "2026-07-16T12:30:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "sequence": 12,
    "status": "Processing",
    "stage": "GeneratingKnowledgeBase",
    "progressPercent": 78
  }
}`,
    },
  },
  {
    id: 'final-validation',
    order: 9,
    title: 'Validation نهایی',
    tag: 'بک',
    kind: 'checklist',
    items: [
      'حداقل یک Root؛ ExternalId یکتا؛ Title/Content غیرخالی',
      'Child فقط زیر Root؛ بدون سطح سوم؛ Sibling title یکتا',
      'DisplayOrder متوالی؛ ContentHash معتبر',
      'Root refs کامل؛ بدون Child ref؛ بدون Orphan',
      'فقط Sourceهای Completed همان Job/Batch',
    ],
  },
  {
    id: 'validation-failure',
    order: 10,
    title: 'Validation Failure',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'نتیجه ناقص اصلاح خاموش نمی‌شود؛ Result=Failed بدون ResultReferenceId روی Job.',
      'Progress روی ۹۰ قرار نمی‌گیرد؛ Retry مدل در برابر Failure Flow قراردادی.',
    ],
    actionLabel: 'جزئیات Failure',
    detail: {
      type: 'bullet-list',
      title: 'رفتار Validation Failure',
      description: 'جزئیات Retry Generation در سند ۲۰ مشخص می‌شود.',
      items: [
        'Result.Status = Failed + FailureCode',
        'Result به Job متصل نمی‌شود',
        'خروجی قابل اصلاح مدل → Retry Attempt',
        'خطای Contract/داده غیرقابل پشتیبانی → Failure Flow Job',
      ],
    },
  },
  {
    id: 'idempotency-restart',
    order: 11,
    title: 'Idempotency و Restart',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'اگر ResultReady و Result.Status=Ready باشد، تولید مجدد انجام نمی‌شود.',
      'Restart روی Generating → Attempt قبلی Failed/Abandoned؛ Attempt جدید بدون ادغام.',
    ],
    actionLabel: 'قواعد Restart',
    detail: {
      type: 'bullet-list',
      title: 'Idempotency',
      description: 'رکوردهای Attempt ناقص با Result جدید ترکیب نمی‌شوند.',
      items: [
        'Job.ResultReferenceId + Result Ready → skip regen',
        'Generating ناقص → Attempt جدید مستقل',
      ],
    },
  },
  {
    id: 'output-acceptance',
    order: 12,
    title: 'خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'موفق: Result Ready؛ Nodes/Sources/Refs معتبر؛ Job Status/Stage=ResultReady؛ Progress=90.',
      'Event آماده‌شدن و انتقال به .NET در سند ۱۴.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'عبور از محدودیت‌ها باعث حذف خاموش Node یا Source نمی‌شود.',
      items: [
        'Knowledge Base فقط دو سطح',
        'ExternalId یکتا؛ فقط Rootها Reference؛ هر Root ≥1 Ref',
        'Source استفاده‌نشده به Result نهایی نرود',
        'ContentHash در Python و .NET قابل بازتولید',
        'عنوان تکراری Sibling ممنوع؛ Result ناقص به .NET نرود',
        'Restart دو Attempt را ترکیب نکند',
        'Python بیش از ۹۰٪ گزارش نکند',
      ],
    },
  },
];
