# ساختار نهایی پنل خریدار

## ✅ تغییرات اعمال شده

### 1. حذف Sidebar و Layout جداگانه
- ❌ `CustomerSidebar.tsx` حذف شد
- ❌ `CustomerPortalLayout.tsx` حذف شد
- ❌ `customer-portal/layout.tsx` حذف شد

### 2. انتقال به ساختار اصلی
```
قبل: app/customer-portal/
بعد: app/(panel)/customer-portal/
```

حالا پنل خریدار از همان Sidebar و Layout اصلی اپلیکیشن استفاده می‌کند.

## 📁 ساختار نهایی

```
apps/vahedyek-panel/app/(panel)/customer-portal/
├── customer-portal.css              # استایل‌های اختصاصی
├── contracts/
│   ├── page.tsx                     # لیست قراردادها
│   └── [contractId]/
│       └── page.tsx                 # داشبورد قرارداد
├── payment-methods/
│   └── page.tsx                     # روش‌های پرداخت بدهی
├── due-dates/
│   └── page.tsx                     # سررسیدهای من
└── account/
    └── page.tsx                     # حساب کاربری
```

## 🎯 4 منوی اصلی

### 1. قراردادهای من
**مسیر:** `/customer-portal/contracts`
**دسترسی:** `customer.contracts.view`
**آیکون:** `fa-file-contract`

**امکانات:**
- لیست تمام قراردادها با کارت‌های جذاب
- نمایش وضعیت هر قرارداد (فعال، تکمیل شده، معلق)
- Progress Bar برای پیشرفت پرداخت
- کلیک روی هر قرارداد → ورود به داشبورد قرارداد

### 2. روش‌های پرداخت بدهی
**مسیر:** `/customer-portal/payment-methods`
**دسترسی:** `customer.payments.view`
**آیکون:** `fa-credit-card`

**امکانات:**
- 3 کارت روش پرداخت:
  - واریز به حساب (شماره حساب، شماره کارت)
  - کارت به کارت
  - چک (آدرس ارسال)
- دکمه کپی برای شماره حساب/کارت
- اطلاعات کامل هر روش پرداخت

### 3. سررسیدهای من
**مسیر:** `/customer-portal/due-dates`
**دسترسی:** `customer.payments.view`
**آیکون:** `fa-calendar-check`

**امکانات:**
- تایم‌لاین تمام سررسیدها
- فیلتر بر اساس وضعیت:
  - همه
  - در انتظار
  - معوق
  - پرداخت شده
- نمایش تاریخ سررسید و مبلغ
- هشدار برای سررسیدهای معوق

### 4. حساب کاربری
**مسیر:** `/customer-portal/account`
**دسترسی:** `customer.profile.view`
**آیکون:** `fa-user-circle`

**امکانات:**
- نمایش اطلاعات شخصی
- ویرایش پروفایل
- تغییر رمز عبور
- آواتار کاربر

## 🎨 ویژگی‌های UI/UX

### استفاده از Sidebar اصلی
- ✅ منوهای پنل خریدار در Sidebar اصلی نمایش داده می‌شوند
- ✅ بر اساس دسترسی کاربر فیلتر می‌شوند
- ✅ با سایر منوهای اپلیکیشن یکپارچه هستند

### طراحی Responsive
- ✅ موبایل First
- ✅ Grid Layout برای کارت‌ها
- ✅ تبلت و دسکتاپ

### تم تاریک/روشن
- ✅ از متغیرهای CSS استفاده می‌کند
- ✅ با تم اصلی اپلیکیشن سازگار است

## 📊 نقشه دسترسی

| منو | دسترسی مورد نیاز | نمایش در Sidebar |
|-----|------------------|-------------------|
| قراردادهای من | `customer.contracts.view` | ✅ |
| روش‌های پرداخت | `customer.payments.view` | ✅ |
| سررسیدهای من | `customer.payments.view` | ✅ |
| حساب کاربری | `customer.profile.view` | ✅ |

## 🔧 تنظیمات در کانفیگ

### فایل: `vahedyek.ts`

