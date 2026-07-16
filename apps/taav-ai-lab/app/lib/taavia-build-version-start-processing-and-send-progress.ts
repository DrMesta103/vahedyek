import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const START_PROCESSING_AND_SEND_PROGRESS_META: BuildVersionStepDocMeta = {
  slug: 'start-processing-and-send-progress',
  title: '۱۱. پردازش Sources در Python و محاسبه Progress',
  description:
    'پس از دریافت کامل Sources و Mediaها، Python هر Source را به ProcessedContent، ProcessedContentHash و ProcessorVersion تبدیل می‌کند. این خروجی برای Snapshot و ساخت Knowledge Base بعدی است؛ Knowledge Node نهایی هنوز ساخته نمی‌شود.',
  status: 'فعال',
  pills: ['ProcessingSources', 'WorkUnits', 'Progress 20–60'],
};

export const START_PROCESSING_AND_SEND_PROGRESS_OVERVIEW_STEPS = [
  'Enter ProcessingSources',
  'Process Sources',
  'Progress Throttle + Outbox',
  'All Completed → 60%',
] as const;

export const START_PROCESSING_AND_SEND_PROGRESS_OVERVIEW_NOTE =
  'Python هرگز بیش از ۹۰٪ نمی‌فرستد؛ Knowledge Node در این مرحله ساخته نمی‌شود.';

