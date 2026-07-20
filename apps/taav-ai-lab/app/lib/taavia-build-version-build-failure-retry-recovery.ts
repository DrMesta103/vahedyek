import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const BUILD_FAILURE_RETRY_RECOVERY_META: BuildVersionStepDocMeta = {
  slug: 'build-failure-retry-recovery',
  title: '۲۰. Failure، Retry، Recovery و Cleanup فلو Build',
  description:
    'خطای موقت Build را از دست نمی‌دهد؛ Retry تکراری/هم‌زمان نیست؛ Worker مرده Job را قفل نمی‌کند؛ KB ناقص معتبر نمی‌شود؛ پس از Failed نهایی Sources قابل ویرایش‌اند؛ داده موقت پس از Retention پاک می‌شود؛ شکست Python و Import از هم تفکیک می‌شوند.',
  status: 'فعال',
  pills: ['Retry', 'Recovery', 'Cleanup'],
};

export const BUILD_FAILURE_RETRY_RECOVERY_OVERVIEW_STEPS = [
  'Classify error (Retryable vs Terminal)',
  'Auto Retry same BuildId',
  'Terminal Failed + Events',
  'Recovery Lease + Cleanup',
] as const;

export const BUILD_FAILURE_RETRY_RECOVERY_OVERVIEW_NOTE =
  'Retry خودکار همان Build را ادامه می‌دهد؛ بعد از Failed فقط Build جدید (Retry بیزینسی). درصد Failure هرگز 100 نیست.';

