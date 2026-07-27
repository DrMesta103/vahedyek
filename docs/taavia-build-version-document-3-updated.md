# سند ۳: دریافت Event در Python و ثبت Inbox / Job

## ۱. هدف بیزینسی

این فلو Eventهای ورودی را از RabbitMQ دریافت می‌کند، آن‌ها را به‌صورت پایدار در PostgreSQL ثبت می‌کند و برای Eventهایی که نیاز به پردازش دارند، Job می‌سازد.

پس از Ack شدن پیام RabbitMQ، اطلاعات Event و Job باید در PostgreSQL باقی بماند و Restart سرویس Python نباید باعث ازبین‌رفتن آن‌ها شود.

## ۲. معماری و مسئولیت Workerها

در سمت Python دو Worker مستقل وجود دارد:

### Worker دریافت‌کننده RabbitMQ

این Worker از Queueهای متصل به Exchangeهای مختلف پیام دریافت می‌کند و فقط مسئول Ingress است:

```text
RabbitMQ
→ دریافت پیام
→ اعتبارسنجی Envelope عمومی
→ محاسبه MessageHash
→ ثبت Inbox و در صورت نیاز Job
→ Commit
→ RabbitMQ Ack
```

این Worker نباید منطق سنگین بیزینسی، AI، پردازش فایل یا اجرای واقعی Build را انجام دهد.

### Worker پردازش Job

این Worker مستقل از RabbitMQ، Jobهای ثبت‌شده در PostgreSQL را Claim می‌کند و بر اساس `eventType`، Handler مناسب را انتخاب می‌کند. اجرای واقعی Event، دریافت Sources، پردازش AI، ساخت Knowledge Base و گزارش Progress در این Worker انجام می‌شود.

## ۳. تنظیمات RabbitMQ

نمونه‌ی Binding فعلی:

```text
Exchange:
taavia.knowledge-base

Exchange Type:
topic

Routing Key:
taavia.knowledge-base.build.requested.v1

Queue:
taavia-ai.knowledge-base.build.requested.v1

Durable = true
AutoDelete = false
Exclusive = false
Manual Ack = true

Dead Letter Queue:
taavia-ai.knowledge-base.build.requested.v1.dlq
```

این Binding فقط یک نمونه است. Worker دریافت‌کننده می‌تواند از Queueها یا Exchangeهای مختلف پیام بگیرد. پیام نامعتبر یا غیرقابل‌پردازش بدون Requeue به DLQ منتقل می‌شود.

## ۴. Envelope ورودی

نسخه‌ی Event فعلاً فیلد جداگانه ندارد و داخل نام `eventType` قرار دارد؛ مانند `TaaviaKnowledgeBaseBuildRequestedV1`.

```json
{
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
}
```

### قوانین Envelope

- `eventId` در کل سیستم یکتا است و در Retry یا انتشار مجدد تغییر نمی‌کند.
- `eventId` کلید Idempotency است.
- `eventType` خالی نیست و نوع Event و نسخه‌ی آن را در نام خود مشخص می‌کند.
- `occurredAt` زمان ایجاد Event در Outbox با UTC است، نه زمان دریافت Python.
- `payload` باید JSON معتبر و قابل ذخیره‌سازی باشد.
- Eventهای مختلف می‌توانند وارد Ingress شوند؛ انتخاب Contract و Handler بر اساس `eventType` در Worker پردازش انجام می‌شود.

## ۵. اعتبارسنجی Contract

Worker دریافت‌کننده فقط اعتبارسنجی عمومی را انجام می‌دهد:

- `eventId` خالی نباشد و از نظر Idempotency قابل استفاده باشد.
- `eventType` خالی نباشد.
- `occurredAt` معتبر و دارای Timezone باشد.
- `payload` معتبر باشد.
- Envelope و MessageHash قابل محاسبه باشند.

