'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import { fetchProfileStore, type NaturalShareholderRecord } from './profileStorage';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

function getPartnerName(item: NaturalShareholderRecord) {
  return item.fullName.trim() || item.mobile || item.email || 'کاربر جدید';
}

export function BusinessPartnersPanel() {
  const [query, setQuery] = useState('');
  const [partners, setPartners] = useState<NaturalShareholderRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setPartners(store.principalPartners);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedQuery = query.trim();
  const filteredPartners = useMemo(
    () =>
      partners.filter(
        (item) => !normalizedQuery || item.fullName.includes(normalizedQuery) || item.mobile.includes(normalizedQuery) || item.email.includes(normalizedQuery),
      ),
    [partners, normalizedQuery],
  );

  return (
    <section className="shareholders-page" aria-label="لیست شرکای اصلی">
      <div className="representative-toolbar shareholders-toolbar">
        <Link
          href={`/business-settings/profile/partners/new?title=${encodeURIComponent('ثبت شریک')}&returnTo=${encodeURIComponent('/business-settings/profile/partners')}`}
          className="representative-add-button"
        >
          <Plus />
          افزودن شریک
        </Link>

        <label className="representative-search">
          <FormTextInput value={query} onChange={setQuery} placeholder="جستجو..." icon={Search} />
        </label>
      </div>

      <div className="shareholders-grid">
        {filteredPartners.map((item) => (
          <PersonRowCard
            key={item.id}
            className="shareholder-card"
            name={getPartnerName(item)}
            subtitle={`${item.sharePercent}%`}
            email={item.email}
            avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="person" />}
          />
        ))}
      </div>
    </section>
  );
}
