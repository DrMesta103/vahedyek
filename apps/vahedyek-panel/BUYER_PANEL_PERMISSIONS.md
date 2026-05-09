# دسترسی‌های پنل خریدار

## نمای کلی
دسترسی‌های پنل خریدار به صورت جداگانه در گروه `customer` تعریف شده‌اند و در بخش تنظیمات سیستم قابل مدیریت هستند.

## گروه دسترسی: Customer

### دسترسی‌های تعریف شده

#### 1. دسترسی پایه
```typescript
{
  key: 'customer.portal.access',
  label: 'دسترسی به پنل خریدار',
  group: 'customer'
}
```
**توضیح:** دسترسی اصلی برای ورود به پنل خریدار. بدون این دسترسی، کاربر نمی‌تواند به `/customer-portal` دسترسی داشته باشد.

---

#### 2. قراردادها
```typescript
{
  key: 'customer.contracts.view',
  label: 'مشاهده قراردادهای خود',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/contracts` - لیست قراردادها

```typescript
{
  key: 'customer.contracts.details',
  label: 'مشاهده جزئیات قرارداد',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/contracts/[id]` - داشبورد قرارداد
- `/customer-portal/contracts/[id]/text` - متن قرارداد
- `/customer-portal/contracts/[id]/due-dates` - سررسیدها
- `/customer-portal/contracts/[id]/documents` - مدارک

---

#### 3. مالی
```typescript
{
  key: 'customer.financial.view',
  label: 'مشاهده اطلاعات مالی',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/contracts/[id]/financial-report` - گزارش مالی قرارداد
- `/customer-portal/financial/overview` - گزارش مالی کلی

```typescript
{
  key: 'customer.payments.view',
  label: 'مشاهده پرداخت‌ها',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/financial/receipts` - لیست فیش‌های پرداختی
- `/customer-portal/financial/due-dates` - سررسیدهای من
- `/customer-portal/financial/payment-methods` - روش‌های پرداخت

```typescript
{
  key: 'customer.payments.submit',
  label: 'ثبت فیش پرداختی',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/financial/receipts/new` - ثبت فیش جدید
- `/customer-portal/contracts/[id]/receipts` - ثبت فیش برای قرارداد خاص

---

#### 4. اسناد و مدارک
```typescript
{
  key: 'customer.documents.view',
  label: 'مشاهده اسناد و مدارک',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/contracts/[id]/documents` - مدارک قرارداد

---

#### 5. پشتیبانی
```typescript
{
  key: 'customer.support.view',
  label: 'مشاهده تیکت‌های پشتیبانی',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/support` - لیست تیکت‌ها
- `/customer-portal/support/[id]` - جزئیات تیکت

```typescript
{
  key: 'customer.support.create',
  label: 'ایجاد تیکت پشتیبانی',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/support/new` - ایجاد تیکت جدید

---

#### 6. پروفایل
```typescript
{
  key: 'customer.profile.view',
  label: 'مشاهده پروفایل',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/account` - حساب کاربری

```typescript
{
  key: 'customer.profile.update',
  label: 'ویرایش پروفایل',
  group: 'customer'
}
```
**مسیرها:**
- `/customer-portal/account` - ویرایش اطلاعات شخصی

---

## نقش‌های پیشنهادی

### نقش: خریدار (Buyer)
**دسترسی‌های پیشنهادی:**
```typescript
[
  'customer.portal.access',
  'customer.contracts.view',
  'customer.contracts.details',
  'customer.financial.view',
  'customer.payments.view',
  'customer.payments.submit',
  'customer.documents.view',
  'customer.support.view',
  'customer.support.create',
  'customer.profile.view',
  'customer.profile.update',
]
```
**توضیح:** دسترسی کامل به تمام امکانات پنل خریدار

---

### نقش: خریدار محدود (Limited Buyer)
**دسترسی‌های پیشنهادی:**
```typescript
[
  'customer.portal.access',
  'customer.contracts.view',
  'customer.contracts.details',
  'customer.financial.view',
  'customer.payments.view',
  'customer.documents.view',
  'customer.profile.view',
]
```
**توضیح:** فقط مشاهده اطلاعات، بدون امکان ثبت فیش یا ایجاد تیکت

---

### نقش: خریدار فقط مشاهده (View-Only Buyer)
**دسترسی‌های پیشنهادی:**
```typescript
[
  'customer.portal.access',
  'customer.contracts.view',
  'customer.contracts.details',
  'customer.profile.view',
]
```
**توضیح:** فقط مشاهده قراردادها و پروفایل

---

## نحوه استفاده در کد

### بررسی دسترسی در کامپوننت
```typescript
import { useAuthContext } from '../hooks/useAuthContext';

function MyComponent() {
  const { data } = useAuthContext();
  const permissions = data?.access?.permissions || [];
  
  const canViewContracts = permissions.includes('customer.contracts.view');
  const canSubmitPayment = permissions.includes('customer.payments.submit');
  
  return (
    <div>
      {canViewContracts && <ContractsList />}
      {canSubmitPayment && <SubmitPaymentButton />}
    </div>
  );
}
```

