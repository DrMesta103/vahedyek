'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchProfileStore, type RepresentativeRecord } from './profileStorage';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

export function BusinessRepresentativesPanel() {
  const [query, setQuery] = useState('');
  const [representatives, setRepresentatives] = useState<RepresentativeRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setRepresentatives(store.representatives);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedQuery = query.trim();
  const filtered = representatives.filter((item) =>
    !normalizedQuery ||
    item.fullName.includes(normalizedQuery) ||
    item.mobile.includes(normalizedQuery) ||
    item.email.includes(normalizedQuery)
  );

  return (
    <section className="representative-list-page" aria-label="لیست نماینده قانونی">
      <div className="representative-toolbar">
        <Link href="/business-settings/profile/representatives/new" className="representative-add-button">
          <Plus />
          افزودن نماینده
        </Link>

        <label className="representative-search">
          <FormTextInput value={query} onChange={setQuery} placeholder="جستجو..." icon={Search} />
        </label>
      </div>

      <div className="representative-list">
        {filtered.map((item) => (
          <PersonRowCard
            key={item.id}
            className="representative-list-card"
            name={item.fullName}
            subtitle={item.mobile}
            email={item.email}
            avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="person" />}
          />
        ))}
      </div>
    </section>
  );
}
