# Implementation Plan: سامانه مدیریت قراردادهای واحدهای ساختمانی (contract-list)

## Overview

پیاده‌سازی ماژول قراردادها شامل لایه داده، منطق فیلتر/اعتبارسنجی، کامپوننت‌های UI و صفحات Next.js است. هر تسک بر پایه تسک قبلی ساخته می‌شود و در نهایت همه اجزا به هم وصل می‌شوند.

## Tasks

- [x] 1. تعریف تایپ‌ها و ساختار فایل‌ها
  - ایجاد فایل `app/types/contract.ts` با تمام interface‌ها و type‌های تعریف‌شده در مستند طراحی
  - شامل: `ContractStatus`, `ContractType`, `ContractorType`, `ShareMode`, `PersonType`, `Share`, `Contractor`, `ContractParty`, `ContractSubjectData`, `ContractPartiesData`, `ContractFormData`, `Contract`, `FilterState`, `Block`, `Unit`, `Employee`, `Partner`, `Buyer`
  - _Requirements: 3، 4، 5_

- [x] 2. پیاده‌سازی لایه ذخیره‌سازی و اعتبارسنجی
  - [x] 2.1 پیاده‌سازی `app/lib/contractStore.ts`
    - توابع `getContracts()`, `saveContract(data, status)`, `getContractById(id)` با localStorage
    - مدیریت خطای localStorage و داده‌های corrupt
    - _Requirements: 5.2, 5.3, 5.4, 5.6_

  - [ ]* 2.2 نوشتن property test برای contractStore
    - **Property 10: وضعیت ذخیره‌شده با نوع ذخیره‌سازی مطابقت دارد**
    - **Validates: Requirements 5.2, 5.6**
    - **Property 11: بارگذاری پیش‌نویس داده‌های ذخیره‌شده را بازمی‌گرداند (Round-trip)**
    - **Validates: Requirements 5.4**

  - [x] 2.3 پیاده‌سازی `app/lib/contractValidation.ts`
    - تابع `validateStep1(data)` برای اعتبارسنجی مرحله اول
    - تابع `validateStep2(data)` برای اعتبارسنجی مرحله دوم
    - تابع `validateShares(parties, mode)` برای بررسی مجموع سهم‌ها
    - برگرداندن پیام خطای مشخص برای هر فیلد خالی
    - _Requirements: 3.11, 4.8, 4.9, 4.10, 4.11, 5.7_

  - [ ]* 2.4 نوشتن property test برای contractValidation
    - **Property 8: اعتبارسنجی فیلدهای الزامی خطای مشخص برمی‌گرداند**
    - **Validates: Requirements 3.11, 5.7**
    - **Property 9: مجموع سهم‌ها نباید از حد مجاز تجاوز کند**
    - **Validates: Requirements 4.8, 4.9, 4.10, 4.11**

- [x] 3. Checkpoint - اطمینان از صحت لایه داده
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. پیاده‌سازی `useContracts` hook
  - [x] 4.1 ایجاد `app/hooks/useContracts.ts`
    - مدیریت state: `contracts`, `filteredContracts`, `filters`, `searchQuery`, `activeTab`
    - پیاده‌سازی debounce 250ms برای جستجو
    - منطق فیلتر ترکیبی (تب + جستجو + فیلترها)
    - توابع: `setActiveTab`, `setSearchQuery`, `setFilters`, `clearFilters`, `saveContract`, `getContractById`
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 4.2 نوشتن property test برای useContracts
    - **Property 1: فیلتر تب فقط قراردادهای با وضعیت مطابق را نشان می‌دهد**
    - **Validates: Requirements 1.2, 1.3**
    - **Property 2: شمارنده تب با تعداد واقعی قراردادها برابر است**
    - **Validates: Requirements 1.4**
    - **Property 3: جستجو فقط قراردادهای مرتبط را برمی‌گرداند**
    - **Validates: Requirements 2.1**
    - **Property 4: ترکیب فیلترها فقط قراردادهای برآورنده تمام شرایط را نشان می‌دهد**
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6**
    - **Property 5: پاک کردن فیلترها به حالت اولیه برمی‌گردد**
    - **Validates: Requirements 2.7**

- [x] 5. پیاده‌سازی کامپوننت‌های صفحه فهرست
  - [x] 5.1 ایجاد `app/components/contracts/ContractTabs.tsx`
    - نمایش دو تب «قراردادهای نهایی» و «پیش‌نویس‌ها»
    - نمایش شمارنده در کنار هر تب
    - _Requirements: 1.1, 1.4_

  - [x] 5.2 ایجاد `app/components/contracts/ContractSearch.tsx`
    - فیلد جستجوی متنی با debounce
    - _Requirements: 2.1, 2.2_

  - [x] 5.3 ایجاد `app/components/contracts/ContractFilters.tsx`
    - فیلتر نوع قرارداد (فروش/پیش‌فروش)
    - فیلتر بازه تاریخ
    - فیلتر بلوک و واحد (واحدها وابسته به بلوک انتخاب‌شده)
    - دکمه «پاک کردن فیلترها»
    - _Requirements: 2.3, 2.4, 2.5, 2.7_

  - [x] 5.4 ایجاد `app/components/contracts/ContractTable.tsx`
    - جدول با ستون‌های: شماره، نوع، واحد، طرفین، تاریخ، وضعیت، عملیات
    - نمایش پیام «قراردادی یافت نشد» در حالت خالی
    - _Requirements: 1.5_

  - [x] 5.5 ایجاد `app/components/contracts/ContractList.tsx`
    - ترکیب ContractTabs، ContractSearch، ContractFilters، ContractTable
    - استفاده از useContracts hook
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.6, 2.7_

  - [ ]* 5.6 نوشتن unit test برای ContractList
    - تست نمایش دو تب
    - تست پیام خالی بودن (edge case 1.5)
    - _Requirements: 1.1, 1.5_

