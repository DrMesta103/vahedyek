import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const RESULT_READY_FROM_PYTHON_META: BuildVersionStepDocMeta = {
  slug: 'result-ready-from-python',
  title: '۱۴. اعلام آماده‌شدن نتیجه توسط Python',
  description:
    'بعد از ذخیره Result کامل، معتبر و Immutable در PostgreSQL، Python به .NET اعلام می‌کند نتیجه آماده دریافت با gRPC است. RabbitMQ فقط اعلام آمادگی و اطلاعات کنترلی را منتقل می‌کند؛ Nodeها و محتوا داخل Event نیستند.',
  status: 'فعال',
  pills: ['ResultReady', 'Outbox', 'Control Plane'],
};

export const RESULT_READY_FROM_PYTHON_OVERVIEW_STEPS = [
  'Result Ready + Job 90%',
  'Insert Outbox Event',
  'Outbox Publisher Confirm',
  '.NET مصرف بعدی',
] as const;

export const RESULT_READY_FROM_PYTHON_OVERVIEW_NOTE =
  'RabbitMQ فقط اعلام آمادگی است؛ Payload سنگین از gRPC می‌آید.';

export const RESULT_READY_FROM_PYTHON_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'اعلام آمادگی Result برای دریافت gRPC توسط .NET؛ بدون ارسال Node، SourceData، ProcessedContent، Reference یا فایل.',
      'RabbitMQ فقط کنترل‌پلن است؛ داده سنگین از Data Plane (gRPC) می‌آید.',
    ],
  },
  {
    id: 'prerequisites',
    order: 2,
    title: 'پیش‌شرط',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Job: Status/Stage=ResultReady، Progress=90، ResultReferenceId پر.',
      'Result: Status=Ready و ResultManifestHash موجود؛ Generating/Failed/Expired اعلام نمی‌شوند.',
    ],
    actionLabel: 'شرایط ساخت Event',
    detail: {
      type: 'bullet-list',
      title: 'پیش‌شرط‌های ResultReady Event',
      description: 'Event فقط برای نتیجه کامل و Immutable ساخته می‌شود.',
      items: [
        'Job.Status = ResultReady و Stage = ResultReady',
        'Job.ProgressPercent = 90 و ResultReferenceId مقدار دارد',
        'Result.Status = Ready و ResultManifestHash مقدار دارد',
        'نتیجه Generating، Failed یا Expired اعلام نشود',
      ],
    },
  },
  {
    id: 'contract',
    order: 3,
    title: 'Contract',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildResultReadyV1',
    eventChips: [
      'resultReferenceId',
      'resultManifestHash',
      'counts',
      'progressPercent = 90',
    ],
    note: 'startedAt زمان شروع Attempt واقعی است حتی اگر Progressهای قبلی نرسیده باشند.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'نمونه ResultReady Event',
      description: 'Countها کنترلی‌اند و .NET بعداً با محتوای gRPC تطبیق می‌دهد.',
      code: `{
  "eventId": "32b29515b9384473982e8f18970d439f",
  "eventType": "TaaviaKnowledgeBaseBuildResultReadyV1",
  "occurredAt": "2026-07-16T13:05:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "sequence": 15,
    "resultReferenceId": "339bb872-06b4-42bc-a302-2a64681ca906",
    "resultSchemaVersion": 1,
    "resultManifestHash": "99456be3a7d6c15fc5d26f91f280ba482...",
    "rootNodeCount": 8,
    "childNodeCount": 24,
    "totalNodeCount": 32,
    "usedSourceCount": 15,
    "referenceCount": 22,
    "progressPercent": 90,
    "startedAt": "2026-07-16T12:10:00Z",
    "readyAt": "2026-07-16T13:05:00Z"
  }
}`,
    },
  },
  {
    id: 'field-validation',
    order: 4,
    title: 'فیلدها و اعتبار',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'resultReferenceId ورودی اصلی gRPC؛ ManifestHash SHA-256 hex 64؛ Progress دقیقاً 90.',
      'Root≥1؛ Total=Root+Child؛ UsedSource≥1؛ ReferenceCount ≥ RootNodeCount.',
    ],
    actionLabel: 'قواعد اعتبار Contract',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی Payload',
      description: 'Sequence > 0؛ ResultSchemaVersion ≥ 1؛ StartedAt ≤ ReadyAt.',
      items: [
        'ResultReferenceId خالی نباشد',
        'ResultManifestHash = SHA-256 hex lowercase طول 64',
        'RootNodeCount ≥ 1؛ ChildNodeCount ≥ 0',
        'TotalNodeCount = RootNodeCount + ChildNodeCount',
        'UsedSourceCount ≥ 1؛ ReferenceCount ≥ RootNodeCount',
        'ProgressPercent = 90',
      ],
    },
  },
  {
    id: 'contract-version',
    order: 5,
    title: 'نسخه Contract',
    tag: 'بک',
    kind: 'text',
    summaryLines: [
      'نسخه در نام کلاس و eventType است: TaaviaKnowledgeBaseBuildResultReadyV1.',
      'فیلد جداگانه version نداریم؛ Breaking Change → V2.',
    ],
  },
  {
    id: 'rabbitmq',
    order: 6,
    title: 'تنظیمات RabbitMQ',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Exchange = taavia.knowledge-base',
      'RK = …build.result-ready.v1',
      'Queue = taavia-dotnet.…result-ready.v1',
      'Persistent + Manual Ack path',
    ],
    actionLabel: 'جزئیات Queue و Header',
    detail: {
      type: 'kv-list',
      title: 'Exchange، Queue و Headerها',
      description: 'پیام Persistent است. Envelope داخل Body منبع قرارداد است.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base (topic)' },
        { label: 'Routing Key', value: 'taavia.knowledge-base.build.result-ready.v1' },
        { label: 'Queue', value: 'taavia-dotnet.knowledge-base.build.result-ready.v1' },
        { label: 'DLQ', value: 'taavia-dotnet.knowledge-base.build.result-ready.v1.dlq' },
        { label: 'MessageId', value: 'EventId' },
        { label: 'CorrelationId', value: 'BuildId' },
        { label: 'Type', value: 'TaaviaKnowledgeBaseBuildResultReadyV1' },
        { label: 'ContentType', value: 'application/json' },
      ],
    },
  },
  {
    id: 'atomic-tx',
    order: 7,
    title: 'Transaction اتمیک',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Result.Status = Ready',
      'Job ResultReady @90 + ResultReferenceId',
      'LastEventSequence += 1',
      'Insert ResultReady در Outbox',
    ],
    note: 'اگر Insert Outbox شکست بخورد، Result و Job Ready نمی‌شوند و Transaction Rollback می‌شود.',
  },
  {
    id: 'outbox-publish',
    order: 8,
    title: 'انتشار Outbox',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'انتشار توسط همان Python Outbox Publisher سند ۵ انجام می‌شود.',
      'Worker تولید KB مستقیماً RabbitMQ را فراخوانی نمی‌کند.',
    ],
    actionLabel: 'فلو Publish',
    detail: {
      type: 'bullet-list',
      title: 'Outbox Publisher',
      description: 'Publish → Publisher Confirm → PublishedAt.',
      items: [
        'خواندن Outbox منتشرنشده',
        'Publish در RabbitMQ',
        'دریافت Confirm',
        'ثبت PublishedAt',
      ],
    },
  },
  {
    id: 'publish-retry',
    order: 9,
    title: 'Retry انتشار',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'در Retry: EventId، Sequence، ResultReferenceId، ManifestHash و Payload ثابت می‌مانند.',
      'Publish تکراری با همان EventId مجاز است؛ .NET باید Idempotent مصرف کند.',
    ],
    actionLabel: 'فیلدهای ثابت / عملیاتی',
    detail: {
      type: 'bullet-list',
      title: 'Immutability در Retry',
      description: 'فقط فیلدهای عملیاتی Outbox (Attempt، AvailableAt، Lock، LastError، PublishedAt) تغییر می‌کنند.',
      items: [
        'ثابت: EventId، EventType، OccurredAt، Sequence، ResultReferenceId، ResultManifestHash، Payload',
        'قابل‌تغییر: PublishAttemptCount، AvailableAt، LockedBy، LockedUntil، LastError، PublishedAt',
      ],
    },
  },
  {
    id: 'sequence-order',
    order: 10,
    title: 'ترتیب Sequence',
    tag: 'بک',
    kind: 'text',
    summaryLines: [
      'ممکن است ResultReady (مثلاً Sequence 15) قبل از Progressهای قدیمی‌تر برسد؛ این مجاز است.',
      '.NET Sequence جدیدتر را اعمال می‌کند و Sequenceهای کوچک‌تر را بعداً نادیده می‌گیرد.',
    ],
  },
  {
    id: 'successful-output',
    order: 11,
    title: 'خروجی موفق',
    tag: 'بک',
    kind: 'checklist',
    items: [
      'Python Result: Ready و Immutable',
      'Job: ResultReady / ResultReady / Progress 90',
      'Outbox: ResultReady ثبت یا منتشرشده',
      'RabbitMQ: Event موجود',
      '.NET: ممکن است تا مصرف Event هنوز Processing باشد',
    ],
  },
  {
    id: 'acceptance',
    order: 12,
    title: 'معیارهای پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Event قبل از Ready کامل ساخته نشود؛ Node/Source داخل RMQ نباشد؛ Progress دقیقاً 90.',
      'Ready Result و Outbox اتمیک؛ Retry Event/Sequence جدید نسازد؛ Result بعد از ارسال تغییر نکند.',
    ],
    actionLabel: 'فهرست پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'ترتیب دریافت RabbitMQ مبنای ترتیب بیزینسی نیست؛ Sequence مبنا است.',
      items: [
        'Event قبل از Ready شدن کامل Result ساخته نشود',
        'Nodeها و Sourceها داخل RabbitMQ قرار نگیرند',
        'resultReferenceId فقط به Result آماده اشاره کند',
        'Countها با Result واقعی سازگار باشند',
        'Progress این Event دقیقاً 90 باشد',
        'Ready شدن Result و ساخت Outbox اتمیک باشند',
        'Retry انتشار EventId یا Sequence جدید نسازد',
        'Result آماده بعد از ارسال Event تغییر نکند',
      ],
    },
  },
];
