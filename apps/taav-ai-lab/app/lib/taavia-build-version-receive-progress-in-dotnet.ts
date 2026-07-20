import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const RECEIVE_PROGRESS_IN_DOTNET_META: BuildVersionStepDocMeta = {
  slug: 'receive-progress-in-dotnet',
  title: '۶. دریافت Event پیشرفت Python در .NET',
  description:
    'آخرین وضعیت پردازش Python از RabbitMQ دریافت و در TaaviaKnowledgeBaseBuild ذخیره می‌شود. وضعیت قابل‌نمایش برای Flutter به‌روز می‌شود؛ ارسال SignalR در سند بعدی است.',
  status: 'فعال',
  pills: ['.NET Consumer', 'Inbox', 'Sequence'],
};

export const RECEIVE_PROGRESS_IN_DOTNET_OVERVIEW_STEPS = [
  'دریافت Progress Event',
  'Inbox + اعتبارسنجی',
  'Update Build (Sequence)',
  'Commit + Ack',
] as const;

export const RECEIVE_PROGRESS_IN_DOTNET_OVERVIEW_NOTE =
  'Ack فقط بعد از Commit؛ SignalR در این مرحله ارسال نمی‌شود.';

export const RECEIVE_PROGRESS_IN_DOTNET_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      '.NET آخرین وضعیت پردازش Python را از RabbitMQ دریافت و در Build ذخیره می‌کند.',
      'وضعیت قابل‌نمایش برای Flutter به‌روز می‌شود؛ پیام SignalR هنوز ارسال نمی‌شود.',
    ],
  },
  {
    id: 'rabbitmq',
    order: 2,
    title: 'تنظیمات RabbitMQ',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Exchange = taavia.knowledge-base',
      'Queue = taavia-dotnet.knowledge-base.build.progressed.v1',
      'Routing Key = …progressed.v1',
      'Manual Ack = true',
    ],
    actionLabel: 'جزئیات Queue و DLQ',
    detail: {
      type: 'kv-list',
      title: 'جزئیات تنظیمات RabbitMQ',
      description: 'پیام‌های نامعتبر بدون Requeue به DLQ منتقل می‌شوند.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base (topic)' },
        { label: 'Routing Key', value: 'taavia.knowledge-base.build.progressed.v1' },
        { label: 'Queue', value: 'taavia-dotnet.knowledge-base.build.progressed.v1' },
        { label: 'Durable', value: 'true' },
        { label: 'AutoDelete / Exclusive', value: 'false' },
        { label: 'Manual Ack', value: 'true' },
        { label: 'DLQ', value: 'taavia-dotnet.knowledge-base.build.progressed.v1.dlq' },
      ],
    },
  },
  {
    id: 'contract',
    order: 3,
    title: 'Contract ورودی',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildProgressedV1',
    eventChips: [
      'status = Processing',
      'sequence',
      'stage',
      'progressPercent 0–90',
    ],
    note: 'در این Contract فقط status=Processing معتبر است؛ progressPercent بین ۰ تا ۹۰.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'نمونه Progress Event',
      description:
        'tenantId/brandId/buildId برای پیدا کردن Build؛ sequence ترتیب قطعی Eventهای Python برای همان Build است.',
      code: `{
  "eventId": "866ef4214d814a96ad38b754a0018afe",
  "eventType": "TaaviaKnowledgeBaseBuildProgressedV1",
  "occurredAt": "2026-07-16T09:20:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "sequence": 1,
    "status": "Processing",
    "stage": "PreparingInputs",
    "progressPercent": 0
  }
}`,
    },
  },
  {
    id: 'stages-progress',
    order: 4,
    title: 'Stage و مالکیت درصد',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Stageهای Python: PreparingInputs → ProcessingSources → GeneratingKnowledgeBase.',
      'درصد: Python 0–90 ، .NET Import 91–99 ، فعال‌سازی Version = 100.',
    ],
    actionLabel: 'Stage مجاز و قوانین درصد',
    detail: {
      type: 'bullet-list',
      title: 'Stageهای Python و قوانین Progress',
      description:
        'ResultReady و مراحل بعدی .NET با این Progress Event ارسال نمی‌شوند؛ ResultReady Contract مستقل دارد.',
      items: [
        'Stage مجاز: PreparingInputs، ProcessingSources، GeneratingKnowledgeBase',
        'ممنوع در Progress: ResultReady، ImportingResult، ValidatingResult، ActivatingVersion، Completed',
        'Python نباید بیش از ۹۰ ارسال کند؛ ۱۰۰ فقط بعد از فعال‌سازی Version در .NET',
        'درصد کاهش پیدا نمی‌کند؛ ارسال مجدد همان درصد مجاز است',
      ],
    },
  },
  {
    id: 'inbox',
    order: 5,
    title: 'Inbox سمت .NET',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Consumer = knowledge-base-build-progressed-v1',
      'UNIQUE(ConsumerName, EventId)',
      'Applied / Ignored / Rejected',
      'زیرساخت مشترک Inbox .NET',
    ],
    actionLabel: 'فیلدها و ProcessingResult',
    detail: {
      type: 'kv-list',
      title: 'Inbox و نتایج پردازش',
      description: 'Applied = تغییر Build؛ Ignored = قدیمی/تکراری؛ Rejected = نامعتبر Contract یا بیزینس.',
      items: [
        { label: 'ConsumerName', value: 'knowledge-base-build-progressed-v1' },
        { label: 'UNIQUE', value: '(ConsumerName, EventId)' },
        { label: 'Sequence / MessageHash', value: 'تشخیص قدیمی، تکراری یا Conflict' },
        { label: 'ProcessingResult', value: 'Applied=1 ، Ignored=2 ، Rejected=3' },
        { label: 'ErrorCode', value: 'دلیل Reject یا Ignore' },
      ],
    },
  },
  {
    id: 'build-validation',
    order: 6,
    title: 'اعتبارسنجی Build',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Build با TenantId + BrandId + BuildId پیدا می‌شود؛ فقط BuildId کافی نیست.',
      'Type = InitialBuild|Rebuild و Status = Queued|Processing.',
    ],
    actionLabel: 'شرایط معتبر و نامعتبر',
    detail: {
      type: 'bullet-list',
      title: 'شرایط پیدا کردن و اعتبار Build',
      description: 'اگر Build وجود نداشته باشد یا متعلق به Tenant/Brand پیام نباشد، Event نامعتبر است.',
      items: [
        'Query با هر سه شناسه: TenantId، BrandId، BuildId',
        'Type مجاز: InitialBuild یا Rebuild',
        'Status مجاز برای اعمال: Queued یا Processing',
        'عدم تطابق Tenant/Brand یا نبود Build → نامعتبر',
      ],
    },
  },
  {
    id: 'sequence',
    order: 7,
    title: 'کنترل Sequence',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'اعمال فقط اگر sequence > LastPythonEventSequence.',
      'کوچک‌تر/تکراری برابر → Ignored+Ack؛ Conflict محتوا → Rejected+DLQ.',
    ],
    actionLabel: 'همه حالت‌های Sequence',
    detail: {
      type: 'bullet-list',
      title: 'رفتار Sequence',
      description: 'فاصله Sequence مجاز است (مثلاً 2 سپس 4)؛ Event میانی دیررس بعداً Ignored می‌شود.',
      items: [
        'sequence < Last → Ignored، بدون تغییر Build، Ack',
        'sequence == Last و Status/Stage/درصد یکسان → Ignored، Ack',
        'sequence == Last با محتوای متفاوت → Rejected، PythonSequenceConflict، DLQ',
        'sequence > Last → Event جدید؛ اعتبارسنجی Stage و درصد',
      ],
    },
  },
  {
    id: 'stage-progress-rules',
    order: 8,
    title: 'کنترل Stage و درصد',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Stage جدید نباید عقب‌تر باشد؛ regression → PythonStageRegression + DLQ.',
      '0≤درصد≤90 و درصد ≥ مقدار فعلی؛ کمتر یا >90 → Rejected + DLQ.',
    ],
    actionLabel: 'ErrorCodeهای Regression',
    detail: {
      type: 'bullet-list',
      title: 'قواعد Stage و ProgressPercent',
      description: 'درصد برابر مجاز است (مثلاً Stage عوض شود ولی درصد ثابت بماند).',
      items: [
        'ترتیب: PreparingInputs → ProcessingSources → GeneratingKnowledgeBase',
        'Stage regression → PythonStageRegression → Reject without Requeue → DLQ',
        'Progress < فعلی → PythonProgressRegression → DLQ',
        'Progress > 90 → PythonProgressOutOfRange → DLQ',
      ],
    },
  },
  {
    id: 'build-update',
    order: 9,
    title: 'تغییرات Build',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Status = Processing',
      'Stage / ProgressPercent از Event',
      'LastPythonEventSequence = sequence',
      'StartedAt فقط بار اول',
    ],
    actionLabel: 'فیلدهای تغییر / بدون تغییر',
    detail: {
      type: 'kv-list',
      title: 'Update Build برای Event معتبر',
      description: 'StartedAt فقط اگر خالی باشد از Event.OccurredAt پر می‌شود و دیگر تغییر نمی‌کند.',
      items: [
        { label: 'Status', value: 'Processing' },
        { label: 'Stage / ProgressPercent', value: 'مقدار دریافتی' },
        { label: 'LastPythonEventSequence', value: 'sequence' },
        { label: 'StartedAt', value: 'COALESCE(StartedAt, OccurredAt)' },
        { label: 'بدون تغییر', value: 'FinishedAt، ResultReferenceId، VersionId، SourceRestoreMode' },
      ],
    },
  },
  {
    id: 'transaction-race',
    order: 10,
    title: 'Transaction و Race',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'بررسی EventId + Insert Inbox',
      'Load Build + Sequence/Stage/Progress',
      'Update شرطی با LastPythonEventSequence < @Sequence',
      'Commit سپس Ack',
    ],
    note: 'اگر Update صفر ردیف بزند، Build دوباره خوانده می‌شود تا قدیمی/هم‌زمان/بسته بودن مشخص شود.',
  },
  {
    id: 'errors',
    order: 11,
    title: 'خطاها',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'خطای موقت SQL → Rollback + Nack with Requeue.',
      'Contract/Build نامعتبر یا Progress روی Build بسته → Reject + DLQ.',
    ],
    actionLabel: 'جزئیات رفتار خطا',
    detail: {
      type: 'bullet-list',
      title: 'رفتار در خطا',
      description: 'قطع SignalR هیچ اثری روی مصرف Event و ذخیره Build ندارد.',
      items: [
        'Timeout / Deadlock / قطع اتصال → Rollback → Nack with Requeue',
        'Contract نامعتبر (status، Stage، درصد) → Reject without Requeue → DLQ',
        'Build پیدا نشد → Reject without Requeue → DLQ (غیرقابل Retry)',
        'Build در Importing/Completed/Failed با Sequence قدیمی → Ignored + Ack',
        'همان وضعیت با Sequence جدیدتر → ProgressReceivedForClosedBuild → DLQ',
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
      'اولین Event: Status=Processing، Stage=PreparingInputs، Progress=0، Sequence=1، Inbox=Applied، Ack.',
      'وضعیت در SQL آماده نمایش است حتی اگر Flutter به SignalR متصل نباشد.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Update Build و ثبت Inbox در یک Transaction؛ Ack فقط بعد از Commit.',
      items: [
        'یک EventId نتواند دو بار Build را تغییر دهد',
        'Sequence قدیمی Build را عقب نبرد',
        'Sequence جدید با Stage عقب‌تر رد شود',
        'Python نتواند درصد بیشتر از ۹۰ ثبت کند؛ درصد کاهش پیدا نکند',
        'StartedAt فقط با اولین Event پردازش مقدار بگیرد',
        'دریافت هم‌زمان باعث ثبت Sequence قدیمی‌تر نشود',
        'قطع SignalR روی مصرف Event اثر نگذارد',
      ],
    },
  },
];
