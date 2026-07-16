import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const POST_COMPLETION_ACTIONS_META: BuildVersionStepDocMeta = {
  slug: 'post-completion-actions',
  title: '۱۹. اقدامات پس از Completion و اعلام نتیجه نهایی',
  description:
    'پس از Commit موفق سند ۱۸، Sources دوباره قابل ویرایش می‌شوند، وضعیت نهایی به Flutter اعلام می‌شود، Knowledge Base خواندنی است و Python از Import موفق مطلع می‌شود — بدون وابستگی موفقیت TX به Flutter یا RabbitMQ.',
  status: 'فعال',
  pills: ['SignalR', 'Outbox', 'ResultImported'],
};

export const POST_COMPLETION_ACTIONS_OVERVIEW_STEPS = [
  'Sources unlocked via Completed',
  'SignalR Completed @100%',
  'Outbox → RabbitMQ ResultImported',
  'Python marks Result imported',
] as const;

export const POST_COMPLETION_ACTIONS_OVERVIEW_NOTE =
  'شکست SignalR یا قطع RabbitMQ باعث Rollback Version فعال نمی‌شود؛ منبع حقیقت SQL Server و Outbox است.';

export const POST_COMPLETION_ACTIONS_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'آزادسازی بیزینسی Sources، اعلام به Flutter، دسترسی به KB جدید، و اطلاع Python از Import موفق.',
      'این اقدامات موفقیت Transaction اصلی را به اتصال Flutter یا RabbitMQ وابسته نمی‌کنند.',
    ],
    actionLabel: 'اقدامات پس از Commit',
    detail: {
      type: 'bullet-list',
      title: 'چهار خروجی پس از سند ۱۸',
      description: 'همه بعد از Completed بودن Build اجرا می‌شوند؛ بدون بازگرداندن Version.',
      items: [
        'Sources دوباره قابل تغییر',
        'SignalR Full State Completed / 100%',
        'خواندن Active Knowledge Base از REST',
        'انتشار ResultImported از Outbox به Python',
      ],
    },
  },
  {
    id: 'sources-unlock',
    order: 2,
    title: 'آزادشدن Sources',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'در Queued / Processing / Importing، Sourceها فقط خواندنی بودند؛ بعد از Completed دوباره قابل ویرایش‌اند.',
      'آزادشدن یعنی تغییر Status Build؛ نه Unlock یک Connection چندساعته.',
    ],
    actionLabel: 'قفل کوتاه در برابر قفل بیزینسی',
    detail: {
      type: 'bullet-list',
      title: 'بدون Application Lock طولانی',
      description: 'sp_getapplock فقط داخل Transactionهای کوتاه (مثل Commit سند ۱۸) استفاده می‌شود.',
      items: [
        'Build فعال = Queued | Processing | Importing',
        'Build.Status = Completed → Commandهای Source Build فعالی پیدا نمی‌کنند',
        'هیچ Applock از ابتدای Build تا پایان نگه داشته نمی‌شود',
      ],
    },
  },
  {
    id: 'signalr-final',
    order: 3,
    title: 'SignalR نهایی',
    tag: 'بک',
    kind: 'event',
    eventName: 'KnowledgeBaseBuildStateChangedV1',
    eventChips: [
      'status = Completed',
      'stage = Completed',
      'progressPercent = 100',
      'knowledgeBaseVersionId',
      'finishedAt',
    ],
    note: 'پس از Commit موفق سند ۱۸ ارسال می‌شود؛ فقط Full State وضعیت Build، نه محتوای Nodeها.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Full State تکمیل',
      description: 'Client Method همان KnowledgeBaseBuildStateChangedV1 است.',
      code: `{
  "eventType": "TaaviaKnowledgeBaseBuildStateChangedV1",
  "occurredAt": "2026-07-16T13:20:01Z",
  "payload": {
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "buildType": "InitialBuild",
    "status": "Completed",
    "stage": "Completed",
    "progressPercent": 100,
    "knowledgeBaseVersionId": "0c445d46ec1846068569ace41ce5cc63",
    "requestedAt": "2026-07-16T12:09:50Z",
    "startedAt": "2026-07-16T12:10:00Z",
    "finishedAt": "2026-07-16T13:20:00Z",
    "updatedAt": "2026-07-16T13:20:00Z"
  }
}`,
    },
  },
  {
    id: 'flutter-behavior',
    order: 4,
    title: 'رفتار Flutter',
    tag: 'فرانت',
    kind: 'detail-list',
    summaryLines: [
      'با Completed و Progress 100%: بستن Progress، نمایش Completed، فراخوانی Active Version و دریافت مجدد Nodeها.',
      'Flutter نباید Nodeها را از SignalR بگیرد؛ SignalR فقط تغییر وضعیت را اعلام می‌کند.',
    ],
    actionLabel: 'اقدامات UI پس از Completion',
    detail: {
      type: 'bullet-list',
      title: 'جریان Frontend',
      description: 'داده Knowledge Base همیشه از REST خوانده می‌شود.',
      items: [
        'پایان Progress Dialog / Section',
        'نمایش Status = Completed',
        'GET Active Knowledge Base Version',
        'دریافت مجدد Nodeها و دسته‌بندی‌های Version فعال',
      ],
    },
  },
  {
    id: 'signalr-failure',
    order: 5,
    title: 'شکست SignalR',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'شکست ارسال SignalR باعث Rollback Build یا Version یا حذف Outbox نمی‌شود؛ فقط Log.',
      'Flutter با REST آخرین وضعیت را بازیابی می‌کند؛ منبع اصلی SQL Server است.',
    ],
    actionLabel: 'Recovery با REST',
    detail: {
      type: 'bullet-list',
      title: 'رفتار در شکست Push',
      description: 'Knowledge Base فعال و ResultImported در Outbox باقی می‌مانند.',
      items: [
        'GET /api/taavia/brands/{brandId}/knowledge-base/builds/latest',
        'Build و Version rollback نمی‌شوند',
        'Outbox ResultImported حذف نمی‌شود',
      ],
    },
  },
  {
    id: 'rest-after-completion',
    order: 6,
    title: 'REST پس از Completion',
    tag: 'بک',
    kind: 'response',
    status: '200 OK · GET .../builds/latest',
    code: `{
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
  "buildType": "InitialBuild",
  "status": "Completed",
  "stage": "Completed",
  "progressPercent": 100,
  "knowledgeBaseVersionId": "0c445d46ec1846068569ace41ce5cc63",
  "requestedAt": "2026-07-16T12:09:50Z",
  "startedAt": "2026-07-16T12:10:00Z",
  "finishedAt": "2026-07-16T13:20:00Z",
  "updatedAt": "2026-07-16T13:20:00Z"
}`,
  },
  {
    id: 'publish-python',
    order: 7,
    title: 'انتشار به Python',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Event: TaaviaKnowledgeBaseBuildResultImportedV1',
      'Exchange: taavia.knowledge-base',
      'RK: ...build.result-imported.v1',
      'Queue + DLQ سمت Python',
    ],
    actionLabel: 'مسیر RabbitMQ',
    detail: {
      type: 'kv-list',
      title: 'تنظیمات انتشار',
      description: 'Outbox Worker سمت .NET Event را به‌صورت ناهمزمان منتشر می‌کند.',
      items: [
        { label: 'Exchange', value: 'taavia.knowledge-base' },
        {
          label: 'Routing Key',
          value: 'taavia.knowledge-base.build.result-imported.v1',
        },
        {
          label: 'Queue',
          value: 'taavia-ai.knowledge-base.build.result-imported.v1',
        },
        {
          label: 'DLQ',
          value: 'taavia-ai.knowledge-base.build.result-imported.v1.dlq',
        },
      ],
    },
  },
  {
    id: 'contract-fields',
    order: 8,
    title: 'Contract و فیلدها',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildResultImportedV1',
    eventChips: [
      'buildId',
      'resultReferenceId',
      'knowledgeBaseVersionId',
      'versionNumber',
      'completedAt',
    ],
    note: 'tenantId/brandId برای مالکیت؛ buildId برای Correlation با Job پایتون؛ completedAt زمان Commit موفق .NET.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Contract Event',
      description:
        'resultReferenceId همان Result Importشده است؛ knowledgeBaseVersionId و versionNumber Version فعال در SQL Server.',
      code: `{
  "eventId": "bd4877a88c134cb59ef238168585893e",
  "eventType": "TaaviaKnowledgeBaseBuildResultImportedV1",
  "occurredAt": "2026-07-16T13:20:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "resultReferenceId": "339bb872-06b4-42bc-a302-2a64681ca906",
    "knowledgeBaseVersionId": "0c445d46ec1846068569ace41ce5cc63",
    "versionNumber": 1,
    "completedAt": "2026-07-16T13:20:00Z"
  }
}`,
    },
  },
  {
    id: 'python-consume',
    order: 9,
    title: 'مصرف Python',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Validate Contract + Insert Inbox',
      'Load Job (Tenant/Brand/Build) و Result (ResultReferenceId)',
      'Validate Job.ResultRef = Payload و Result.Status = Ready',
      'Update imported_at / version_id / version_number',
      'COMMIT سپس RabbitMQ Ack',
    ],
    note: 'این Consumer هیچ پردازش AI جدیدی آغاز نمی‌کند؛ فقط لینک Import را روی Result ثبت می‌کند.',
  },
  {
    id: 'idempotency-job',
    order: 10,
    title: 'Idempotency و Job',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'EventId تکراری یا همان Version قبلاً Importشده → Ack بدون Update جدید.',
      'Result با Version متفاوت → Reject بدون Requeue → DLQ + Sentry؛ Job در ResultReady می‌ماند.',
    ],
    actionLabel: 'جداسازی مفاهیم Status',
    detail: {
      type: 'bullet-list',
      title: 'Idempotency و وضعیت Job',
      description:
        'Job.Status = ResultReady یعنی پایان پردازش Python؛ اطلاعات Import فقط روی Result است تا با فعال‌سازی .NET مخلوط نشود.',
      items: [
        'فیلدهای Result: imported_at، imported_knowledge_base_version_id، imported_version_number',
        'یک Result آماده نباید به دو Version متفاوت Import شود',
        'وضعیت Job بعد از Event Import تغییر نمی‌کند',
      ],
    },
  },
  {
    id: 'rabbit-source-after',
    order: 11,
    title: 'RabbitMQ قطع و Source بعد از',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'قطع RabbitMQ: Build Completed و KB فعال می‌مانند؛ Event در Outbox می‌ماند تا بعداً منتشر شود.',
      'پس از آزادشدن Sources، تغییر موفق Source → Active Version.NeedsRebuild = true بدون حذف Version.',
    ],
    actionLabel: 'اثرات جانبی',
    detail: {
      type: 'bullet-list',
      title: 'استقلال Completion از Pipeline پایتون',
      description: 'عدم دریافت Event فقط Retention/Cleanup سریع Result در Python را به تأخیر می‌اندازد.',
      items: [
        'Flutter از REST می‌خواند؛ دسترسی کاربر مختل نمی‌شود',
        'NeedsRebuild مربوط به فلو Source Modification است',
        'KB فعلی تا Rebuild قابل استفاده می‌ماند',
      ],
    },
  },
  {
    id: 'output-acceptance',
    order: 12,
    title: 'خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'checklist',
    items: [
      'Build Completed / 100%؛ Version 1 Active؛ Sources قابل ویرایش',
      'Flutter Completion از SignalR یا REST؛ Nodeها داخل SignalR نیستند',
      'ResultImported از Outbox منتشر می‌شود؛ قطع RabbitMQ Event را از دست نمی‌دهد',
      'Python لینک Result↔Version را ثبت می‌کند؛ Event تکراری Update ناسازگار نمی‌سازد',
      'یک Result به دو Version Import نمی‌شود؛ Status پردازش Python با فعال‌سازی .NET مخلوط نمی‌شود',
    ],
  },
];
