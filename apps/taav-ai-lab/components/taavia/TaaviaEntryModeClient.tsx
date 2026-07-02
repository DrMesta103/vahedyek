'use client';

import Link from 'next/link';
import { ArrowLeft, Bot, ChevronLeft, Sparkles, Wand2 } from 'lucide-react';

type TaaviaEntryModeClientProps = {
  businessId: string;
  brandId: string;
  brandName: string;
};

export function TaaviaEntryModeClient({
  businessId,
  brandId,
  brandName,
}: TaaviaEntryModeClientProps) {
  const basePath = `/businesses/${businessId}/products/taavia/brands/${brandId}`;

  return (
    <div className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,16,33,0.98)_0%,rgba(11,22,43,0.95)_100%)] px-5 py-8 shadow-[0_24px_120px_rgba(0,0,0,0.45)] md:px-8 md:py-10">
      <div className="absolute inset-x-[-10%] top-[-18%] h-64 rounded-full bg-[radial-gradient(circle,rgba(61,233,208,0.30)_0%,rgba(61,233,208,0)_72%)] blur-3xl" />
      <div className="absolute bottom-[-22%] left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(94,130,255,0.22)_0%,rgba(94,130,255,0)_76%)] blur-3xl" />
      <div className="absolute right-[-8%] top-[22%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_78%)] blur-3xl" />

      <div className="relative grid gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/businesses/${businessId}/products/taavia/brands`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[length:var(--taav-text-sm)] font-bold text-[var(--taav-text-strong)] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              بازگشت به برندها
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(61,233,208,0.24)] bg-[rgba(61,233,208,0.10)] px-4 py-2 text-[length:var(--taav-text-xs)] font-black text-[rgb(150,246,231)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            برند {brandName}
          </div>
        </div>

        <div className="grid gap-4 text-right">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-muted)] backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[rgb(61,233,208)] shadow-[0_0_16px_rgba(61,233,208,0.8)]" />
            مسیر شروع برند
          </div>
          <h1 className="m-0 max-w-3xl text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.1] tracking-[-0.03em] text-white">
            حالا انتخاب کن برندت را با <span className="text-[rgb(130,245,229)]">هوش مصنوعی</span> جلو ببری یا
            <span className="text-[rgb(163,188,255)]"> دستی</span> تنظیمش کنی
          </h1>
          <p className="m-0 max-w-2xl text-[length:var(--taav-text-md)] leading-8 text-[rgba(221,231,255,0.74)]">
            هر دو مسیر آماده‌اند. اگر بخواهی سریع‌تر شروع کنی، AI مستقیم تو را وارد چت مدیریت برند می‌کند. اگر کنترل کامل
            می‌خواهی، مسیر دستی برای انتخاب بخش‌ها و تنظیمات دقیق آماده است.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Link href={`${basePath}?mode=ai`} className="group">
            <article className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/8 p-5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:border-[rgba(61,233,208,0.38)] hover:bg-white/12 hover:shadow-[0_20px_60px_rgba(14,197,173,0.18)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(61,233,208,0.24)_0%,rgba(61,233,208,0.06)_45%,rgba(255,255,255,0.06)_100%)] opacity-90" />
              <div className="absolute right-5 top-5 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_72%)] blur-2xl" />
              <div className="relative grid gap-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/14 bg-[rgba(255,255,255,0.12)] text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
                    <Bot className="h-7 w-7" />
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(7,17,28,0.24)] px-3 py-1 text-[length:var(--taav-text-xs)] font-black text-[rgb(191,255,245)]">
                    AI
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="grid gap-3 text-right">
                  <h2 className="m-0 text-[clamp(1.7rem,2vw,2.3rem)] font-black text-white">راه‌اندازی با AI</h2>
                  <p className="m-0 text-[length:var(--taav-text-sm)] leading-8 text-[rgba(231,245,244,0.80)]">
                    مستقیم وارد چت هوشمند مدیریت برند شو و با کمک AI مسیر راه‌اندازی، محتوا و آماده‌سازی دانش برند را پیش ببر.
                  </p>
                </div>

                <div className="grid gap-2 text-right text-[length:var(--taav-text-xs)] text-[rgba(225,251,245,0.78)]">
                  <span>شروع سریع و تعاملی</span>
                  <span>مناسب برای راه‌اندازی اولیه و ایده‌پردازی</span>
                </div>

                <div className="inline-flex items-center justify-between rounded-[22px] border border-white/10 bg-[rgba(6,17,27,0.24)] px-4 py-3 text-white">
                  <span className="text-[length:var(--taav-text-sm)] font-black">ورود به مسیر AI</span>
                  <ChevronLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
                </div>
              </div>
            </article>
          </Link>

          <Link href={`${basePath}/manual`} className="group">
            <article className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/8 p-5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:border-[rgba(120,146,255,0.34)] hover:bg-white/12 hover:shadow-[0_20px_60px_rgba(92,112,255,0.16)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(112,131,255,0.24)_0%,rgba(112,131,255,0.06)_42%,rgba(255,255,255,0.06)_100%)] opacity-90" />
              <div className="absolute left-5 top-5 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_72%)] blur-2xl" />
              <div className="relative grid gap-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/14 bg-[rgba(255,255,255,0.12)] text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(8,16,31,0.24)] px-3 py-1 text-[length:var(--taav-text-xs)] font-black text-[rgb(210,218,255)]">
                    دستی
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="grid gap-3 text-right">
                  <h2 className="m-0 text-[clamp(1.7rem,2vw,2.3rem)] font-black text-white">تنظیم دستی</h2>
                  <p className="m-0 text-[length:var(--taav-text-sm)] leading-8 text-[rgba(233,238,255,0.78)]">
                    بخش‌های استفاده، مسیر فعال‌سازی و جزئیات راه‌اندازی را قدم‌به‌قدم خودت انتخاب کن و کنترل کامل روی تنظیمات
                    داشته باش.
                  </p>
                </div>

                <div className="grid gap-2 text-right text-[length:var(--taav-text-xs)] text-[rgba(223,229,255,0.78)]">
                  <span>کنترل کامل روی تنظیمات</span>
                  <span>مناسب برای تعیین دقیق بخش‌ها و ساختار برند</span>
                </div>

                <div className="inline-flex items-center justify-between rounded-[22px] border border-white/10 bg-[rgba(7,16,30,0.24)] px-4 py-3 text-white">
                  <span className="text-[length:var(--taav-text-sm)] font-black">ورود به مسیر دستی</span>
                  <ChevronLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
                </div>
              </div>
            </article>
          </Link>
        </div>
      </div>
    </div>
  );
}