### محافظت از مسیرها
```typescript
// در middleware یا layout
const hasAccess = permissions.includes('customer.portal.access');
if (!hasAccess) {
  redirect('/unauthorized');
}
```

### محافظت از API Routes
```typescript
// در API route
export async function GET(request: Request) {
  const session = await getSession(request);
  const permissions = session.user.permissions;
  
  if (!permissions.includes('customer.contracts.view')) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // ... rest of the code
}
```

---

## تنظیمات در پنل مدیریت

### مسیر تنظیمات
```
http://localhost:3000/settings
```

### مراحل تنظیم دسترسی:

1. **ایجاد نقش جدید**
   - به بخش "نقش‌ها و دسترسی‌ها" بروید
   - روی "نقش جدید" کلیک کنید
   - نام نقش را وارد کنید (مثلاً "خریدار")

2. **انتخاب دسترسی‌ها**
   - در لیست دسترسی‌ها، گروه "Customer" را پیدا کنید
   - دسترسی‌های مورد نیاز را انتخاب کنید
   - تغییرات را ذخیره کنید

3. **اختصاص نقش به کاربر**
   - به بخش "کاربران" بروید
   - کاربر مورد نظر را انتخاب کنید
   - نقش "خریدار" را به او اختصاص دهید

---

## نکات امنیتی

### 1. دسترسی پایه الزامی است
همیشه `customer.portal.access` را به همراه سایر دسترسی‌ها اختصاص دهید.

### 2. جداسازی دسترسی‌ها
دسترسی‌های خواندن و نوشتن جدا هستند:
- `view` برای مشاهده
- `submit` / `create` / `update` برای تغییرات

### 3. بررسی دسترسی در سمت سرور
همیشه دسترسی‌ها را در API routes بررسی کنید، نه فقط در UI.

### 4. Audit Log
تمام عملیات مهم (ثبت فیش، ایجاد تیکت) باید لاگ شوند.

---

## مثال‌های کاربردی

### مثال 1: محدود کردن دکمه ثبت فیش
```typescript
function ReceiptsPage() {
  const { data } = useAuthContext();
  const canSubmit = data?.access?.permissions?.includes('customer.payments.submit');
  
  return (
    <div>
      <h1>فیش‌های پرداختی</h1>
      {canSubmit && (
        <Link href="/customer-portal/financial/receipts/new">
          ثبت فیش جدید
        </Link>
      )}
      <ReceiptsList />
    </div>
  );
}
```

### مثال 2: مخفی کردن منوی پشتیبانی
```typescript
function CustomerSidebar() {
  const { data } = useAuthContext();
  const canViewSupport = data?.access?.permissions?.includes('customer.support.view');
  
  return (
    <nav>
      <MenuItem href="/customer-portal/contracts">قراردادها</MenuItem>
      <MenuItem href="/customer-portal/financial">مالی</MenuItem>
      {canViewSupport && (
        <MenuItem href="/customer-portal/support">پشتیبانی</MenuItem>
      )}
    </nav>
  );
}
```

### مثال 3: محافظت از صفحه
```typescript
// در layout.tsx یا page.tsx
export default function CustomerPortalLayout({ children }) {
  const { data } = useAuthContext();
  const hasAccess = data?.access?.permissions?.includes('customer.portal.access');
  
  if (!hasAccess) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
}
```

---

## چک‌لیست پیاده‌سازی

- [x] دسترسی‌ها در `vahedyek.ts` تعریف شدند
- [x] ماژول پنل خریدار اضافه شد
- [ ] Middleware برای بررسی دسترسی
- [ ] بررسی دسترسی در کامپوننت‌ها
- [ ] بررسی دسترسی در API routes
- [ ] تست دسترسی‌ها با نقش‌های مختلف
- [ ] مستندات برای ادمین‌ها

---

## سوالات متداول

**Q: آیا باید همه دسترسی‌ها را به یک خریدار بدهم؟**
A: بستگی به سیاست شما دارد. می‌توانید دسترسی‌ها را بر اساس نیاز محدود کنید.

**Q: چگونه می‌توانم دسترسی جدید اضافه کنم؟**
A: در فایل `vahedyek.ts` یک آیتم جدید به آرایه `permissions` اضافه کنید.

**Q: آیا می‌توانم دسترسی‌ها را به صورت پویا تغییر دهم؟**
A: بله، دسترسی‌ها از دیتابیس خوانده می‌شوند و می‌توانید آن‌ها را در پنل مدیریت تغییر دهید.

**Q: چگونه می‌توانم دسترسی‌ها را تست کنم؟**
A: با ایجاد کاربران با نقش‌های مختلف و ورود با آن‌ها به سیستم.
