import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocMeta,
} from '@/app/lib/taavia-build-version-step-doc-types';

export const RECEIVE_BRAND_SOURCES_META: BuildVersionStepDocMeta = {
  slug: 'receive-brand-sources',
  title: '۹. دریافت Sources توسط Python از .NET با gRPC',
  description:
    'پس از شروع Job، Python تمام منابع معتبر برند را از .NET با gRPC دریافت می‌کند. Python به SQL Server دسترسی ندارد؛ مجموعه Sources در طول Build ثابت می‌ماند و در PostgreSQL پایدار ذخیره می‌شود.',
  status: 'فعال',
  pills: ['gRPC Stream', 'Input Batch', 'ManifestHash'],
};

export const RECEIVE_BRAND_SOURCES_OVERVIEW_STEPS = [
  'Stream Header',
  'دریافت Sources',
  'Completed + Hash',
  'Activate Batch',
] as const;

export const RECEIVE_BRAND_SOURCES_OVERVIEW_NOTE =
  'Media باینری در این Stream نیست؛ لینک موقت در سند ۱۰.';

export const RECEIVE_BRAND_SOURCES_CARDS: BuildVersionStepDocCard[] = [
  {
    id: 'goal',
    order: 1,
    title: 'هدف',
    tag: 'عمومی',
    kind: 'text',
    summaryLines: [
      'Python منابع معتبر Tenant/Brand را از .NET می‌گیرد تا Knowledge Base را بسازد.',
      'بدون دسترسی مستقیم به SQL Server؛ مجموعه ثابت؛ ذخیره پایدار؛ بدون باینری در RabbitMQ.',
    ],
  },
  {
    id: 'responsibilities',
    order: 2,
    title: 'مسئولیت‌ها',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      '.NET: اعتبارسنجی Build، Canonical JSON، Hash، Manifest، Server Streaming.',
      'Python: فراخوانی gRPC، اعتبارسنجی Count/Hash، ذخیره Batch، فعال‌کردن ورودی کامل.',
    ],
    actionLabel: 'خارج از این مرحله',
    detail: {
      type: 'bullet-list',
      title: 'در این مرحله انجام نمی‌شود',
      description: 'دریافت بایت Media و پردازش محتوا در مراحل بعدی است.',
      items: [
        'پردازش محتوای Sourceها',
        'اجرای OCR یا Document AI',
        'فراخوانی AI Model',
        'ساخت Knowledge Node',
        'دریافت بایت فایل‌های Media',
      ],
    },
  },
  {
    id: 'grpc-service',
    order: 3,
    title: 'سرویس gRPC',
    tag: 'بک',
    kind: 'event',
    eventName: 'StreamKnowledgeBaseBuildInputs',
    eventChips: ['tenant_id', 'brand_id', 'build_id', 'Server Streaming'],
    note: 'RPC دوم GetKnowledgeBaseBuildMediaDownloadUrlV1 فقط لینک موقت Media است (سند ۱۰).',
    actionLabel: 'مشاهده Request',
    detail: {
      type: 'json',
      title: 'Request و دلیل Streaming',
      description:
        'ارسال همه Sources در یک Response بزرگ حافظه و محدودیت اندازه پیام را تهدید می‌کند؛ بنابراین .NET به‌صورت Stream برمی‌گرداند. Python هیچ Source/VersionId/MediaId در Request نمی‌فرستد.',
      code: `{
  "tenantId": "tenant-100",
  "brandId": "brand-200",
  "buildId": "7f04c30ae78547d9bc173c3557a0bc91"
}`,
    },
  },
  {
    id: 'stream-shape',
    order: 4,
    title: 'ساختار Stream',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Header',
      'Source 1 … Source N',
      'Completed',
    ],
    note: 'oneof: header | source | completed. نبودن Header یا Completed یعنی Stream ناقص.',
  },
  {
    id: 'header-source',
    order: 5,
    title: 'Header و Source',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'Header: source_count + manifest_hash',
      'Source: source_data_json_utf8 (bytes)',
      'source_content_hash = SHA-256',
      'Types: BrandInfo | Product | FAQ',
    ],
    actionLabel: 'فیلدها و SourceType',
    detail: {
      type: 'kv-list',
      title: 'فیلدهای Header/Source و Enum',
      description:
        'از Struct استفاده نمی‌شود تا ترتیب Property و فرمت اعداد/Null/تاریخ عوض نشود. Hash روی بایت خام قبل از Parse است. مقدار UNSPECIFIED=0 معتبر نیست.',
      items: [
        { label: 'Header', value: 'tenant/brand/build + build_type + source_count + manifest_hash + generated_at' },
        { label: 'Source', value: 'type, id, revision, title?, schema_version, json_utf8, content_hash' },
        { label: 'BrandInfo', value: '1 — معرفی برند + مرجع Media' },
        { label: 'Product', value: '2 — محصول و فیلدهای داینامیک' },
        { label: 'FAQ', value: '3 — پرسش‌وپاسخ فعال و تأییدشده' },
      ],
    },
  },
  {
    id: 'eligible-lock',
    order: 6,
    title: 'Sources معتبر و قفل',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'فقط Sources قابل‌استفاده Tenant/Brand؛ FAQهای Draft/Rejected/Pending ارسال نمی‌شوند.',
      'در Queued/Processing/Importing منابع ReadOnly با AppLock هستند.',
    ],
    actionLabel: 'قواعد واجد شرایط و قفل',
    detail: {
      type: 'bullet-list',
      title: 'فیلتر Sources و قفل تغییر',
      description:
        'Retry همان Build باید همان مجموعه ورودی را بگیرد. قفل: taavia:knowledge-sources:{tenantId}:{brandId} با sp_getapplock.',
      items: [
        'BrandInfo: متعلق به Tenant/Brand، حذف/Archive نشده، قابل‌استفاده',
        'Product: فعال، حذف‌نشده؛ فیلدهای فعلی داخل SourceData',
        'FAQ: فعال، تأییدشده، حذف‌نشده؛ Draft/Rejected/Pending ممنوع',
        'از ثبت Build تا پایان: Sources فقط خواندنی',
        'Handler: TX کوتاه + Shared Lock → خواندن → Canonical/Hash/Manifest → Commit → سپس Stream',
      ],
    },
  },
  {
    id: 'canonical-hashes',
    order: 7,
    title: 'Canonical و Hashها',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Canonical JSON: ترتیب ثابت، UTC ISO-8601، Enum ثابت، UTF-8 بدون whitespace اضافه.',
      'SourceContentHash = SHA-256(bytes)؛ ManifestHash روی خطوط مرتب SourceType|Id|Revision|Hash.',
    ],
    actionLabel: 'قواعد Hash و Completed',
    detail: {
      type: 'bullet-list',
      title: 'Canonical، Manifest و Completed',
      description: 'Python JSON را دوباره Serialize و با Hash .NET مقایسه نمی‌کند. Hash خروجی hex lowercase ۶۴ کاراکتر است.',
      items: [
        'مرتب‌سازی Manifest: SourceType سپس SourceId',
        'خط Manifest: SourceType|SourceId|SourceRevision|SourceContentHash',
        'ManifestHash = SHA-256(خطوط با \\n)',
        'Completed: streamed_source_count + manifest_hash',
        'باید Header.Count = Received = Completed.Count و هر سه ManifestHash برابر باشند',
      ],
    },
  },
  {
    id: 'pg-tables',
    order: 8,
    title: 'جداول PostgreSQL',
    tag: 'بک',
    kind: 'build-summary',
    summaryItems: [
      'knowledge_base_build_input_batches',
      'knowledge_base_build_input_sources',
      'Job.active_input_batch_id',
      'Status: Loading | Completed | Failed',
    ],
    actionLabel: 'جزئیات Schema',
    detail: {
      type: 'kv-list',
      title: 'Batch، Sources و فیلدهای Job',
      description:
        'source_data برای Query و source_data_raw برای Audit/Hash نگهداری می‌شوند. فقط Batch Completed می‌تواند Active شود.',
      items: [
        { label: 'Batch', value: 'id, job_id, status, expected/received counts, expected/calculated manifest, timestamps, last_error' },
        { label: 'Source', value: 'batch_id, type, source_id, revision, schema_version, jsonb + bytea, content_hash' },
        { label: 'UNIQUE', value: '(input_batch_id, source_type, source_id)' },
        { label: 'Job', value: 'active_input_batch_id, input_source_count, input_manifest_hash, inputs_loaded_at' },
      ],
    },
  },
  {
    id: 'batch-flow',
    order: 9,
    title: 'فلو Batch و Retry',
    tag: 'بک',
    kind: 'transaction',
    steps: [
      'Batch = Loading + شروع Stream',
      'Header → Sources (hash سپس parse) → Completed',
      'اعتبارسنجی Count و ManifestHash',
      'TX: Batch Completed + Active روی Job',
    ],
    note: 'Stream در یک TX طولانی PG نیست. ناقص → Batch=Failed و Active عوض نمی‌شود. Active Completed موجود → دریافت مجدد نمی‌شود.',
  },
  {
    id: 'build-security',
    order: 10,
    title: 'Build مجاز و امنیت',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'Build مجاز: Queued یا Processing (حتی قبل از مصرف Progress Event).',
      'ممنوع: Importing / Completed / Failed. gRPC با TLS + Service Auth؛ Deadline ≈ ۵ دقیقه.',
    ],
    actionLabel: 'Precheck و امنیت',
    detail: {
      type: 'bullet-list',
      title: 'اعتبارسنجی .NET و الزامات امنیتی',
      description: 'شناسه‌های Request به‌تنهایی معیار مجوز نیستند. پیشنهاد Production: mTLS.',
      items: [
        'Build وجود + Tenant/Brand برابر Request',
        'Type = InitialBuild|Rebuild؛ Status = Queued|Processing؛ FinishedAt خالی',
        'KnowledgeBaseVersionId مقدار داشته باشد؛ SourceRestoreMode = null',
        'TLS، Service-to-Service Auth، Authorization Policy',
        'CorrelationId = BuildId؛ Deadline اجباری (۵ دقیقه Configurable)',
      ],
    },
  },
  {
    id: 'errors-progress',
    order: 11,
    title: 'خطا و Progress',
    tag: 'بک',
    kind: 'detail-list',
    summaryLines: [
      'در طول دریافت: Status=Processing، Stage=PreparingInputs؛ Progress throttle؛ بدون Event اجباری per Source.',
      'NoEligibleKnowledgeSources → FAILED_PRECONDITION و Non-Retryable.',
    ],
    actionLabel: 'کدهای gRPC و Progress',
    detail: {
      type: 'bullet-list',
      title: 'خطاهای gRPC و ارتباط با Progress',
      description:
        'PreparingInputs فقط وقتی تمام می‌شود که Batch کامل و Mediaهای الزامی (سند ۱۰) آماده باشند. Media فقط به‌صورت مرجع در SourceData است.',
      items: [
        'NOT_FOUND / PERMISSION_DENIED / FAILED_PRECONDITION / DATA_LOSS → Non-Retryable',
        'UNAVAILABLE / DEADLINE_EXCEEDED → Retryable',
        'هیچ Source واجد شرایط → NoEligibleKnowledgeSources',
        'SourceData فقط media.id دارد؛ بدون Presigned URL یا Credential',
        'Progress داخلی ممکن است از تعداد Source استفاده کند؛ .NET/Flutter تعداد را به درصد تبدیل نمی‌کنند',
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
      'موفق: Batch Completed، Sources ذخیره‌شده، Job دارای ActiveInputBatchId و ManifestHash؛ Stage=PreparingInputs.',
      'پس از آن Python Media Referenceها را طبق سند ۱۰ از MinIO می‌گیرد.',
    ],
    actionLabel: 'معیارهای پذیرش',
    detail: {
      type: 'bullet-list',
      title: 'معیارهای پذیرش',
      description: 'Sources در طول Build قفل می‌مانند؛ Batch کامل بعد از Restart قابل استفاده است.',
      items: [
        'Python به SQL Server متصل نشود؛ همه Sources از gRPC',
        'Queued/Processing مجاز؛ Importing/Completed/Failed غیرمجاز',
        'Stream ناقص قابل استفاده نباشد؛ Batch فقط بعد از Count+Manifest فعال شود',
        'Hash هر Source قبل از Parse؛ Tenant دیگر و FAQ تأییدنشده ارسال نشوند',
        'باینری و Presigned URL داخل Stream/SourceData نباشند',
        'Retry دو Batch را ترکیب نکند؛ Active Batch بدون دریافت مجدد قابل ادامه باشد',
        'تغییر Source تا پایان Build مسدود بماند',
      ],
    },
  },
];
