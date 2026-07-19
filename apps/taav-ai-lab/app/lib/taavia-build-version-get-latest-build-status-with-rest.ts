import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const GET_LATEST_BUILD_STATUS_WITH_REST_META: BuildVersionStepDocMeta = {
  slug: 'get-latest-build-status-with-rest',
  title: '۸. بازیابی آخرین وضعیت Build با REST',
  description:
    'Flutter پس از بازشدن صفحه، Refresh یا اتصال مجدد SignalR، آخرین وضعیت ثبت‌شده Build را از SQL Server دریافت می‌کند. این API وابستگی UI به دریافت همه پیام‌های SignalR را از بین می‌برد.',
  status: 'فعال',
  pills: ['REST', 'Recovery', 'no-store'],
};

export const GET_LATEST_BUILD_STATUS_WITH_REST_OVERVIEW_STEPS = [
  'Subscribe SignalR Group',
  'GET latest',
  'نمایش وضعیت',
  'ادامه Live Updates',
] as const;

export const GET_LATEST_BUILD_STATUS_WITH_REST_OVERVIEW_NOTE =
  'REST منبع قطعی بازیابی است؛ SignalR فقط اعلان زنده است.';

export const GET_LATEST_BUILD_STATUS_WITH_REST_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'پس از بازشدن صفحه، Refresh یا Reconnect، آخرین وضعیت Build از SQL Server خوانده می‌شود.',
      'UI دیگر وابسته به دریافت همه پیام‌های SignalR نیست.',
    ],
  },
  {
    id: 'api',
    order: 2,
    title: 'API',
    tag: 'بک',
    kind: 'api',
    endpoint: 'GET /api/taavia/brands/{brandId}/knowledge-base/builds/latest',
    requestBodyLabel: 'Request Body ندارد',
  },
  {
    id: 'selection',
    order: 3,
    title: 'رفتار انتخاب Build',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'اول Build فعال: Queued / Processing / Importing.',
      'در نبود فعال: آخرین Completed یا Failed با RequestedAt DESC، Id DESC.',
    ],
    actionLabel: 'جزئیات انتخاب',
    detail: {
      type: 'bullet-list',
      title: 'اولویت انتخاب Build',
      description: 'به‌دلیل قانون یک Build فعال per برند، نباید هم‌زمان بیش از یک Build فعال پیدا شود.',
      items: [
        'جست‌وجوی فعال: Queued، Processing، Importing',
        'در نبود فعال: آخرین Completed یا Failed',
        'ترتیب: RequestedAt DESC سپس Id DESC',
        'حداکثر یک Build فعال برای هر برند',
      ],
    },
  },
  {
    id: 'validation',
    order: 4,
    title: 'اعتبارسنجی',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'احراز هویت، وجود برند، تعلق به Tenant، مجوز مشاهده Knowledge Base.',
      'تمام Queryها با TenantId و BrandId محدود می‌شوند.',
    ],
    actionLabel: 'فهرست بررسی‌ها',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی دسترسی',
      description: 'بدون این بررسی‌ها پاسخ Build برگردانده نمی‌شود.',
      items: [
        'کاربر احراز هویت شده باشد',
        'برند وجود داشته باشد',
        'برند متعلق به Tenant جاری باشد',
        'کاربر مجوز مشاهده Knowledge Base برند را داشته باشد',
        'Queryها محدود به TenantId + BrandId',
      ],
    },
  },
  {
    id: 'success-response',
    order: 5,
    title: 'پاسخ موفق',
    tag: 'بک',
    kind: 'event',
    eventName: '200 OK',
    eventChips: [
      'buildId / status / stage',
      'progressPercent',
      'knowledgeBaseVersionId',
      'requestedAt / updatedAt',
    ],
    note: 'اطلاعات داخلی مثل LastPythonEventSequence و ResultReferenceId به Flutter ارسال نمی‌شوند.',
    actionLabel: 'مشاهده Body',
    detail: {
      type: 'json',
      title: 'نمونه پاسخ 200',
      description:
        'progressPercent آخرین درصد SQL است. فیلدهای داخلی Python/Outbox افشا نمی‌شوند مگر صفحه واقعاً نیاز بیزینسی داشته باشد.',
      code: `{
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
  "buildType": "InitialBuild",
  "status": "Processing",
  "stage": "ProcessingSources",
  "progressPercent": 35,
  "knowledgeBaseVersionId": "0c445d46ec1846068569ace41ce5cc63",
  "requestedAt": "2026-07-16T09:19:50Z",
  "startedAt": "2026-07-16T09:20:00Z",
  "finishedAt": null,
  "updatedAt": "2026-07-16T09:24:10Z"
}`,
    },
  },
  {
    id: 'no-build',
    order: 6,
    title: 'نبود Build',
    tag: 'بک',
    kind: 'response',
    status: '204 No Content',
    code: `// برند معتبر است ولی هنوز هیچ Buildی شروع نشده است.`,
  },
  {
    id: 'page-entry',
    order: 7,
    title: 'ورود به صفحه',
    tag: 'فرانت',
    kind: 'transaction',
    steps: [
      'اتصال یا بررسی SignalR',
      'Subscribe به Group برند',
      'فراخوانی GET latest',
      'نمایش وضعیت + ادامه Live',
    ],
    note: 'Subscribe قبل از REST است تا فاصله بین دریافت REST و عضویت Group کمتر شود.',
  },
  {
    id: 'reconnect',
    order: 8,
    title: 'Reconnect',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'Reconnected → Subscribe → GET latest → جایگزینی وضعیت Local.',
      'پاسخ REST وضعیت قطعی فعلی است و فاصله قطع SignalR را جبران می‌کند.',
    ],
    actionLabel: 'ترتیب Reconnect',
    detail: {
      type: 'bullet-list',
      title: 'بازیابی بعد از قطع SignalR',
      description: 'REST منبع قطعی است؛ سپس پیام‌های زنده ادامه می‌یابند.',
      items: [
        'SignalR Reconnected',
        'SubscribeToBrandKnowledgeBase',
        'GET /builds/latest',
        'جایگزینی وضعیت Local با پاسخ REST',
      ],
    },
  },
  {
    id: 'stale-guard',
    order: 9,
    title: 'جلوگیری از وضعیت قدیمی',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'اعمال فقط اگر UpdatedAt >= CurrentUpdatedAt.',
      'اگر buildId عوض شود، Build جدید جایگزین قبلی می‌شود.',
    ],
    actionLabel: 'قواعد اعمال',
    detail: {
      type: 'bullet-list',
      title: 'قواعد updatedAt و buildId',
      description: 'همین قاعده برای پیام REST و SignalR اعمال می‌شود.',
      items: [
        'نگهداری updatedAt آخرین وضعیت اعمال‌شده',
        'اعمال فقط وقتی UpdatedAt >= CurrentUpdatedAt',
        'تغییر buildId → جایگزینی کامل Build قبلی',
        'Flutter درصد یا Stage را محاسبه نکند',
      ],
    },
  },
  {
    id: 'terminal-states',
    order: 10,
    title: 'وضعیت‌های نهایی',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'Completed + progress 100 → پایان Progress و Refresh Version فعال.',
      'Failed → درصد به ۱۰۰ تبدیل نمی‌شود؛ آخرین درصد موفق می‌ماند.',
    ],
    actionLabel: 'نمونه Completed و Failed',
    detail: {
      type: 'bullet-list',
      title: 'رفتار UI در پایان',
      description: 'جزئیات فنی خطا از این API عمومی برنمی‌گردد؛ پیام کاربر بر اساس Failed است.',
      items: [
        'Completed: status=Completed، stage=Completed، progressPercent=100',
        'بعد از Completed: پایان Progress + دریافت مجدد Version از API مربوطه',
        'Failed: status=Failed با آخرین درصد موفق (مثلاً 63)',
        'در Failed درصد به 100 تبدیل نمی‌شود',
      ],
    },
  },
  {
    id: 'cache-errors',
    order: 11,
    title: 'Cache و خطاها',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Cache-Control: no-store',
      '401 Unauthorized',
      '403 Forbidden',
      '404 Not Found',
    ],
    actionLabel: 'جزئیات خطاها',
    detail: {
      type: 'kv-list',
      title: 'Cache و کدهای خطا',
      description: 'برند متعلق به Tenant دیگر نیز می‌تواند 404 برگرداند تا اطلاعات افشا نشود.',
      items: [
        { label: 'Cache', value: 'Cache-Control: no-store' },
        { label: '401', value: 'کاربر وارد سیستم نشده' },
        { label: '403', value: 'بدون مجوز مشاهده برند' },
        { label: '404', value: 'برند در Tenant جاری نیست / وجود ندارد' },
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
      'Refresh و Reconnect وضعیت را از دست نمی‌دهند؛ پاسخ از SQL Server خوانده می‌شود.',
      'فعال → همان Build؛ بدون فعال → آخرین پایان‌یافته؛ بدون Build → 204.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Endpoint نباید Cache شود و فیلدهای داخلی Python افشا نشوند.',
      items: [
        'Refresh صفحه باعث ازدست‌رفتن وضعیت Build نشود',
        'قطع و اتصال مجدد SignalR با REST جبران شود',
        'وجود Build فعال → همان Build برگردانده شود',
        'نبود فعال → آخرین Completed/Failed',
        'نبود هرگونه Build → 204',
        'Flutter درصد یا Stage را محاسبه نکند',
        'پاسخ از SQL Server؛ Cache نشود',
        'اطلاعات داخلی ارتباط با Python در Response نباشد',
      ],
    },
  },
];
