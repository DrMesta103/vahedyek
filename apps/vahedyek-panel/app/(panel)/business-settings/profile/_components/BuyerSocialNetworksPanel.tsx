'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { ChoicePillsField } from '@repo/ui';
import {
  fetchProfileStore,
  persistProfileStore,
  upsertNaturalBuyer,
  type NaturalBuyerRecord,
} from './profileStorage';

type SocialPlatform = 'whatsapp' | 'telegram' | 'instagram' | 'linkedin';

type SocialNetwork = {
  id: string;
  platform: SocialPlatform;
  handle: string;
  phoneNumber: string;
};

const platformOptions = [
  { value: 'whatsapp' as const, label: 'واتس‌اپ' },
  { value: 'telegram' as const, label: 'تلگرام' },
  { value: 'instagram' as const, label: 'اینستاگرام' },
  { value: 'linkedin' as const, label: 'لینکدین' },
];

export function BuyerSocialNetworksPanel() {
  const router = useRouter();
  const params = useParams();
  const buyerId = params.buyerId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      const buyer = store.naturalBuyers.find((b) => b.id === buyerId);
      if (buyer?.socialNetworks) {
        setSocialNetworks(buyer.socialNetworks);
      }
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [buyerId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const store = await fetchProfileStore();
      const buyer = store.naturalBuyers.find((b) => b.id === buyerId);
      
      if (buyer) {
        const updatedBuyer: NaturalBuyerRecord = {
          ...buyer,
          socialNetworks,
        };
        await persistProfileStore(upsertNaturalBuyer(store, updatedBuyer));
        router.push(`/business-settings/profile/buyers/new?kind=natural&tab=natural`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const addNetwork = () => {
    const newNetwork: SocialNetwork = {
      id: `social-${Date.now()}`,
      platform: 'whatsapp',
      handle: '',
      phoneNumber: '',
    };
    setSocialNetworks((current) => [...current, newNetwork]);
  };

  const removeNetwork = (id: string) => {
    setSocialNetworks((current) => current.filter((n) => n.id !== id));
  };

  const updateNetwork = (id: string, updates: Partial<SocialNetwork>) => {
    setSocialNetworks((current) =>
      current.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  if (loading) {
    return <div className="representative-page-shell">در حال بارگذاری...</div>;
  }

  return (
    <section className="representative-page-shell">
      <div className="representative-page-header">
        <button type="button" className="representative-back-button" onClick={() => router.back()}>
          <ChevronLeft />
        </button>
        <div>
          <h1 className="representative-page-title">شبکه‌های اجتماعی</h1>
          <p className="representative-page-description">
            در این بخش می‌توانید شبکه‌های اجتماعی خریدار را ثبت کنید
          </p>
        </div>
      </div>

      <div className="representative-details-card">
        <div className="representative-extra-stack">
          {socialNetworks.map((network) => (
            <div key={network.id} style={{
              border: '1px solid var(--theme-divider, #e5e7eb)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              background: 'var(--surface, #fff)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <strong>شبکه اجتماعی</strong>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    padding: '4px',
                  }}
                  onClick={() => removeNetwork(network.id)}
                >
                  <X size={18} />
                </button>
              </div>

              <ChoicePillsField<SocialPlatform>
                label="انتخاب شبکه اجتماعی"
                options={platformOptions}
                value={network.platform}
                onChange={(value) => updateNetwork(network.id, { platform: value })}
                className="representative-gender-field"
                labelClassName="representative-gender-label"
                pillsClassName="representative-gender-pills"
                pillClassName="representative-gender-pill"
                showActiveIndicator
              />

              <label className="representative-inline-field">
                <span>شناره موبایل</span>
                <input
                  className="app-control"
                  value={network.phoneNumber}
                  onChange={(event) => updateNetwork(network.id, { phoneNumber: event.target.value })}
                  placeholder="شماره این کد شبکه اجتماعی یا ثبت شده است را میتوانید وارد کنید"
                />
                <small>
                  در این بخش شماره تلفن ثبت خریدار در این شبکه اجتماعی را میتوانید ثبت کنید
                </small>
              </label>

              <label className="representative-inline-field">
                <span>شناسه کاربری</span>
                <input
                  className="app-control"
                  value={network.handle}
                  onChange={(event) => updateNetwork(network.id, { handle: event.target.value })}
                  placeholder="در این بخش شناسه کاربری مانند ID تلگرام و یا نام کاربری استفاده شده در شبکه اجتماعی را میتوانید وارد کنید"
                />
                <small>
                  در این بخش شناسه کاربری مانند ID تلگرام و یا نام کاربری استفاده شده در شبکه اجتماعی را میتوانید وارد کنید
                </small>
              </label>
            </div>
          ))}

          <button type="button" className="profile-secondary-button" onClick={addNetwork}>
            <Plus />
            افزودن شبکه اجتماعی
          </button>
        </div>
      </div>

      <div className="representative-details-actions">
        <button type="button" className="profile-primary-button" disabled={saving} onClick={handleSave}>
          {saving ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
      </div>
    </section>
  );
}
