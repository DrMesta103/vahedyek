# مشخصات پنل خریدار (Buyer/Customer Panel)

## نمای کلی
پنل خریدار یک داشبورد اختصاصی برای مشتریان/خریدارانی است که قراردادهای فعال دارند. این پنل به آنها امکان می‌دهد قراردادها، وضعیت مالی، پرداخت‌ها و اسناد خود را مدیریت کنند.

## سطح دسترسی
- نقش: `buyer` / `customer`
- دسترسی‌های مورد نیاز:
  - `customer.contracts.view` - مشاهده قراردادهای خود
  - `customer.payments.view` - مشاهده پرداخت‌ها
  - `customer.payments.submit` - ثبت فیش پرداختی
  - `customer.documents.view` - مشاهده اسناد
  - `customer.support.create` - ایجاد تیکت پشتیبانی
  - `customer.profile.view` - مشاهده پروفایل
  - `customer.profile.update` - ویرایش پروفایل

---

## ساختار منوی اصلی

### 1. قراردادهای من
**مسیر:** `/customer-portal/contracts`
**آیکون:** `fa-file-contract`
**توضیح:** لیست تمام قراردادهای فعال و دارایی‌های کاربر

### 2. مدیریت مالی (دارای زیرمنو)
**مسیر:** `/customer-portal/financial`
**آیکون:** `fa-money-bill-wave`

#### 2.1 فیش‌های پرداختی
**مسیر:** `/customer-portal/financial/receipts`
**آیکون:** `fa-receipt`

#### 2.2 روش‌های پرداخت بدهی
**مسیر:** `/customer-portal/financial/payment-methods`
**آیکون:** `fa-credit-card`

#### 2.3 سررسیدهای من
**مسیر:** `/customer-portal/financial/due-dates`
**آیکون:** `fa-calendar-check`

### 3. پشتیبانی / تیکت‌ها
**مسیر:** `/customer-portal/support`
**آیکون:** `fa-headset`
**توضیح:** ارتباط با کارشناسان و مشاهده تیکت‌ها

### 4. حساب کاربری
**مسیر:** `/customer-portal/account`
**آیکون:** `fa-user-circle`
**توضیح:** تنظیمات پروفایل و مشخصات فردی

---

## امکانات هدر (Header Features)

### دکمه تغییر تم
- تاریک / روشن
- ذخیره در localStorage

### اعلان‌ها (Notifications)
- نمایش تعداد اعلان‌های خوانده نشده
- لیست اعلان‌ها در Dropdown

### مسیر کاربری (Breadcrumbs)
- نمایش مسیر فعلی
- قابلیت کلیک برای بازگشت

---

## فلوها و صفحات داخلی

## فلوی 1: مدیریت قراردادها (Contract Hub)

### صفحه لیست قراردادها
**مسیر:** `/customer-portal/contracts`

**المان‌های UI:**
- کارت‌های قرارداد شامل:
  - شماره قرارداد
  - تاریخ قرارداد (شمسی)
  - نام بلوک
  - شماره طبقه
  - مشخصه واحد (مثلاً: واحد 12، پلاک 5)
  - وضعیت قرارداد (فعال، تکمیل شده، معلق)
  - درصد پیشرفت پرداخت (Progress Bar)

**اکشن:**
- کلیک روی هر کارت → ورود به داشبورد داخلی قرارداد

---

### داشبورد داخلی قرارداد
**مسیر:** `/customer-portal/contracts/[contractId]`

**6 بخش اصلی (دکمه/کارت):**

#### 1. متن قرارداد
**مسیر:** `/customer-portal/contracts/[contractId]/text`

**فیلدهای موضوع قرارداد:**
- نوع قرارداد (پیش‌فروش، رهن، اجاره، ...)
- تاریخ تحویل واحد
- مبلغ کل قرارداد
- شرایط خاص