```typescript
// 4 منوی پنل خریدار
{
  id: 'customer-contracts',
  label: 'قراردادهای من',
  icon: 'fa-file-contract',
  href: '/customer-portal/contracts',
  requiredPermission: 'customer.contracts.view',
},
{
  id: 'customer-payment-methods',
  label: 'روش‌های پرداخت بدهی',
  icon: 'fa-credit-card',
  href: '/customer-portal/payment-methods',
  requiredPermission: 'customer.payments.view',
},
{
  id: 'customer-due-dates',
  label: 'سررسیدهای من',
  icon: 'fa-calendar-check',
  href: '/customer-portal/due-dates',
  requiredPermission: 'customer.payments.view',
},
{
  id: 'customer-account',
  label: 'حساب کاربری',
  icon: 'fa-user-circle',
  href: '/customer-portal/account',
  requiredPermission: 'customer.profile.view',
},
```

## 🧪 تست

### مرحله 1: تنظیمات
1. به `/settings` بروید
2. نقش "خریدار" را انتخاب کنید
3. دسترسی‌های زیر را فعال کنید:
   - `customer.portal.access`
   - `customer.contracts.view`
   - `customer.payments.view`
   - `customer.profile.view`
4. در بخش "منوهای مجاز" باید 4 منو ببینید

### مرحله 2: Sidebar
1. صفحه را Refresh کنید
2. در Sidebar اصلی باید 4 منوی جدید ببینید:
   - قراردادهای من
   - روش‌های پرداخت بدهی
   - سررسیدهای من
   - حساب کاربری

### مرحله 3: صفحات
1. **قراردادهای من:**
   - لیست قراردادها با کارت‌ها
   - کلیک روی قرارداد → داشبورد قرارداد

2. **روش‌های پرداخت:**
   - 3 کارت روش پرداخت
   - دکمه کپی کار می‌کند

3. **سررسیدهای من:**
   - تایم‌لاین سررسیدها
   - فیلترها کار می‌کنند

4. **حساب کاربری:**
   - نمایش اطلاعات
   - ویرایش پروفایل

## ✨ مزایای ساختار جدید

### 1. یکپارچگی
- پنل خریدار بخشی از اپلیکیشن اصلی است
- از همان Sidebar و Layout استفاده می‌کند
- تجربه کاربری یکسان

### 2. مدیریت دسترسی
- منوها بر اساس دسترسی نمایش داده می‌شوند
- در تنظیمات قابل مدیریت هستند
- با سیستم نقش‌ها یکپارچه است

### 3. نگهداری آسان
- کد تکراری کمتر
- یک Sidebar برای کل اپلیکیشن
- تغییرات در یک جا اعمال می‌شوند

## 📝 نکات مهم

### 1. مسیرها
همه مسیرها با `/customer-portal` شروع می‌شوند:
```
/customer-portal/contracts
/customer-portal/payment-methods
/customer-portal/due-dates
/customer-portal/account
```

### 2. دسترسی‌ها
برای نمایش منوها، دسترسی‌های مربوطه باید فعال باشند:
- `customer.portal.access` - الزامی برای دسترسی به پنل
- `customer.contracts.view` - برای منوی قراردادها
- `customer.payments.view` - برای منوهای مالی
- `customer.profile.view` - برای منوی حساب کاربری

### 3. استایل‌ها
فایل CSS در مسیر زیر قرار دارد:
```
app/(panel)/customer-portal/customer-portal.css
```

و در صفحه اول import می‌شود تا برای تمام صفحات در دسترس باشد.

## 🎉 وضعیت نهایی

### چک‌لیست
- [x] حذف Sidebar و Layout جداگانه
- [x] انتقال به ساختار `(panel)`
- [x] 4 منوی اصلی تعریف شدند
- [x] صفحات ایجاد شدند
- [x] استایل‌ها اضافه شدند
- [x] یکپارچگی با Sidebar اصلی
- [x] مدیریت دسترسی
- [x] Responsive Design

### نتیجه
پنل خریدار حالا به طور کامل با ساختار اصلی اپلیکیشن یکپارچه شده و از همان Sidebar و Layout استفاده می‌کند! 🎉

## 🚀 مراحل بعدی

1. **تست کامل:**
   - تست تمام صفحات
   - تست دسترسی‌ها
   - تست Responsive

2. **اتصال به API:**
   - جایگزینی Mock Data با API واقعی
   - مدیریت خطاها
   - Loading States

3. **بهبودها:**
   - افزودن نمودارها
   - پیاده‌سازی جستجو و فیلتر
   - افزودن Pagination
