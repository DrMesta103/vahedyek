import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const ACTIVATE_FIRST_VERSION_META: BuildVersionStepDocMeta = {
  slug: 'activate-first-version',
  title: '۱۸. Commit نهایی Build اولیه و ساخت Version فعال',
  description:
    'پس از ReadyToCommit، Staging به‌صورت اتمیک وارد جداول اصلی Knowledge Base می‌شود: Version شماره ۱ Active، Snapshot، Node، Reference، Activation، تکمیل Import و Build، و ثبت Event موفقیت برای Python.',
  status: 'فعال',
  pills: ['Commit', 'Version 1', 'ActivatingVersion'],
};

export const ACTIVATE_FIRST_VERSION_OVERVIEW_STEPS = [
  'Preconditions ReadyToCommit',
  'ActivatingVersion @99%',
  'Atomic TX (Version→Nodes→Activation)',
  'Build Completed @100%',
] as const;

export const ACTIVATE_FIRST_VERSION_OVERVIEW_NOTE =
  'Transaction نهایی شامل gRPC/RabbitMQ/MinIO/AI نیست؛ فقط Validate سریع، Insert، Activation و Outbox.';

export const ACTIVATE_FIRST_VERSION_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Staging در یک Transaction اتمیک به جداول اصلی KB منتقل می‌شود؛ شکست هر بخش = Rollback کامل.',
      'Build اولیه: Version 1 Active + Snapshot + Node + Ref + Activation + Import/Build Complete + Outbox.',
    ],
    actionLabel: 'خروجی‌های اتمیک',
    detail: {
      type: 'bullet-list',
      title: 'همه یا هیچ',
      description: 'هیچ Knowledge Base ناقص یا Version فعالی نباید بعد از شکست باقی بماند.',
      items: [
        'TaaviaKnowledgeBaseVersion (Version 1 / Active)',
        'Source Snapshotها و Root/Child Nodeها',
        'Node Referenceها و Initial Activation',
        'Import Completed و Build Completed @100%',
        'Outbox: TaaviaKnowledgeBaseBuildResultImportedV1',
      ],
    },
  },
  {
    id: 'preconditions',
    order: 2,
    title: 'پیش‌شرط‌های Commit',
    tag: 'بک',
    kind: 'checklist',
    items: [
      'Build: InitialBuild / Importing / ValidatingResult / Progress ≥ 97',
      'KnowledgeBaseVersionId و ResultReferenceId مقدار داشته باشند',
      'SourceRestoreMode = null؛ Brand بدون Version موجود',
      'Import و Attempt = ReadyToCommit',
      'ResultReferenceId و ManifestHash با Import/Attempt برابر باشند',
    ],
  },
  {
    id: 'enter-activation',
    order: 3,
    title: 'ورود به Activation',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Transaction کوتاه قبل از Commit نهایی',
      'Build.Stage = ActivatingVersion',
      'ProgressPercent = 99 + UpdatedAt',
      'SignalR بعد از Commit: Importing / ActivatingVersion / 99',
    ],
    note: 'اگر Transaction نهایی شکست بخورد، Build در ActivatingVersion می‌ماند و Commit قابل Retry است.',
  },
  {
    id: 'brand-lock',
    order: 4,
    title: 'قفل Brand',
    tag: 'بک',
    kind: 'lock',
    lockKey: 'taavia:knowledge-sources:{tenantId}:{brandId}',
    mechanism: 'sp_getapplock · Exclusive · LockOwner = Transaction',
    note: 'هم‌زمان با اعتبارسنجی Sources و فعال‌سازی Version هیچ Command مربوط به Source اجرا نمی‌شود؛ آزادسازی خودکار با Commit/Rollback.',
  },
  {
    id: 'revalidate',
    order: 5,
    title: 'Re-validate داخل TX',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Brand Active؛ Build هنوز Importing/ActivatingVersion/InitialBuild؛ Import و Attempt ReadyToCommit.',
      'Sources جاری: وجود، Tenant/Brand، Revision و ContentHash؛ ناسازگاری → KnowledgeSourceChangedDuringBuild.',
    ],
    actionLabel: 'بررسی‌های داخل Transaction',
    detail: {
      type: 'bullet-list',
      title: 'پیش‌شرط‌های Version و Source',
      description: 'بررسی قبل از TX برای Race کافی نیست؛ همه دوباره داخل Transaction انجام می‌شوند.',
      items: [
        'هیچ KB Version برای Brand؛ هیچ VersionNumber = 1 (حتی حذف‌شده)',
        'KnowledgeBaseVersionId رزروشده استفاده نشده باشد',
        'ResultReferenceId با Import و Staging برابر باشد',
        'هر Staging Source هنوز قابل استفاده و هم‌Hash باشد',
      ],
    },
  },
  {
    id: 'version-one',
    order: 6,
    title: 'Version اول',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Id = Build.KnowledgeBaseVersionId',
      'VersionNumber = 1',
      'Status = Active',
      'LastBuildId + ResultReferenceId',
      'HasManualChanges / NeedsRebuild = false',
    ],
    actionLabel: 'قوانین Version',
    detail: {
      type: 'kv-list',
      title: 'ساخت Version شماره ۱',
      description: 'شناسه همان رزرو زمان ساخت Build است؛ Version ناقص یا Inactive موقت ساخته نمی‌شود.',
      items: [
        { label: 'Active از لحظه ساخت', value: 'مستقیماً Status = Active' },
        { label: 'LastBuildId', value: 'اشاره به Build اولیه' },
        { label: 'ResultReferenceId', value: 'Audit نتیجه Python' },
      ],
    },
  },
  {
    id: 'snapshots-mapping',
    order: 7,
    title: 'Snapshots و Mapping',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط Sourceهای استفاده‌شده در Result Snapshot می‌سازند؛ SourceData بدون Serialize مجدد.',
      'Mapping موقت: SourceType + SourceId → SnapshotId (OUTPUT Insert یا Dictionary).',
    ],
    actionLabel: 'قواعد Snapshot',
    detail: {
      type: 'bullet-list',
      title: 'Snapshot Immutable',
      description: 'UNIQUE(TenantId, KnowledgeBaseVersionId, SourceType, SourceId).',
      items: [
        'Source استفاده‌نشده در Input Batch Snapshot ندارد',
        'Revision / Title / Schema / Hashes از Staging',
        'Mapping فقط در همان اجرای Transaction نهایی',
      ],
    },
  },
  {
    id: 'nodes',
    order: 8,
    title: 'Root و Child Nodeها',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'ابتدا Rootها (ParentExternalId = null)؛ Mapping ExternalId → KnowledgeNodeId.',
      'سپس Childها با ParentId از Map؛ Revision = 1؛ CreatedBy/UpdatedBy = system:taavia-ai.',
    ],
    actionLabel: 'Mapping و خطا',
    detail: {
      type: 'bullet-list',
      title: 'Insert و Parent Mapping',
      description: 'Mapping بر اساس ExternalId است نه ترتیب رکورد؛ MERGE/OUTPUT یا Batch کنترل‌شده.',
      items: [
        'IsManuallyEdited = false؛ RequestedBy فقط روی Build',
        'ParentExternalId ناموجود → KnowledgeNodeParentMappingFailed + Rollback',
        'Child بدون Parent یا با Parent اشتباه ذخیره نمی‌شود',
      ],
    },
  },
  {
    id: 'refs-activation',
    order: 9,
    title: 'References و Activation',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'هر Staging Ref: RootExternalId → NodeId و SourceType+Id → SnapshotId.',
      'InitialActivation: PreviousVersionId = null؛ ActivatedBy = RequestedBy؛ BuildId یکتا.',
    ],
    actionLabel: 'قواعد Ref و History',
    detail: {
      type: 'bullet-list',
      title: 'Node Reference و Activation History',
      description: 'Activation بعداً ویرایش یا حذف نمی‌شود؛ SourceRestoreMode فقط برای Rollback است.',
      items: [
        'KnowledgeNodeId حتماً Root؛ Node و Snapshot همان Version',
        'هر Root ≥1 Ref؛ هر Snapshot ≥1 Ref؛ بدون تکراری',
        'Type = InitialActivation؛ ActivatedVersionId = Version 1',
      ],
    },
  },
  {
    id: 'complete-import-build',
    order: 10,
    title: 'تکمیل Import و Build',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Import.Status = Completed؛ FinishedAt؛ پاک‌کردن Lease',
      'Attempt معتبر در ReadyToCommit می‌ماند',
      'Build.Status/Stage = Completed؛ Progress = 100',
      'حفظ VersionId، ResultReferenceId، Sequence، Started/RequestedAt',
    ],
    note: 'Build فقط وقتی Completed می‌شود که Version، Node، Snapshot، Reference، Activation و Import همه کامل باشند.',
  },
  {
    id: 'result-imported-event',
    order: 11,
    title: 'Event موفقیت Python',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildResultImportedV1',
    eventChips: [
      'tenantId',
      'brandId',
      'buildId',
      'resultReferenceId',
      'knowledgeBaseVersionId',
      'versionNumber',
      'completedAt',
    ],
    note: 'ثبت در .NET Outbox داخل همان Transaction؛ انتشار تأخیری باعث Rollback Build نمی‌شود.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Payload رویداد',
      description:
        'Python با این Event زمان Import موفق را ثبت و Retention/Cleanup Result را آغاز می‌کند.',
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
    id: 'tx-retry-acceptance',
    order: 12,
    title: 'TX، Retry و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'ترتیب: Applock → Validate → Version → Snapshot → Root → Child → Ref → Activation → Import/Build → Outbox.',
      'Retry موقت: Idempotency با VersionId و Activation.BuildId؛ داده جزئی بدون Completed ممکن نیست.',
    ],
    actionLabel: 'معیارهای پذیرش سند ۱۸',
    detail: {
      type: 'bullet-list',
      title: 'پذیرش',
      description: 'TX بدون gRPC/RabbitMQ/MinIO/AI و بدون Validation سنگین یا محاسبه مجدد Python.',
      items: [
        'Version فقط پس از Validation کامل؛ شماره ۱ مستقیماً Active',
        'Snapshot فقط Sourceهای استفاده‌شده؛ Child فقط به Root همان Version',
        'Nodeها Revision = 1 و IsManuallyEdited = false؛ فقط Rootها Reference',
        'Activation و Version و Build در یک TX؛ Event موفقیت در همان TX در Outbox',
        'شکست هر بخش = Rollback کامل؛ Retry پس از بررسی Idempotency',
      ],
    },
  },
];
