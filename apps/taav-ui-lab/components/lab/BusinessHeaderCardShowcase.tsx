'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { BadgePercent, Building2, ContactRound, Receipt, UsersRound } from 'lucide-react';
import { TaavBusinessHeaderCard } from '@repo/ui/taav/business';

function VariantWrap({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="flex justify-center">
      {children}
    </div>
  );
}

export function BusinessHeaderCardToggleWithLinkDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <VariantWrap>
      <TaavBusinessHeaderCard
        title="آیا این تنظیمات بعنوان پیشنهاد در زمان ثبت قرارداد نمایش داده شود؟"
        description="با فعال کردن این گزینه، هنگام ثبت قرارداد در صورت عدم رعایت پیش‌پرداخت به کاربر هشدار داده می‌شود."
        icon={<BadgePercent className="h-6 w-6" strokeWidth={2.2} />}
        variant="toggleWithLink"
        enabled={enabled}
        onToggle={setEnabled}
        href="#"
        onNavigate={() => undefined}
        detailLink={{ label: 'جزئیات تنظیمات پیش‌پرداخت', href: '#' }}
        themeMode="light"
      />
    </VariantWrap>
  );
}

export function BusinessHeaderCardToggleDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <VariantWrap>
      <TaavBusinessHeaderCard
        title="هزینه‌های جانبی"
        description="هزینه‌های ثابت یا درصدی مانند کارمزد اداری، هزینه تشکیل پرونده و هزینه خدمات را در این بخش تعریف کنید."
        icon={<Receipt className="h-6 w-6" strokeWidth={2.2} />}
        variant="toggle"
        enabled={enabled}
        onToggle={setEnabled}
        href="#"
        onNavigate={() => undefined}
        themeMode="light"
      />
    </VariantWrap>
  );
}

export function BusinessHeaderCardActionDemo() {
  return (
    <VariantWrap>
      <TaavBusinessHeaderCard
        title="راه‌های ارتباطی"
        description="در این بخش می‌توانید آدرس‌ها و شماره‌های تماس با سازمان خود را ثبت نمایید"
        icon={<ContactRound className="h-6 w-6" strokeWidth={2.1} />}
        variant="action"
        action={{
          label: 'افزودن راه ارتباطی',
          onClick: () => undefined,
        }}
        href="#"
        onNavigate={() => undefined}
        themeMode="light"
      />
    </VariantWrap>
  );
}

export function BusinessHeaderCardActionWithSearchDemo() {
  const [search, setSearch] = useState('');

  return (
    <VariantWrap>
      <TaavBusinessHeaderCard
        title="نماینده قانونی / صاحب امضا"
        description="فردی که اختیار امضای قراردادها و اسناد رسمی را دارد."
        icon={<UsersRound className="h-6 w-6" strokeWidth={2.1} />}
        variant="actionWithSearch"
        action={{
          label: 'افزودن نماینده',
          onClick: () => undefined,
        }}
        search={{
          value: search,
          placeholder: 'جستجو...',
          onChange: setSearch,
        }}
        href="#"
        onNavigate={() => undefined}
        themeMode="light"
      />
    </VariantWrap>
  );
}

export function BusinessHeaderCardNavigationDemo() {
  return (
    <VariantWrap>
      <TaavBusinessHeaderCard
        title="پروفایل کسب و کار"
        description="در پروفایل کسب‌وکار اطلاعات هویتی، حقوقی، مالی و تماس شرکت ثبت می‌شود تا مبنای قراردادها، پروژه‌ها و ارتباطات رسمی در سیستم باشد."
        icon={<Building2 className="h-6 w-6" strokeWidth={2.2} />}
        variant="navigation"
        href="#"
        themeMode="light"
      />
    </VariantWrap>
  );
}