export const BUILD_FAILURE_RETRY_RECOVERY_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal-failure-types',
    order: 1,
    title: 'هدف و انواع شکست',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'شکست Python قبل از ResultReady: Job و Build Failed؛ Result معتبر برای Import نیست.',
      'شکست Import در .NET بعد از ResultReady: Result ممکن است Ready بماند؛ Build Failed؛ Event به Python.',
    ],
    actionLabel: 'دو محدوده شکست',
    detail: {
      type: 'bullet-list',
      title: 'Python در برابر Import',
      description: 'هر سمت Event شکست خودش را اعلام می‌کند؛ مفاهیم مخلوط نمی‌شوند.',
      items: [
        'Python: PreparingInputs / ProcessingSources / GeneratingKnowledgeBase → BuildFailedV1',
        'NET: ResultReady / ImportingResult / ValidatingResult / ActivatingVersion → ImportFailedV1',
        'هدف: Retry امن، Recovery Lease، Cleanup، و عدم ثبت KB ناقص',
      ],
    },
  },
  {
    id: 'auto-vs-business-retry',
    order: 2,
    title: 'Retry خودکار در برابر بیزینسی',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'خودکار: همان BuildId / VersionId / ResultReferenceId؛ درصد کم نمی‌شود؛ Attempt داخلی زیاد می‌شود.',
      'بیزینسی: بعد از Failed نهایی همان Build دوباره فعال نمی‌شود؛ کاربر Build جدید می‌سازد.',
    ],
    actionLabel: 'محدوده فاز اول',
    detail: {
      type: 'bullet-list',
      title: 'قواعد Retry',
      description: 'API عمومی Resume برای Build شکست‌خورده نداریم؛ Requeue دستی فقط ابزار عملیاتی است.',
      items: [
        'Timeout / شبکه / Deadlock / 429 / Unavailable → Retry خودکار',
        'Failed نهایی → BuildId و VersionId رزروشده جدید در درخواست بعدی',
        'History Build شکست‌خورده برای تاریخچه نگه داشته می‌شود',
      ],
    },
  },
  {
    id: 'retryable-errors',
    order: 3,
    title: 'Retryable و Non-Retryable',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'موقت: Timeout، Deadlock، Rabbit/gRPC Unavailable، 429/5xx، Lease Expiration، Worker Crash.',
      'نهایی: Contract/Schema، Hash ناسازگار، Permission، ساختار KB نامعتبر، Conflict.',
    ],
    actionLabel: 'Max Attempts و Backoff',
    detail: {
      type: 'bullet-list',
      title: 'تنظیمات Configurable',
      description: 'Retry هر بخش با Attempt همان بخش؛ مثلاً Media Attempt، Generation را زیاد نمی‌کند. Jitter محدود به Backoff.',
      items: [
        'MaxJob/Source/Media = 5؛ MaxGeneration = 3؛ MaxImport = 5',
        'Backoff: 10s → 30s → 2m → 5m → Terminal',
        'Non-Retryable با همان ورودی نتیجه متفاوت نمی‌دهد',
      ],
    },
  },
  {
    id: 'terminal-python-lease',
    order: 4,
    title: 'Terminal Python و Lease',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Job Failed یا ResultReady → پاک‌کردن LockedBy / LockToken / LockedUntil',
      'Failed: LastError* + FinishedAt؛ LastEventSequence += 1',
      'Insert TaaviaKnowledgeBaseBuildFailedV1 در Outbox',
      'درصد Job به 100 نمی‌رود؛ آخرین درصد موفق حفظ می‌شود',
    ],
    note: 'برای ResultReady: FinishedAt = ReadyAt؛ یعنی پایان پردازش Python نه پایان Import در .NET.',
  },
  {
    id: 'python-failed-event',
    order: 5,
    title: 'Event شکست Python',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildFailedV1',
    eventChips: [
      'sequence',
      'stage ≤ Generating',
      'progressPercent ≤ 90',
      'errorCode',
      'RK: build.failed.v1',
    ],
    note: 'Exchange taavia.knowledge-base؛ Queue/DLQ سمت .NET؛ Stage فقط PreparingInputs / ProcessingSources / GeneratingKnowledgeBase.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Contract Failure Python',
      description: 'متن فنی کامل داخل Event نیست؛ جزئیات در PostgreSQL، Log و Sentry است.',
      code: `{
  "eventId": "36e56a94523b40bc8dfb214b755179bd",
  "eventType": "TaaviaKnowledgeBaseBuildFailedV1",
  "occurredAt": "2026-07-16T12:45:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "sequence": 14,
    "stage": "ProcessingSources",
    "progressPercent": 47,
    "errorCode": "SourceProcessingAttemptsExceeded",
    "startedAt": "2026-07-16T12:10:00Z",
    "failedAt": "2026-07-16T12:45:00Z"
  }
}`,
    },
  },
  {
    id: 'dotnet-consume-failure',
    order: 6,
    title: 'مصرف Failure در .NET',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Inbox Consumer: knowledge-base-build-failed-v1',
      'Validate Sequence نسبت به LastPythonEventSequence',
      'Build: Status=Failed؛ Stage=Payload؛ Progress=Max(current, payload)',
      'Inbox Applied → COMMIT → SignalR Full State',
    ],
    note: 'Sequence قدیمی/تکراری → Ignored+Ack؛ Conflict محتوا → Reject+DLQ؛ بعد از ResultReady/Importing → PythonFailureReceivedAfterResultReady.',
  },
  {
    id: 'flutter-failure',
    order: 7,
    title: 'Flutter و Failure',
    tag: 'فرانت',
    kind: 'event',
    eventName: 'KnowledgeBaseBuildStateChangedV1',
    eventChips: [
      'status = Failed',
      'stage = آخرین مرحله',
      'progressPercent ≠ 100',
      'finishedAt',
    ],
    note: 'خطای فنی Python به UI نمی‌رود؛ پیام عمومی: «ساخت پایگاه دانش با خطا مواجه شد.»',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Full State شکست',
      description: 'Status=Failed و Stage=آخرین مرحله واقعی؛ Stage جداگانه Failed نداریم.',
      code: `{
  "eventType": "TaaviaKnowledgeBaseBuildStateChangedV1",
  "occurredAt": "2026-07-16T12:45:01Z",
  "payload": {
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "buildType": "InitialBuild",
    "status": "Failed",
    "stage": "ProcessingSources",
    "progressPercent": 47,
    "requestedAt": "2026-07-16T12:09:50Z",
    "startedAt": "2026-07-16T12:10:00Z",
    "finishedAt": "2026-07-16T12:45:00Z",
    "updatedAt": "2026-07-16T12:45:00Z"
  }
}`,
    },
  },
  {
    id: 'import-fail-recovery',
    order: 8,
    title: 'شکست و Recovery Import',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'تا تمام Attempt: Import=RetryScheduled؛ Build همچنان Importing با آخرین Stage/%.',
      'نهایی: Import+Build Failed + Outbox ImportFailed؛ درصد به 100 نمی‌رود.',
    ],
    actionLabel: 'Recovery بر اساس Status',
    detail: {
      type: 'bullet-list',
      title: 'Lease منقضی Import',
      description: 'قبل از Retry نهایی Idempotency: Completed + VersionId + Activation.BuildId → Commit دوباره نه.',
      items: [
        'Downloading: Attempt Failed → RetryScheduled؛ Attempt بعدی Staging جدید',
        'Validating: Attempt Failed؛ می‌تواند دوباره Stream بگیرد',
        'ReadyToCommit: Attempt ثابت؛ فقط Commit نهایی Retry می‌شود؛ دانلود مجدد نه',
        'AttemptCount ≥ MaxImportAttempts → Failed + ImportFailed Event',
      ],
    },
  },
  {
    id: 'no-partial-kb',
    order: 9,
    title: 'عدم KB ناقص و Sources',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Download/Validation: فقط Staging؛ Activation اتمیک → Commit کامل یا Rollback کامل.',
      'Build Failed → دیگر فعال نیست؛ Sources دوباره قابل ویرایش؛ Initial بدون Version؛ Rebuild Version قبلی را نگه می‌دارد.',
    ],
    actionLabel: 'رفتار کاربر پس از Failed',
    detail: {
      type: 'bullet-list',
      title: 'تضمین و آزادسازی',
      description: 'ReadOnly بودن Sources از Query وضعیت Build است نه Applock چندساعته.',
      items: [
        'Build اولیه شکست‌خورده: Build جدید با BuildId و VersionId رزروشده جدید',
        'Rebuild شکست‌خورده: Active Version قبلی قابل استفاده می‌ماند',
        'Progress Failure روی آخرین مقدار موفق می‌ماند؛ هرگز 100',
      ],
    },
  },
  {
    id: 'import-failed-event',
    order: 10,
    title: 'Event ImportFailed',
    tag: 'بک',
    kind: 'event',
    eventName: 'TaaviaKnowledgeBaseBuildResultImportFailedV1',
    eventChips: [
      'resultReferenceId',
      'stage',
      'errorCode',
      'RK: result-import-failed.v1',
    ],
    note: 'Python: import_failed_at / import_failure_code؛ Result.Status همچنان Ready؛ اگر ImportedAt پر باشد → Contract Violation + DLQ.',
    actionLabel: 'مشاهده Payload',
    detail: {
      type: 'json',
      title: 'Contract شکست Import',
      description: 'یک Result نمی‌تواند هم‌زمان Import موفق و شکست‌خورده باشد.',
      code: `{
  "eventId": "4c414cff76f14e83999e1f313a7c599c",
  "eventType": "TaaviaKnowledgeBaseBuildResultImportFailedV1",
  "occurredAt": "2026-07-16T13:18:00Z",
  "payload": {
    "tenantId": "tenant-100",
    "brandId": "brand-200",
    "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
    "resultReferenceId": "339bb872-06b4-42bc-a302-2a64681ca906",
    "stage": "ValidatingResult",
    "errorCode": "ResultManifestHashMismatch",
    "failedAt": "2026-07-16T13:18:00Z"
  }
}`,
    },
  },
  {
    id: 'recovery-locktoken',
    order: 11,
    title: 'Recovery Worker و LockToken',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Python: Processing با LockedUntil منقضی → Recovery بر اساس Stage؛ سپس RetryScheduled یا Failed.',
      'هر Update Worker: Status=Processing + LockToken فعلی + LockedUntil معتبر.',
    ],
    actionLabel: 'Recovery بر اساس Stage Python',
    detail: {
      type: 'bullet-list',
      title: 'رفتار Recovery',
      description: 'پس از Recovery، LockToken قبلی نامعتبر است؛ Worker قدیمی نمی‌تواند Progress/Result/Failure بسازد.',
      items: [
        'PreparingInputs: Loading Batch → Failed WorkerLeaseExpired؛ Media به Pending؛ فایل Local پاک',
        'ProcessingSources: Processing → RetryScheduled؛ Completed دست نخورده',
        'GeneratingKnowledgeBase: Generating Attempt → Failed GenerationInterrupted',
        'بدون Attempt باقی‌مانده → Job Failed + Failure Event',
      ],
    },
  },
  {
    id: 'cleanup-monitor-acceptance',
    order: 12,
    title: 'Cleanup، Monitor و پذیرش',
    tag: 'عمومی',
    kind: 'checklist',
    items: [
      'Result Ready تا ImportedAt یا ImportFailedAt + Retention حذف نشود؛ Outbox منتشرنشده هرگز Cleanup نشود',
      'Build/Version/Activation/Node عملیاتی حذف نشوند؛ Inbox فقط Applied/Ignored/Rejected پس از Retention',
      'Alert: Outbox کهنه، Lease منقضی، ResultReady بدون Completion، DLQ، Hash Conflict، بیش از یک Build فعال',
      'Log بدون Presigned URL / API Key / SourceData کامل؛ Retry اول Build را Failed نکند؛ Staging ReadyToCommit دوباره دانلود نشود',
      'Worker بدون Lease ثبت نکند؛ Sources پس از Failed قابل ویرایش؛ Monitoring روی Retry/Recovery/Failure',
    ],
  },
];