**فیلدهای طرفین:**
- نام خریدار
- نام فروشنده/نماینده
- نوع قدرالسهم (دانگ، درصد)
- مقدار سهم

**نمودار بصری (Donut Chart):**
- مبلغ کل به تفکیک:
  - پیش‌پرداخت (%)
  - اقساط (%)
  - وام بانکی (%)
  - تحویل سند (%)
  - تحویل واحد (%)

#### 2. فهرست سررسیدها
**مسیر:** `/customer-portal/contracts/[contractId]/due-dates`

**جدول/تایم‌لاین:**
- شماره سررسید
- مبلغ
- تاریخ سررسید
- وضعیت (پرداخت شده، معوق، در انتظار)
- تاریخ پرداخت واقعی (اگر پرداخت شده)

#### 3. فیش‌های پرداختی
**مسیر:** `/customer-portal/contracts/[contractId]/receipts`

**لیست فیش‌ها:**
- شماره پیگیری
- بانک مقصد
- مبلغ
- تاریخ واریز
- وضعیت تایید (در انتظار، تایید شده، رد شده)
- تصویر فیش (قابل مشاهده)

**دکمه:** ثبت فیش جدید

#### 4. گزارش مالی
**مسیر:** `/customer-portal/contracts/[contractId]/financial-report`

**کارت‌های وضعیت (Progress Rings):**
- مانده بدهی کل (مبلغ + درصد)
- مبلغ کل پرداخت شده
- وضعیت پیش‌پرداخت
- وضعیت اقساط
- وضعیت وام بانکی
- وضعیت تعدیل

**نمودارها:**
- نمودار خطی: روند پرداخت‌ها در طول زمان
- نمودار میله‌ای: مقایسه پرداخت‌های برنامه‌ریزی شده با واقعی

#### 5. مدارک قرارداد
**مسیر:** `/customer-portal/contracts/[contractId]/documents`

**دسته‌بندی مدارک:**
- قرارداد اولیه
- متمم‌ها
- مدارک شناسایی
- مدارک مالکیت
- سایر اسناد

**هر مدرک شامل:**
- Thumbnail تصویر
- عنوان مدرک
- تاریخ بارگذاری
- دکمه دانلود
- دکمه مشاهده

#### 6. روش‌های پرداخت بدهی
**مسیر:** `/customer-portal/contracts/[contractId]/payment-offers`

**هدر مالی:**
- نوار پیشرفت: مبلغ کل قرارداد
  - پرداخت شده (سبز)
  - مانده بدهی (قرمز)

**کارت هزینه‌های جانبی:**
- مبلغ کل هزینه‌های جانبی
- پرداختی
- جریمه

**بخش پیشنهادهای سیستم (3 کارت آفر):**

##### پیشنهاد 1: تسویه کامل
**فیلدها:**
- مبلغ تسویه با تخفیف
- هزینه انشعابات
- بدهی معوق
- جریمه
- جمع کل قابل پرداخت
- تاریخ انقضای پیشنهاد

**ویژگی UX:**
- مهر قرمز "فاقد اعتبار است" برای پیشنهادهای منقضی شده

##### پیشنهاد 2: قرارداد جدید با قیمت روز
**فیلدها:**
- قیمت روز واحد
- سهم بروز شده مشتری
- مبلغ آورده جدید
- چک‌لیست مزایا:
  - ✓ حذف تاخیر
  - ✓ اقساط جدید
  - ✓ شرایط بهتر

##### پیشنهاد 3: واگذاری فروش
**فیلدها:**
- قیمت تقریبی فروش
- درصد آورده قابل بازگشت
- کارمزد واگذاری
- زمان تقریبی فروش

---

## فلوی 2: گزارشات مالی و نمودارها

### صفحه گزارش مالی کلی
**مسیر:** `/customer-portal/financial/overview`

**کارت‌های خلاصه:**
- مجموع بدهی در تمام قراردادها
- مجموع پرداخت‌های انجام شده
- نزدیک‌ترین سررسید
- تعداد قراردادهای فعال

