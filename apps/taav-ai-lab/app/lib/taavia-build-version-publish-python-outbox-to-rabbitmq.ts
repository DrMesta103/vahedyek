import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_META: BuildVersionStepDocMeta = {
  slug: 'publish-python-outbox-to-rabbitmq',
  title: '۵. انتشار Event از Python Outbox به RabbitMQ',
  description:
    'انتشار مطمئن Eventهای وضعیت Build که قبلاً همراه با تغییر Job در PostgreSQL ثبت شده‌اند. قطع RabbitMQ یا Restart Python باعث ازدست‌رفتن Event نمی‌شود؛ پیام فقط بعد از Publisher Confirm منتشرشده محسوب می‌شود.',
  status: 'فعال',
  pills: ['Outbox Publisher', 'Publisher Confirm', 'At-least-once'],
};

export const PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_OVERVIEW_STEPS = [
  'Claim Outbox (SKIP LOCKED)',
  'Publish + Confirm',
  'ثبت PublishedAt',
  'Retry / Backoff در خطا',
] as const;

export const PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_OVERVIEW_NOTE =
  'این Worker وضعیت knowledge_base_build_jobs را تغییر نمی‌دهد؛ ترتیب بیزینسی با sequence کنترل می‌شود.';

export const PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'انتشار مطمئن Eventهایی که همراه با تغییر Job در PostgreSQL ثبت شده‌اند.',
      'قطع RabbitMQ یا Restart مانع انتشار نمی‌شود؛ فقط بعد از Confirm منتشرشده محسوب می‌شود.',
    ],
  },
  {
    id: 'responsibility',
    order: 2,
    title: 'مسئول این مرحله',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Background Worker جدا: Python Integration Outbox Publisher.',
      'Claim → Publish → Confirm → PublishedAt → Retry/Backoff؛ بدون تغییر Job.',
    ],
    actionLabel: 'محدوده خارج از این مرحله',
    detail: {
      type: 'bullet-list',
      title: 'وظایف و ممنوعیت‌ها',
      description: 'این Worker از Worker پردازش Knowledge Base جداست.',
      items: [
        'Claim کردن Outbox Message',
        'Publish در RabbitMQ و دریافت Publisher Confirm',
        'ثبت PublishedAt و مدیریت Retry / Backoff',
        'نباید وضعیت knowledge_base_build_jobs را تغییر دهد',
      ],
    },
  },
  {
    id: 'claimable',
    order: 3,
    title: 'پیام‌های قابل انتشار',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'PublishedAt = null',
      'AvailableAt <= UTC Now',
      'LockedUntil = null یا منقضی',
      'ترتیب: available_at, created_at, id',
    ],
    actionLabel: 'جزئیات شرط Claim',
    detail: {
      type: 'kv-list',
      title: 'شرط انتخاب Outbox',
      description: 'فقط پیام‌های منتشرنشده و آماده Claim می‌شوند.',
      items: [
        { label: 'PublishedAt', value: 'null' },
        { label: 'AvailableAt', value: '<= UTC Now' },
        { label: 'LockedUntil', value: 'null یا < UTC Now' },
        { label: 'ترتیب', value: 'available_at, created_at, id' },
      ],
    },
  },
  {
    id: 'claim-query',
    order: 4,
    title: 'Claim Outbox Message',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'انتخاب با FOR UPDATE SKIP LOCKED داخل Transaction.',
      'LockedBy + LockedUntil + PublishAttemptCount++ ؛ Lease پیشنهادی ۳۰ ثانیه.',
    ],
    actionLabel: 'SQL و فیلدهای Claim',
    detail: {
      type: 'bullet-list',
      title: 'Query و به‌روزرسانی Claim',
      description:
        'PublishLeaseDuration = 30 seconds و از Configuration قابل‌تغییر است. قفل مانع Claim هم‌زمان است ولی Exactly Once نیست؛ .NET باید Idempotent باشد.',
      items: [
        'SELECT id FROM integration_outbox_messages',
        'WHERE published_at IS NULL AND available_at <= NOW()',
        'AND (locked_until IS NULL OR locked_until < NOW())',
        'ORDER BY available_at, created_at, id FOR UPDATE SKIP LOCKED LIMIT 1',
        'LockedBy = PublisherInstanceId',
        'LockedUntil = UTC Now + PublishLeaseDuration',
        'PublishAttemptCount = PublishAttemptCount + 1',
      ],
    },
  },
  {
    id: 'contract',
    order: 5,
    title: 'Contract و RabbitMQ',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildProgressedV1',
    eventChips: [
      'Exchange = taavia.knowledge-base',
      'Routing Key = …progressed.v1',
      'Persistent',
      'MessageId = EventId',
    ],
    note: 'Envelope داخل Body منبع قرارداد است؛ Headerها برای Routing، Monitoring و Trace هستند.',
    actionLabel: 'مشاهده Payload و Headerها',
    detail: {
      type: 'json',
      title: 'نمونه پیام و تنظیمات Publish',
      description:
        'DeliveryMode=Persistent، ContentType=application/json، MessageId=EventId، CorrelationId=BuildId، Type=EventType.',
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
    id: 'confirm-success',
    order: 6,
    title: 'Publisher Confirm و موفقیت',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Publish Message',
      'انتظار Broker Confirm',
      'ثبت PublishedAt',
      'آزادسازی Lock',
    ],
    note: 'فقط بعد از Confirm، رکورد منتشرشده محسوب می‌شود؛ محتوای Event و event_id تغییر نمی‌کنند.',
  },
  {
    id: 'publish-success-update',
    order: 7,
    title: 'ثبت موفقیت Publish',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'published_at = NOW()',
      'locked_by / locked_until = null',
      'last_error = null',
      'فقط اگر هنوز published_at خالی باشد',
    ],
    actionLabel: 'شرط UPDATE موفقیت',
    detail: {
      type: 'kv-list',
      title: 'UPDATE پس از Confirm',
      description: 'پس از مقدارگرفتن published_at همان رکورد دوباره Publish نمی‌شود.',
      items: [
        { label: 'published_at', value: 'NOW()' },
        { label: 'locked_by', value: 'NULL' },
        { label: 'locked_until', value: 'NULL' },
        { label: 'last_error', value: 'NULL' },
        { label: 'شرط', value: 'published_at IS NULL AND locked_by = PublisherInstanceId' },
        { label: 'Immutable', value: 'Event body ، event_id ، created_at' },
      ],
    },
  },
  {
    id: 'retry-backoff',
    order: 8,
    title: 'شکست Publish و Backoff',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'خطاهای موقت: PublishedAt خالی می‌ماند؛ AvailableAt = زمان Retry؛ Lock آزاد می‌شود.',
      'Backoff: 5s → 15s → 30s → 60s → 5m (+ Jitter)؛ Alert بعد از ۱۰ Attempt.',
    ],
    actionLabel: 'جزئیات Retry و Backoff',
    detail: {
      type: 'bullet-list',
      title: 'Retry، Backoff و Alert',
      description:
        'EventId و Body تغییر نمی‌کنند و Event جدید ساخته نمی‌شود. Retry تا انتشار موفق ادامه دارد؛ Outbox حذف نمی‌شود.',
      items: [
        'خطاهای Retry: قطع اتصال، Confirm نرسیده، Timeout، Channel بسته',
        'PublishedAt=null ، LastError=خلاصه ، LockedBy/LockedUntil=null',
        'Attempt 1→5s ، 2→15s ، 3→30s ، 4→60s ، 5+→5 minutes ± Jitter',
        'Alert after 10 failed publish attempts (عملیات متوقف نمی‌شود)',
      ],
    },
  },
  {
    id: 'at-least-once',
    order: 9,
    title: 'At-least-once و ممنوعیت Event جدید',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Confirm مبهم ممکن است باعث Publish تکراری با همان EventId/Sequence شود.',
      'در Retry فقط فیلدهای عملیاتی Outbox تغییر می‌کنند؛ Payload ثابت می‌ماند.',
    ],
    actionLabel: 'قواعد Idempotency',
    detail: {
      type: 'bullet-list',
      title: 'تکرار مجاز و فیلدهای ثابت',
      description: '.NET پیام دوم را Duplicate تشخیص می‌دهد و بدون تغییر Build، Ack می‌کند.',
      items: [
        'تکرار مجاز: EventId، BuildId، Sequence و Body یکسان',
        'ثابت در Retry: EventId، EventType، OccurredAt، Sequence، Payload، MessageBody',
        'قابل‌تغییر: PublishAttemptCount، AvailableAt، LockedBy، LockedUntil، LastError، PublishedAt',
      ],
    },
  },
  {
    id: 'crash-order',
    order: 10,
    title: 'Crash و ترتیب Event',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Crash قبل/بعد Publish با Lease و Idempotency .NET پوشش داده می‌شود.',
      'ترتیب بیزینسی با sequence است؛ نه ترتیب دریافت RabbitMQ.',
    ],
    actionLabel: 'سناریوهای Crash و sequence',
    detail: {
      type: 'bullet-list',
      title: 'Crash Scenario و کنترل ترتیب',
      description:
        'چند Publisher و Retry طولانی می‌توانند ترتیب رسیدن را به هم بزنند؛ .NET فقط Sequence جدیدتر را اعمال می‌کند.',
      items: [
        'Crash قبل از Publish → Lease منقضی → Publisher دیگر Claim می‌کند',
        'Crash بعد از Publish و قبل از Confirm → ممکن است دوباره Publish شود',
        'Crash بعد از Confirm و قبل از PublishedAt → Publish مجدد + Idempotency در .NET',
        'Crash بعد از PublishedAt → پیام دوباره انتخاب نمی‌شود',
        'ترتیب صحیح = فیلد sequence در Payload',
      ],
    },
  },
  {
    id: 'monitoring',
    order: 11,
    title: 'Monitoring',
    tag: 'بک',
    kind: 'checklist',
    items: [
      'تعداد Outboxهای منتشرنشده',
      'سن قدیمی‌ترین پیام منتشرنشده',
      'تعداد Publish موفق / ناموفق / Retry',
      'مدت‌زمان Publish',
      'پیام‌های با بیش از ۱۰ Attempt',
      'هشدار: oldest unpublished age > 5 minutes',
    ],
  },
  {
    id: 'output-acceptance',
    order: 12,
    title: 'خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'موفق: Outbox.PublishedAt پر شده؛ RabbitMQ دارای Event؛ Job همچنان Processing؛ .NET ممکن است هنوز Queued باشد.',
      'قطع RabbitMQ Event را حذف نمی‌کند؛ بدون Confirm منتشرشده علامت نمی‌خورد.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'انتشار تکراری با همان EventId قابل‌قبول است و توسط .NET کنترل می‌شود.',
      items: [
        'قطع RabbitMQ باعث حذف یا گم‌شدن Event نشود',
        'بدون Publisher Confirm منتشرشده علامت نخورد',
        'Retry باعث EventId یا Sequence جدید نشود',
        'چند Publisher نتوانند هم‌زمان یک Outbox Row را Claim کنند',
        'Crash بعد از Publish باعث ناسازگاری دائمی نشود',
        'پیام منتشرشده مجدداً انتخاب نشود',
        'ترتیب بیزینسی به sequence وابسته باشد، نه ترتیب RabbitMQ',
      ],
    },
  },
];
