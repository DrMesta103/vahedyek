import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

/** @deprecated Prefer BuildVersionStepDocCard */
export type StartBuildFrontendCard = BuildVersionStepDocCard;
/** @deprecated Prefer BuildVersionStepDocCardTag */
export type StartBuildFrontendCardTag = BuildVersionStepDocCard['tag'];

export const START_BUILD_FRONTEND_META: BuildVersionStepDocMeta = {
  slug: 'start-build-from-frontend',
  title: '۱. شروع Build اولیه از Frontend',
  description:
    'شروع ساخت اولیه Knowledge Base برای برندی که هنوز هیچ نسخه‌ای ندارد. عملیات غیرهم‌زمان است و به بازبودن صفحه کاربر وابسته نیست.',
  status: 'فعال',
  pills: ['POST API', 'Async', '202 Accepted'],
};

export const START_BUILD_FRONTEND_OVERVIEW_STEPS = [
  'درخواست Build',
  'اعتبارسنجی + Lock',
  'Create Build + Outbox',
  'Response 202',
] as const;

export const START_BUILD_FRONTEND_OVERVIEW_NOTE = '.NET منتظر اجرای Python نمی‌ماند.';

export const START_BUILD_FRONTEND_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'ایجاد اولین Build برای برند جهت ساخت اولیه Knowledge Base.',
      'ثبت Build و پیام Outbox و آغاز پردازش غیرهم‌زمان.',
    ],
  },
  {
    id: 'api',
    order: 2,
    title: 'API',
    tag: 'فرانت',
    kind: 'api',
    endpoint: 'POST /api/taavia/brands/{brandId}/knowledge-base/builds',
    requestBodyLabel: 'Request Body ندارد',
  },
  {
    id: 'validations',
    order: 3,
    title: 'اعتبارسنجی‌ها',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'وجود برند، تعلق به Tenant جاری و Active بودن بررسی می‌شود.',
      'اگر Build فعال وجود داشته باشد همان Build با پاسخ 202 برگردانده می‌شود.',
    ],
    actionLabel: 'مشاهده همه اعتبارسنجی‌ها',
    detail: {
      type: 'bullet-list',
      title: 'همه اعتبارسنجی‌ها',
      description: 'این بررسی‌ها قبل از ساخت Build و داخل محدوده قفل هم‌زمانی انجام می‌شوند.',
      items: [
        'برند وجود داشته باشد',
        'متعلق به Tenant جاری باشد',
        'وضعیت برند Active باشد',
        'هنوز Knowledge Base Version نداشته باشد',
        'Build فعال دیگری برای برند وجود نداشته باشد',
        'اگر Build فعال وجود داشته باشد، همان Build با پاسخ 202 برگردانده می‌شود',
      ],
    },
  },
  {
    id: 'lock',
    order: 4,
    title: 'قفل هم‌زمانی',
    tag: 'بک',
    kind: 'lock',
    lockKey: 'taavia:knowledge-sources:{tenantId}:{brandId}',
    mechanism: 'sp_getapplock',
    note: 'مانع ثبت هم‌زمان Build و تغییر Sources',
  },
  {
    id: 'build',
    order: 5,
    title: 'ایجاد Build',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'BuildId = new',
      'KnowledgeBaseVersionId = reserved',
      'Type = InitialBuild',
      'Status = Queued',
      'Stage = Queued',
      'ProgressPercent = 0',
    ],
    actionLabel: 'جزئیات مقادیر اولیه',
    detail: {
      type: 'kv-list',
      title: 'مقادیر اولیه Build',
      description:
        'KnowledgeBaseVersionId فقط در این مرحله رزرو می‌شود و هنوز رکورد Version ساخته نشده است.',
      items: [
        { label: 'Type', value: 'InitialBuild' },
        { label: 'Status', value: 'Queued' },
        { label: 'Stage', value: 'Queued' },
        { label: 'ProgressPercent', value: '0' },
        { label: 'LastPythonEventSequence', value: '0' },
        { label: 'KnowledgeBaseResultReferenceId', value: 'null' },
        { label: 'SourceRestoreMode', value: 'null' },
        { label: 'RequestedAt', value: 'UTC Now' },
        { label: 'StartedAt', value: 'null' },
        { label: 'FinishedAt', value: 'null' },
        { label: 'UpdatedAt', value: 'RequestedAt' },
      ],
    },
  },
  {
    id: 'outbox',
    order: 6,
    title: 'Outbox Event',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildRequestedV1',
    eventChips: ['eventId', 'tenantId', 'brandId', 'buildId', 'buildType = InitialBuild'],
    note: 'KnowledgeBaseVersionId داخل Event ارسال نمی‌شود',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Payload رویداد',
      description:
        'Python فقط Build را با BuildId دنبال می‌کند و اطلاعات کامل Source یا Version داخل Event قرار نمی‌گیرد.',
      code: `{
  "eventId": "4db58ce97ef248e8b9bcc3a76ac64896",
  "eventType": "TaaviaKnowledgeBaseBuildRequestedV1",
  "occurredAt": "2026-07-15T19:30:00Z",
  "tenantId": "tenant-100",
  "brandId": "brand-200",
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
  "buildType": "InitialBuild"
}`,
    },
  },
  {
    id: 'transaction',
    order: 7,
    title: 'Transaction',
    tag: 'بک',
    kind: 'transaction',
    steps: ['Begin Transaction', 'Create Build', 'Create Outbox Message', 'Commit'],
    note: 'بعد از Commit، Sources تا پایان Build فقط خواندنی هستند.',
  },
  {
    id: 'response',
    order: 8,
    title: 'Response',
    tag: 'فرانت',
    kind: 'response',
    status: '202 Accepted',
    code: `{
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
  "status": "Queued",
  "requestedAt": "2026-07-15T19:30:00Z"
}`,
  },
  {
    id: 'rules',
    order: 9,
    title: 'قوانین بیزینسی',
    tag: 'عمومی',
    kind: 'checklist',
    items: [
      'انتشار RabbitMQ داخل API انجام نمی‌شود',
      'Outbox Worker مسئول انتشار Event است',
      'خروج کاربر یا قطع SignalR باعث توقف Build نمی‌شود',
      'Source of Truth = دیتابیس .NET',
    ],
  },
];
