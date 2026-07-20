import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_META: BuildVersionStepDocMeta = {
  slug: 'send-status-to-flutter-with-signalr',
  title: '۷. ارسال وضعیت Build از .NET به Flutter با SignalR',
  description:
    'بعد از ذخیره وضعیت Build در SQL Server، .NET همان وضعیت را به‌صورت لحظه‌ای برای Flutter ارسال می‌کند. SignalR فقط برای نمایش سریع است؛ منبع اصلی وضعیت، دیتابیس .NET باقی می‌ماند.',
  status: 'فعال',
  pills: ['SignalR', 'Full State', 'Best-Effort'],
};

export const SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_OVERVIEW_STEPS = [
  'Commit SQL + Ack',
  'Send Full State',
  'Flutter اعمال Payload',
  'Reconnect → Subscribe + REST',
] as const;

export const SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_OVERVIEW_NOTE =
  'SignalR بعد از Commit؛ شکست Push باعث Rollback یا Requeue نمی‌شود.';

export const SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'بعد از ذخیره Build، وضعیت/مرحله/درصد/زمان‌ها به‌صورت لحظه‌ای به Flutter می‌رسند.',
      'SignalR فقط نمایش سریع است؛ منبع اصلی وضعیت همچنان SQL Server .NET است.',
    ],
  },
  {
    id: 'responsibility',
    order: 2,
    title: 'محدوده مسئولیت',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Consumer: ذخیره SQL → Commit → Ack RabbitMQ → ارسال SignalR Full State.',
      'Flutter فقط UI را از Full State به‌روز می‌کند؛ درصد محاسبه یا Build را تغییر نمی‌دهد.',
    ],
    actionLabel: 'خارج از محدوده Flutter',
    detail: {
      type: 'bullet-list',
      title: 'در این مرحله Flutter انجام نمی‌دهد',
      description: 'وضعیت Build فقط در Backend تغییر می‌کند؛ Flutter مصرف‌کننده نمایشی است.',
      items: [
        'محاسبه درصد بر اساس Stage',
        'تغییر وضعیت Build در Backend',
        'ارسال TenantId برای عضویت Group',
      ],
    },
  },
  {
    id: 'hub',
    order: 3,
    title: 'SignalR Hub',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'مسیر: /hubs/taavia/knowledge-base',
      'Hub: TaaviaKnowledgeBaseHub',
      'Authorization = JWT Access Token',
      'Tenant از Claims',
    ],
    actionLabel: 'قواعد احراز هویت',
    detail: {
      type: 'kv-list',
      title: 'احراز هویت و Tenant',
      description: 'Tenant از Claim کاربر خوانده می‌شود و نباید توسط Flutter برای عضویت در Group ارسال شود.',
      items: [
        { label: 'مسیر', value: '/hubs/taavia/knowledge-base' },
        { label: 'نام Hub', value: 'TaaviaKnowledgeBaseHub' },
        { label: 'Authorization', value: 'JWT Access Token' },
        { label: 'منبع Tenant', value: 'Claims کاربر (نه ورودی Flutter)' },
      ],
    },
  },
  {
    id: 'brand-group',
    order: 4,
    title: 'عضویت Group برند',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'Flutter: SubscribeToBrandKnowledgeBase با brandId.',
      'Group داخلی توسط .NET ساخته می‌شود؛ Flutter نام Group را ارسال نمی‌کند.',
    ],
    actionLabel: 'نام Group و بررسی‌ها',
    detail: {
      type: 'bullet-list',
      title: 'عضویت و نام Group',
      description:
        'در هر برند فقط یک Build فعال مجاز است؛ تغییرات Build/Version/KB همان برند از یک Group ارسال می‌شوند.',
      items: [
        'Group: taavia:tenant:{tenantId}:brand:{brandId}:knowledge-base',
        'کاربر احراز هویت‌شده باشد',
        'برند وجود داشته باشد و متعلق به Tenant کاربر باشد',
        'کاربر مجوز مشاهده Knowledge Base برند را داشته باشد',
      ],
    },
  },
  {
    id: 'flutter-contract',
    order: 5,
    title: 'Contract ارسالی به Flutter',
    tag: 'فرانت',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildStateChangedV1',
    eventChips: [
      'Client: KnowledgeBaseBuildStateChangedV1',
      'status / stage / progressPercent',
      'بدون tenantId',
    ],
    note: 'tenantId در پیام Flutter نیست؛ Tenant از اتصال و Group داخلی مشخص است.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'نمونه Full State SignalR',
      description:
        'Client Method = KnowledgeBaseBuildStateChangedV1. occurredAt زمان ساخت پیام توسط .NET است؛ updatedAt آخرین تغییر SQL است.',
      code: `{
  "eventType": "TaaviaKnowledgeBaseBuildStateChangedV1",
  "occurredAt": "2026-07-16T09:20:01Z",
  "payload": {
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "buildType": "InitialBuild",
    "status": "Processing",
    "stage": "PreparingInputs",
    "progressPercent": 0,
    "requestedAt": "2026-07-16T09:19:50Z",
    "startedAt": "2026-07-16T09:20:00Z",
    "finishedAt": null,
    "updatedAt": "2026-07-16T09:20:01Z"
  }
}`,
    },
  },
  {
    id: 'full-state',
    order: 6,
    title: 'Full-State بودن پیام',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'پیام کل وضعیت UI را دارد، نه فقط فیلد تغییرکرده (بدون delta مثل progressPercentChangedTo).',
      'همین Contract برای Processing تا Completed/Failed استفاده می‌شود.',
    ],
    actionLabel: 'دلیل و مراحل استفاده',
    detail: {
      type: 'bullet-list',
      title: 'چرا Full State',
      description: 'اگر Flutter یک پیام قبلی را از دست بدهد، با پیام جدید همچنان صفحه کامل را نمایش می‌دهد.',
      items: [
        'درست: status + stage + progressPercent با هم',
        'نامناسب: فقط progressPercentChangedTo',
        'Reuse در: Processing، ResultReady، Importing، Completed، Failed',
        'Contract جداگانه SignalR برای هر مرحله ساخته نمی‌شود',
      ],
    },
  },
  {
    id: 'progress-source',
    order: 7,
    title: 'منبع درصد',
    tag: 'فرانت',
    kind: 'build-summary',
    summaryItems: [
      'نمایش مستقیم progressPercent',
      'Python: 0 تا 90',
      '.NET Import: 91 تا 99',
      'Activation: 100',
    ],
    actionLabel: 'ممنوعیت محاسبه در Flutter',
    detail: {
      type: 'kv-list',
      title: 'تقسیم درصد و نقش Flutter',
      description: 'Flutter نباید بر اساس Stage درصد جدید بسازد یا درصد دریافتی را تغییر دهد.',
      items: [
        { label: 'منبع نمایش', value: 'progressPercent ذخیره‌شده در .NET' },
        { label: 'Python', value: '0 تا 90' },
        { label: '.NET Import/Validation', value: '91 تا 99' },
        { label: '.NET Activation', value: '100' },
        { label: 'ممنوع', value: 'محاسبه یا تغییر درصد در Flutter' },
      ],
    },
  },
  {
    id: 'send-timing',
    order: 8,
    title: 'زمان ارسال SignalR',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Consume RabbitMQ Event',
      'Update Build + Inbox → Commit',
      'Ack RabbitMQ',
      'Send SignalR Full State',
    ],
    note: 'Flutter هیچ وضعیتی را نمی‌بیند که هنوز در SQL Server ثبت نشده باشد.',
  },
  {
    id: 'signalr-failure',
    order: 9,
    title: 'شکست ارسال SignalR',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'SignalR بخشی از Transaction دیتابیس نیست؛ شکست Push Rollback یا Requeue نمی‌کند.',
      'بازیابی: Flutter در اتصال مجدد وضعیت را از REST می‌گیرد؛ Outbox برای UI نداریم.',
    ],
    actionLabel: 'چرا Best-Effort',
    detail: {
      type: 'bullet-list',
      title: 'رفتار شکست و نقش لایه‌ها',
      description: 'Outbox برای Push رابط کاربری در این مرحله پیچیدگی غیرضروری است.',
      items: [
        'Build Rollback نمی‌شود؛ RabbitMQ Requeue نمی‌شود',
        'Build در وضعیت صحیح می‌ماند؛ خطا در Log/Monitoring',
        'SQL Server = Source of Truth',
        'SignalR = Best-Effort Live Notification',
        'REST = Recovery Mechanism',
      ],
    },
  },
  {
    id: 'flutter-behavior',
    order: 10,
    title: 'رفتار Flutter',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'بررسی brandId صفحه جاری، شناسایی buildId، نادیده گرفتن updatedAt قدیمی‌تر.',
      'جایگزینی کامل وضعیت Local از Payload؛ پایان فقط با Completed یا Failed.',
    ],
    actionLabel: 'قواعد اعمال پیام',
    detail: {
      type: 'bullet-list',
      title: 'اعمال Full State در Flutter',
      description: 'درصد ۱۰۰ به‌تنهایی پایان Build نیست؛ Status باید Completed باشد.',
      items: [
        'brandId متعلق به صفحه جاری باشد',
        'Build جاری با buildId شناسایی شود',
        'updatedAt قدیمی‌تر از وضعیت فعلی اعمال نشود',
        'تمام وضعیت Local از Payload جدید جایگزین شود',
        'پایان فقط با Status = Completed یا Failed',
      ],
    },
  },
  {
    id: 'disconnect-reconnect',
    order: 11,
    title: 'قطع اتصال و Reconnect',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'قطع SignalR Build را متوقف نمی‌کند؛ Python و .NET ادامه می‌دهند.',
      'بعد از Reconnect: دوباره Subscribe + دریافت آخرین وضعیت از REST.',
    ],
    actionLabel: 'ترتیب Reconnect',
    detail: {
      type: 'bullet-list',
      title: 'قطع اتصال و بازیابی',
      description: 'عضویت‌های قبلی بعد از Reconnect تضمین‌شده نیستند. جزئیات REST در سند بعدی است.',
      items: [
        'هنگام قطع: Worker و Consumer ادامه؛ Build در SQL به‌روز می‌شود',
        'SignalR Reconnected',
        'SubscribeToBrandKnowledgeBase(brandId)',
        'دریافت آخرین وضعیت از REST',
        'ادامه دریافت پیام‌های زنده',
      ],
    },
  },
  {
    id: 'security-push-acceptance',
    order: 12,
    title: 'امنیت، Push شرطی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Push فقط وقتی Inbox.ProcessingResult = Applied؛ Ignored/Rejected پیام نمی‌فرستند.',
      'موفق: SQL Processing، Ack، SignalR ارسال، Flutter صفحه Processing.',
    ],
    actionLabel: 'امنیت و معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'امنیت، شرط Push و پذیرش',
      description: 'Group Name معیار امنیت نیست؛ مجوز قبل از AddToGroup بررسی می‌شود.',
      items: [
        'Flutter نمی‌تواند TenantId دلخواه Subscribe کند',
        'برند با Tenant Claims و مجوز KB بررسی می‌شود',
        'Queryهای Build با TenantId و BrandId محدود می‌شوند',
        'SignalR قبل از Commit ارسال نشود',
        'قطع/شکست SignalR باعث توقف Build یا Rollback/Requeue نشود',
        'Flutter درصد را محاسبه نکند؛ فقط درصد .NET را نمایش دهد',
        'پیام Full State باشد؛ بعد از Reconnect دوباره Subscribe + REST',
        'Completed همراه با درصد ۱۰۰ = پایان موفق',
      ],
    },
  },
];
