import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const GET_TEMPORARY_MEDIA_LINK_META: BuildVersionStepDocMeta = {
  slug: 'get-temporary-media-link',
  title: '۱۰. دریافت لینک موقت Media و دانلود مستقیم از MinIO',
  description:
    'Python با gRPC لینک دانلود موقت می‌گیرد، فایل را مستقیماً از MinIO دانلود می‌کند و Size و SHA-256 را اعتبارسنجی می‌کند. gRPC = Control Plane و MinIO = Data Plane؛ فایل از .NET عبور نمی‌کند.',
  status: 'فعال',
  pills: ['Presigned URL', 'MinIO', 'SHA-256'],
};

export const GET_TEMPORARY_MEDIA_LINK_OVERVIEW_STEPS = [
  'gRPC لینک موقت',
  'دانلود Streaming از MinIO',
  'Size + SHA-256',
  'Validated → Consumed',
] as const;

export const GET_TEMPORARY_MEDIA_LINK_OVERVIEW_NOTE =
  'لینک موقت در DB/Log/Sentry ذخیره نمی‌شود؛ فایل از .NET عبور نمی‌کند.';

export const GET_TEMPORARY_MEDIA_LINK_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal-architecture',
    order: 1,
    title: 'هدف و معماری',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'gRPC = Control Plane (لینک موقت + Metadata)؛ MinIO = Data Plane (باینری).',
      'فایل از Backend دات‌نت، RabbitMQ یا gRPC عبور نمی‌کند.',
    ],
    actionLabel: 'دلایل این معماری',
    detail: {
      type: 'bullet-list',
      title: 'چرا Control Plane / Data Plane',
      description: 'فایل اصلی در Storage مشترک می‌ماند؛ در انقضای لینک، Python لینک جدید می‌گیرد.',
      items: [
        'ترافیک فایل روی .NET نیست',
        'باینری داخل RabbitMQ یا gRPC منتقل نمی‌شود',
        'Python به Credentialهای MinIO دسترسی ندارد',
        'لینک فقط برای یک Object و مدت محدود معتبر است',
        'MinIO مسئول Streaming و مدیریت اتصال است',
      ],
    },
  },
  {
    id: 'responsibilities',
    order: 2,
    title: 'مسئولیت‌ها',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      '.NET: اعتبارسنجی Build/Source/Media و Presigned GET + Metadata.',
      'Python: درخواست لینک، Streaming دانلود، Size/Hash، Retry، Cleanup.',
    ],
    actionLabel: 'نقش MinIO',
    detail: {
      type: 'bullet-list',
      title: 'تقسیم مسئولیت',
      description: 'دانستن MediaId به‌تنهایی برای دریافت لینک کافی نیست.',
      items: [
        '.NET: Build، Tenant/Brand، Source، ارتباط Media، اندازه مجاز، Presigned URL',
        'Python: لینک، دانلود Disk موقت، Size، SHA-256، Retry، حذف موقت',
        'MinIO: نگهداری فایل، اعتبار امضا، ارسال مستقیم بایت‌ها',
      ],
    },
  },
  {
    id: 'rpc-request',
    order: 3,
    title: 'RPC لینک',
    tag: 'بک',
    kind: 'event',
    eventName: 'GetKnowledgeBaseBuildMediaDownloadUrlV1',
    eventChips: [
      'Unary Request/Response',
      'Build: Queued | Processing',
      'sourceRevision + contentHash',
      'mediaId',
    ],
    note: 'Importing / Completed / Failed مجاز نیستند (هماهنگ با سند ۹).',
    actionLabel: 'مشاهده Request',
    detail: {
      type: 'json',
      title: 'Request دریافت لینک',
      description:
        'برای هر Media یک درخواست مستقل. source_revision و source_content_hash باید با Input Batch قفل‌شده برابر باشند.',
      code: `{
  "tenantId": "tenant-100",
  "brandId": "brand-200",
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91",
  "sourceType": "BrandInfo",
  "sourceId": "info-100",
  "sourceRevision": 4,
  "sourceContentHash": "4e30f4b821...",
  "mediaId": "media-500"
}`,
    },
  },
  {
    id: 'rpc-response',
    order: 4,
    title: 'Response و نسخه‌بندی',
    tag: 'بک',
    kind: 'event',
    eventName: 'GetKnowledgeBaseBuildMediaDownloadUrlV1Response',
    eventChips: [
      'downloadUrl + expiresAt',
      'sizeBytes',
      'contentSha256',
      'بدون version field',
    ],
    note: 'نسخه در نام RPC/Message است. AccessKey، Bucket Key و Permanent URL در Response نیستند.',
    actionLabel: 'مشاهده Response',
    detail: {
      type: 'json',
      title: 'نمونه Response لینک',
      description:
        'content_sha256 از Metadata ذخیره‌شده هنگام Upload می‌آید؛ هنگام هر درخواست لینک فایل کامل دوباره Hash نمی‌شود. ETag معیار صحت نیست.',
      code: `{
  "mediaId": "media-500",
  "downloadUrl": "https://minio.example.com/...",
  "expiresAt": "2026-07-16T10:15:00Z",
  "extension": ".pdf",
  "contentType": "application/pdf",
  "originalFileName": "catalog.pdf",
  "sizeBytes": 4258012,
  "contentSha256": "cfa7601f..."
}`,
    },
  },
  {
    id: 'dotnet-validation',
    order: 5,
    title: 'اعتبارسنجی .NET',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Build متعلق به Tenant/Brand؛ Type=InitialBuild|Rebuild؛ Status=Queued|Processing.',
      'Source revision/hash برابر؛ Media داخل همان Source؛ Object موجود؛ اندازه مجاز.',
    ],
    actionLabel: 'فهرست کامل Precheck',
    detail: {
      type: 'bullet-list',
      title: 'بررسی‌های قبل از Presigned URL',
      description: 'Python نمی‌تواند با MediaId برند دیگر لینک بگیرد.',
      items: [
        'Build وجود دارد و Finished نیست',
        'TenantId/BrandId با Build برابرند',
        'Source متعلق به همان Tenant/Brand با Type/Id معتبر',
        'SourceRevision و SourceContentHash با مقدار فعلی برابرند',
        'MediaId واقعاً در همان Source Reference شده و حذف نشده',
        'Object در MinIO وجود دارد و اندازه از حد مجاز بیشتر نیست',
      ],
    },
  },
  {
    id: 'presigned-security',
    order: 6,
    title: 'Presigned و امنیت لینک',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط GET برای همان Object؛ Bucket عمومی نیست؛ HTTPS؛ اعتبار پیشنهادی ۱۰ دقیقه.',
      'download_url در PostgreSQL، Log، Sentry، Job Payload یا RabbitMQ ذخیره نمی‌شود.',
    ],
    actionLabel: 'ممنوعیت‌ها و Redaction',
    detail: {
      type: 'bullet-list',
      title: 'قواعد Presigned و داده حساس',
      description: 'در Log فقط Host/Path با Query String برابر [REDACTED] ثبت می‌شود.',
      items: [
        'بدون AccessKey / SecretKey / Service Account در Response',
        'بدون Permanent Object URL و وابستگی Contract به Bucket/Key',
        'لینک در Error Message کامل نمایش داده نمی‌شود',
        'اعتبار Configurable؛ پس از انقضا لینک جدید با gRPC',
      ],
    },
  },
  {
    id: 'media-tables',
    order: 7,
    title: 'جداول Media',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'knowledge_base_build_input_media_files',
      'knowledge_base_build_input_source_media',
      'Pending → Downloading → Validated → Consumed',
      'UNIQUE(batch, media_id)',
    ],
    actionLabel: 'Schema و Transition',
    detail: {
      type: 'kv-list',
      title: 'Schema و وضعیت‌ها',
      description:
        'فایل و لینک در PG ذخیره نمی‌شوند. Media مشترک در Batch یک بار دانلود می‌شود. Validated→Pending اگر Worker قبل از Consumed Restart شود.',
      items: [
        { label: 'Media row', value: 'expected/validated size+sha256، attempt_count، last_url_requested_at (بدون URL)' },
        { label: 'Source-Media', value: 'UNIQUE(input_source_id, input_media_file_id)' },
        { label: 'Pending', value: 'شناسایی‌شده؛ دانلود شروع نشده' },
        { label: 'Downloading', value: 'لینک گرفته؛ دانلود جاری' },
        { label: 'Validated', value: 'Size/Hash OK؛ فایل موقت روی Disk Worker' },
        { label: 'Consumed / Failed', value: 'خروجی پایدار / غیرقابل استفاده' },
      ],
    },
  },
  {
    id: 'download-flow',
    order: 8,
    title: 'فلو دانلود',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Pending → Lock + Attempt++ → Downloading',
      'gRPC لینک + Metadata (بدون ذخیره URL)',
      'HTTP Streaming + Size/SHA-256 → Validated',
      'پردازش → Consumed + حذف فایل موقت',
    ],
    note: 'مسیر موقت مثل /tmp/taavia-kb/{buildId}/{batchId}/{mediaId}.download — Source of Truth نیست و با Restart حذف می‌شود.',
  },
  {
    id: 'http-expiry',
    order: 9,
    title: 'HTTP Client و انقضا',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط HTTPS؛ Host allowlist MinIO؛ بدون Redirect ناشناس؛ Chunk ≈ 256KB Streaming.',
      'انقضا → URL دور انداخته می‌شود؛ gRPC مجدد؛ دانلود از ابتدا (بدون Resume).',
    ],
    actionLabel: 'قواعد اعتبارسنجی دانلود',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی HTTP و فایل',
      description: 'Headerها معیار نهایی نیستند؛ بایت‌های واقعی دانلودشده معیار Size و SHA-256 هستند.',
      items: [
        'HTTP 200 OK مورد انتظار است',
        'Content-Length در صورت وجود با sizeBytes ناسازگار نباشد',
        'بایت نهایی = sizeBytes و SHA-256 = contentSha256',
        'Host غیرمجاز → رد دانلود + Alert',
        'بدون بارگذاری کل فایل در Memory',
      ],
    },
  },
  {
    id: 'errors-retry',
    order: 10,
    title: 'خطا و Retry',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'gRPC: NOT_FOUND/PERMISSION/FAILED_PRECONDITION/RESOURCE_EXHAUSTED غیرقابل Retry.',
      'Backoff: 5s → 15s → 30s → 60s → Failed؛ هر Retry URL جدید + حذف فایل موقت.',
    ],
    actionLabel: 'MinIO و Integrity',
    detail: {
      type: 'bullet-list',
      title: 'خطاهای دانلود و Integrity',
      description: 'اختلاف Size/Hash یک‌بار با لینک جدید Retry؛ تکرار → MediaContentIntegrityFailed + Alert.',
      items: [
        '403 → لینک جدید و دانلود مجدد؛ چند 403 متوالی = خطای تنظیمات/امنیتی',
        '404 Object → Non-Retryable + Sentry',
        '429 / 5xx / Timeout → Retryable with Backoff',
        'UNAVAILABLE / DEADLINE_EXCEEDED روی gRPC → Retryable',
      ],
    },
  },
  {
    id: 'parallel-tx-recovery',
    order: 11,
    title: 'Parallel، TX و Recovery',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'حداکثر ۳ دانلود هم‌زمان per Job (+ سقف Instance)؛ TX کوتاه فقط برای وضعیت.',
      'Crash روی Downloading یا Validated مصرف‌نشده → Pending و دانلود مجدد.',
    ],
    actionLabel: 'جزئیات TX و Recovery',
    detail: {
      type: 'bullet-list',
      title: 'Transaction و Recovery',
      description: 'تمام Updateها LockToken و مالکیت Job را بررسی می‌کنند. Consumed نیاز به دانلود مجدد ندارد.',
      items: [
        'TX شروع: Downloading + Attempt++ + timestamps → Commit سپس gRPC/HTTP',
        'TX Metadata: extension/type/size/sha expected بدون URL',
        'TX پایان: Validated + validated size/sha',
        'Downloading crash → حذف موقت → Pending',
        'Validated بدون Consumed → Pending (فایل فقط روی Disk Worker قبلی بود)',
      ],
    },
  },
  {
    id: 'progress-acceptance',
    order: 12,
    title: 'Progress، خروجی و پذیرش',
    tag: 'عمومی',
    kind: 'detail-list',
    summaryLines: [
      'Stage = PreparingInputs تا Batch کامل و همه Mediaهای الزامی حداقل Validated باشند.',
      'موفق: Presigned صادر، فایل مستقیم از MinIO، Metadata Validated، بدون فایل در RabbitMQ.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Progress per Chunk به Flutter نمی‌رود؛ Eventها Throttle می‌شوند.',
      items: [
        'فایل از .NET / gRPC / RabbitMQ عبور نکند',
        'بدون Credential دائمی MinIO؛ MediaId به‌تنهایی کافی نباشد',
        'ارتباط Build/Tenant/Brand/Source/Media بررسی شود',
        'لینک فقط GET و کوتاه‌عمر؛ در DB/Log/Sentry ذخیره نشود',
        'Streaming + Size/SHA-256؛ ETag معیار Hash نباشد',
        'فایل موقت SoT نباشد؛ Restart باعث فایل ناقص نشود',
        'Media مشترک یک‌بار دانلود؛ انقضا با gRPC جدید',
        'Downloading و Validated مصرف‌نشده در Recovery دوباره Pending',
        'فقط Media معتبر وارد پردازش Source شود',
      ],
    },
  },
];