**نمودارها:**
- نمودار دونات: توزیع بدهی بین قراردادها
- نمودار خطی: روند پرداخت‌ها در 12 ماه گذشته

---

## فلوی 3: روش‌های پرداخت و پیشنهادهای تسویه

### صفحه روش‌های پرداخت
**مسیر:** `/customer-portal/financial/payment-methods`

**روش‌های پرداخت:**
- کارت به کارت
- واریز به حساب
- پرداخت اینترنتی (درگاه)
- چک

**اطلاعات هر روش:**
- شماره حساب/کارت
- نام بانک
- نام صاحب حساب
- دکمه کپی

---

## فلوی 4: سررسیدها و فیش‌های پرداختی

### صفحه سررسیدهای من
**مسیر:** `/customer-portal/financial/due-dates`

**فیلترها:**
- همه قراردادها / قرارداد خاص
- وضعیت (همه، پرداخت شده، معوق، در انتظار)
- بازه زمانی

**تایم‌لاین/جدول:**
- شماره قرارداد
- شماره سررسید
- مبلغ
- تاریخ سررسید
- وضعیت
- اکشن (پرداخت، مشاهده جزئیات)

---

### صفحه ثبت فیش پرداختی
**مسیر:** `/customer-portal/financial/receipts/new`

**فرم:**
- انتخاب قرارداد (Dropdown)
- انتخاب بانک مقصد (Dropdown)
- شماره پیگیری / کد ردیابی (Text Input)
- تاریخ واریز (Date Picker - شمسی)
- مبلغ واریزی (Number Input)
- باکس آپلود تصویر فیش (Drag & Drop)
- توضیحات (Textarea - اختیاری)

**دکمه‌ها:**
- ثبت فیش
- انصراف

---

### صفحه لیست فیش‌های پرداختی
**مسیر:** `/customer-portal/financial/receipts`

**فیلترها:**
- قرارداد
- وضعیت تایید
- بازه زمانی

**جدول:**
- شماره پیگیری
- قرارداد
- بانک
- مبلغ
- تاریخ واریز
- وضعیت
- اکشن (مشاهده، حذف)

---

## فلوی 5: مدارک و اسناد قرارداد

### صفحه مدارک
**مسیر:** `/customer-portal/contracts/[contractId]/documents`

**دسته‌بندی:**
- قرارداد اولیه
- متمم‌ها
- مدارک شناسایی
- مدارک مالکیت
- سایر

**Grid View:**
- Thumbnail
- عنوان
- تاریخ بارگذاری
- حجم فایل
- دکمه دانلود
- دکمه مشاهده

---

## فلوی 6: پشتیبانی و تیکت‌ها

### صفحه لیست تیکت‌ها
**مسیر:** `/customer-portal/support`

**دکمه:** تیکت جدید

**لیست تیکت‌ها:**
- شماره تیکت
- موضوع
- وضعیت (باز، در حال بررسی، بسته شده)
- تاریخ ایجاد
- آخرین پاسخ

---

### صفحه ایجاد تیکت
**مسیر:** `/customer-portal/support/new`

**فرم:**
- موضوع (Text Input)
- دسته‌بندی (Dropdown: مالی، فنی، قرارداد، سایر)
- اولویت (کم، متوسط، زیاد)
- توضیحات (Textarea)
- پیوست (File Upload)

---

### صفحه جزئیات تیکت
**مسیر:** `/customer-portal/support/[ticketId]`

**نمایش:**
- اطلاعات تیکت
- تایم‌لاین پیام‌ها
- فرم پاسخ

---

## فلوی 7: حساب کاربری

### صفحه پروفایل
**مسیر:** `/customer-portal/account`

**بخش‌ها:**
- اطلاعات شخصی
  - نام و نام خانوادگی
  - کد ملی
  - تاریخ تولد
  - شماره تماس
  - ایمیل
