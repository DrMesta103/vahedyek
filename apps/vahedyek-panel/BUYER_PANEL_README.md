# پنل خریدار - راهنمای استفاده

## نمای کلی
پنل خریدار یک داشبورد اختصاصی برای مشتریان/خریدارانی است که قراردادهای فعال دارند. این پنل به آنها امکان می‌دهد قراردادها، وضعیت مالی، پرداخت‌ها و اسناد خود را مدیریت کنند.

## ساختار فایل‌ها

```
apps/vahedyek-panel/
├── app/
│   ├── customer-portal/                # مسیرهای پنل خریدار
│   │   ├── layout.tsx                  # Layout اصلی
│   │   ├── page.tsx                    # داشبورد خانه
│   │   ├── customer-portal.css         # استایل‌های اختصاصی
│   │   ├── contracts/                  # بخش قراردادها
│   │   │   ├── page.tsx               # لیست قراردادها
│   │   │   └── [contractId]/          # جزئیات قرارداد
│   │   │       └── page.tsx
│   │   ├── financial/                  # بخش مالی
│   │   │   └── receipts/              # فیش‌های پرداختی
│   │   │       ├── page.tsx
│   │   │       └── new/
│   │   │           └── page.tsx
│   │   ├── support/                    # پشتیبانی
│   │   │   └── page.tsx
│   │   └── account/                    # حساب کاربری
│   │       └── page.tsx
│   └── components/
│       └── customer/                   # کامپوننت‌های پنل خریدار
│           ├── CustomerPortalLayout.tsx
│           ├── CustomerSidebar.tsx
│           ├── CustomerDashboard.tsx
│           ├── contracts/
│           │   ├── ContractsList.tsx
│           │   └── ContractDashboard.tsx
│           ├── financial/
│           │   ├── ReceiptForm.tsx
│           │   └── ReceiptsList.tsx
│           ├── support/
│           │   └── SupportTicketsList.tsx
│           └── account/
│               └── AccountProfile.tsx
```

## صفحات پیاده‌سازی شده

### ✅ فاز 1: پایه (تکمیل شده)
- [x] Layout اختصاصی با Sidebar
- [x] داشبورد خانه با آمار کلی
- [x] سیستم Breadcrumb
- [x] منوی سایدبار با زیرمنو

### ✅ فاز 2: قراردادها (تکمیل شده)
- [x] لیست قراردادها با کارت‌ها
- [x] داشبورد داخلی قرارداد با 6 بخش
- [x] نمایش اطلاعات مالی

### ✅ فاز 3: مالی (تکمیل شده)
- [x] لیست فیش‌های پرداختی
- [x] فرم ثبت فیش جدید
- [x] آپلود تصویر فیش

### ✅ فاز 4: پشتیبانی و حساب (تکمیل شده)
- [x] لیست تیکت‌های پشتیبانی
- [x] صفحه حساب کاربری
- [x] ویرایش اطلاعات شخصی

## صفحات در حال توسعه

### 🚧 فاز بعدی
- [ ] صفحه متن قرارداد با نمودار دونات
- [ ] صفحه سررسیدها
- [ ] صفحه گزارش مالی با نمودارها
- [ ] صفحه مدارک قرارداد
- [ ] صفحه پیشنهادهای پرداخت
- [ ] صفحه روش‌های پرداخت
- [ ] فرم ایجاد تیکت جدید
- [ ] صفحه جزئیات تیکت

## دسترسی به پنل

### URL اصلی
```
/customer-portal
```

### مسیرهای اصلی
- **داشبورد:** `/customer-portal`
- **قراردادها:** `/customer-portal/contracts`
- **جزئیات قرارداد:** `/customer-portal/contracts/[contractId]`
- **فیش‌های پرداختی:** `/customer-portal/financial/receipts`
- **ثبت فیش جدید:** `/customer-portal/financial/receipts/new`
- **پشتیبانی:** `/customer-portal/support`
- **حساب کاربری:** `/customer-portal/account`

## ویژگی‌های پیاده‌سازی شده

### 🎨 UI/UX
- ✅ طراحی Responsive (موبایل، تبلت، دسکتاپ)
- ✅ تم تاریک/روشن
- ✅ انیمیشن‌های Smooth
- ✅ کارت‌های تعاملی
- ✅ Progress Bar برای پیشرفت پرداخت
- ✅ Badge های رنگی برای وضعیت‌ها

