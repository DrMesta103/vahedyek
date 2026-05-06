'use client';

import { Building2, Globe, Mail, MapPin, Phone, Plus, Radio, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChoicePillsField, Input, RuleTabButton, SearchableSelect } from '@repo/ui';
import {
  fetchProfileStore,
  persistProfileStore,
  type ContactOfficeAddress,
  type ContactOfficeChannels,
  type ContactOfficeRecord,
} from './profileStorage';
import { ProfileCard, ProfileHeading, ProfilePageShell } from './ProfileFormShell';

type ContactWaysTab = 'address' | 'contacts';

type AddressDirectory = Record<string, Record<string, string[]>>;

const addressDirectory: AddressDirectory = {
  ایران: {
    فارس: ['شیراز', 'مرودشت', 'کازرون'],
    تهران: ['تهران', 'اسلامشهر', 'شهریار'],
  },
};

const countryOptions = Object.keys(addressDirectory).map((item) => ({ value: item, label: item }));

const contactSections: Array<{ key: keyof ContactOfficeChannels; title: string; emptyText: string; icon: typeof Smartphone }> = [
  { key: 'mobiles', title: 'شماره های همراه', emptyText: 'برای این دفتر هنوز هیچ موبایلی ثبت نشده است', icon: Smartphone },
  { key: 'phones', title: 'تلفن ثابت', emptyText: 'برای این دفتر هنوز هیچ تلفن ثابتی ثبت نشده است', icon: Phone },
  { key: 'faxes', title: 'شماره فکس', emptyText: 'برای این دفتر هنوز هیچ شماره فکسی ثبت نشده است', icon: Radio },
  { key: 'websites', title: 'وبسایت', emptyText: 'برای این دفتر هنوز هیچ وبسایتی ثبت نشده است', icon: Globe },
  { key: 'emails', title: 'ایمیل', emptyText: 'برای این دفتر هنوز هیچ ایمیلی ثبت نشده است', icon: Mail },
  { key: 'socialNetworks', title: 'شبکه های اجتماعی', emptyText: 'برای این دفتر هنوز هیچ شبکه اجتماعی ثبت نشده است', icon: Building2 },
];

const emptyAddress: ContactOfficeAddress = {
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
};