اعتبارسنجی فیلدهای اختصاصی هر Event، مانند `tenantId`، `brandId`، `buildId` یا `buildType`، داخل Contract Validator و Handler همان Event انجام می‌شود. بنابراین Consumer عمومی نباید فقط یک Event خاص را قبول کند یا Eventهای دیگر مانند `Rollback` و `ManualVersionCreation` را صرفاً به‌دلیل نامشان رد کند.

در صورت نامعتبر بودن Envelope عمومی، پیام بدون Requeue به DLQ منتقل می‌شود. در صورت معتبر بودن Envelope ولی نامعتبر بودن Contract اختصاصی، تصمیم Reject یا وضعیت پردازش توسط Handler همان `eventType` تعیین می‌شود.

## ۶. جدول Inbox در PostgreSQL

نام جدول:

```text
integration_inbox_messages
```

Inbox پیام را مستقل از نوع Event پایدار می‌کند. هر `eventId` در کل سیستم فقط یک رکورد Inbox دارد.

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | bigint identity | شناسه داخلی PostgreSQL |
| `consumer_name` | varchar(150) | نام Worker دریافت‌کننده؛ نمونه: `rabbitmq-ingress-worker` |
| `event_id` | varchar(64) | شناسه یکتای سراسری Event و کلید Idempotency |
| `event_type` | varchar(200) | نوع Event و نسخه‌ی آن در نام Event |
| `message_body` | jsonb | Envelope و payload کامل پیام |
| `rabbitmq_metadata` | jsonb | اطلاعات RabbitMQ مانند exchange، queue، routing key، delivery tag و headers |
| `message_hash` | char(64) | SHA-256 پیام Canonical |
| `occurred_at` | timestamptz | زمان ایجاد Event |
| `received_at` | timestamptz | زمان دریافت توسط Worker Python |
| `processed_at` | timestamptz nullable | زمان پایان پردازش Handler |
| `status` | varchar(50) | وضعیت Ingress یا پردازش مانند `Received`، `Processed`، `Rejected` یا `Unsupported` |

Constraints:

```text
PRIMARY KEY (id)
UNIQUE (event_id)
```

رکورد Inbox پس از ثبت نباید ویرایش یا حذف فوری شود. پاک‌سازی فقط با Retention Policy انجام می‌شود.

نمونه‌ی `rabbitmq_metadata`:

```json
{
  "exchange": "taavia.knowledge-base",
  "queue": "taavia-ai.knowledge-base.build.requested.v1",
  "routingKey": "taavia.knowledge-base.build.requested.v1",
  "deliveryTag": 1842,
  "headers": {
    "contentType": "application/json"
  }
}
```

## ۷. جدول Job در PostgreSQL

نام جدول:

```text
knowledge_base_build_jobs
```

Job نماینده‌ی پایدار عملیات Build در Python است و توسط Worker پردازش، مستقل از RabbitMQ، اجرا می‌شود.

فیلدهای اصلی:

```text
id
inbox_message_id
build_id
tenant_id
brand_id
build_type
status
stage
progress_percent
attempt_count
available_at
locked_by
locked_until
last_event_sequence
result_reference_id
last_error_code
last_error_message
last_error_at
created_at
started_at
finished_at
updated_at
```

Constraints اصلی:

```text
PRIMARY KEY (id)
UNIQUE (build_id)
UNIQUE (inbox_message_id)
CHECK (attempt_count >= 0)
CHECK (progress_percent BETWEEN 0 AND 90)
```

## ۸. Enumهای Job

### BuildType

```text
InitialBuild = 1
Rebuild = 2
```

### JobStatus

```text
Queued = 1
Processing = 2
RetryScheduled = 3
ResultReady = 4
Failed = 5
```

### JobStage

```text
Queued = 1
PreparingInputs = 2
ProcessingSources = 3
GeneratingKnowledgeBase = 4
ResultReady = 5
```

## ۹. Transaction دریافت Event

عملیات ثبت Inbox و Job در یک Transaction PostgreSQL انجام می‌شود:

```text
BEGIN
Validate Envelope
Canonicalize JSON
Calculate MessageHash
Check Inbox by EventId
Insert Inbox
Dispatch or create Job according to eventType
COMMIT
RabbitMQ ACK
```

Ack فقط بعد از Commit موفق ارسال می‌شود.

## ۱۰. رفتار Duplicate و Idempotency

### همان `eventId` و همان `messageHash`

پیام تکراری است. Inbox موجود تشخیص داده می‌شود، Job دوم ساخته نمی‌شود و پیام Ack می‌شود.

### همان `eventId` با `messageHash` متفاوت

این وضعیت نقض Contract است. Job دوم ساخته نمی‌شود و پیام برای بررسی به DLQ منتقل می‌شود.

### `eventId` جدید با شناسه‌ی کسب‌وکاری تکراری

تصمیم‌گیری درباره‌ی Reject، Ignore یا پردازش مجدد بر عهده‌ی Handler همان Event است؛ Consumer عمومی نباید بر اساس نوع خاصی از Build تصمیم بگیرد.

## ۱۱. رفتار خطا

### خطای موقت PostgreSQL یا زیرساخت

```text
Rollback
→ Nack with Requeue
```

هیچ Inbox یا Job ناقصی نباید Commit شود.

### پیام نامعتبر

```text
Reject without Requeue
→ DLQ
→ Log + Sentry
```

### قطع قبل از Commit

پیام دوباره تحویل می‌شود و چون داده‌ای Commit نشده، پردازش از ابتدا انجام می‌شود.

### قطع بعد از Commit و قبل از Ack

پیام دوباره تحویل می‌شود. اگر `eventId` و `messageHash` یکسان باشند، Inbox آن را Duplicate معتبر تشخیص می‌دهد، Job دوم ساخته نمی‌شود و پیام Ack می‌شود. اگر همان `eventId` با `messageHash` متفاوت باشد، نقض Idempotency است و پیام بدون Requeue به DLQ منتقل می‌شود.

## ۱۲. مالکیت داده

- `.NET` مالک `BuildId`، `TenantId`، `BrandId` و داده‌ی Outbox است.
- Worker دریافت‌کننده مالک دریافت پیام، ثبت Inbox و Ack پس از Commit است.
- Worker پردازش مالک وضعیت Job، Attempt، Lease، خطا و `ResultReferenceId` است.
- RabbitMQ فقط مسئول انتقال Event است و Source of Truth نیست.
- PostgreSQL Python Source of Truth اجرای Job است.
- Consumer دریافت‌کننده نباید در این مرحله برای تأیید Brand یا Build به .NET API یا gRPC فراخوانی بزند.

## ۱۳. خروجی موفق این مرحله

```text
RabbitMQ Message = Acked
Inbox Message = Persisted
Inbox Status = Received یا Processed
Python Job = Queued، در صورت نیاز به پردازش
ProgressPercent = 0
```

در این مرحله Progress Event به .NET ارسال نمی‌شود.

## ۱۴. معیارهای پذیرش

- دریافت Event از Queueهای مختلف امکان‌پذیر باشد.
- Envelope عمومی بدون وابستگی به یک `eventType` خاص اعتبارسنجی شود.
- `eventId` در کل سیستم یکتا و کلید Idempotency باشد.
- تکرار همان Event باعث ساخت Inbox یا Job دوم نشود.
- Event با `eventId` یکسان و محتوای متفاوت به DLQ منتقل شود.
- متادیتای RabbitMQ در `rabbitmq_metadata` ذخیره شود.
- `consumer_name` Worker دریافت‌کننده را مشخص کند.
- انتخاب Handler بر اساس `eventType` انجام شود.
- Worker دریافت‌کننده هیچ پردازش AI سنگینی انجام ندهد.
- Job فقط توسط Worker پردازش اجرا شود.
- Ack قبل از Commit PostgreSQL ارسال نشود.
- Restart هر Worker باعث ازبین‌رفتن Inbox یا Job نشود.