### 🔧 عملکرد
- ✅ Loading States
- ✅ Empty States
- ✅ Form Validation (Client-side)
- ✅ Image Upload با Preview
- ✅ Breadcrumb Navigation
- ✅ Sidebar با قابلیت Collapse

### 📱 Responsive
- ✅ Grid Layout برای کارت‌ها
- ✅ جداول Responsive
- ✅ منوی موبایل
- ✅ فرم‌های Responsive

## نحوه استفاده

### 1. اجرای پروژه
```bash
cd apps/vahedyek-panel
npm run dev
```

### 2. دسترسی به پنل خریدار
مرورگر را باز کنید و به آدرس زیر بروید:
```
http://localhost:3000/customer-portal
```

### 3. تست امکانات
- مشاهده داشبورد با آمار کلی
- مشاهده لیست قراردادها
- کلیک روی یک قرارداد برای مشاهده جزئیات
- ثبت فیش پرداختی جدید
- مشاهده تیکت‌های پشتیبانی
- ویرایش اطلاعات حساب کاربری

## یادداشت‌های توسعه

### داده‌های Mock
در حال حاضر تمام داده‌ها Mock هستند و با `setTimeout` شبیه‌سازی می‌شوند. برای اتصال به API واقعی:

1. فایل‌های کامپوننت را باز کنید
2. بخش `useEffect` را پیدا کنید
3. `setTimeout` را با `fetch` یا `axios` جایگزین کنید

مثال:
```typescript
// قبل (Mock)
useEffect(() => {
  setTimeout(() => {
    setContracts([...mockData]);
    setLoading(false);
  }, 500);
}, []);

// بعد (API واقعی)
useEffect(() => {
  fetch('/api/customer/contracts')
    .then(res => res.json())
    .then(data => {
      setContracts(data);
      setLoading(false);
    });
}, []);
```

### متغیرهای CSS
استایل‌ها از متغیرهای CSS استفاده می‌کنند که در `globals.css` تعریف شده‌اند:

```css
--background
--card-bg
--border-color
--text-primary
--text-secondary
--text-tertiary
--hover-bg
--input-bg
```

### رنگ اصلی پنل
رنگ اصلی پنل خریدار: `#008080` (Teal)

## مراحل بعدی توسعه

### اولویت بالا
1. **صفحه متن قرارداد**
   - نمایش جزئیات کامل قرارداد
   - نمودار دونات برای توزیع مالی
   - اطلاعات طرفین

2. **صفحه سررسیدها**
   - تایم‌لاین سررسیدها
   - فیلتر بر اساس وضعیت
   - نمایش سررسیدهای معوق

3. **صفحه گزارش مالی**
   - نمودارهای تعاملی (Chart.js یا Recharts)
   - Progress Rings
   - خلاصه مالی

### اولویت متوسط
4. **صفحه مدارک**
   - آپلود مدارک
   - دسته‌بندی
   - پیش‌نمایش و دانلود

5. **صفحه پیشنهادهای پرداخت**
   - 3 کارت پیشنهاد
   - Watermark برای پیشنهادهای منقضی
   - محاسبات مالی

### اولویت پایین
6. **فرم تیکت جدید**
7. **صفحه جزئیات تیکت**
8. **صفحه روش‌های پرداخت**

## تست‌ها

### تست دستی
- [ ] تست در Chrome
- [ ] تست در Firefox
- [ ] تست در Safari
- [ ] تست در موبایل (Chrome Mobile)
- [ ] تست تم تاریک
- [ ] تست تم روشن

### تست عملکرد
- [ ] Navigation بین صفحات
- [ ] Breadcrumb Links
- [ ] Form Submission
- [ ] Image Upload
- [ ] Sidebar Collapse
- [ ] Responsive Breakpoints

## مشکلات شناخته شده
- هیچ مشکل شناخته شده‌ای در حال حاضر وجود ندارد

## مشارکت
برای افزودن امکانات جدید یا رفع باگ:
1. مستندات `BUYER_PANEL_SPEC.md` را مطالعه کنید
2. از الگوی کد موجود پیروی کنید
3. استایل‌ها را در `customer-portal.css` اضافه کنید
4. کامپوننت‌ها را در پوشه `components/customer/` قرار دهید

## پشتیبانی
برای سوالات یا مشکلات، به مستندات اصلی پروژه مراجعه کنید.
