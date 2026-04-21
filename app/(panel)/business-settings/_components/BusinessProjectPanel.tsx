'use client';

import { useState } from 'react';
import { Building2, ClipboardList, FileText, Grid2X2, Home, MapPin, Pencil, Wrench } from 'lucide-react';
import { TagPill } from '../../contracts/new/_components/ContractFormPrimitives';

const ownershipOptions = [
  { value: 'rental', label: 'استیجاری' },
  { value: 'endowment', label: 'اوقافی' },
  { value: 'registered', label: 'ثبتی ملکی' },
] as const;

const structureOptions = [
  { value: 'housing-foundation', label: 'بنیاد مسکن' },
  { value: 'public-private-company', label: 'شرکت‌های خصوصی سهامی عام' },
  { value: 'other', label: 'سایر' },
  { value: 'national-housing', label: 'مسکن ملی' },
  { value: 'private-company', label: 'شرکت‌های خصوصی سهامی خاص' },
  { value: 'personal', label: 'شخصی ساز' },
  { value: 'mehr', label: 'مسکن مهر' },
  { value: 'cooperative', label: 'تعاونی' },
] as const;

const infoItems = [
  {
    title: 'گزارشات اطلاعات مجتمع',
    description: 'نمایش کلی از اطلاعات مجتمع مانند ثبت واحدها و طبقات مجتمع',
    icon: ClipboardList,
  },
  {
    title: 'مشخصات فنی پروژه',
    description: 'کابینت، سرامیک، سیستم سرمایش و گرمایش',
    icon: Wrench,
  },
  {
    title: 'فهرست بلوک‌ها',
    description: 'نمایش لیست بلوک‌های مجتمع',
    icon: Home,
  },
  {
    title: 'فایل‌ها',
    description: 'بارگذاری اسناد تکمیلی مانند نقشه‌ها، پروانه ساخت، گزارش‌های فنی و عکس‌های رسمی',
    icon: FileText,
  },
  {
    title: 'پلاک اصلی / پلاک فرعی',
    description: 'پلاک اصلی: ۱۲۵ (پلاک فرعی ۱۰)، پلاک اصلی: ۱ ... بیشتر',
    icon: Grid2X2,
  },
  {
    title: 'آدرس',
    description: 'پونک گلزار سوم',
    icon: MapPin,
  },
  {
    title: 'تیپ‌های واحد',
    description: 'فهرست تیپ‌های واحد مجتمع',
    icon: Building2,
  },
];

export function BusinessProjectPanel() {
  const [ownership, setOwnership] = useState<(typeof ownershipOptions)[number]['value']>('registered');
  const [structure, setStructure] = useState<(typeof structureOptions)[number]['value']>('cooperative');

  return (
    <section className="business-project-page" aria-label="پروفایل مجتمع">
      <div className="business-project-card">
        <div className="business-project-avatar" aria-hidden="true">
          <Building2 />
        </div>

        <div className="business-project-title-row">
          <button type="button" className="business-project-edit" aria-label="ویرایش" title="ویرایش">
            <Pencil />
          </button>
          <h1>آسمان شب</h1>
        </div>

        <div className="business-project-section">
          <h2>نوع مالکیت عرضه</h2>
          <div className="business-project-tags" role="radiogroup" aria-label="نوع مالکیت">
            {ownershipOptions.map((option) => (
              <TagPill key={option.value} label={option.label} active={ownership === option.value} onClick={() => setOwnership(option.value)} />
            ))}
          </div>
          <p>وضعیت مالکیت زمین یا بنا را مشخص کنید. این مورد در قراردادها و اسناد رسمی لحاظ می‌شود</p>
        </div>

        <div className="business-project-section">
          <h2>نوع ساخت</h2>
          <div className="business-project-tags" role="radiogroup" aria-label="نوع ساخت">
            {structureOptions.map((option) => (
              <TagPill key={option.value} label={option.label} active={structure === option.value} onClick={() => setStructure(option.value)} />
            ))}
          </div>
          <p>شیوه یا نهاد اصلی سازنده پروژه را مشخص کنید</p>
        </div>

        <div className="business-project-info-grid" aria-label="بخش‌های اطلاعاتی">
          {infoItems.map((item) => {
            const Icon = item.icon;

            return (
              <button type="button" key={item.title} className="business-project-info-item">
                <div className="business-project-info-content">
                  <div className="business-project-info-title">
                    <Icon />
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                </div>
                <span className="business-project-chevron">‹</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
