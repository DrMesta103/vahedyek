'use client';

import Link from 'next/link';
import { Plus, Search, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  fetchProfileStore,
  type LegalBuyerRecord,
  type NaturalBuyerRecord,
  type RepresentativeRecord,
} from './profileStorage';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

type BuyerTab = 'natural' | 'legal';

function getNaturalBuyerName(item: NaturalBuyerRecord, fallbackName: string) {
  return item.fullName.trim() || item.mobile || item.email || fallbackName;
}

function RepresentativeStack({ representatives }: { representatives: RepresentativeRecord[] }) {
  if (!representatives.length) return null;
  return (
    <div className="representative-stack">
      {representatives.slice(0, 3).map((rep) => (
        <PersonAvatar key={rep.id} avatarMode={rep.avatarMode} avatarText={rep.avatarText} avatarImage={rep.avatarImage} kind="person" />
      ))}
    </div>
  );
}

export function BusinessBuyersPanel() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<BuyerTab>('natural');
  const [naturalBuyers, setNaturalBuyers] = useState<NaturalBuyerRecord[]>([]);
  const [legalBuyers, setLegalBuyers] = useState<LegalBuyerRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setNaturalBuyers(store.naturalBuyers || []);
      setLegalBuyers(store.legalBuyers || []);
      const tab = searchParams.get('tab');
      setActiveTab(tab === 'legal' ? 'legal' : 'natural');
    });

    return () => {
      ignore = true;
    };
  }, [searchParams]);

  const normalizedQuery = query.trim();
  const filteredNatural = useMemo(
    () =>
      naturalBuyers.filter(
        (item) =>
          !normalizedQuery || item.fullName.includes(normalizedQuery) || item.mobile.includes(normalizedQuery) || item.email.includes(normalizedQuery),
      ),
    [naturalBuyers, normalizedQuery],
  );
  const filteredLegal = useMemo(
    () =>
      legalBuyers.filter(
        (item) =>
          !normalizedQuery ||
          item.companyName.includes(normalizedQuery) ||
          item.brandName.includes(normalizedQuery) ||
          item.sharePercent.includes(normalizedQuery) ||
          item.representatives.some((representative) => representative.fullName.includes(normalizedQuery)),
      ),
    [legalBuyers, normalizedQuery],
  );

  return (
    <section className="shareholders-page" aria-label="لیست خریداران">
      <div className="shareholders-top-tabs" role="tablist" aria-label="نوع خریدار">
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
        <Link href={`/business-settings/profile/buyers/new?kind=${activeTab}&tab=${activeTab}`} className="representative-add-button">
          <Plus />
          افزودن خریدار
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
              name={getNaturalBuyerName(item, 'خریدار جدید')}
              subtitle={`${item.sharePercent}%`}
              email={item.email}
              avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="person" />}
            />
          ))}
        </div>
      ) : (
        <div className="shareholders-grid">
          {filteredLegal.map((item) => (
            <Link key={item.id} href={`/business-settings/profile/buyers/${item.id}?tab=legal`} className="shareholder-card shareholder-card-link">
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
