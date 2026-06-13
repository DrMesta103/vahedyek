# رفع مشکل نمایش منوهای پنل خریدار

## 🐛 مشکل
پس از فعال کردن تمام دسترسی‌های پنل خریدار:
1. ❌ در پنل خریدار فقط "حساب کاربری" نمایش داده می‌شد
2. ❌ در بخش تنظیمات، قسمت "منوهای مجاز" فقط "حساب کاربری" را نشان می‌داد
3. ❌ سایر منوها (قراردادها، مالی، پشتیبانی) نمایش داده نمی‌شدند

## 🔍 علت مشکل

### مشکل 1: منوها در کانفیگ نبودند
منوهای پنل خریدار در `menuItems` فایل `vahedyek.ts` تعریف نشده بودند.

### مشکل 2: Sidebar از سیستم دسترسی استفاده نمی‌کرد
`CustomerSidebar` از یک آرایه ثابت (`CUSTOMER_MENU_ITEMS`) استفاده می‌کرد و دسترسی‌های کاربر را چک نمی‌کرد.

## ✅ راه‌حل

### تغییر 1: اضافه کردن منوها به کانفیگ
7 منوی جدید به `menuItems` در `vahedyek.ts` اضافه شدند:

```typescript
// Customer Portal Menu Items
{
  id: 'customer-contracts',
  label: 'قراردادهای من',
  icon: 'fa-file-contract',
  href: '/customer-portal/contracts',
  requiredPermission: 'customer.contracts.view',
},
{
  id: 'customer-financial',
  label: 'مدیریت مالی',
  icon: 'fa-money-bill-wave',
  href: '/customer-portal/financial',
  requiredPermission: 'customer.financial.view',
},
{
  id: 'customer-receipts',
  label: 'فیش‌های پرداختی',
  icon: 'fa-receipt',
  href: '/customer-portal/financial/receipts',
  requiredPermission: 'customer.payments.view',
},
{
  id: 'customer-payment-methods',
  label: 'روش‌های پرداخت',
  icon: 'fa-credit-card',
  href: '/customer-portal/financial/payment-methods',
  requiredPermission: 'customer.payments.view',
},
{
  id: 'customer-due-dates',
  label: 'سررسیدهای من',
  icon: 'fa-calendar-check',
  href: '/customer-portal/financial/due-dates',
  requiredPermission: 'customer.payments.view',
},
{
  id: 'customer-support',
  label: 'پشتیبانی',
  icon: 'fa-headset',
  href: '/customer-portal/support',
  requiredPermission: 'customer.support.view',
},
{
  id: 'customer-account',
  label: 'حساب کاربری',
  icon: 'fa-user-circle',
  href: '/customer-portal/account',
  requiredPermission: 'customer.profile.view',
},
```

### تغییر 2: آپدیت CustomerSidebar
`CustomerSidebar` حالا:
1. ✅ از `currentAppConfig.menuItems` استفاده می‌کند
2. ✅ `allowedMenuItemIds` را از context می‌خواند
3. ✅ فقط منوهایی که کاربر دسترسی دارد را نمایش می‌دهد
4. ✅ به صورت پویا ساختار منو را می‌سازد

```typescript
const allowedMenuItemIds = data?.access?.allowedMenuItemIds;
const menuItems = getCustomerMenuItems(allowedMenuItemIds);
```

## 📁 فایل‌های تغییر یافته

1. `apps/vahedyek-panel/app/config/apps/vahedyek.ts`
   - اضافه شدن 7 منوی پنل خریدار

2. `apps/vahedyek-panel/app/components/customer/CustomerSidebar.tsx`
   - استفاده از سیستم دسترسی
   - ساخت پویای منو بر اساس دسترسی‌ها

## 🎯 نتیجه

### قبل
```
❌ فقط "حساب کاربری" نمایش داده می‌شد
❌ منوهای دیگر وجود نداشتند
❌ دسترسی‌ها تأثیری نداشتند
```

### بعد
```
✅ قراردادهای من
✅ مدیریت مالی
  ✅ فیش‌های پرداختی
  ✅ روش‌های پرداخت
  ✅ سررسیدهای من
✅ پشتیبانی
✅ حساب کاربری
```

## 🧪 تست

