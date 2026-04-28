'use client';

import Link from 'next/link';
import { Plus, Search, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  loadProfileStore,
  type LegalShareholderRecord,
  type NaturalShareholderRecord,
  type RepresentativeRecord,
} from './profileStorage';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

type ShareholderTab = 'natural' | 'legal';

export function BusinessShareholdersPanel() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ShareholderTab>('natural');
  const [naturalShareholders, setNaturalShareholders] = useState<NaturalShareholderRecord[]>([]);
  const [legalShareholders, setLegalShareholders] = useState<LegalShareholderRecord[]>([]);

  useEffect(() => {
    const store = loadProfileStore();
    setNaturalShareholders(store.naturalShareholders);
    setLegalShareholders(store.legalShareholders);
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'legal' ? 'legal' : 'natural');
  }, [searchParams]);

  const normalizedQuery = query.trim();
  const filteredNatural = useMemo(
    () =>
      naturalShareholders.filter((item) =>
        !normalizedQuery || item.fullName.includes(normalizedQuery) || item.mobile.includes(normalizedQuery) || item.email.includes(normalizedQuery)
      ),
    [naturalShareholders, normalizedQuery]
  );
  const filteredLegal = useMemo(
    () =>
      legalShareholders.filter((item) =>
        !normalizedQuery ||
        item.companyName.includes(normalizedQuery) ||
        item.brandName.includes(normalizedQuery) ||
        item.sharePercent.includes(normalizedQuery) ||
        item.representatives.some((representative) => representative.fullName.includes(normalizedQuery))
      ),
    [legalShareholders, normalizedQuery]
  );

  return (
    <section className="shareholders-page" aria-label="لیست سهامداران اصلی">
      <div className="shareholders-top-tabs" role="tablist" aria-label="نوع سهامدار">
        <button type="button" role="tab" aria-selected={activeTab === 'legal'} className={activeTab === 'legal' ? 'is-active' : ''} onClick={() => setActiveTab('legal')}>
          <Users />
          <span>حقوقی</span>
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'natural'} className={activeTab === 'natural' ? 'is-active' : ''} onClick={() => setActiveTab('natural')}>
          <UserRound />
          <span>حقیقی</span>
        </button>
      </div>

      <div className="representative-toolbar shareholders-toolbar">
        <Link href={`/business-settings/profile/shareholders/new?kind=${activeTab}&tab=${activeTab}`} className="representative-add-button">
          <Plus />
          افزودن سهامدار
        </Link>

        <label className="representative-search">
          <FormTextInput value={query} onChange={setQuery} placeholder="جستجو..." icon={Search} />
        </label>
      </div>

      {activeTab === 'natural' ? (
        <div className="shareholders-grid">
          {filteredNatural.map((item) => (
            <PersonRowCard
              key={item.id}
              className="shareholder-card"
              name={item.fullName}
              subtitle={`${item.sharePercent}%`}
              email={item.email}
              avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="person" />}
            />
          ))}
        </div>
      ) : (
        <div className="shareholders-grid">
          {filteredLegal.map((item) => (
            <Link key={item.id} href={`/business-settings/profile/shareholders/${item.id}?tab=legal`} className="shareholder-card shareholder-card-link">
              <PersonRowCard
                className="shareholder-card-inner"
                name={item.companyName}
                subtitle={`${item.sharePercent}%`}
                avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="company" />}
                showPhone={false}
                showEmail={false}
                footer={
                  <>
                    <RepresentativeStack representatives={item.representatives} />
                    <span>نمایندگان</span>
                  </>
                }
                onMoreClick={(event) => event.preventDefault()}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RepresentativeStack({ representatives }: { representatives: RepresentativeRecord[] }) {
  return (
    <div className="shareholder-representative-stack" aria-hidden="true">
      {representatives.slice(0, 3).map((representative) => (
        <span key={representative.id} className={`is-${representative.avatarMode}`}>
          {representative.avatarMode === 'image' && representative.avatarImage ? (
            <img src={representative.avatarImage} alt="" className="shareholder-representative-stack-image" />
          ) : representative.avatarMode === 'ghost' ? (
            '•'
          ) : (
            representative.avatarText
          )}
        </span>
      ))}
    </div>
  );
}
