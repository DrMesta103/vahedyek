# مرجع کنترل تغییرات فاز ۵ — معماری و طبقه‌بندی مشاغل

## ۱. فراداده مرجع

| مورد | مقدار |
| --- | --- |
| شناسه | `PHASE-5-JOB-CLASSIFICATION` |
| وضعیت | مبنای پذیرش Production Completion |
| منبع تصمیم | Business Requirement فاز ۵، Production Completion Prompt و Delta Checklist Audit |
| مالک دامنه | منابع انسانی / معماری مشاغل |
| Source of Truth اجرایی | `app/lib/job-classification-actions.ts` |

این سند خلاصه کنترل‌شده تصمیم‌های قطعی است و جایگزین متن کامل Business Requirement نیست.

## ۲. Scope تأییدشده

* JobFamily، JobCategory، JobLevel و JobClassification نسخه‌دار
* ارزیابی وزنی شغل با Criterion، Score، Evidence و نتیجه قابل استفاده
* Grade و Rank مستقل و Tenant-scoped
* پیشنهاد Level/Grade/Rank و تأیید انسانی آن
* بازه پیشنهادی جبران خدمت نسخه‌دار و تاریخ‌اثرگذار
* Snapshot بازنگری JobProfile در نسخه Classification
* Permission، Tenant isolation، OrganizationEvent، Detail، Evaluation و گزارش‌های اولیه

## ۳. Out of Scope قطعی

* Payroll، محاسبه حقوق واقعی، مالیات و بیمه
* Contract Generator و Employment Order
* تغییر Position، EmployeeOrganizationUnit، Assignment Architecture یا Assignment History
* Rule Engine عمومی
* Mock Data، Seed پذیرش، Backfill، Migration مخرب و حذف داده

## ۴. Acceptance Criteria

1. تمام Mutationها Permission-aware و Tenant-scoped باشند.
2. مجموع Weight معیارهای فعال برای اجرای Evaluation دقیقاً ۱۰۰ باشد.
3. Score هر معیار در دامنه تعریف‌شده باشد و Evidence داشته باشد.
4. Evaluation نتیجه Total Score و Evaluation Level تولید کند.
5. پیشنهاد Level/Grade/Rank فقط پس از تأیید کاربر مجاز روی Classification اعمال شود.
6. تغییر Compensation نسخه جدید بسازد و نسخه قبلی را Archive کند.
7. رویدادهای Criterion، Evaluation، Grade، Rank و Compensation دارای actor، before/after، reason و effectiveAt باشند.
8. مسیرهای Workspace، Detail، Evaluation و Reports دارای Loading، Empty، Error و Permission state مناسب باشند.
9. `prisma validate`، `prisma migrate status` و `tsc --noEmit` موفق باشند.

## ۵. قواعد معماری و State

* `job-classification-actions.ts` تنها Source مجاز Mutationهای این دامنه است؛ افزودن Mutation فاز ۵ به `actions.ts` ممنوع است.
* Classification با ایجاد نسخه جدید، نسخه فعال قبلی را Archive می‌کند؛ Draft Classification در Scope فعلی نیست.
* Evaluation پس از ذخیره امتیازها در وضعیت `SCORED` قرار می‌گیرد؛ تأیید یا رد فقط از `SCORED` مجاز است.
* Approval و Rejection تصمیم انسانی‌اند و Rule Engine خودکار محسوب نمی‌شوند.
* Compensation Update مستقیم نیست؛ هر تغییر یک Version جدید با Effective Date می‌سازد.

## ۶. شواهد اجرایی

* Migration foundation: `20260722310000_job_architecture_phase_five`
* Migration production completion: `20260722320000_job_architecture_production_completion`
* Migration compensation version: `20260722330000_job_compensation_range_version`
* Runtime artifacts: `.playwright-cli` و `apps/dastranj-panel/.playwright-cli`

