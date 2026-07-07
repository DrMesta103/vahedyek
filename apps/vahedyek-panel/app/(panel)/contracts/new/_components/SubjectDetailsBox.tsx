'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Hash } from 'lucide-react';
import { TagPills } from '@repo/ui';
import { FieldGroup, FormDateInput, SectionCard, SectionHeader } from './ContractFormPrimitives';

type ContractType = 'sale' | 'pre-sale';

function ContractNumberInput({ value, onChange, invalid = false }: { value: string; onChange: (value: string) => void; invalid?: boolean }) {
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
        placeholder={suggestedNumber || 'مثلاً ۱۴۰۵-۱۰۲'}
        aria-invalid={invalid || undefined}
        className={`h-[46px] w-full rounded-[8px] border bg-[image:var(--control-bg-gradient)] pr-10 pl-3.5 text-[14px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] placeholder:text-slate-400 outline-none transition-all ${invalid ? 'border-rose-300 ring-4 ring-rose-500/10 focus:border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10'}`}
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
  contractTypeInvalid = false,
  contractNumberInvalid = false,
  contractDateInvalid = false,
  deliveryDateInvalid = false,
}: {
  selectedContractType: ContractType;
  onContractTypeChange: (value: ContractType) => void;
  contractNumber: string;
  onContractNumberChange: (value: string) => void;
  contractDate: string;
  onContractDateChange: (value: string) => void;
  deliveryDate: string;
  onDeliveryDateChange: (value: string) => void;
  contractTypeInvalid?: boolean;
  contractNumberInvalid?: boolean;
  contractDateInvalid?: boolean;
  deliveryDateInvalid?: boolean;
}) {
  return (
    <SectionCard>
      <SectionHeader label="جزئیات قرارداد" />
      <div className="space-y-6 p-5 sm:p-6">
        <FieldGroup label="نوع قرارداد" required>
          <div className={contractTypeInvalid ? 'rounded-[8px] border border-rose-300 bg-rose-50/40 p-2' : ''}>
            <div className="space-y-2">
              <TagPills
                options={[
                  { value: 'sale', label: 'فروش' },
                  { value: 'pre-sale', label: 'پیش فروش' },
                ]}
                value={selectedContractType}
                onChange={onContractTypeChange}
                wrap={false}
                className="justify-start overflow-x-auto pb-1"
              />
              <p className="text-[12px] leading-6 text-slate-400">نوع قرارداد را متناسب با ماهیت این معامله انتخاب کنید.</p>
            </div>
          </div>
        </FieldGroup>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldGroup label="شماره قرارداد" required hint="شماره مرجع داخلی">
            <ContractNumberInput value={contractNumber} onChange={onContractNumberChange} invalid={contractNumberInvalid} />
          </FieldGroup>

          <FieldGroup label="تاریخ قرارداد" required>
            <FormDateInput value={contractDate} onChange={onContractDateChange} placeholder="انتخاب تاریخ" />
          </FieldGroup>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldGroup label="تاریخ تحویل واحد" required hint="زمان تحویل تقریبی">
            <FormDateInput value={deliveryDate} onChange={onDeliveryDateChange} placeholder="انتخاب تاریخ" icon={CalendarClock} />
          </FieldGroup>
          <div />
        </div>
      </div>
    </SectionCard>
  );
}