### مرحله 1: بررسی در تنظیمات
1. به `http://localhost:3000/settings` بروید
2. نقش "خریدار" را انتخاب کنید
3. در بالای صفحه، بخش "منوهای مجاز" را ببینید
4. باید 7 منو نمایش داده شود:
   - ✅ قراردادهای من
   - ✅ مدیریت مالی
   - ✅ فیش‌های پرداختی
   - ✅ روش‌های پرداخت
   - ✅ سررسیدهای من
   - ✅ پشتیبانی
   - ✅ حساب کاربری

### مرحله 2: بررسی در پنل خریدار
1. به `http://localhost:3000/customer-portal` بروید
2. در سایدبار باید تمام منوها نمایش داده شوند
3. کلیک روی هر منو باید به صفحه مربوطه برود

### مرحله 3: تست دسترسی محدود
1. در تنظیمات، یک نقش جدید "خریدار محدود" ایجاد کنید
2. فقط این دسترسی‌ها را فعال کنید:
   - `customer.portal.access`
   - `customer.contracts.view`
   - `customer.profile.view`
3. نقش را به یک کاربر اختصاص دهید
4. با آن کاربر وارد شوید
5. باید فقط 2 منو نمایش داده شود:
   - قراردادهای من
   - حساب کاربری

## 📊 نقشه دسترسی به منو

| دسترسی | منوی نمایش داده شده |
|--------|---------------------|
| `customer.contracts.view` | قراردادهای من |
| `customer.financial.view` | مدیریت مالی (والد) |
| `customer.payments.view` | فیش‌های پرداختی، روش‌های پرداخت، سررسیدها |
| `customer.support.view` | پشتیبانی |
| `customer.profile.view` | حساب کاربری |

## 🔄 نحوه کار سیستم

### 1. تعریف منو در کانفیگ
```typescript
{
  id: 'customer-contracts',
  label: 'قراردادهای من',
  requiredPermission: 'customer.contracts.view',
}
```

### 2. بررسی دسترسی در API
```typescript
// API بررسی می‌کند کاربر چه دسترسی‌هایی دارد
const permissions = user.permissions;
const allowedMenus = menuItems.filter(item => 
  !item.requiredPermission || 
  permissions.includes(item.requiredPermission)
);
```

### 3. نمایش در Sidebar
```typescript
// Sidebar فقط منوهای مجاز را نمایش می‌دهد
const menuItems = getCustomerMenuItems(allowedMenuItemIds);
```

## ✨ ویژگی‌های جدید

### 1. منوی پویا
منوها بر اساس دسترسی کاربر به صورت خودکار نمایش داده می‌شوند.

### 2. زیرمنوی هوشمند
اگر کاربر به هیچ یک از زیرمنوها دسترسی نداشته باشد، منوی والد نمایش داده نمی‌شود.

### 3. نمایش در تنظیمات
در بخش تنظیمات، منوهای مجاز برای هر نقش نمایش داده می‌شوند.

## 🎉 وضعیت نهایی

### چک‌لیست
- [x] منوها در کانفیگ تعریف شدند
- [x] Sidebar از سیستم دسترسی استفاده می‌کند
- [x] منوها در تنظیمات نمایش داده می‌شوند
- [x] منوها در پنل خریدار نمایش داده می‌شوند
- [x] دسترسی‌ها به درستی کار می‌کنند
- [x] زیرمنوها به درستی نمایش داده می‌شوند

### نتیجه
پنل خریدار حالا کاملاً با سیستم دسترسی یکپارچه شده و منوها بر اساس دسترسی‌های کاربر نمایش داده می‌شوند! 🎉

## 📝 نکات مهم

1. **همیشه `customer.portal.access` را فعال کنید**
   - بدون این دسترسی، کاربر نمی‌تواند به پنل خریدار دسترسی داشته باشد

2. **دسترسی‌های مرتبط را با هم فعال کنید**
   - برای نمایش "مدیریت مالی"، حداقل یکی از دسترسی‌های مالی را فعال کنید

3. **تست با نقش‌های مختلف**
   - نقش‌های مختلف با ترکیب‌های مختلف دسترسی ایجاد کنید و تست کنید

4. **Refresh کنید**
   - پس از تغییر دسترسی‌ها، صفحه را Refresh کنید تا تغییرات اعمال شوند
