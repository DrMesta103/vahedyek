import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const RECEIVE_EVENT_AND_CREATE_INBOX_JOB_META: BuildVersionStepDocMeta = {
  slug: 'receive-event-and-create-inbox-job',
  title: '۳. دریافت Event در Python و ثبت Inbox / Job',
  description:
    'دریافت درخواست ساخت Knowledge Base از .NET و تبدیل آن به Job پایدار در PostgreSQL. بعد از Ack، Job حتی با Restart سرویس Python از بین نمی‌رود.',
  status: 'فعال',
  pills: ['Python Consumer', 'Inbox', 'Idempotent'],
};

export const RECEIVE_EVENT_AND_CREATE_INBOX_JOB_OVERVIEW_STEPS = [
  'دریافت Event',
  'اعتبارسنجی Contract',
  'Insert Inbox + Job',
  'Commit + Ack',
] as const;

export const RECEIVE_EVENT_AND_CREATE_INBOX_JOB_OVERVIEW_NOTE =
  'Ack فقط بعد از Commit موفق؛ Job توسط Worker Pool اجرا می‌شود نه Consumer.';

export const RECEIVE_EVENT_AND_CREATE_INBOX_JOB_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'دریافت درخواست ساخت Knowledge Base از .NET و تبدیل آن به Job پایدار در Python.',
      'بعد از Ack شدن پیام RabbitMQ، Job در PostgreSQL ذخیره شده و با Restart سرویس از بین نمی‌رود.',
    ],
  },
  {
    id: 'responsibility',
    order: 2,
    title: 'مسئولیت مرحله',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'در سمت Python دو Worker مستقل وجود دارد: Worker دریافت‌کننده پیام را از RabbitMQ می‌گیرد، Contract را اعتبارسنجی می‌کند، Inbox و Job را ثبت می‌کند و بعد از Commit موفق Ack می‌فرستد.',
      'Worker پردازش، Job ثبت‌شده را برمی‌دارد و پردازش واقعی Event، اجرای Build، دریافت Sources، پردازش AI و گزارش Progress را انجام می‌دهد.',
    ],
    actionLabel: 'محدوده خارج از این مرحله',
    detail: {
      type: 'bullet-list',
      title: 'در این مرحله انجام نمی‌شود',
      description: 'Worker دریافت‌کننده فقط پیام را پایدار می‌کند؛ Worker پردازش مسئول اجرای واقعی Job است.',
      items: [
        'Worker پردازش: دریافت Job از PostgreSQL و اجرای واقعی Event / Build',
        'پردازش فایل و متن',
        'فراخوانی AI Model',
        'دریافت Sources از .NET',
        'ساخت Knowledge Base',
        'ارسال Progress Event',
        'اجرای مستقیم Job داخل Consumer',
      ],
    },
  },
  {
    id: 'rabbitmq',
    order: 3,
    title: 'تنظیمات RabbitMQ',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Exchange = taavia.knowledge-base',
      'Queue = taavia-ai.knowledge-base.build.requested.v1',
      'Routing Key = taavia.knowledge-base.build.requested.v1',
      'Manual Ack = true',
    ],
    actionLabel: 'جزئیات تنظیمات',
    detail: {
      type: 'kv-list',
      title: 'جزئیات تنظیمات RabbitMQ',
      description: 'پیام‌های نامعتبر یا غیرقابل‌پردازش بدون Requeue به DLQ منتقل می‌شوند.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base' },
        { label: 'Exchange Type', value: 'topic' },
        { label: 'Routing Key', value: 'taavia.knowledge-base.build.requested.v1' },
        { label: 'Queue', value: 'taavia-ai.knowledge-base.build.requested.v1' },
        { label: 'Durable', value: 'true' },
        { label: 'AutoDelete', value: 'false' },
        { label: 'Exclusive', value: 'false' },
        { label: 'Manual Ack', value: 'true' },
        { label: 'DLQ', value: 'taavia-ai.knowledge-base.build.requested.v1.dlq' },
      ],
    },
  },
  {
    id: 'contract',
    order: 4,
    title: 'Contract ورودی',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildRequestedV1',
    eventChips: ['eventId', 'eventType', 'occurredAt', 'tenantId', 'brandId', 'buildId', 'buildType', 'modelAssignments'],
    note: 'فیلد اختیاری جدید در V1 نباید Consumer را متوقف کند؛ فیلدهای الزامی باید وجود داشته باشند.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'نمونه پیام Contract',
      description:
        'eventId برای Idempotency است و در Retry تغییر نمی‌کند. occurredAt زمان ایجاد در Outbox (.NET) است، نه زمان دریافت Python.',
      code: `{
  "eventId": "4db58ce97ef248e8b9bcc3a76ac64896",
  "eventType": "TaaviaKnowledgeBaseBuildRequestedV1",
  "occurredAt": "2026-07-15T19:30:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "buildType": "InitialBuild",
    "modelAssignments": [
      {
        "modelType": "document_extraction",
        "providerType": "mistral",
        "model": "mistral-ocr-latest"
      },
      {
        "modelType": "text_generation",
        "providerType": "deepseek",
        "model": "deepseek-chat"
      }
    ]
  }
}`,
      fields: [
        { label: 'eventId', value: 'string / globally unique', description: 'شناسه یکتای سراسری Event و کلید Idempotency است؛ در Retry نباید تغییر کند.' },
        { label: 'eventType', value: 'string', description: 'نام Event و نسخه آن است؛ Worker پردازش براساس همین نام Contract و Handler مناسب را انتخاب می‌کند.' },
        { label: 'occurredAt', value: 'ISO-8601 UTC', description: 'زمان تولید Event در Outbox سرویس .NET است، نه زمان دریافت آن توسط Python.' },
        { label: 'payload', value: 'JSON object', description: 'داده کسب‌وکاری پیام است و schema و اعتبارسنجی تخصصی آن به eventType و Handler مربوط می‌شود.' },
        { label: 'payload.tenantId', value: 'string', description: 'Tenant مالک درخواست را مشخص می‌کند تا جداسازی داده و دسترسی رعایت شود.' },
        { label: 'payload.brandId', value: 'string', description: 'Brand هدف ساخت Knowledge Base را مشخص می‌کند.' },
        { label: 'payload.buildId', value: 'string', description: 'شناسه Build و کلید ارتباط Job، Progress و نتیجه با درخواست اصلی است.' },
        { label: 'payload.buildType', value: 'InitialBuild | Rebuild', description: 'نوع عملیات را مشخص می‌کند تا Handler رفتار مربوط به ساخت اولیه یا بازسازی را اجرا کند.' },
      ],
    },
  },
  {
    id: 'validations',
    order: 5,
    title: 'اعتبارسنجی Contract',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'قبل از ثبت در Inbox، Envelope عمومی شامل eventId، eventType، occurredAt و payload بررسی می‌شود.',
      'نسخه داخل نام eventType قرار دارد و Eventهای مختلف پذیرفته می‌شوند؛ انتخاب Contract و Handler مناسب بعداً توسط Worker پردازش انجام می‌شود.',
    ],
    actionLabel: 'مشاهده همه اعتبارسنجی‌ها',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی‌های Contract',
      description: 'این مرحله فقط سلامت عمومی پیام و قابلیت ثبت Idempotent را بررسی می‌کند و منطق Event-specific در Worker پردازش انجام می‌شود.',
      items: [
        'eventId خالی نباشد و در کل سیستم یکتا باشد',
        'eventId به‌عنوان کلید Idempotency استفاده شود',
        'eventType خالی نباشد و نسخه‌ی Event را در نام خود داشته باشد',
        'eventType برای انتخاب Contract و Handler ذخیره شود',
        'occurredAt معتبر و دارای Timezone باشد',
        'payload معتبر و قابل ذخیره‌سازی به‌صورت JSON باشد',
        'در صورت تکرار eventId، Inbox یا Job دوم ساخته نشود',
      ],
    },
  },
  {
    id: 'inbox',
    order: 6,
    title: 'جدول Inbox',
    tag: 'بک',
    kind: 'build-summary',
      summaryItems: [
       'integration_inbox_messages',
       'UNIQUE(event_id)',
       'consumer = rabbitmq-ingress-worker',
       'rabbitmq_metadata = jsonb',
       'Immutable پس از ثبت',
    ],
    actionLabel: 'جزئیات Inbox',
    detail: {
      type: 'kv-list',
      title: 'ساختار و قوانین Inbox',
      description:
        'Inbox پیام را مستقل از نوع Event پایدار می‌کند. eventId یکتا است و رکورد RabbitMQ و payload بعد از ثبت ویرایش یا حذف فوری نمی‌شود.',
      items: [
        { label: 'id', value: 'bigint identity', description: 'شناسه داخلی رکورد Inbox در PostgreSQL است و جایگزین eventId سراسری نمی‌شود.' },
        { label: 'consumer_name', value: 'varchar(150) = rabbitmq-ingress-worker', description: 'مشخص می‌کند کدام Worker پیام را از RabbitMQ دریافت و در Inbox ثبت کرده است.' },
        { label: 'event_id', value: 'varchar(64)', description: 'eventId سراسری پیام است و برای تشخیص Duplicate و Idempotency استفاده می‌شود.' },
        { label: 'event_type', value: 'varchar(200)', description: 'نام Event را نگه می‌دارد؛ Worker پردازش با آن Handler مناسب را انتخاب می‌کند.' },
        { label: 'message_body', value: 'jsonb', description: 'Envelope و payload خام را برای Audit، Replay و پردازش مجدد ذخیره می‌کند.' },
        { label: 'rabbitmq_metadata', value: 'jsonb', description: 'اطلاعات RabbitMQ مانند exchange، queue، routing key، delivery tag و headers را نگه می‌دارد.' },
        { label: 'message_hash', value: 'char(64) SHA-256', description: 'برای تشخیص تغییر محتوای پیام با eventId یکسان استفاده می‌شود؛ اختلاف آن خطای Idempotency است.' },
        { label: 'occurred_at', value: 'timestamptz (UTC)', description: 'زمان رخداد در Producer و Outbox است.' },
        { label: 'received_at', value: 'timestamptz (UTC)', description: 'زمان دریافت پیام توسط rabbitmq-ingress-worker است.' },
        { label: 'processed_at', value: 'timestamptz (UTC)', description: 'پس از پایان موفق پردازش توسط Worker دوم تکمیل می‌شود و قبل از آن null است.' },
        { label: 'status', value: 'Received | Processed | Rejected | Unsupported', description: 'وضعیت چرخه عمر پیام در Inbox را مشخص می‌کند.' },
        { label: 'PRIMARY KEY', value: 'id', description: 'یکپارچگی و ارجاع داخلی رکورد را تضمین می‌کند.' },
        { label: 'UNIQUE', value: 'event_id', description: 'اجازه ثبت دوباره یک Event را نمی‌دهد؛ Duplicate معتبر باید Ack شود و Job دوم نسازد.' },
      ],
    },
  },
  {
    id: 'job',
    order: 7,
    title: 'جدول Job',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'knowledge_base_build_jobs',
      'Status = Queued',
      'Stage = Queued',
      'ProgressPercent = 0',
      'UNIQUE(build_id)',
    ],
    actionLabel: 'جزئیات Job',
    detail: {
      type: 'kv-list',
      title: 'مقادیر اولیه و Constraintهای Job',
      description:
        'Consumer عملیات سنگین اجرا نمی‌کند. Job نماینده پایدار Build در Python است و Worker Pool آن را اجرا می‌کند. Progress حداکثر تا ۹۰٪ توسط Python مدیریت می‌شود.',
      items: [
        { label: 'build_id', value: 'string', description: 'Buildی که این Job باید پردازش کند و مرجع ارتباط با سرویس .NET است.' },
        { label: 'inbox_message_id', value: 'bigint FK', description: 'Job را به پیام ثبت‌شده در Inbox متصل می‌کند تا منبع پردازش مشخص باشد.' },
        { label: 'Status', value: 'Queued', description: 'وضعیت چرخه اجرای Job؛ Worker دوم آن را به Processing و سپس نتیجه یا Retry/Failed می‌برد.' },
        { label: 'Stage', value: 'Queued', description: 'مرحله کسب‌وکاری پردازش است و با Retry به مرحله قبلی برنمی‌گردد.' },
        { label: 'ProgressPercent', value: '0', description: 'درصد پیشرفت گزارش‌شده از Python است؛ Python حداکثر تا ۹۰٪ را مالک است.' },
        { label: 'AttemptCount', value: '0', description: 'تعداد دفعات تلاش Worker پردازش برای این Job را نگه می‌دارد.' },
        { label: 'AvailableAt', value: 'UTC Now', description: 'اولین زمانی است که Job برای Claim و اجرا توسط Worker آماده است؛ برای Backoff تغییر می‌کند.' },
        { label: 'LockedBy / LockedUntil', value: 'null', description: 'مالک و مهلت Lease فعلی را مشخص می‌کند تا اجرای هم‌زمان کنترل شود.' },
        { label: 'LastEventSequence', value: '0', description: 'آخرین شماره Progress Event ارسال‌شده را نگه می‌دارد تا ترتیب و تکرار کنترل شود.' },
        { label: 'ResultReferenceId', value: 'null', description: 'پس از موفقیت، ارجاع پایدار نتیجه‌ای است که API یا gRPC آن را به .NET ارائه می‌کند.' },
        { label: 'StartedAt / FinishedAt', value: 'null', description: 'زمان واقعی شروع و پایان پردازش Job را ثبت می‌کند.' },
        { label: 'UNIQUE', value: 'build_id , inbox_message_id', description: 'برای جلوگیری از ثبت دوباره Job متناظر با همان درخواست و پیام Inbox استفاده می‌شود.' },
        { label: 'CHECK progress', value: 'BETWEEN 0 AND 90', description: 'اجازه نمی‌دهد Python قبل از تحویل نتیجه نهایی، Progress را خارج از محدوده مسئولیت خود ثبت کند.' },
        { label: 'Worker index', value: '(status, available_at)', description: 'پیدا کردن سریع Jobهای قابل اجرا را برای Worker Pool ممکن می‌کند.' },
        { label: 'Lease index', value: 'locked_until WHERE NOT NULL', description: 'Jobهای دارای Lease منقضی‌شده را برای reclaim سریع پیدا می‌کند.' },
      ],
    },
  },
  {
    id: 'enums',
    order: 8,
    title: 'Enumها',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'BuildType: InitialBuild | Rebuild',
      'JobStatus: Queued → … → ResultReady | Failed',
      'JobStage: Queued → PreparingInputs → …',
      'Stage کاهش پیدا نمی‌کند',
    ],
    actionLabel: 'جزئیات Enum و Transition',
    detail: {
      type: 'kv-list',
      title: 'Enumها و Transitionهای مجاز',
      description:
        'در Retry فقط Status تغییر می‌کند؛ Stage به مرحله قبلی بازگردانده نمی‌شود. ResultReady و Failed وضعیت Terminal هستند.',
      items: [
        { label: 'BuildType', value: 'InitialBuild = 1 ، Rebuild = 2', description: 'نوع عملیات Build است؛ نسخه جداگانه‌ای از Event نداریم و version در eventType می‌آید.' },
        { label: 'JobStatus', value: 'Queued → Processing', description: 'Job ساخته شده و پس از Claim توسط Worker دوم وارد پردازش می‌شود.' },
        { label: 'JobStatus', value: 'Processing → RetryScheduled | ResultReady | Failed', description: 'خروجی پردازش موفق، خطای قابل Retry یا خطای نهایی را مشخص می‌کند.' },
        { label: 'JobStatus', value: 'RetryScheduled → Processing', description: 'پس از رسیدن AvailableAt، تلاش بعدی مجاز است.' },
        {
          label: 'JobStage',
          value: 'Queued → PreparingInputs → ProcessingSources → GeneratingKnowledgeBase → ResultReady',
          description: 'مراحل پیشرفت کسب‌وکاری Job هستند و در Retry کاهش پیدا نمی‌کنند.',
        },
        {
          label: 'ResultReady',
          value: 'نتیجه Durable آماده gRPC است؛ نه فعال‌شدن Version در .NET',
          description: 'Python فقط نتیجه پایدار و قابل دریافت را آماده می‌کند؛ مالکیت فعال‌سازی Version با .NET است.',
        },
      ],
    },
  },
  {
    id: 'transaction',
    order: 9,
    title: 'Transaction',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'دریافت Event از RabbitMQ',
      'اعتبارسنجی Contract + Canonicalize + MessageHash',
      'Begin TX → Inbox + Job',
      'Commit سپس Ack',
    ],
    note: 'Ack فقط بعد از Commit موفق ارسال می‌شود.',
  },
  {
    id: 'duplicate',
    order: 10,
    title: 'رفتار Duplicate',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'EventId + MessageHash یکسان → Job جدید ساخته نمی‌شود و Ack می‌شود.',
      'EventId یکسان با Hash متفاوت → DLQ.',
    ],
    actionLabel: 'مشاهده همه حالت‌ها',
    detail: {
      type: 'bullet-list',
      title: 'حالت‌های Duplicate',
      description: 'Python نباید Job دوم بسازد یا Job قبلی را بازنویسی کند.',
      items: [
        'همان EventId و همان MessageHash: Inbox موجود است → Job جدید ساخته نمی‌شود → Ack',
        'همان EventId ولی MessageHash متفاوت: Contract Violation → Reject without Requeue → DLQ → Log + Sentry',
        'EventId جدید ولی شناسه‌ی کسب‌وکاری تکراری: تصمیم‌گیری درباره Reject یا پردازش مجدد توسط Handler همان Event انجام می‌شود',
      ],
    },
  },
  {
    id: 'errors-ownership',
    order: 11,
    title: 'خطا و مالکیت',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'خطای موقت PostgreSQL → Rollback و Nack with Requeue.',
      'پیام نامعتبر → Reject without Requeue و DLQ. Source of Truth اجرا = PostgreSQL Python.',
    ],
    actionLabel: 'جزئیات خطا و مالکیت',
    detail: {
      type: 'bullet-list',
      title: 'رفتار خطا و مالکیت داده',
      description: 'Consumer نباید در این مرحله API یا gRPC مربوط به .NET را برای تأیید Brand یا Build فراخوانی کند.',
      items: [
        'قطع اتصال / Timeout / Deadlock / Failover: Rollback → Nack with Requeue',
        'پیام نامعتبر (Envelope، eventId، eventType، payload یا تاریخ): Reject without Requeue → DLQ → Log + Sentry',
        'قطع قبل از Commit: داده‌ای ثبت نشده و پیام دوباره تحویل می‌شود',
        'قطع بعد از Commit و قبل از Ack: پیام دوباره تحویل می‌شود؛ اگر eventId و messageHash یکسان باشند، Inbox Duplicate تشخیص داده می‌شود، Job دوم ساخته نمی‌شود و پیام Ack می‌شود',
        'همان eventId با messageHash متفاوت: نقض Idempotency است و پیام بدون Requeue به DLQ می‌رود',
        '.NET مالک BuildId، TenantId، BrandId و BuildType است',
        'Python مالک وضعیت Job، Attempt، Lease، خطا و ResultReferenceId است',
        'RabbitMQ فقط انتقال Event است و Source of Truth نیست',
        'PostgreSQL Python = Source of Truth اجرای Job',
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
      'موفق: RabbitMQ Acked، Inbox Persisted، Job و Build برابر Queued با Progress 0.',
      'در این مرحله Progress Event به .NET ارسال نمی‌شود.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'پس از پایان موفق، Job فقط توسط Worker Pool اجرا می‌شود.',
      items: [
        'دریافت دوباره همان Event باعث ساخت Job دوم نشود',
        'Ack قبل از Commit PostgreSQL ارسال نشود',
        'Restart شدن Consumer بعد از Commit باعث ازبین‌رفتن Job نشود',
        'پیام نامعتبر وارد Requeue نامحدود نشود',
        'EventId یکسان با محتوای متفاوت به DLQ منتقل شود',
        'هر Event معتبر پس از ذخیره در Inbox توسط Handler متناظر با eventType پردازش شود',
        'Consumer هیچ پردازش AI سنگینی انجام ندهد',
        'Job فقط توسط Worker Pool اجرا شود',
      ],
    },
  },
];
