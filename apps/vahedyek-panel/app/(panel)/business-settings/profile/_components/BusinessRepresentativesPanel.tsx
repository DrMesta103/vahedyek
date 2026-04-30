'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchProfileStore, type RepresentativeRecord } from './profileStorage';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

export function BusinessRepresentativesPanel({
  kind = 'representative',
}: {
  kind?: 'representative' | 'board-member';
}) {
  const [query, setQuery] = useState('');
  const [representatives, setRepresentatives] = useState<RepresentativeRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setRepresentatives(kind === 'board-member' ? store.boardMembers : store.representatives);
    });

    return () => {
      ignore = true;
    };
  }, [kind]);

  const normalizedQuery = query.trim();
  const filtered = representatives.filter(
    (item) => !normalizedQuery || item.fullName.includes(normalizedQuery) || item.mobile.includes(normalizedQuery) || item.email.includes(normalizedQuery),
  );

  const addTitle = kind === 'board-member' ? 'ثبت عضو هیئت مدیره' : 'ثبت نماینده';
  const addHref =
    kind === 'board-member'
      ? `/business-settings/profile/board-members/new?title=${encodeURIComponent(addTitle)}`
      : `/business-settings/profile/representatives/new?title=${encodeURIComponent(addTitle)}`;
  const pageLabel = kind === 'board-member' ? 'لیست هیئت مدیره' : 'لیست نماینده قانونی';
  const addLabel = kind === 'board-member' ? 'افزودن عضو هیئت مدیره' : 'افزودن نماینده';

  return (
    <section className="representative-list-page" aria-label={pageLabel}>
      <div className="representative-toolbar">
        <Link href={addHref} className="representative-add-button">
          <Plus />
          {addLabel}
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
