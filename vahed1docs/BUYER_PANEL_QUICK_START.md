# 🚀 راهنمای سریع پنل خریدار

## شروع سریع (3 دقیقه)

### 1️⃣ اجرای پروژه
```bash
cd apps/vahedyek-panel
npm run dev
```

### 2️⃣ فعال‌سازی دسترسی‌ها
1. به `http://localhost:3000/settings` بروید
2. "افزودن نقش جدید" کلیک کنید
3. عنوان: **خریدار**
4. در گروه "پنل خریدار" روی **"فعال کردن همه"** کلیک کنید
5. ذخیره کنید

### 3️⃣ مشاهده پنل
به یکی از این آدرس‌ها بروید:
- `http://localhost:3000/customer-portal/contracts`
- `http://localhost:3000/customer-portal/payment-methods`
- `http://localhost:3000/customer-portal/due-dates`
- `http://localhost:3000/customer-portal/account`

---

## 📁 ساختار فایل‌ها

```
app/(panel)/customer-portal/
├── contracts/page.tsx              # لیست قراردادها
├── contracts/[contractId]/page.tsx # داشبورد قرارداد
├── payment-methods/page.tsx        # روش‌های پرداخت
├── due-dates/page.tsx              # سررسیدها
└── account/page.tsx                # حساب کاربری
```

---

## 🎯 4 منوی اصلی

| منو | مسیر | دسترسی |
|-----|------|--------|
| قراردادهای من | `/customer-portal/contracts` | `customer.contracts.view` |
| روش‌های پرداخت | `/customer-portal/payment-methods` | `customer.payments.view` |
| سررسیدهای من | `/customer-portal/due-dates` | `customer.payments.view` |
| حساب کاربری | `/customer-portal/account` | `customer.profile.view` |

---

## 🔧 رفع مشکلات سریع

### خطای Build
```powershell
Remove-Item -Recurse -Force apps/vahedyek-panel/.next
npm run dev
```

### منوها نمایش داده نمی‌شوند
1. به `/settings` بروید
2. دسترسی‌های گروه "پنل خریدار" را فعال کنید
3. صفحه را Refresh کنید

### خطای Import
- تمام Import ها صحیح هستند
- Cache را پاک کنید
- دوباره اجرا کنید

---

## 📊 داده‌ها

**فعلاً Mock هستند!**

برای اتصال به API، در هر کامپوننت `setTimeout` را با `fetch` جایگزین کنید.

---

## 📚 مستندات کامل

- **BUYER_PANEL_SPEC.md** - مشخصات کامل
- **BUYER_PANEL_README.md** - راهنمای جامع
- **BUYER_PANEL_READY.md** - وضعیت نهایی
- **BUYER_PANEL_PERMISSIONS.md** - دسترسی‌ها

---

## ✅ چک‌لیست

- [ ] پروژه اجرا شد (`npm run dev`)
- [ ] نقش "خریدار" ایجاد شد
- [ ] دسترسی‌ها فعال شدند
- [ ] 4 منو در Sidebar نمایش داده می‌شوند
- [ ] صفحات به درستی کار می‌کنند

---

**همین!** 🎉

پنل خریدار آماده است. برای جزئیات بیشتر، فایل‌های مستندات را مطالعه کنید.
