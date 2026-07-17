import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const START_WORKER_POOL_AND_ATTEMPT_META: BuildVersionStepDocMeta = {
  slug: 'start-worker-pool-and-attempt',
  title: '۴. برداشتن Job توسط Python Worker Pool و شروع Attempt',
  description:
    'Worker Pool یک Job آماده را از PostgreSQL برمی‌دارد و اجرای واقعی Build را آغاز می‌کند. یک Job هم‌زمان فقط در اختیار یک Worker است؛ شروع پردازش پایدار ثبت می‌شود و Crash باعث گم‌شدن دائمی Job نمی‌شود.',
  status: 'فعال',
  pills: ['Worker Pool', 'Lease', 'Python Outbox'],
};

export const START_WORKER_POOL_AND_ATTEMPT_OVERVIEW_STEPS = [
  'Claim Job (SKIP LOCKED)',
  'Lease + LockToken',
  'Update Job + Sequence',
  'Insert Outbox + Commit',
] as const;

export const START_WORKER_POOL_AND_ATTEMPT_OVERVIEW_NOTE =
  'Publish مستقیم RabbitMQ انجام نمی‌شود؛ Event توسط Python Outbox Worker منتشر می‌شود.';

export const START_WORKER_POOL_AND_ATTEMPT_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'Worker Pool یک Job آماده را Claim می‌کند و اجرای واقعی Build را آغاز می‌کند.',
      'یک Job هم‌زمان فقط یک مالک دارد؛ پردازش تکراری بین Instanceها رخ نمی‌دهد؛ شروع پایدار و crash-safe است.',
    ],
  },
  {
    id: 'responsibility',
    order: 2,
    title: 'مسئولیت مرحله',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Claim → Lease → افزایش AttemptCount → Status=Processing → Stage → Sequence → ثبت Outbox.',
      'Sources، AI، نتیجه نهایی و Publish مستقیم RabbitMQ در این مرحله انجام نمی‌شود.',
    ],
    actionLabel: 'راهنمای مسئولیت مرحله',
    detail: {
      type: 'tabs',
      title: 'راهنمای مسئولیت Worker Pool',
      description: 'این مرحله فقط Job را Claim می‌کند، مالکیت آن را می‌گیرد و شروع پردازش را پایدار ثبت می‌کند.',
      tabs: [
        {
          id: 'does',
          label: 'در این مرحله انجام می‌شود',
          description: 'Worker Pool برای هر دور Poll این مسیر را اجرا می‌کند:',
          items: [
            'یک Job با Status برابر Queued یا RetryScheduled و AvailableAt رسیده را با FOR UPDATE SKIP LOCKED انتخاب می‌کند.',
            'در همان Transaction، locked_by، lock_token و locked_until را ثبت می‌کند تا Job فقط مالک واحد داشته باشد.',
            'AttemptCount را یک واحد افزایش می‌دهد؛ در اولین Attempt وضعیت را Processing و مرحله را PreparingInputs می‌کند.',
            'برای شروع پردازش یک Event در integration_outbox_messages ثبت می‌کند و Job و Outbox را با هم Commit می‌کند.',
            'بعد از Commit موفق، اجرای واقعی Build را به Worker پردازش می‌سپارد؛ Heartbeat نیز Lease را تمدید می‌کند.',
          ],
        },
        {
          id: 'does-not',
          label: 'در این مرحله انجام نمی‌شود',
          description: 'این کارها مسئولیت مراحل بعدی یا Workerهای دیگر هستند:',
          items: [
            'دریافت Sources از .NET و پردازش فایل‌ها در این مرحله انجام نمی‌شود.',
            'اجرای AI Model و تولید نتیجه نهایی در این مرحله انجام نمی‌شود.',
            'انتشار مستقیم Event در RabbitMQ انجام نمی‌شود؛ Python Outbox Worker رکورد Outbox را بعداً Publish می‌کند.',
            'فعال‌سازی Version یا تغییر وضعیت نهایی Build در .NET در این مرحله انجام نمی‌شود.',
          ],
        },
      ],
    },
  },
  {
    id: 'worker-pool',
    order: 3,
    title: 'Worker Pool',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'worker_instance_id یکتا per Process',
      'نمونه: taavia-ai-kb-worker-03-550e8400',
      'ذخیره در locked_by',
      'چند Worker در هر Instance',
    ],
    actionLabel: 'جزئیات شناسه Worker',
    detail: {
      type: 'kv-list',
      title: 'شناسه Instance و locked_by',
      description:
        'شناسه در Startup ساخته می‌شود و تا خاموش‌شدن همان Process ثابت می‌ماند. مقدار آن در locked_by ذخیره می‌شود.',
      items: [
        { label: 'فیلد', value: 'worker_instance_id' },
        { label: 'نمونه', value: 'taavia-ai-kb-worker-03-550e8400' },
        { label: 'ذخیره در Job', value: 'locked_by' },
        { label: 'عمر شناسه', value: 'از Startup تا Shutdown همان Process' },
        { label: 'تعداد Worker', value: 'هر Instance می‌تواند چند Worker داشته باشد' },
      ],
    },
  },
  {
    id: 'lock-token',
    order: 4,
    title: 'lock_token',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فیلد lock_token uuid در هر Claim مقدار UUID جدید می‌گیرد.',
      'Worker قدیمی بعد از ازدست‌دادن Lease دیگر اجازه تغییر Job را ندارد.',
    ],
    actionLabel: 'شرط Update با LockToken',
    detail: {
      type: 'bullet-list',
      title: 'بررسی LockToken در Updateها',
      description:
        'locked_by فقط Instance را نشان می‌دهد؛ lock_token جلوی Update توسط Worker قبلی بعد از Restart یا Claim مجدد را می‌گیرد.',
      items: [
        'WHERE id = @jobId',
        'AND status = @processingStatus',
        'AND lock_token = @lockToken',
        'در هر Claim: lock_token = UUID جدید',
      ],
    },
  },
  {
    id: 'claimable-jobs',
    order: 5,
    title: 'Jobهای قابل Claim',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط Status برابر Queued یا RetryScheduled با AvailableAt <= UTC Now.',
      'Jobهای Processing مستقیماً Claim نمی‌شوند؛ حتی اگر Lease منقضی شده باشد.',
    ],
    actionLabel: 'جزئیات انتخاب و Recovery',
    detail: {
      type: 'bullet-list',
      title: 'شرایط Claim و محدودیت Processing',
      description:
        'بازیابی Jobهای Processing با Lease منقضی‌شده یک فلو مستقل Recovery است و در این مرحله انجام نمی‌شود.',
      items: [
        'Status = Queued یا RetryScheduled',
        'AvailableAt <= UTC Now',
        'Status = Processing توسط Worker دیگر انتخاب نمی‌شود',
        'Lease منقضی‌شده روی Processing → Recovery جداگانه',
      ],
    },
  },
  {
    id: 'claim-query',
    order: 6,
    title: 'Query انتخاب Job',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'انتخاب داخل Transaction با FOR UPDATE SKIP LOCKED و LIMIT 1.',
      'ترتیب: AvailableAt، CreatedAt، Id — Jobهای قدیمی‌تر و آماده‌تر اولویت دارند.',
    ],
    actionLabel: 'مشاهده SQL و دلیل Lock',
    detail: {
      type: 'bullet-list',
      title: 'Query و دلیل FOR UPDATE / SKIP LOCKED',
      description:
        'رکورد تا پایان Transaction قفل است؛ Worker منتظر Job قفل‌شده نمی‌ماند و Job آماده بعدی را می‌گیرد.',
      items: [
        'SELECT id FROM knowledge_base_build_jobs',
        'WHERE status IN (Queued, RetryScheduled) AND available_at <= NOW()',
        'ORDER BY available_at, created_at, id',
        'FOR UPDATE SKIP LOCKED LIMIT 1',
        'FOR UPDATE: قفل تا پایان Transaction برای همان Worker',
        'SKIP LOCKED: بدون انتظار روی Job قفل‌شده توسط Worker دیگر',
      ],
    },
  },
  {
    id: 'lease',
    order: 7,
    title: 'تنظیمات Lease',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Lease Duration = 60 seconds',
      'Heartbeat Interval = 20 seconds',
      'قابل‌تغییر از Configuration',
      'LockedUntil = Now + LeaseDuration',
    ],
    actionLabel: 'فیلدهای Claim',
    detail: {
      type: 'kv-list',
      title: 'مقادیر Lease هنگام Claim',
      description: 'Worker در طول پردازش Lease را با Heartbeat تمدید می‌کند.',
      items: [
        { label: 'Lease Duration', value: '60 seconds (configurable)' },
        { label: 'Heartbeat Interval', value: '20 seconds (configurable)' },
        { label: 'LockedBy', value: 'WorkerInstanceId' },
        { label: 'LockToken', value: 'UUID جدید' },
        { label: 'LockedUntil', value: 'UTC Now + LeaseDuration' },
      ],
    },
  },
  {
    id: 'claim-updates',
    order: 8,
    title: 'تغییرات Job هنگام Claim',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'اولین Attempt (از Queued): Processing + PreparingInputs + Progress 0 + StartedAt.',
      'Retry (از RetryScheduled): Stage و Progress بدون تغییر؛ StartedAt بازنویسی نمی‌شود.',
    ],
    actionLabel: 'جدول تغییرات فیلدها',
    detail: {
      type: 'bullet-list',
      title: 'اولین Attempt در برابر Retry',
      description: 'Stage و درصد در Retry نباید کاهش پیدا کنند. AttemptCount در هر دو حالت +1 می‌شود.',
      items: [
        'Queued → Status=Processing، Stage=PreparingInputs، Progress=0، Attempt+1، StartedAt=Now',
        'RetryScheduled → Status=Processing، Stage بدون تغییر، Progress بدون تغییر، Attempt+1',
        'Retry: StartedAt بدون تغییر؛ UpdatedAt = UTC Now در هر دو حالت',
      ],
    },
  },
  {
    id: 'sequence-outbox',
    order: 9,
    title: 'Sequence و Python Outbox',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'LastEventSequence = LastEventSequence + 1',
      'اولین Attempt → Sequence = 1',
      'جدول: integration_outbox_messages',
      'Job + Outbox در یک Transaction',
    ],
    actionLabel: 'ساختار Outbox',
    detail: {
      type: 'kv-list',
      title: 'integration_outbox_messages',
      description:
        'رکورد Outbox بعد از ساخت نباید ویرایش محتوایی شود. Sequence تکراری یا کوچک‌تر در .NET نادیده گرفته می‌شود (LastPythonEventSequence).',
      items: [
        { label: 'id', value: 'bigint identity' },
        { label: 'event_id', value: 'varchar(64) UNIQUE' },
        { label: 'event_type', value: 'varchar(200)' },
        { label: 'aggregate_id', value: 'varchar(64) = BuildId' },
        { label: 'exchange_name', value: 'varchar(200)' },
        { label: 'routing_key', value: 'varchar(200)' },
        { label: 'message_body', value: 'jsonb' },
        { label: 'created_at / available_at', value: 'timestamptz (UTC Now)' },
        { label: 'publish_attempt_count', value: '0 ، CHECK >= 0' },
        { label: 'locked_by / locked_until', value: 'null' },
        { label: 'published_at / last_error', value: 'null' },
      ],
    },
  },
  {
    id: 'progress-event',
    order: 10,
    title: 'Event شروع پردازش',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildProgressedV1',
    eventChips: [
      'sequence',
      'status = Processing',
      'stage = PreparingInputs',
      'progressPercent = 0',
    ],
    note: 'Exchange = taavia.knowledge-base · Routing Key = taavia.knowledge-base.build.progressed.v1',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'نمونه Event اولین Attempt',
      description:
        'sequence ترتیب قطعی Eventهای Python برای همان Build است. progressPercent در اولین شروع برابر صفر است.',
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
    id: 'transaction-heartbeat',
    order: 11,
    title: 'Transaction و Heartbeat',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'TX: Select SKIP LOCKED → Update Job → Insert Outbox → Commit؛ سپس شروع پردازش.',
      'Heartbeat هر ۲۰ ثانیه Lease را تمدید می‌کند؛ صفر ردیف یعنی مالکیت از دست رفته.',
    ],
    actionLabel: 'جزئیات Heartbeat',
    detail: {
      type: 'bullet-list',
      title: 'Heartbeat و ازدست‌رفتن مالکیت',
      description:
        'اگر Insert Outbox شکست بخورد، Transaction Rollback می‌شود و AttemptCount افزایش پیدا نمی‌کند.',
      items: [
        'UPDATE locked_until و updated_at',
        'WHERE id + status=Processing + lock_token + locked_by',
        'اگر تعداد رکورد تغییرکرده صفر باشد: مالک Job نیست',
        'در آن حالت: توقف در نقطه امن، بدون تغییر Job، بدون Event جدید، بدون نتیجه نهایی',
      ],
    },
  },
  {
    id: 'errors-ownership-acceptance',
    order: 12,
    title: 'خطا، مالکیت و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'موفق: Job=Processing، Stage=PreparingInputs، Attempt=1، Sequence=1، Outbox Pending؛ .NET فعلاً Queued.',
      'قطع RabbitMQ مانع شروع Job نمی‌شود؛ Source of Truth اجرا = PostgreSQL Python.',
    ],
    actionLabel: 'خطا، مالکیت و معیار پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'رفتار خطا، مالکیت و معیارهای پذیرش',
      description:
        'تا مصرف Event در .NET ممکن است Job برابر Processing باشد ولی Build هنوز Queued نمایش داده شود؛ این فاصله موقت قابل‌قبول است.',
      items: [
        'PostgreSQL هنگام Claim در دسترس نیست → Poll مجدد + Log/Sentry',
        'شکست Insert Outbox → Rollback؛ Job آماده می‌ماند',
        'Crash بعد از Commit و قبل از پردازش → Processing + Lease منقضی → Recovery جداگانه',
        'RabbitMQ قطع → Job شروع می‌شود؛ Outbox Worker بعداً Publish می‌کند',
        'Python Job = Source of Truth اجرای داخلی',
        '.NET Build = Source of Truth وضعیت Frontend',
        'دو Worker نتوانند یک Job را هم‌زمان Claim کنند',
        'Claim بدون ثبت Outbox ممکن نباشد؛ AttemptCount فقط بعد از Claim موفق',
        'اولین Attempt مقدار StartedAt را ثبت کند؛ Retry آن را بازنویسی نکند',
        'Stage و درصد در Retry کاهش پیدا نکنند',
        'بدون LockToken معتبر Job تغییر نکند؛ ازدست‌رفتن Lease = توقف Updateهای Worker قبلی',
        'Restart سرویس باعث گم‌شدن Job یا Event شروع پردازش نشود',
      ],
    },
  },
];
