'use client';

import { Search, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  linkRepresentativeToLegalShareholder,
  loadProfileStore,
  normalizePhone,
  saveProfileStore,
  type RepresentativeCandidate,
  upsertRepresentative,
} from './profileStorage';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';

export function BusinessRepresentativePickerPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [directory, setDirectory] = useState<RepresentativeCandidate[]>([]);
  const [selected, setSelected] = useState<RepresentativeCandidate | null>(null);

  useEffect(() => {
    const store = loadProfileStore();
    setDirectory(store.directory);
  }, []);

  const normalizedQuery = normalizePhone(query);
  const candidate =
    directory.find((item) => normalizePhone(item.mobile) === normalizedQuery || item.email.toLowerCase() === query.trim().toLowerCase()) ?? null;

  const confirm = () => {
    if (!selected) return;
    const store = loadProfileStore();
    const nextStore = upsertRepresentative(store, selected);
    const storedRepresentative =
      nextStore.representatives.find((item) => item.id === selected.id) ?? {
        id: selected.id,
        fullName: selected.fullName,
        mobile: selected.mobile,
        email: selected.email,
        avatarMode: selected.avatarMode,
        avatarText: selected.avatarText,
        avatarImage: selected.avatarImage,
        isPrimary: false,
        linkedUser: selected.linkedUser,
      };
    const shareholderId = searchParams.get('shareholderId');
    const finalStore = shareholderId ? linkRepresentativeToLegalShareholder(nextStore, shareholderId, storedRepresentative) : nextStore;
    saveProfileStore(finalStore);
    router.push(searchParams.get('returnTo') || '/business-settings/profile/representatives');
    router.refresh();
  };

  return (
    <section className="representative-picker-page" aria-label="افزودن نماینده قانونی">
      <div className="representative-picker-card">
        <div className="representative-picker-logo" aria-hidden="true">
          <span>1</span>
        </div>

        <label className="profile-form-field representative-picker-field">
          <span>
            موبایل یا ایمیل
            <i>*</i>
          </span>
          <div className="representative-picker-input-wrap">
            <FormTextInput
              value={query}
              onChange={(value) => {
                setQuery(value.slice(0, 50));
                setSelected(null);
              }}
              icon={Search}
            />
            {query ? (
              <button type="button" className="representative-picker-clear" aria-label="پاک کردن" onClick={() => setQuery('')}>
                <X />
              </button>
            ) : null}
          </div>
          <small>وارد کردن شماره موبایل یا ایمیل برای ثبت کاربر ضروری میباشد .</small>
          <em>{query.length}/50</em>
        </label>
      </div>

      {candidate ? (
        <button type="button" className={`representative-search-result${selected?.id === candidate.id ? ' is-selected' : ''}`} onClick={() => setSelected(candidate)}>
          <div className="representative-search-result-meta">
            <strong>{candidate.fullName}</strong>
            <span dir="ltr">{candidate.mobile}</span>
            <small dir="ltr">{candidate.email}</small>
          </div>
          <div className="representative-search-result-icon">
            <UserRound />
          </div>
        </button>
      ) : null}

      <div className="representative-picker-submit">
        <button type="button" className="profile-primary-button is-wide" disabled={!selected} onClick={confirm}>
          انتخاب و تایید
        </button>
      </div>
    </section>
  );
}
