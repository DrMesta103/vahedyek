import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META: BuildVersionStepDocMeta = {
  slug: 'receive-result-ready-and-schedule-import',
  title: '۱۵. دریافت ResultReady در .NET و زمان‌بندی Import',
  description:
    '.NET Event آماده‌شدن Result را دریافت می‌کند، Build را به Importing منتقل می‌کند، ResultReferenceId را ذخیره می‌کند و درخواست Durable برای Import ثبت می‌کند. دریافت واقعی Result با gRPC در Worker مستقل است.',
  status: 'فعال',
  pills: ['Importing', 'Inbox', 'Import Outbox'],
};

export const RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_OVERVIEW_STEPS = [
  'Validate ResultReady',
  'Build → Importing @90%',
  'Insert ImportRequested Outbox',
  'Ack + SignalR',
] as const;

export const RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_OVERVIEW_NOTE =
  'gRPC و Import واقعی در Worker جداگانه است؛ Consumer فقط زمان‌بندی می‌کند.';

export const RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal-separation',
    order: 1,
    title: 'هدف و جداسازی',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Consumer: اعتبارسنجی Event → Importing → ذخیره ResultReferenceId → ثبت Import Request.',
      'Import Worker: gRPC + Staging + Validation + Commit نهایی.',
    ],
    actionLabel: 'چرا Import داخل Consumer نیست',
    detail: {
      type: 'bullet-list',
      title: 'دلیل جداکردن Consumer از Import',
      description: 'دریافت Result ممکن است هزاران Node/Source/Reference داشته باشد.',
      items: [
        'طولانی‌شدن زمان Ack و قفل Consumer',
        'افزایش Redelivery و پیچیدگی Retry',
        'احتمال اجرای Import تکراری',
      ],
    },
  },
  {
    id: 'rabbitmq-input',
    order: 2,
    title: 'RabbitMQ ورودی',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Exchange = taavia.knowledge-base',
      'RK = …result-ready.v1',
      'Queue = taavia-dotnet.…result-ready.v1',
      'Manual Ack = true',
    ],
    actionLabel: 'جزئیات Queue',
    detail: {
      type: 'kv-list',
      title: 'تنظیمات Queue ورودی',
      description: 'Durable=true؛ AutoDelete/Exclusive=false.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base (topic)' },
        { label: 'Routing Key', value: 'taavia.knowledge-base.build.result-ready.v1' },
        { label: 'Queue', value: 'taavia-dotnet.knowledge-base.build.result-ready.v1' },
        { label: 'Durable', value: 'true' },
        { label: 'Manual Ack', value: 'true' },
      ],
    },
  },
  {
    id: 'contract-inbox',
    order: 3,
    title: 'Contract و Inbox',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Contract: TaaviaKnowledgeBaseBuildResultReadyV1؛ SchemaVersion پشتیبانی‌شده = 1.',
      'Inbox Consumer = knowledge-base-build-result-ready-v1؛ UNIQUE(ConsumerName, EventId).',
    ],
    actionLabel: 'نتایج Inbox و Schema',
    detail: {
      type: 'bullet-list',
      title: 'Inbox و نسخه Schema',
      description: 'Applied / Ignored / Rejected مطابق سند ۶. Schema پشتیبانی‌نشده → Reject without Requeue → DLQ.',
      items: [
        'Deserialize و Validate همه فیلدهای سند ۱۴',
        'ResultSchemaVersion ≠ 1 → DLQ + Log/Sentry',
        'ProcessingResult: Applied، Ignored، Rejected',
      ],
    },
  },
  {
    id: 'build-sequence',
    order: 4,
    title: 'Build و Sequence',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Build با TenantId+BrandId+BuildId؛ Type=InitialBuild|Rebuild؛ Status=Queued|Processing.',
      'Queued پذیرفته می‌شود چون ResultReady ممکن است زودتر از Progress برسد.',
    ],
    actionLabel: 'حالت‌های Sequence',
    detail: {
      type: 'bullet-list',
      title: 'کنترل Sequence',
      description: 'فاصله Sequence مجاز است. قاعده اعمال: Sequence > LastPythonEventSequence.',
      items: [
        'Sequence کوچک‌تر → Ignored + Ack',
        'Sequence برابر + محتوای یکسان → Ignored + Ack',
        'Sequence برابر + محتوای متفاوت → Rejected PythonSequenceConflict + DLQ',
        'Sequence بزرگ‌تر → اعتبارسنجی بیزینسی',
      ],
    },
  },
  {
    id: 'metadata-ref',
    order: 5,
    title: 'Metadata و ResultReference',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'اعتبار Count/Hash/Progress=90 قبل از اعمال؛ جایگزین Validation کامل gRPC نیست.',
      'ResultReferenceId خالی → اعمال؛ همان Ref → تکراری؛ Ref متفاوت → ResultReferenceConflict.',
    ],
    actionLabel: 'قواعد Metadata و Conflict',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی Metadata',
      description: 'یک Build نباید دو Result نهایی متفاوت بگیرد.',
      items: [
        'Root≥1؛ Total=Root+Child؛ UsedSource≥1؛ ReferenceCount≥Root',
        'ManifestHash معتبر؛ SchemaVersion=1؛ StartedAt≤ReadyAt',
        'بدون ResultReferenceId قبلی → قابل اعمال',
        'همان ResultReferenceId → تکراری/اعمال‌شده',
        'ResultReferenceId متفاوت → Rejected + DLQ',
      ],
    },
  },
  {
    id: 'build-changes',
    order: 6,
    title: 'تغییرات Build',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Status = Importing',
      'Stage = ResultReady',
      'ProgressPercent = 90',
      'ResultReferenceId ذخیره می‌شود',
    ],
    actionLabel: 'فیلدهای تغییر / بدون تغییر',
    detail: {
      type: 'kv-list',
      title: 'Update Build پس از ResultReady',
      description:
        'Importing = مسئولیت فعال به .NET منتقل شده؛ Stage=ResultReady یعنی Result آماده ولی دریافت هنوز شروع نشده.',
      items: [
        { label: 'LastPythonEventSequence', value: 'Payload.Sequence' },
        { label: 'StartedAt', value: 'COALESCE(StartedAt, Payload.StartedAt)' },
        { label: 'بدون تغییر', value: 'FinishedAt، KnowledgeBaseVersionId، SourceRestoreMode' },
      ],
    },
  },
  {
    id: 'import-requested',
    order: 7,
    title: 'ImportRequested',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseResultImportRequestedV1',
    eventChips: ['tenantId', 'brandId', 'buildId', 'resultReferenceId'],
    note: 'Payload کم‌حجم است؛ Worker جزئیات را از Build و gRPC می‌خواند.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'نمونه ImportRequested داخلی',
      description:
        'VersionId، ManifestHash، Countها، BuildType و SourceRestoreMode در Event داخلی تکرار نمی‌شوند.',
      code: `{
  "eventId": "260d7428706e49de93b880f5784080b9",
  "eventType": "TaaviaKnowledgeBaseResultImportRequestedV1",
  "occurredAt": "2026-07-16T13:05:02Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "resultReferenceId": "339bb872-06b4-42bc-a302-2a64681ca906"
  }
}`,
    },
  },
  {
    id: 'internal-rabbitmq',
    order: 8,
    title: 'RabbitMQ داخلی Import',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'RK = …result.import.requested.v1',
      'Queue = taavia-dotnet.…import.requested.v1',
      'تولید و مصرف توسط .NET',
      'Contract = ImportRequestedV1',
    ],
    actionLabel: 'جزئیات مسیر داخلی',
    detail: {
      type: 'kv-list',
      title: 'مسیر Import داخلی',
      description: 'این Event توسط .NET تولید و توسط Import Worker .NET مصرف می‌شود.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base' },
        { label: 'Routing Key', value: 'taavia.knowledge-base.result.import.requested.v1' },
        { label: 'Queue', value: 'taavia-dotnet.knowledge-base.result.import.requested.v1' },
      ],
    },
  },
  {
    id: 'transaction-race',
    order: 9,
    title: 'Transaction و Race',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Inbox Insert + Load Build',
      'Sequence + Metadata',
      'Update شرطی Importing + Outbox ImportRequested',
      'Inbox Applied → Commit → Ack',
    ],
    note: 'UPDATE فقط اگر LastPythonEventSequence < @Sequence و Status IN (Queued, Processing). صفر ردیف → خواندن مجدد Build.',
  },
  {
    id: 'closed-errors',
    order: 10,
    title: 'Buildهای بسته و خطا',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Importing تکراری با همان Ref → Ignored؛ Sequence جدیدتر → Rejected.',
      'خطای موقت SQL → Nack/Requeue؛ Contract نامعتبر → DLQ بدون تغییر Build.',
    ],
    actionLabel: 'جزئیات بسته و خطا',
    detail: {
      type: 'bullet-list',
      title: 'رفتار Build بسته و خطاها',
      description: 'قطع RabbitMQ داخلی باعث گم‌شدن Import نمی‌شود؛ Outbox بعداً Publish می‌کند.',
      items: [
        'Importing + Sequence جدیدتر → ResultReadyReceivedAfterImportStarted',
        'Completed/Failed + Sequence قدیمی → Ignored؛ جدیدتر → ResultReadyReceivedForClosedBuild + DLQ',
        'Timeout/Deadlock → Rollback + Nack with Requeue',
        'Metadata نامعتبر → Reject without Requeue؛ بدون Import Request',
      ],
    },
  },
  {
    id: 'signalr-no-grpc',
    order: 11,
    title: 'SignalR و ممنوعیت gRPC',
    tag: 'فرانت',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildStateChangedV1',
    eventChips: [
      'status = Importing',
      'stage = ResultReady',
      'progressPercent = 90',
    ],
    note: 'Consumer نباید Get/Stream/Acknowledge Result را صدا بزند؛ همه gRPC در Import Worker است.',
    actionLabel: 'مشاهده Full State',
    detail: {
      type: 'json',
      title: 'SignalR بعد از Commit',
      description: 'Flutter فقط وضعیت را نمایش می‌دهد؛ Result را دریافت یا Import نمی‌کند.',
      code: `{
  "eventType": "TaaviaKnowledgeBaseBuildStateChangedV1",
  "occurredAt": "2026-07-16T13:05:03Z",
  "payload": {
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "buildType": "InitialBuild",
    "status": "Importing",
    "stage": "ResultReady",
    "progressPercent": 90,
    "requestedAt": "2026-07-16T12:09:50Z",
    "startedAt": "2026-07-16T12:10:00Z",
    "finishedAt": null,
    "updatedAt": "2026-07-16T13:05:02Z"
  }
}`,
    },
  },
  {
    id: 'output-acceptance',
    order: 12,
    title: 'خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'موفق: Build Importing/ResultReady @90، Inbox Applied، Outbox ImportRequested، Ack، Flutter به‌روز.',
      'ResultReady فقط Import را زمان‌بندی می‌کند؛ gRPC داخل Consumer نیست.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Import Worker مستقل و قابل Retry است.',
      items: [
        'Queued و Processing بتوانند ResultReady را بپذیرند',
        'Sequence جدید Progressهای قدیمی را بی‌اثر کند',
        'یک Build دو ResultReferenceId متفاوت نگیرد',
        'Build و Outbox Import در یک Transaction',
        'قطع RabbitMQ داخلی باعث گم‌شدن Import نشود',
        'Progress بعد از ResultReady برابر ۹۰ بماند',
        'Flutter فقط وضعیت ذخیره‌شده .NET را ببیند',
      ],
    },
  },
];
