import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const GET_RESULT_FROM_PYTHON_GRPC_META: BuildVersionStepDocMeta = {
  slug: 'get-result-from-python-grpc',
  title: '۱۶. دریافت Result نهایی از Python با gRPC',
  description:
    'پس از ImportRequested، Worker مستقل .NET نتیجه آماده را با gRPC Server Streaming از Python دریافت و در Staging ذخیره می‌کند. Result هنوز وارد جداول اصلی Knowledge Base نمی‌شود؛ اعتبارسنجی در سند ۱۷ است.',
  status: 'فعال',
  pills: ['Import Worker', 'gRPC Stream', 'Staging'],
};

export const GET_RESULT_FROM_PYTHON_GRPC_OVERVIEW_STEPS = [
  'Claim Import Job',
  'Stream Result (Header→…→Completed)',
  'ذخیره Staging',
  'Validating (سند ۱۷)',
] as const;

export const GET_RESULT_FROM_PYTHON_GRPC_OVERVIEW_NOTE =
  'Consumer فقط Import Job می‌سازد؛ gRPC طولانی داخل Worker است.';

export const GET_RESULT_FROM_PYTHON_GRPC_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal-flow',
    order: 1,
    title: 'هدف و فلو',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'ImportRequested Consumer → Import Job پایدار + Ack؛ Worker → Claim + gRPC Stream → Staging.',
      'Sources، Nodes، References و Hashها دریافت می‌شوند؛ جداول زنده KB هنوز پر نمی‌شوند.',
    ],
    actionLabel: 'جداسازی Consumer و Worker',
    detail: {
      type: 'bullet-list',
      title: 'نقش‌ها',
      description: 'Consumer نباید عملیات طولانی gRPC را اجرا کند.',
      items: [
        'Consumer: ایجاد Import Job در SQL Server و Ack',
        'Worker: Claim، Stream، Staging، سپس Validating',
      ],
    },
  },
  {
    id: 'import-entity',
    order: 2,
    title: 'Entity Import',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'TaaviaKnowledgeBaseResultImport',
      'UNIQUE(BuildId) و UNIQUE(ResultReferenceId)',
      'Expected ManifestHash + Counts',
      'Lease: LockedBy / LockToken / LockedUntil',
    ],
    actionLabel: 'دلیل فیلدهای کلیدی',
    detail: {
      type: 'kv-list',
      title: 'فیلدهای عملیاتی Import',
      description: 'Entity داخلی است و در API عمومی نمایش داده نمی‌شود. Expected* از Event تأییدشده ResultReady می‌آید.',
      items: [
        { label: 'ResultReferenceId', value: 'شناسه Result آماده در PostgreSQL پایتون' },
        { label: 'Expected*', value: 'ManifestHash و Countها برای تشخیص Stream ناقص' },
        { label: 'Attempt / AvailableAt', value: 'Retry و زمان مجاز Attempt بعدی' },
        { label: 'LockToken', value: 'جلوگیری از Update توسط Worker قدیمی' },
      ],
    },
  },
  {
    id: 'statuses',
    order: 3,
    title: 'وضعیت‌های Import',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Queued → Downloading → Validating → ReadyToCommit → Completed.',
      'RetryScheduled و Failed نیز در مسیر خطا/Retry هستند.',
    ],
    actionLabel: 'Transitionهای مجاز',
    detail: {
      type: 'bullet-list',
      title: 'Enum و Transition',
      description: 'ReadyToCommit یعنی Staging معتبر است و آماده Commit نهایی Knowledge Base (سندهای بعدی).',
      items: [
        'Queued → Downloading',
        'Downloading → Validating | RetryScheduled | Failed',
        'Validating → ReadyToCommit | RetryScheduled | Failed',
        'ReadyToCommit → Completed | RetryScheduled | Failed',
        'RetryScheduled → Downloading',
      ],
    },
  },
  {
    id: 'create-queued',
    order: 4,
    title: 'ImportRequested → Queued',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Consumer ImportRequested را می‌گیرد؛ Expected را از Build/Inbox ResultReady می‌خواند و Import Queued می‌سازد.',
      'اگر BuildId قبلاً Import داشته باشد، Import جدید ساخته نمی‌شود و پیام Ack می‌شود.',
    ],
    actionLabel: 'مقادیر اولیه',
    detail: {
      type: 'bullet-list',
      title: 'ایجاد Idempotent Import Job',
      description: 'ثبت Inbox ImportRequested و ساخت Import در یک Transaction است.',
      items: [
        'Status=Queued؛ AttemptCount=0؛ AvailableAt=Now',
        'LockedBy/LockToken/LockedUntil = null',
        'StartedAt/FinishedAt = null',
      ],
    },
  },
  {
    id: 'claim-lease',
    order: 5,
    title: 'Claim و Lease',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط Queued یا RetryScheduled با AvailableAt<=Now؛ SELECT TOP 1 با UPDLOCK, READPAST, ROWLOCK.',
      'Lease 60s و Heartbeat 20s؛ LockToken جدید در هر Claim.',
    ],
    actionLabel: 'به‌روزرسانی هنگام Claim',
    detail: {
      type: 'bullet-list',
      title: 'فیلدهای Claim',
      description: 'مقادیر Lease از Configuration قابل‌تغییرند.',
      items: [
        'Status = Downloading؛ AttemptCount += 1',
        'LockedBy = WorkerInstanceId؛ LockToken = Guid جدید',
        'LockedUntil = Now + LeaseDuration',
        'StartedAt = COALESCE(StartedAt, Now)',
      ],
    },
  },
  {
    id: 'build-on-start',
    order: 6,
    title: 'Build هنگام شروع',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Status = Importing',
      'Stage = ImportingResult',
      'ProgressPercent = Max(Current, 91)',
      'FinishedAt همچنان null',
    ],
    actionLabel: 'SignalR بعد از Commit',
    detail: {
      type: 'kv-list',
      title: 'به‌روزرسانی Build با Claim',
      description: 'پس از Commit، Full State جدید با SignalR ارسال می‌شود.',
      items: [
        { label: 'Status', value: 'Importing' },
        { label: 'Stage', value: 'ImportingResult' },
        { label: 'Progress', value: 'حداقل ۹۱' },
      ],
    },
  },
  {
    id: 'grpc-request',
    order: 7,
    title: 'gRPC Service و Request',
    tag: 'بک',
    kind: 'event',
    eventName: 'StreamKnowledgeBaseBuildResultV1',
    eventChips: ['tenant_id', 'brand_id', 'build_id', 'result_reference_id'],
    note: 'Server Streaming. VersionId یا شناسه Staging به Python ارسال نمی‌شود.',
    actionLabel: 'مشاهده Request',
    detail: {
      type: 'json',
      title: 'Request دریافت Result',
      description: 'Correlation اصلی BuildId است؛ ResultReferenceId شناسه Result آماده در Event است.',
      code: `{
  "tenantId": "tenant-100",
  "brandId": "brand-200",
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
  "resultReferenceId": "339bb872-06b4-42bc-a302-2a64681ca906"
}`,
    },
  },
  {
    id: 'stream-shape',
    order: 8,
    title: 'ساختار Stream',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Header',
      'تمام Sourceها',
      'Rootها سپس Childها',
      'References سپس Completed',
    ],
    note: 'oneof: header | source | node | reference | completed. نبودن Header یا Completed یعنی Result ناقص.',
  },
  {
    id: 'messages-completed',
    order: 9,
    title: 'پیام‌ها و Completed',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Source: Canonical JSON + hashes؛ Node: ExternalId/Parent؛ Ref: RootExternalId + SourceType/Id.',
      'Completed Countها و ManifestHash باید با Event، Job، Header و Staging برابر باشند.',
    ],
    actionLabel: 'قواعد پیام‌ها',
    detail: {
      type: 'bullet-list',
      title: 'Source، Node، Reference، Completed',
      description: 'Header با Event ResultReady و Import Expected مقایسه می‌شود.',
      items: [
        'Source: source_data_json_utf8 Canonical؛ processed_content غیرخالی؛ Type+Id یکتا',
        'Root: ParentExternalId=null؛ Child: Parent=Root ExternalId',
        'Reference با هویت بیزینسی Source؛ نه PK داخلی PostgreSQL',
        'تطبیق Count/Manifest: Event ↔ Job Expected ↔ Header ↔ Staging ↔ Completed',
      ],
    },
  },
  {
    id: 'python-security',
    order: 10,
    title: 'Python checks و امنیت',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Python فقط اگر Job/Result Ready و شناسه‌ها برابر Request باشند Stream می‌دهد.',
      'TLS + Service Auth + Deadline ≈ ۱۰ دقیقه؛ پیشنهاد Production: mTLS.',
    ],
    actionLabel: 'خطاهای gRPC',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی Python و Errorها',
      description: 'Result آماده در زمان Stream نباید تغییر کند. Deadline بیشتر از Stream ورودی Sources است.',
      items: [
        'NOT_FOUND / PERMISSION_DENIED / DATA_LOSS → Non-Retryable',
        'FAILED_PRECONDITION بسته به ErrorCode ممکن است Retryable یا نه',
        'UNAVAILABLE / DEADLINE_EXCEEDED → Retryable',
      ],
    },
  },
  {
    id: 'progress-incomplete',
    order: 11,
    title: 'Progress و Stream ناقص',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Progress دریافت: 91 + Floor(3 × Received/Total) ≤ 94؛ Monotonic با Max(Current, New).',
      'قطع قبل از Completed → Staging Failed؛ Import=RetryScheduled؛ Attempt بعدی Staging جدید.',
    ],
    actionLabel: 'فرمول و Throttle',
    detail: {
      type: 'bullet-list',
      title: 'Progress و Incomplete Stream',
      description: 'Throttle: حداقل ۱٪ تغییر یا ۵ ثانیه از آخرین Push. Staging ناقص وارد جداول اصلی نمی‌شود.',
      items: [
        'TotalItems = UsedSourceCount + TotalNodeCount + ReferenceCount',
        'Retry درصد را کاهش نمی‌دهد',
        'Attempt بعدی داده‌های Staging قبلی را ادامه نمی‌دهد',
      ],
    },
  },
  {
    id: 'lease-output-acceptance',
    order: 12,
    title: 'Lease، خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Update فقط با LockToken معتبر و Status=Downloading|Validating؛ ازدست‌رفتن Lease → Cancel Stream.',
      'موفق سند ۱۶: Staging پر؛ Import Downloading یا Validating؛ Build Importing/ImportingResult @91–94.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'خروجی و پذیرش',
      description: 'Python Result بدون تغییر Ready می‌ماند. Validation کامل در سند ۱۷.',
      items: [
        'gRPC داخل Consumer نباشد',
        'Result مستقیم وارد جداول اصلی KB نشود',
        'Header/Completed اجباری؛ Count و Manifest سازگار باشند',
        'بدون Lease معتبر: بدون ذخیره جدید، بدون تغییر Build، بدون Commit نهایی',
        'Stream ناقص فقط Retry با Staging جدید',
      ],
    },
  },
];