- [x] 6. Checkpoint - اطمینان از صحت صفحه فهرست
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. پیاده‌سازی کامپوننت‌های فرم ثبت قرارداد
  - [x] 7.1 ایجاد `app/components/contracts/ShareInput.tsx`
    - ورودی سهم با دو حالت درصد/دانگ
    - نمایش دانگ به صورت «X از ۶ دانگ»
    - _Requirements: 4.3, 4.4_

  - [x] 7.2 ایجاد `app/components/contracts/Step1_ContractSubject.tsx`
    - فیلد منعقدکننده با سه گزینه (خودم / سایر کارمندان / کارمند سابق)
    - نمایش شرطی فیلدهای اضافه بر اساس نوع منعقدکننده
    - فیلدهای نوع قرارداد، تاریخ، شماره، تاریخ تحویل، بلوک، واحد
    - واحدها فیلتر شده بر اساس بلوک انتخاب‌شده
    - پیام خطا برای انتخاب واحد بدون بلوک
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

  - [ ]* 7.3 نوشتن property test برای Step1_ContractSubject
    - **Property 6: انتخاب نوع منعقدکننده، فیلدهای مناسب را نمایش می‌دهد**
    - **Validates: Requirements 3.2, 3.3**
    - **Property 7: واحدهای نمایش‌داده‌شده متعلق به بلوک انتخاب‌شده هستند**
    - **Validates: Requirements 3.9**

  - [x] 7.4 ایجاد `app/components/contracts/Step2_ContractParties.tsx`
    - بخش طرف اول با مقدار پیش‌فرض «صاحب کسب‌وکار» و امکان انتخاب شرکا
    - بخش طرف دوم با انتخاب خریداران (نمایش بصری متمایز حقیقی/حقوقی)
    - ShareInput برای هر شخص در هر طرف
    - اعتبارسنجی مجموع سهم‌ها
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

  - [ ]* 7.5 نوشتن unit test برای Step2_ContractParties
    - تست نمایش خطا برای تجاوز سهم درصدی و دانگی
    - تست نمایش بصری متمایز حقیقی/حقوقی
    - _Requirements: 4.6, 4.8, 4.9, 4.10, 4.11_

  - [x] 7.6 ایجاد `app/components/contracts/FormNavigation.tsx`
    - دکمه‌های «قبلی»، «بعدی»، «ذخیره پیش‌نویس»، «ثبت نهایی»
    - نمایش «ثبت نهایی» فقط در مرحله آخر
    - _Requirements: 5.1, 5.5_

  - [x] 7.7 ایجاد `app/components/contracts/ContractForm.tsx`
    - مدیریت state کل فرم و ناوبری بین مراحل
    - اعتبارسنجی مرحله‌ای قبل از رفتن به مرحله بعد
    - بارگذاری داده‌های پیش‌نویس موجود
    - _Requirements: 3.11, 5.1, 5.2, 5.4, 5.5, 5.6, 5.7_

- [x] 8. Checkpoint - اطمینان از صحت فرم ثبت قرارداد
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. ایجاد صفحات Next.js و اتصال نهایی
  - [x] 9.1 ایجاد `app/contracts/page.tsx`
    - صفحه فهرست قراردادها با ContractList
    - استفاده از Header و Sidebar موجود
    - دکمه «ثبت قرارداد جدید» با لینک به `/contracts/new`
    - _Requirements: 6.1, 6.3_

  - [x] 9.2 ایجاد `app/contracts/new/page.tsx`
    - صفحه فرم ثبت قرارداد با ContractForm
    - استفاده از Header و Sidebar موجود
    - _Requirements: 6.2, 6.4_

  - [x] 9.3 به‌روزرسانی `app/components/Sidebar.tsx`
    - تبدیل لینک «فهرست قرارداد ها» به لینک واقعی `/contracts`
    - _Requirements: 6.3_

  - [x] 9.4 اطمینان از واکنش‌گرایی موبایل
    - بررسی و اصلاح layout در عرض کمتر از ۷۶۸ پیکسل برای ContractList و ContractForm
    - _Requirements: 6.5_

- [x] 10. Final Checkpoint - اطمینان از صحت کل ماژول
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- تسک‌های علامت‌گذاری‌شده با `*` اختیاری هستند و برای MVP می‌توان از آن‌ها صرف‌نظر کرد
- هر تسک به نیازمندی‌های مشخص ارجاع دارد
- تست‌های property-based با fast-check نوشته می‌شوند و حداقل ۱۰۰ بار اجرا می‌شوند
- داده‌های mock برای Employee، Block، Unit، Partner، Buyer در مرحله پیاده‌سازی تعریف می‌شوند
