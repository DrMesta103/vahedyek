# راهنمای مسیرهای CSS در پنل خریدار 📁

## ساختار پوشه‌ها

```
app/(panel)/customer-portal/
├── customer-portal.css              ← فایل CSS اینجاست
├── contracts/
│   ├── page.tsx                    
│   └── [contractId]/
│       └── page.tsx                
├── payment-methods/
│   └── page.tsx                    
├── due-dates/
│   └── page.tsx                    
└── account/
    └── page.tsx                    
```

## مسیرهای صحیح Import

### 1. صفحات سطح اول (یک پوشه پایین‌تر از CSS)

**مسیر:** `customer-portal/contracts/page.tsx`  
**Import:** `import '../customer-portal.css';`

```
customer-portal/
├── customer-portal.css              ← هدف
└── contracts/
    └── page.tsx                     ← شروع (../ = یک سطح بالا)
```

**مثال‌ها:**
- ✅ `contracts/page.tsx` → `'../customer-portal.css'`
- ✅ `payment-methods/page.tsx` → `'../customer-portal.css'`
- ✅ `due-dates/page.tsx` → `'../customer-portal.css'`
- ✅ `account/page.tsx` → `'../customer-portal.css'`

---

### 2. صفحات سطح دوم (دو پوشه پایین‌تر از CSS)

**مسیر:** `customer-portal/contracts/[contractId]/page.tsx`  
**Import:** `import '../../customer-portal.css';`

```
customer-portal/
├── customer-portal.css              ← هدف
└── contracts/
    └── [contractId]/
        └── page.tsx                 ← شروع (../../ = دو سطح بالا)
```

**مثال:**
- ✅ `contracts/[contractId]/page.tsx` → `'../../customer-portal.css'`

---

## قانون کلی

```
../ = یک سطح بالا
../../ = دو سطح بالا
../../../ = سه سطح بالا
```

### نحوه محاسبه:

1. از فایل فعلی شروع کنید
2. هر بار که یک پوشه بالا می‌روید، یک `../` اضافه کنید
3. تا برسید به پوشه‌ای که فایل CSS در آن است

---

## کد نهایی صحیح

### contracts/page.tsx
```typescript
import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import ContractsList from '../../../components/customer/contracts/ContractsList';
import '../customer-portal.css'; // ✅ یک سطح بالا
```

### contracts/[contractId]/page.tsx
```typescript
import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import ContractDashboard from '../../../../components/customer/contracts/ContractDashboard';
import '../../customer-portal.css'; // ✅ دو سطح بالا
```

### payment-methods/page.tsx
```typescript
import PanelLayout from '../../../components/PanelLayout';
import '../customer-portal.css'; // ✅ یک سطح بالا
```

### due-dates/page.tsx
```typescript
import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import DueDatesList from '../../../components/customer/financial/DueDatesList';
import '../customer-portal.css'; // ✅ یک سطح بالا
```

### account/page.tsx
```typescript
import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import AccountProfile from '../../../components/customer/account/AccountProfile';
import '../customer-portal.css'; // ✅ یک سطح بالا
```

---

## چک‌لیست نهایی

- [x] `contracts/page.tsx` → `'../customer-portal.css'`
- [x] `contracts/[contractId]/page.tsx` → `'../../customer-portal.css'`
- [x] `payment-methods/page.tsx` → `'../customer-portal.css'`
- [x] `due-dates/page.tsx` → `'../customer-portal.css'`
- [x] `account/page.tsx` → `'../customer-portal.css'`

---

## نکته مهم 💡

اگر در آینده صفحه جدیدی اضافه کردید:

1. **سطح اول** (مثل `new-page/page.tsx`):
   ```typescript
   import '../customer-portal.css';
   ```

2. **سطح دوم** (مثل `contracts/new/page.tsx`):
   ```typescript
   import '../../customer-portal.css';
   ```

3. **سطح سوم** (مثل `contracts/[id]/edit/page.tsx`):
   ```typescript
   import '../../../customer-portal.css';
   ```

---

**تاریخ:** 1403/02/18  
**وضعیت:** ✅ تمام مسیرها صحیح هستند