export function BusinessContactWaysPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [offices, setOffices] = useState<ContactOfficeRecord[]>([]);
  const [activeOfficeId, setActiveOfficeId] = useState('');
  const [activeTab, setActiveTab] = useState<ContactWaysTab>('address');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      const officeId = searchParams.get('office');
      const requestedTab = searchParams.get('tab');
      const safeOffices: ContactOfficeRecord[] = store.contactOffices.length
        ? store.contactOffices
        : [
            {
              id: 'office-head',
              title: 'دفتر مرکزی سازمان',
              kind: 'head-office',
              address: emptyAddress,
              channels: { mobiles: [], phones: [], faxes: [], websites: [], emails: [], socialNetworks: [] },
            },
          ];

      setOffices(safeOffices);
      setActiveOfficeId(safeOffices.find((item) => item.id === officeId)?.id ?? safeOffices[0]?.id ?? '');
      setActiveTab(requestedTab === 'contacts' ? 'contacts' : 'address');
    });

    return () => {
      ignore = true;
    };
  }, [searchParams]);

  const activeOffice = useMemo(() => offices.find((item) => item.id === activeOfficeId) ?? null, [activeOfficeId, offices]);

  const provinceOptions = useMemo(() => {
    const selectedCountry = activeOffice?.address.country || 'ایران';
    return Object.keys(addressDirectory[selectedCountry] ?? {}).map((item) => ({ value: item, label: item }));
  }, [activeOffice]);

  const cityOptions = useMemo(() => {
    const selectedCountry = activeOffice?.address.country || 'ایران';
    const selectedProvince = activeOffice?.address.province || 'فارس';
    return (addressDirectory[selectedCountry]?.[selectedProvince] ?? []).map((item) => ({ value: item, label: item }));
  }, [activeOffice]);

  function updateOffice(updater: (office: ContactOfficeRecord) => ContactOfficeRecord) {
    setOffices((current) => current.map((item) => (item.id === activeOfficeId ? updater(item) : item)));
  }

  function updateAddress<K extends keyof ContactOfficeAddress>(key: K, value: ContactOfficeAddress[K]) {
    updateOffice((office) => ({ ...office, address: { ...office.address, [key]: value } }));
  }

  async function save() {
    if (!activeOffice) return;
    setMessage(null);

    if (activeTab === 'address') {
      if (!activeOffice.address.postalCode.trim() || !activeOffice.address.fullAddress.trim()) {
        setMessage('کدپستی و آدرس دقیق دفتر الزامی هستند.');
        return;
      }
    }

    setSaving(true);
    try {
      const store = await fetchProfileStore();
      await persistProfileStore({ ...store, contactOffices: offices });
      setMessage('اطلاعات با موفقیت ثبت شد.');
    } catch {
      setMessage('ذخیره اطلاعات ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  if (!activeOffice) {
    return null;
  }

  return (
    <ProfilePageShell>
      <ProfileCard className="contact-ways-card">
        <ProfileHeading title="راه های ارتباطی" description="آدرس و راه های تماس دفاتر سازمان را در این بخش مدیریت کنید." />

        <ChoicePillsField
          label="دفتر فعال"
          options={offices.map((office) => ({ value: office.id, label: office.title }))}
          value={activeOfficeId}
          onChange={setActiveOfficeId}
          className="contact-ways-office-picker"
          pillsClassName="contact-ways-office-pills"
        />

        <div className="contact-ways-tabs" role="tablist" aria-label="تب های راه های ارتباطی">
          <RuleTabButton title="اطلاعات تماس" icon={Phone} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          <RuleTabButton title="آدرس" icon={MapPin} active={activeTab === 'address'} onClick={() => setActiveTab('address')} />
        </div>

        {activeTab === 'address' ? (
          <div className="contact-ways-pane">
            <div className="contact-ways-pane-head">
              <strong>اطلاعات آدرس</strong>
              <span>{activeOffice.title}</span>
            </div>

            <div className="contact-ways-map-placeholder" aria-hidden="true">
              <div className="contact-ways-map-grid" />
              <div className="contact-ways-map-pin" />
            </div>

            <div className="contact-ways-form-grid">
              <OfficeSelectField
                label="کشور"
                value={activeOffice.address.country}
                options={countryOptions}
                onSelect={(value) => {
                  const nextProvince = Object.keys(addressDirectory[value] ?? {})[0] ?? '';
                  const nextCity = addressDirectory[value]?.[nextProvince]?.[0] ?? '';
                  updateOffice((office) => ({
                    ...office,
                    address: { ...office.address, country: value, province: nextProvince, city: nextCity },
                  }));
                }}
                placeholder="انتخاب کشور"
              />
              <OfficeSelectField
                label="استان"
                value={activeOffice.address.province}
                options={provinceOptions}
                onSelect={(value) => {
                  const nextCity = (addressDirectory[activeOffice.address.country]?.[value] ?? [])[0] ?? '';
                  updateOffice((office) => ({ ...office, address: { ...office.address, province: value, city: nextCity } }));
                }}
                placeholder="انتخاب استان"
              />
              <OfficeSelectField label="شهر" value={activeOffice.address.city} options={cityOptions} onSelect={(value) => updateAddress('city', value)} placeholder="انتخاب شهر" />
              <OfficeInputField label="خیابان اصلی" value={activeOffice.address.mainStreet} onChange={(value) => updateAddress('mainStreet', value)} />
              <OfficeInputField label="خیابان فرعی" value={activeOffice.address.sideStreet} onChange={(value) => updateAddress('sideStreet', value)} />
              <OfficeInputField label="کوچه" value={activeOffice.address.alley} onChange={(value) => updateAddress('alley', value)} />
              <OfficeInputField label="پلاک" value={activeOffice.address.plaque} onChange={(value) => updateAddress('plaque', value)} />
              <OfficeInputField label="طبقه" value={activeOffice.address.floor} onChange={(value) => updateAddress('floor', value)} />
              <OfficeInputField label="واحد" value={activeOffice.address.unit} onChange={(value) => updateAddress('unit', value)} />
              <OfficeInputField label="کدپستی" required value={activeOffice.address.postalCode} onChange={(value) => updateAddress('postalCode', value)} />
            </div>

            <label className="contact-ways-textarea-field">
              <span>
                آدرس
                <i>*</i>
              </span>
              <textarea
                value={activeOffice.address.fullAddress}
                onChange={(event) => updateAddress('fullAddress', event.target.value.slice(0, 300))}
                placeholder="آدرس دقیق دفتر"
                className="contact-ways-textarea"
              />
              <small>محل دقیق آدرس دفتر خود را در این بخش میتوانید وارد کنید</small>
            </label>
          </div>
        ) : (
          <div className="contact-ways-pane">
            <div className="contact-ways-pane-head">
              <strong>اطلاعات تماس</strong>
              <span>{activeOffice.title}</span>
            </div>

            <div className="contact-ways-list">
              {contactSections.map((section) => {
                const Icon = section.icon;
                const hasValue = activeOffice.channels[section.key].length > 0;
                return (
                  <button key={section.key} type="button" className="contact-ways-item-card">
                    <span className="contact-ways-item-add">
                      <Plus />
                    </span>
                    <div className="contact-ways-item-copy">
                      <strong>{section.title}</strong>
                      <p>{hasValue ? activeOffice.channels[section.key].join(' - ') : section.emptyText}</p>
                    </div>
                    <span className="contact-ways-item-icon">
                      <Icon />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {message ? <p className={`contact-ways-message${message.includes('موفقیت') ? ' is-success' : ' is-error'}`}>{message}</p> : null}

        <div className="contact-ways-actions">
          <button type="button" className="profile-primary-button" onClick={save} disabled={saving}>
            {saving ? 'در حال ثبت...' : 'ثبت'}
          </button>
          <button type="button" className="profile-primary-button is-secondary" onClick={() => router.push('/business-settings/profile')}>
            بازگشت
          </button>
        </div>
      </ProfileCard>
    </ProfilePageShell>
  );
}

function OfficeInputField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="contact-ways-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function OfficeSelectField({
  label,
  value,
  options,
  onSelect,
  placeholder,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="contact-ways-field">
      <span>{label}</span>
      <SearchableSelect
        value={value}
        onSelect={onSelect}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={`جستجو در ${label}...`}
        emptyText="موردی پیدا نشد"
      />
    </label>
  );
}
