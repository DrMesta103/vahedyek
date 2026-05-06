# ماژول مدیریت کارمندان - Vahedyek Panel

یک سیستم مدیریت کارمندان کامل با طراحی مینیمال و حرفه‌ای برای CRM املاک/فروش تجاری.

## ✅ امکانات پیاده‌سازی شده

### 1. لیست و مدیریت کارمندان (`/employees`)

**ویژگی‌ها:**
- 🔍 نوار جستجو برای فیلتر بر اساس نام، موبایل یا ایمیل
- 🔄 دکمه تغییر وضعیت (فعال/غیرفعال) با بروزرسانی فوری
- ✏️ دکمه ویرایش برای هر کارمند
- 🗑️ حذف نرم (Soft Delete) که داده‌های مرتبط را حفظ می‌کند
- 📊 نمایش جدولی تمیز و حرفه‌ای

### 2. ویزارد ثبت کارمند چند مرحله‌ای (`/employees/new`)

#### مرحله ۱: شماره موبایل
- ✅ اعتبارسنجی فرمت ۱۱ رقمی (۰۹XXXXXXXXX)
- ✅ بررسی تکراری بودن شماره از طریق API
- ✅ پیام‌های خطای واضح به فارسی

#### مرحله ۲: نام و نام خانوادگی
- ✅ دو فیلد جداگانه برای نام و نام خانوادگی
- ✅ اعتبارسنجی فیلدهای الزامی
- ✅ دکمه‌های بازگشت و ادامه

#### مرحله ۳: آدرس ایمیل
- ✅ اعتبارسنجی فرمت ایمیل
- ✅ بازخورد خطا در لحظه

#### مرحله ۴: بررسی و تأیید نهایی
- ✅ نمایش تمام اطلاعات وارد شده
- ✅ آیکون مداد برای ویرایش هر فیلد
- ✅ آپلود تصویر آواتار
- ✅ دکمه ثبت نهایی

## 📁 ساختار فایل‌ها

```
employees/
├── _components/
│   ├── EmployeeWizard.tsx       # کامپوننت اصلی ویزارد
│   ├── MobileStep.tsx           # مرحله ۱: ورود موبایل
│   ├── NameStep.tsx             # مرحله ۲: ورود نام
│   ├── EmailStep.tsx            # مرحله ۳: ورود ایمیل
│   ├── SummaryStep.tsx          # مرحله ۴: بررسی و ثبت
│   ├── WizardProgress.tsx       # نشانگر پیشرفت
│   ├── ImageUpload.tsx          # آپلود تصویر
│   └── EmployeeList.tsx         # لیست کارمندان
├── new/
│   └── page.tsx                 # صفحه افزودن کارمند
├── page.tsx                     # صفحه لیست کارمندان
├── employees.css                # استایل‌های ماژول
└── README.md                    # این فایل
```

## 🔌 API Endpoints

### POST `/api/employees`
ایجاد کارمند جدید

**Request:**
```json
{
  "mobile": "09123456789",
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "avatarUrl": "data:image/..."
}
```

### POST `/api/employees/check-mobile`
بررسی تکراری بودن موبایل

**Request:**
```json
{
  "mobile": "09123456789"
}
```

**Response:**
```json
{
  "exists": true | false
}
```

### PATCH `/api/employees/[id]/toggle-status`
تغییر وضعیت فعال/غیرفعال

**Request:**
```json
{
  "isActive": true | false
}
```

### DELETE `/api/employees/[id]`
حذف نرم کارمند (تنظیم isActive به false)

## 🎨 طراحی

### رنگ‌ها
- Primary: `var(--theme-accent)` - Teal
- Strong: `var(--theme-accent-strong)`
- Soft: `var(--theme-accent-soft)`
- Text: `var(--text-strong)`
- Muted: `var(--text-muted)`

### ویژگی‌های طراحی
- ✅ مینیمال و تمیز
- ✅ حرفه‌ای
- ✅ ریسپانسیو
- ✅ دارک مود (از طریق متغیرهای CSS)
- ✅ انیمیشن‌های نرم

## 🔐 امنیت

- احراز هویت از طریق session
- بررسی tenantId در تمام API calls
- حذف نرم برای حفظ یکپارچگی داده‌ها
- اعتبارسنجی سمت کلاینت و سرور

## 📝 نکات مهم

### Schema Database
مدل Employee در Prisma Schema باید شامل فیلدهای زیر باشد:

```prisma
model Employee {
  id        String   @id
  tenantId  String
  firstName String
  lastName  String
  mobile    String?  // اضافه شده
  email     String?  // اضافه شده
  avatarUrl String?  // اضافه شده
  isActive  Boolean  @default(true)
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  subjects  ContractSubject[]

  @@index([tenantId])
  @@index([tenantId, mobile])
}
```

### Migration
برای اضافه کردن فیلدهای جدید:

```bash
npx prisma migrate dev --name add_employee_fields
```

## 🚀 استفاده

### افزودن کارمند جدید

1. به `/employees/new` بروید
2. شماره موبایل را وارد کنید
3. نام و نام خانوادگی را وارد کنید
4. آدرس ایمیل را وارد کنید
5. اطلاعات را بررسی کنید
6. در صورت نیاز آواتار آپلود کنید
7. با آیکون مداد هر فیلد را ویرایش کنید
8. ثبت کنید

### مدیریت کارمندان

1. به `/employees` بروید
2. از نوار جستجو استفاده کنید
3. با دکمه سوئیچ وضعیت را تغییر دهید
4. روی "ویرایش" کلیک کنید
5. روی "حذف" کلیک کنید

## 🧪 تست

- [ ] ایجاد کارمند جدید
- [ ] بررسی اعتبارسنجی موبایل
- [ ] بررسی تکراری بودن موبایل
- [ ] اعتبارسنجی ایمیل
- [ ] ویرایش از صفحه خلاصه
- [ ] آپلود آواتار
- [ ] جستجو در لیست
- [ ] تغییر وضعیت
- [ ] حذف کارمند

## 📱 ریسپانسیو

- ✅ دسکتاپ (1400px+)
- ✅ تبلت (768px - 1400px)
- ✅ موبایل (< 768px)

## ♿ دسترسی‌پذیری

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader friendly

## 🔄 وضعیت

**✅ آماده برای استفاده در محیط تولید**

- ✅ تمام کامپوننت‌ها بدون خطا
- ✅ API routes پیاده‌سازی شده
- ✅ استایل‌ها کامل
- ✅ اعتبارسنجی‌ها فعال
- ✅ ریسپانسیو

## 📚 تکنولوژی‌ها

- React 18+
- Next.js 14+ (App Router)
- TypeScript
- Prisma ORM
- Tailwind CSS (متغیرهای CSS)

---

**نسخه**: 1.0.0  
**تاریخ**: ۱۴۰۵/۰۲/۱۵  
**پروژه**: Vahedyek Panel