export const START_PROCESSING_AND_SEND_PROGRESS_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'خروجی هر Source: ProcessedContent + ProcessedContentHash + ProcessorVersion.',
      'برای تولید دسته‌بندی/Node بعدی و ذخیره Snapshot در .NET؛ هنوز Knowledge Node نهایی نیست.',
    ],
    actionLabel: 'کاربرد خروجی',
    detail: {
      type: 'bullet-list',
      title: 'استفاده‌های بعدی خروجی',
      description: 'جزئیات الگوریتم و مدل AI در این سند تعریف نمی‌شود.',
      items: [
        'تولید دسته‌بندی‌ها و Nodeهای Knowledge Base',
        'ذخیره در TaaviaKnowledgeSourceSnapshot سمت .NET',
        'Audit و تشخیص تغییر پردازش',
      ],
    },
  },
  {
    id: 'prereq-stage',
    order: 2,
    title: 'پیش‌شرط و ورود Stage',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildProgressedV1',
    eventChips: [
      'Batch Completed',
      'Media Validated|Consumed',
      'Stage = ProcessingSources',
      'progressPercent ≥ 20',
    ],
    note: 'Stage و Progress Event در یک Transaction ذخیره می‌شوند. LastEventSequence += 1.',
    actionLabel: 'نمونه Event ورود',
    detail: {
      type: 'json',
      title: 'Event ورود به ProcessingSources',
      description:
        'پیش‌شرط: Job.Status=Processing، Stage=PreparingInputs، ActiveInputBatchId، InputBatch Completed، همه Media الزامی Validated یا Consumed.',
      code: `{
  "eventId": "473cc630b06e4bbeb1b3c70429c33e38",
  "eventType": "TaaviaKnowledgeBaseBuildProgressedV1",
  "occurredAt": "2026-07-16T11:00:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "sequence": 4,
    "status": "Processing",
    "stage": "ProcessingSources",
    "progressPercent": 20
  }
}`,
    },
  },
  {
    id: 'processing-concept',
    order: 3,
    title: 'مفهوم پردازش',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'BrandInfo / Product / FAQ → متن استاندارد UTF-8 برای AI؛ Media → استخراج و ترکیب.',
      'شکست پردازش پس از Retryهای مجاز → کل Build Failed؛ حذف خاموش Source ممنوع.',
    ],
    actionLabel: 'قواعد حذف‌نکردن Source',
    detail: {
      type: 'bullet-list',
      title: 'پردازش و قانون Incomplete',
      description: 'ممکن است شامل Document Parsing، OCR، Speech-to-Text یا Normalization باشد.',
      items: [
        'تمام Sourceهای ActiveInputBatch برای Build معتبرند',
        'KB ناقص بدون اعلام خطا تولید نشود',
        'Snapshot نهایی فقط Sourceهای Batch + پردازش موفق + استفاده‌شده در نتیجه',
      ],
    },
  },
  {
    id: 'processed-table',
    order: 4,
    title: 'جدول processed_sources',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'knowledge_base_build_processed_sources',
      'UNIQUE(job_id, input_source_id)',
      'Pending → … → Completed|Failed',
      'processor_name / version / schema',
    ],
    actionLabel: 'فیلدها و وضعیت‌ها',
    detail: {
      type: 'kv-list',
      title: 'Schema و Status',
      description:
        'ایجاد رکوردها Idempotent است. Completed نیازمند Content، Hash، ProcessorName/Version و CompletedAt است.',
      items: [
        { label: 'وضعیت‌ها', value: 'Pending, Processing, RetryScheduled, Completed, Failed' },
        { label: 'نسخه', value: 'processor_name، processor_version، processed_content_schema_version=1' },
        { label: 'کار', value: 'work_units ≥ 1؛ attempt_count؛ available_at' },
        { label: 'خروجی', value: 'processed_content + processed_content_hash' },
        { label: 'Index worker', value: '(job_id, status, available_at, id)' },
      ],
    },
  },
  {
    id: 'work-units-parallel',
    order: 5,
    title: 'WorkUnits و موازی',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'بدون Media: WorkUnits=1؛ با Media: 1 + Ceiling(size/5MB) تا سقف ۲۰.',
      'حداکثر ۳ Source هم‌زمان per Job؛ Claim با UPDATE شرطی (یک ردیف).',
    ],
    actionLabel: 'Claim و وزن',
    detail: {
      type: 'bullet-list',
      title: 'WorkUnits و انتخاب Source',
      description: 'work_units فقط برای Progress است؛ مبنای هزینه Token نیست. محدودیت Instance نیز Configurable است.',
      items: [
        'BytesPerWorkUnit = 5 MB؛ MaxWorkUnitsPerSource = 20',
        'UPDATE … SET Processing WHERE status IN (Pending, RetryScheduled) AND available_at <= NOW()',
        'تعداد رکورد تغییرکرده باید ۱ باشد',
        'دو Task نباید یک Source را هم‌زمان بگیرند',
      ],
    },
  },
  {
    id: 'ownership-content',
    order: 6,
    title: 'مالکیت و ProcessedContent',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Update فقط با Job.Status=Processing + LockToken معتبر + LockedUntil فعال.',
      'محتوا UTF-8 غیرخالی؛ بدون Presigned URL یا Credential؛ Hash بعد از NormalizeLineEndings.',
    ],
    actionLabel: 'قواعد محتوا و Hash',
    detail: {
      type: 'bullet-list',
      title: 'ProcessedContent و ContentHash',
      description: '.NET هنگام دریافت نتیجه Hash را دوباره محاسبه و اعتبارسنجی می‌کند.',
      items: [
        'بدون Lease: توقف پردازش؛ بدون خروجی جدید و بدون Progress Event',
        'ProcessedContentHash = SHA-256(UTF8(NormalizedProcessedContent)) hex 64',
        'نمونه FAQ/Product به‌صورت متن ساختاریافته پایدار',
      ],
    },
  },
  {
    id: 'media-complete',
    order: 7,
    title: 'Media و تکمیل Source',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Media Validated → خواندن فایل موقت',
      'تولید ProcessedContent + Hash',
      'TX: Source Completed + Media Consumed',
      'حذف فایل موقت',
    ],
    note: 'اگر چند Source یک Media دارند، Consumed فقط وقتی همه وابسته‌ها خروجی پایدار دارند.',
  },
  {
    id: 'progress-split',
    order: 8,
    title: 'تقسیم درصد Build',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'PreparingInputs: 0–20',
      'ProcessingSources: 20–60',
      'GeneratingKB: 60–90',
      '.NET Import/Activate: 91–100',
    ],
    actionLabel: 'فرمول‌های Progress',
    detail: {
      type: 'kv-list',
      title: 'فرمول PreparingInputs و ProcessingSources',
      description: 'Python هیچ‌گاه بیش از ۹۰ ارسال نمی‌کند. Sourceهای Processing/RetryScheduled در CompletedWorkUnits نیستند.',
      items: [
        { label: 'بدون Media', value: 'بعد از Batch کامل → مستقیم ۲۰' },
        { label: 'با Media', value: '8 + Floor(12 × ValidatedBytes / TotalBytes) ≤ 20' },
        { label: 'ProcessingSources', value: '20 + Floor(40 × CompletedWorkUnits / TotalWorkUnits) ≤ 60' },
        { label: 'مثال', value: '10 واحد، ۵ کامل → Progress = 40' },
      ],
    },
  },
  {
    id: 'monotonic-throttle',
    order: 9,
    title: 'Monotonic و Throttle',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'NewProgress = Max(Current, Calculated)؛ Retry درصد را کم نمی‌کند.',
      'Event فقط با تغییر Stage یا +2٪ یا ≥5s با افزایش یا مرزهای ۲۰/۶۰/۹۰.',
    ],
    actionLabel: 'فیلدها و TX Progress',
    detail: {
      type: 'bullet-list',
      title: 'Throttle و Transaction Progress',
      description: 'Chunk فایل یا Token داخلی Event جداگانه نمی‌سازند. MinimumProgressStep=2 و Interval=5s Configurable.',
      items: [
        'Job: last_emitted_progress_percent و last_progress_event_created_at',
        'TX: Update ProcessedSource → محاسبه → Update Job → در صورت نیاز Sequence++ و Insert Outbox',
        'شکست Insert Outbox → Rollback کل TX',
        'Event Full State است؛ به تعداد Sourceهای کامل وابسته نیست',
      ],
    },
  },
  {
    id: 'retry-failure',
    order: 10,
    title: 'Retry و Failure',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Retryable: Timeout OCR/شبکه/AI → RetryScheduled با Backoff تا Attempt 5 → Failed.',
      'Non-Retryable: Schema، JSON، Media Hash، نوع فایل، Content خالی → Failed + فلو شکست Job.',
    ],
    actionLabel: 'Recovery بعد از Restart',
    detail: {
      type: 'bullet-list',
      title: 'Backoff و Recovery',
      description: 'Attempt: 10s → 30s → 2m → 5m → Failed. درصد در Retry کاهش نمی‌یابد.',
      items: [
        'Completed دوباره پردازش نمی‌شود',
        'Pending / RetryScheduled ادامه می‌یابند',
        'Processing با Lease منقضی → RetryScheduled، AvailableAt=Now؛ خروجی موقت کنار گذاشته می‌شود',
        'نسخه اول: بدون Cache ProcessedContent بین Buildها',
      ],
    },
  },
  {
    id: 'stage-end',
    order: 11,
    title: 'پایان Stage',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'همه ProcessedSource = Completed',
      'هیچ Pending/Processing/RetryScheduled/Failed',
      'Stage = GeneratingKnowledgeBase',
      'ProgressPercent = 60 + Outbox Event',
    ],
    note: 'ورود به GeneratingKnowledgeBase فقط بعد از کامل‌شدن همه Sourceها.',
  },
  {
    id: 'output-acceptance',
    order: 12,
    title: 'خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'موفق: Stage=GeneratingKnowledgeBase، Progress=60، همه Sourceها Completed با Content+Hash.',
      'Flutter/.NET درصد را محاسبه نمی‌کنند؛ Event و Sequence با Update Job در یک TX.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Worker بدون Lease/LockToken معتبر خروجی ثبت نمی‌کند.',
      items: [
        'Source شکست‌خورده بدون اعلام خطا حذف نشود',
        'هر Input Source فقط یک رکورد پردازش؛ خروجی بعد از Restart قابل استفاده',
        'ProcessedContent خالی ممنوع؛ Hash برای هر Completed اجباری',
        'Retry درصد را کم نکند؛ Progress این مرحله ۲۰–۶۰',
        'Progress Event برای هر تغییر جزئی ساخته نشود',
        'همه Sourceها قبل از GeneratingKnowledgeBase کامل شوند',
        'Python هرگز بیش از ۹۰٪ نفرستد',
      ],
    },
  },
];
