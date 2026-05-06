'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessSettingsCard, type BusinessSettingsCardProps } from '../../_components/BusinessSettingsCard';
import { fetchProfileStore, persistProfileStore, type ContactOfficeRecord, type OwnershipKind } from './profileStorage';

type ProfileSection = BusinessSettingsCardProps & {
  span?: 'full' | 'half';
  onlyFor?: OwnershipKind;
};

const baseSections: ProfileSection[] = [
  {
    title: 'نوع مالکیت و اطلاعات پایه',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 'full',
    href: '/business-settings/profile/ownership',
  },
  {
    title: 'سهامداران اصلی',
    description: 'مدیریت و تنظیم قراردادها، فرم‌های رسمی و اطلاعیه‌ها',
    onlyFor: 'legal',
    href: '/business-settings/profile/shareholders',
  },
  {
    title: 'شرکای اصلی',
    description: 'مدیریت و ثبت شرکای اصلی برای کسب‌وکار حقیقی',
    onlyFor: 'natural',
    href: '/business-settings/profile/partners',
  },
  {
    title: 'نماینده قانونی',
    description: 'مدیریت و تنظیم قراردادها، فرم‌های رسمی و اطلاعیه‌ها',
    href: '/business-settings/profile/representatives',
  },
  {
    title: 'هیئت مدیره',
    description: 'مدیریت اعضای هیئت مدیره با همان فلو افزودن نماینده',
    onlyFor: 'legal',
    href: '/business-settings/profile/board-members',
    span: 'full'
  },
  {
    title: 'شماره حساب',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 'full',
    href: '/business-settings/profile/bank-accounts',
  },
  {
    title: 'اسناد',
    description: '(در حال توسعه) این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
  },
  {
    title: 'لوگو و مهر',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    href: '/business-settings/profile/branding',
  },
  {
    title: 'ارز پایه',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/currency',
  },
  {
    title: 'زبان های فعال',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/languages',
  },
  {
    title: 'تقویم',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/calendar',
  },
  {
    title: 'واحد اندازه گیری',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/measurement',
  },
  {
    title: 'راه های ارتباطی',
    description: '(در حال توسعه) در این بخش می‌توانید آدرس ها و شماره های تماس سازمان خود را ثبت نمایید',
    span: 'full',
  },
];

export function BusinessProfileOverviewPanel() {
  const router = useRouter();
  const [ownershipKind, setOwnershipKind] = useState<OwnershipKind>('legal');
  const [contactWaysDialogOpen, setContactWaysDialogOpen] = useState(false);
  const [selectedTitles, setSelectedTitles] = useState<string[]>(['دفتر فنی']);

  const optionalOfficeTitles = ['دفتر فنی', 'دفتر وصول مطالبات', 'دفتر مرکزی', 'دفتر فروش', 'نمایندگی', 'دفتر پشتیبانی', 'دفتر حقوقی'];

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setOwnershipKind(store.ownershipKind);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const sections = baseSections.filter((section) => !section.onlyFor || section.onlyFor === ownershipKind);

  async function submitContactWaysTitles() {
    const store = await fetchProfileStore();
    const headOffice: ContactOfficeRecord = store.contactOffices.find((item) => item.kind === 'head-office') ?? {
      id: 'office-head',
      title: 'دفتر مرکزی سازمان',
      kind: 'head-office',
      address: {
        country: 'ایران',
        province: 'فارس',
        city: 'شیراز',
        mainStreet: '',
        sideStreet: '',
        alley: '',
        plaque: '',
        floor: '',
        unit: '',
        postalCode: '',
        fullAddress: '',
      },
      channels: {
        mobiles: [],
        phones: [],
        faxes: [],
        websites: [],
        emails: [],
        socialNetworks: [],
      },
    };

    const branches = selectedTitles.map((title, index) => {
      const existing = store.contactOffices.find((item) => item.title === title);
      return (
        existing ?? {
          id: `office-branch-${index + 1}`,
          title,
          kind: 'branch' as const,
          address: { ...headOffice.address, mainStreet: '', sideStreet: '', alley: '', plaque: '', floor: '', unit: '', postalCode: '', fullAddress: '' },
          channels: { mobiles: [], phones: [], faxes: [], websites: [], emails: [], socialNetworks: [] },
        }
      );
    });

    const nextOffices = [headOffice, ...branches];
    const saved = await persistProfileStore({ ...store, contactOffices: nextOffices });
    setContactWaysDialogOpen(false);
    router.push(`/business-settings/profile/contact-ways?office=${saved.contactOffices[0]?.id ?? headOffice.id}&tab=address`);
    router.refresh();
  }

  return (
    <section className="business-profile-page">
      <header className="business-profile-intro">
        <p>در پروفایل کسب‌وکار اطلاعات هویتی، حقوقی، مالی و تماس شرکت ثبت می‌شود تا مبنای قراردادها، پروژه‌ها و ارتباطات رسمی در سیستم باشد.</p>
      </header>

      <div className="business-profile-grid">
        {sections.map((section) => (
          <BusinessSettingsCard
            key={section.title}
            title={section.title}
            description={section.description}
            href={section.title === 'راه های ارتباطی' ? undefined : section.href}
            onClick={section.title === 'راه های ارتباطی' ? () => setContactWaysDialogOpen(true) : undefined}
            className={section.span === 'full' ? 'business-profile-card-full' : undefined}
          />
        ))}
      </div>

      {contactWaysDialogOpen ? (
        <div className="profile-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="profile-dialog">
            <button type="button" className="profile-dialog-close" onClick={() => setContactWaysDialogOpen(false)} aria-label="بستن">
              <X />
            </button>
            <h2>انتخاب عنوان</h2>
            <p>در این بخش میتوانید عناوین مدنظر خود را برای دفاتر خود انتخاب کنید تا سپس راه های ارتباطی دفاتر خود را وارد کنید</p>

            <div className="profile-dialog-fixed-office">
              <strong>دفتر مرکزی سازمان</strong>
              <span>دفتری که در آن تمام واحد های سازمان در آن تجمیع شده است</span>
              <i>*</i>
            </div>

            <div className="profile-dialog-office-list">
              <strong>سایر دفاتر</strong>
              {optionalOfficeTitles.map((title) => {
                const checked = selectedTitles.includes(title);
                return (
                  <label key={title} className={`profile-dialog-office-option${checked ? ' is-active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedTitles((current) => (checked ? current.filter((item) => item !== title) : [...current, title]))
                      }
                    />
                    <span>{title}</span>
                  </label>
                );
              })}
            </div>

            <button type="button" className="profile-primary-button" onClick={submitContactWaysTitles}>
              ثبت
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
