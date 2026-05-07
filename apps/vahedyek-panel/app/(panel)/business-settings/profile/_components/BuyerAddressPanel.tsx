'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import {
  fetchProfileStore,
  persistProfileStore,
  upsertNaturalBuyer,
  type NaturalBuyerRecord,
} from './profileStorage';

export function BuyerAddressPanel() {
  const router = useRouter();
  const params = useParams();
  const buyerId = params.buyerId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState({
    country: 'ایران',
    province: '',
    city: '',
    mainStreet: '',
    sideStreet: '',
    alley: '',
    plaque: '',
    floor: '',
    unit: '',
    postalCode: '',
    fullAddress: '',
  });

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      const buyer = store.naturalBuyers.find((b) => b.id === buyerId);
      if (buyer?.address) {
        setAddress(buyer.address);
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
          address,
        };
        await persistProfileStore(upsertNaturalBuyer(store, updatedBuyer));
        router.push(`/business-settings/profile/buyers/new?kind=natural&tab=natural`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
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
          <h1 className="representative-page-title">اطلاعات آدرس</h1>
          <p className="representative-page-description">
            آدرس محل سکونت خریدار را با جزئیات کامل در این بخش وارد کنید
          </p>
        </div>
      </div>

      <div className="representative-details-card">
        <div className="representative-extra-stack">
          <label className="representative-inline-field">
            <span>کشور</span>
            <input
              className="app-control"
              value={address.country}
              onChange={(event) => setAddress((current) => ({ ...current, country: event.target.value }))}
              placeholder="ایران"
            />
          </label>

          <label className="representative-inline-field">
            <span>استان</span>
            <input
              className="app-control"
              value={address.province}
              onChange={(event) => setAddress((current) => ({ ...current, province: event.target.value }))}
              placeholder="فارس"
            />
          </label>

          <label className="representative-inline-field">
            <span>شهر</span>
            <input
              className="app-control"
              value={address.city}
              onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))}
              placeholder="شیراز"
            />
          </label>

          <label className="representative-inline-field">
            <span>خیابان اصلی</span>
            <input
              className="app-control"
              value={address.mainStreet}
              onChange={(event) => setAddress((current) => ({ ...current, mainStreet: event.target.value }))}
              placeholder="البرز"
            />
          </label>

          <label className="representative-inline-field">
            <span>خیابان فرعی</span>
            <input
              className="app-control"
              value={address.sideStreet}
              onChange={(event) => setAddress((current) => ({ ...current, sideStreet: event.target.value }))}
              placeholder="خیابان فرعی"
            />
          </label>

          <label className="representative-inline-field">
            <span>کوچه/بن‌بست</span>
            <input
              className="app-control"
              value={address.alley}
              onChange={(event) => setAddress((current) => ({ ...current, alley: event.target.value }))}
              placeholder="کوچه‌بستی"
            />
          </label>

          <label className="representative-inline-field">
            <span>پلاک</span>
            <input
              className="app-control"
              value={address.plaque}
              onChange={(event) => setAddress((current) => ({ ...current, plaque: event.target.value }))}
              placeholder="۱۲"
            />
          </label>

          <label className="representative-inline-field">
            <span>طبقه</span>
            <input
              className="app-control"
              value={address.floor}
              onChange={(event) => setAddress((current) => ({ ...current, floor: event.target.value }))}
              placeholder="۳"
            />
          </label>

          <label className="representative-inline-field">
            <span>واحد</span>
            <input
              className="app-control"
              value={address.unit}
              onChange={(event) => setAddress((current) => ({ ...current, unit: event.target.value }))}
              placeholder="۵"
            />
          </label>

          <label className="representative-inline-field">
            <span>کد پستی</span>
            <input
              className="app-control"
              value={address.postalCode}
              onChange={(event) => setAddress((current) => ({ ...current, postalCode: event.target.value }))}
              placeholder="۱۲۳۴۵۶۷۸۹۰"
            />
          </label>

          <label className="representative-inline-field">
            <span>آدرس</span>
            <textarea
              className="app-control"
              rows={3}
              value={address.fullAddress}
              onChange={(event) => setAddress((current) => ({ ...current, fullAddress: event.target.value }))}
              placeholder="آدرس دقیق خریدار را وارد کنید"
            />
            <small>محل دقیق سکونت خریدار را با جزئیات کامل در این بخش وارد کنید.</small>
          </label>
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
