
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FormBox } from './FormBox';
import { StickySubmitBar } from './StickySubmitBar';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { SearchableSelect } from './SearchableSelect';
import { Input } from '../../../../components/ui/input';

// Mock data - replace with actual data fetching
const STAFF_OPTIONS = [
    { value: 'user1', label: 'کاربر شماره یک' },
    { value: 'user2', label: 'کاربر شماره دو' },
];

const BLOCK_OPTIONS = [
    { id: 'block1', label: 'بلوک ۱', units: ['واحد ۱', 'واحد ۲'] },
    { id: 'block2', label: 'بلوک ۲', units: ['واحد ۳', 'واحد ۴'] },
];

export function SubjectStep({ stepId, title }: { stepId: string, title: string }) {
  const router = useRouter();
  
  const [issuerType, setIssuerType] = useState('self');
  const [formerEmployeeName, setFormerEmployeeName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('sale');
  const [contractDate, setContractDate] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const selectedBlockData = BLOCK_OPTIONS.find((block) => block.id === selectedBlock);
  const unitOptions = useMemo(() => selectedBlockData?.units.map(u => ({label: u, value: u})) ?? [], [selectedBlockData]);

  const handleBack = () => router.push('/contracts/new');
  const handleSubmit = () => {
    // Handle form submission logic here
    console.log('Form submitted');
    router.push('/contracts/new');
  };

  return (
    <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="mt-1 text-gray-500">اطلاعات پایه و اولیه قرارداد را در این بخش وارد کنید.</p>
            </div>
            <button type="button" onClick={handleBack} className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
                بازگشت به مراحل
            </button>
        </div>

      <div className="grid gap-4">
        <FormBox title="منعقد کننده قرارداد" description="مشخص کنید قرارداد توسط چه شخصی منعقد می شود.">
          <div className="grid gap-3 md:grid-cols-3">
            <ChoiceCard title="خودم" active={issuerType === 'self'} onClick={() => setIssuerType('self')} />
            <ChoiceCard title="کارمند سابق" active={issuerType === 'former'} onClick={() => setIssuerType('former')} />
            <ChoiceCard title="سایر کارمندان" active={issuerType === 'staff'} onClick={() => setIssuerType('staff')} />
          </div>
          {issuerType === 'former' && (
            <div className="mt-4">
              <FieldLabel label="نام کارمند سابق" />
              <Input value={formerEmployeeName} onChange={(e) => setFormerEmployeeName(e.target.value)} placeholder="نام کارمند سابق را وارد کنید" className="mt-2" />
            </div>
          )}
          {issuerType === 'staff' && (
            <div className="mt-4">
              <FieldLabel label="انتخاب از سایر کارمندان" />
              <SearchableSelect
                value={selectedStaff}
                onSelect={setSelectedStaff}
                placeholder="یک کارمند را انتخاب کنید"
                searchPlaceholder="جستجو در کارمندان..."
                options={STAFF_OPTIONS}
                emptyText="کارمندی پیدا نشد"
              />
            </div>
          )}
        </FormBox>

        <FormBox title="نوع قرارداد" description="نوع قرارداد را مشخص کنید.">
          <div className="grid gap-3 md:grid-cols-2">
            <ChoiceCard title="فروش" active={selectedContractType === 'sale'} onClick={() => setSelectedContractType('sale')} />
            <ChoiceCard title="پیش فروش" active={selectedContractType === 'pre-sale'} onClick={() => setSelectedContractType('pre-sale')} />
          </div>
        </FormBox>

        <FormBox title="اطلاعات ثبت قرارداد" description="تاریخ و شماره قرارداد در این بخش ثبت می شود.">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="تاریخ قرارداد" />
              <Input value={contractDate} onChange={(e) => setContractDate(e.target.value)} placeholder="مثال: ۱۴۰۵/۰۱/۲۰" className="mt-2" />
            </div>
            <div>
              <FieldLabel label="شماره قرارداد" />
              <Input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} placeholder="شماره قرارداد را وارد کنید" className="mt-2" />
            </div>
          </div>
        </FormBox>

        <FormBox title="انتخاب واحد" description="ابتدا بلوک و سپس واحد را انتخاب کنید.">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="انتخاب بلوک" />
               <SearchableSelect
                value={selectedBlock}
                onSelect={(value) => { setSelectedBlock(value); setSelectedUnit(''); }}
                placeholder="بلوک را انتخاب کنید"
                searchPlaceholder="جستجو در بلوک ها..."
                options={BLOCK_OPTIONS.map(b => ({label: b.label, value: b.id}))}
                emptyText="بلوکی پیدا نشد"
              />
            </div>
            <div>
              <FieldLabel label="انتخاب واحد" />
              <SearchableSelect
                value={selectedUnit}
                onSelect={setSelectedUnit}
                placeholder={selectedBlock ? 'واحد را انتخاب کنید' : 'ابتدا بلوک را انتخاب کنید'}
                searchPlaceholder="جستجو در واحدها..."
                options={unitOptions}
                disabled={!selectedBlock}
                emptyText="واحدی پیدا نشد"
              />
            </div>
          </div>
        </FormBox>
      </div>

      <StickySubmitBar label="ثبت اطلاعات پایه" onClick={handleSubmit} />
    </div>
  );
}
