import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const CREATE_BUILD_AND_OUTBOX_META: BuildVersionStepDocMeta = {
  slug: 'create-build-and-outbox',
  title: '۲. انتشار درخواست Build از Outbox به RabbitMQ',
  description:
    'انتشار مطمئن Event ساخت Knowledge Base بعد از ثبت موفق Build در دیتابیس .NET. انتشار Event داخل درخواست HTTP انجام نمی‌شود و مسئولیت آن با Outbox Worker است.',
  status: 'فعال',
  pills: ['Outbox Worker', 'RabbitMQ', 'At-least-once'],
};

export const CREATE_BUILD_AND_OUTBOX_OVERVIEW_STEPS = [
  'خواندن Outbox',
  'Publish در RabbitMQ',
  'Publisher Confirm',
  'علامت‌گذاری Published',
] as const;

export const CREATE_BUILD_AND_OUTBOX_OVERVIEW_NOTE =
  'Build.Status همچنان Queued می‌ماند؛ تغییر به Processing فقط بعد از شروع واقعی Job در Python انجام می‌شود.';

export const CREATE_BUILD_AND_OUTBOX_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'انتشار مطمئن Event ساخت Knowledge Base بعد از ثبت موفق Build در دیتابیس .NET.',
      'انتشار داخل درخواست HTTP انجام نمی‌شود و مسئولیت آن با Outbox Worker است.',
    ],
  },
  {
    id: 'worker-input',
    order: 2,
    title: 'ورودی Worker',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildRequestedV1',
    eventChips: ['eventId', 'eventType', 'tenantId', 'brandId', 'buildId', 'buildType = InitialBuild', 'modelAssignments'],
    note: 'نسخه Contract در انتهای نام کلاس و eventType قرار دارد و فیلد جداگانه version نداریم.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Payload رویداد',
      description:
        'Outbox Worker پیام منتشرنشده‌ای با این Contract پیدا می‌کند. نسخه در نام eventType قرار دارد و فیلد جداگانه version وجود ندارد.',
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
      'Type = topic',
      'Routing Key = taavia.knowledge-base.build.requested.v1',
      'Persistent + Durable',
    ],
    actionLabel: 'جزئیات تنظیمات',
    detail: {
      type: 'kv-list',
      title: 'جزئیات تنظیمات RabbitMQ',
      description: 'پیام باید Persistent باشد و Exchange و Queue مصرف‌کننده Durable باشند.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base' },
        { label: 'Exchange Type', value: 'topic' },
        { label: 'Routing Key', value: 'taavia.knowledge-base.build.requested.v1' },
        { label: 'Message Delivery', value: 'Persistent' },
        { label: 'Exchange / Queue', value: 'Durable' },
      ],
    },
  },
  {
    id: 'worker-behavior',
    order: 4,
    title: 'رفتار Worker',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'خواندن پیام‌های منتشرنشده',
      'Publish در RabbitMQ',
      'دریافت Publisher Confirm',
      'علامت‌گذاری Outbox به‌عنوان منتشرشده',
    ],
    note: 'پیام فقط بعد از دریافت تأیید Broker، منتشرشده محسوب می‌شود.',
  },
  {
    id: 'error-behavior',
    order: 5,
    title: 'رفتار در خطا',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'اگر Publish یا Confirm شکست بخورد، Outbox منتشرشده علامت نمی‌خورد.',
      'وضعیت Build همچنان Queued باقی می‌ماند.',
    ],
    actionLabel: 'مشاهده جزئیات خطا',
    detail: {
      type: 'bullet-list',
      title: 'جزئیات رفتار در خطا',
      description: 'در صورت شکست Publish یا دریافت Confirm، این قواعد اعمال می‌شوند.',
      items: [
        'Outbox منتشرشده علامت نمی‌خورد',
        'پیام در اجرای بعدی دوباره ارسال می‌شود',
        'EventId تغییر نمی‌کند',
        'Event جدیدی برای Retry ساخته نمی‌شود',
        'Retry با Backoff انجام می‌شود',
        'خطا در Log و Sentry ثبت می‌شود',
        'وضعیت Build همچنان Queued باقی می‌ماند',
      ],
    },
  },
  {
    id: 'at-least-once',
    order: 6,
    title: 'At-least-once Delivery',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'ممکن است RabbitMQ پیام را دریافت کرده باشد، اما .NET قبل از ثبت موفقیت Outbox قطع شود و همان Event دوباره منتشر شود.',
      'Python باید تکراری‌بودن پیام را با EventId و Inbox تشخیص دهد.',
    ],
  },
  {
    id: 'output',
    order: 7,
    title: 'خروجی مرحله',
    tag: 'بک',
    kind: 'checklist',
    items: [
      'Build.Status = Queued',
      'Outbox = Published',
      'RabbitMQ دارای Event درخواست Build',
      'وضعیت Build هنوز به Processing تغییر نکرده است',
    ],
  },
];
