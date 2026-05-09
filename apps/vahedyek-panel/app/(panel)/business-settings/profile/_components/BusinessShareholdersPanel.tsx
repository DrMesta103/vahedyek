'use client';

import Link from 'next/link';
import { Plus, Search, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  fetchProfileStore,
  type LegalCustomerRecord,
  type LegalShareholderRecord,
  type NaturalCustomerRecord,
  type NaturalShareholderRecord,
  type RepresentativeRecord,
} from './profileStorage';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

type ShareholderTab = 'natural' | 'legal';
type PeopleEntity = 'shareholder' | 'customer';
type NaturalPersonRecord = NaturalShareholderRecord | NaturalCustomerRecord;
type LegalPersonRecord = LegalShareholderRecord | LegalCustomerRecord;

const entityConfig = {
  shareholder: {
    basePath: '/business-settings/profile/shareholders',
    ariaLabel: 'لیست سهامداران اصلی',
    tabLabel: 'نوع سهامدار',
    addLabel: 'افزودن سهامدار',
    fallbackName: 'سهامدار جدید',
  },
  customer: {
    basePath: '/customers',
    ariaLabel: 'لیست مشتریان',
    tabLabel: 'نوع مشتری',
    addLabel: 'افزودن مشتری',
    fallbackName: 'مشتری جدید',
  },
} as const;

function getNaturalPersonName(item: NaturalPersonRecord, fallbackName: string) {
  return item.fullName.trim() || item.mobile || item.email || fallbackName;
}

export function BusinessShareholdersPanel({ entity = 'shareholder' }: { entity?: PeopleEntity }) {
  const searchParams = useSearchParams();
  const config = entityConfig[entity];
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ShareholderTab>('natural');
  const [naturalPeople, setNaturalPeople] = useState<NaturalPersonRecord[]>([]);
  const [legalPeople, setLegalPeople] = useState<LegalPersonRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setNaturalPeople(entity === 'customer' ? store.naturalCustomers : store.naturalShareholders);
      setLegalPeople(entity === 'customer' ? store.legalCustomers : store.legalShareholders);
      const tab = searchParams.get('tab');
      setActiveTab(tab === 'legal' ? 'legal' : 'natural');
    });

    return () => {
      ignore = true;
    };
  }, [entity, searchParams]);

  const normalizedQuery = query.trim();
  const filteredNatural = useMemo(
    () =>
      naturalPeople.filter(
        (item) =>
          !normalizedQuery || item.fullName.includes(normalizedQuery) || item.mobile.includes(normalizedQuery) || item.email.includes(normalizedQuery),
      ),
    [naturalPeople, normalizedQuery],
  );
  const filteredLegal = useMemo(
    () =>
      legalPeople.filter(
        (item) =>
          !normalizedQuery ||
          item.companyName.includes(normalizedQuery) ||
          item.brandName.includes(normalizedQuery) ||
          item.sharePercent.includes(normalizedQuery) ||
          item.representatives.some((representative) => representative.fullName.includes(normalizedQuery)),
      ),
    [legalPeople, normalizedQuery],
  );

  return (
    <section className="shareholders-page" aria-label={config.ariaLabel}>
      <div className="shareholders-top-tabs" role="tablist" aria-label={config.tabLabel}>
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
        <Link href={`${config.basePath}/new?kind=${activeTab}&tab=${activeTab}`} className="representative-add-button">
          <Plus />
          {config.addLabel}
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
              name={getNaturalPersonName(item, config.fallbackName)}
              subtitle={`${item.sharePercent}%`}
              email={item.email}
              avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="person" />}
            />
          ))}
        </div>
      ) : (
        <div className="shareholders-grid">
          {filteredLegal.map((item) => (
            <Link key={item.id} href={`${config.basePath}/${item.id}?tab=legal`} className="shareholder-card shareholder-card-link">
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
            '.'
          ) : (
            representative.avatarText
          )}
        </span>
      ))}
    </div>
  );
}