- آدرس
- تصویر پروفایل
- تغییر رمز عبور

---

## مدل‌های داده (Data Models)

### Contract (قرارداد)
```typescript
interface Contract {
  id: string;
  contractNumber: string;
  contractDate: string;
  type: 'presale' | 'rental' | 'mortgage';
  status: 'active' | 'completed' | 'suspended';
  
  // واحد
  blockName: string;
  floorNumber: string;
  unitIdentifier: string;
  
  // مالی
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentProgress: number; // درصد
  
  // تاریخ‌ها
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
}
```

### PaymentReceipt (فیش پرداختی)
```typescript
interface PaymentReceipt {
  id: string;
  contractId: string;
  trackingNumber: string;
  bankName: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl: string;
  description?: string;
  createdAt: string;
}
```

### DueDate (سررسید)
```typescript
interface DueDate {
  id: string;
  contractId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'overdue' | 'pending';
  actualPaymentDate?: string;
}
```

### Document (مدرک)
```typescript
interface Document {
  id: string;
  contractId: string;
  category: 'contract' | 'amendment' | 'identity' | 'ownership' | 'other';
  title: string;
  fileUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  uploadedAt: string;
}
```

### PaymentOffer (پیشنهاد پرداخت)
```typescript
interface PaymentOffer {
  id: string;
  contractId: string;
  type: 'full_settlement' | 'new_contract' | 'transfer';
  amount: number;
  discount?: number;
  expiryDate: string;
  isExpired: boolean;
  details: Record<string, any>;
}
```

### SupportTicket (تیکت پشتیبانی)
```typescript
interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  category: 'financial' | 'technical' | 'contract' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  description: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

## نکات فنی و UX

### امنیت
- احراز هویت دو مرحله‌ای
- محدودیت دسترسی به قراردادهای خود کاربر
- رمزنگاری اطلاعات حساس

### واکنش‌گرا (Responsive)
- موبایل First
- تبلت و دسکتاپ

### دسترسی‌پذیری
- ARIA Labels
- کیبورد Navigation
- کنتراست رنگ مناسب

### عملکرد
- Lazy Loading برای تصاویر
- Pagination برای لیست‌ها
- Caching داده‌ها

### اعلان‌ها
- اعلان سررسید نزدیک
- اعلان تایید فیش
- اعلان پاسخ تیکت

---

## مراحل پیاده‌سازی

### فاز 1: پایه (Foundation)
1. ایجاد ساختار مسیرها
2. طراحی Layout اختصاصی پنل خریدار
3. سیستم احراز هویت و دسترسی

### فاز 2: قراردادها
1. لیست قراردادها
2. داشبورد قرارداد
3. متن و جزئیات قرارداد

### فاز 3: مالی
1. سررسیدها
2. فیش‌های پرداختی
3. گزارش مالی
4. پیشنهادهای پرداخت

### فاز 4: مدارک و پشتیبانی
1. مدیریت مدارک
2. سیستم تیکتینگ

### فاز 5: پروفایل و تنظیمات
1. صفحه پروفایل
2. تنظیمات حساب کاربری

---

## چک‌لیست نهایی

- [ ] ساختار مسیرها
- [ ] Layout پنل خریدار
- [ ] سیستم احراز هویت
- [ ] لیست قراردادها
- [ ] داشبورد قرارداد
- [ ] متن قرارداد با نمودار
- [ ] سررسیدها
- [ ] فیش‌های پرداختی
- [ ] گزارش مالی
- [ ] مدارک قرارداد
- [ ] پیشنهادهای پرداخت
- [ ] سیستم تیکتینگ
- [ ] صفحه پروفایل
- [ ] تم تاریک/روشن
- [ ] سیستم اعلان‌ها
- [ ] Responsive Design
- [ ] تست‌های واحد
- [ ] مستندات API
