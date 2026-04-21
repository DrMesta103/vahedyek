'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Hash } from 'lucide-react';
import { FieldGroup, FormDateInput, SectionCard, SectionHeader, TagPills } from './ContractFormPrimitives';

type ContractType = 'sale' | 'pre-sale';

function ContractNumberInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [suggestedNumber, setSuggestedNumber] = useState('');

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const response = await fetch('/api/contracts/generate-number');
        if (response.ok) {
          const data = (await response.json()) as { contractNumber: string };
          setSuggestedNumber(data.contractNumber);
        }
      } catch {
        // Suggestion is optional; manual entry remains available.
      }
    };
    void fetchSuggestion();
  }, []);

  return (
    <div className="relative">
      <Hash className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={suggestedNumber || 'مثلا ۱۴۰۳-۰۰۱'}
        className="h-[42px] w-full rounded-xl border border-slate-200 bg-[image:var(--control-bg-gradient)] pr-10 pl-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      />
    </div>
  );
}

export function SubjectDetailsBox({
  selectedContractType,
  onContractTypeChange,
  contractNumber,
  onContractNumberChange,
  contractDate,
  onContractDateChange,
  deliveryDate,
  onDeliveryDateChange,
}: {
  selectedContractType: ContractType;
  onContractTypeChange: (value: ContractType) => void;
  contractNumber: string;
  onContractNumberChange: (value: string) => void;
  contractDate: string;
  onContractDateChange: (value: string) => void;
  deliveryDate: string;
  onDeliveryDateChange: (value: string) => void;
}) {
  return (
    <SectionCard>
      <SectionHeader label="مشخصات قرارداد" />
      <div className="space-y-5 p-5">
        <FieldGroup label="نوع قرارداد" required>
          <TagPills
            value={selectedContractType}
            onChange={onContractTypeChange}
            options={[
              { value: 'pre-sale', label: 'پیش‌فروش' },
              { value: 'sale', label: 'فروش' },
            ]}
          />
        </FieldGroup>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldGroup label="شماره قرارداد" required hint="باید یکتا باشد">
            <ContractNumberInput value={contractNumber} onChange={onContractNumberChange} />
          </FieldGroup>

          <FieldGroup label="زمان عقد قرارداد" required>
            <FormDateInput value={contractDate} onChange={onContractDateChange} placeholder="انتخاب تاریخ" />
          </FieldGroup>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldGroup label="تاریخ تحویل واحد" required hint="تعهد رسمی شرکت سازنده">
            <FormDateInput value={deliveryDate} onChange={onDeliveryDateChange} placeholder="انتخاب تاریخ" icon={CalendarClock} />
          </FieldGroup>
          <div />
        </div>
      </div>
    </SectionCard>
  );
}

