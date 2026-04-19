'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, FileText, KeyRound } from 'lucide-react';
import { FormBox } from './FormBox';
import { StickySubmitBar } from './StickySubmitBar';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { SearchableSelect } from './SearchableSelect';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { Input } from '../../../../components/ui/input';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';

const STAFF_OPTIONS = [
  { value: 'user1', label: 'کاربر شماره یک' },
  { value: 'user2', label: 'کاربر شماره دو' },
];

const BLOCK_OPTIONS = [
  { id: 'block1', label: 'بلوک ۱', units: ['واحد ۱', 'واحد ۲'] },
  { id: 'block2', label: 'بلوک ۲', units: ['واحد ۳', 'واحد ۴'] },
];

function ContractMetaField({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <FieldLabel label={label} />
          <p className="mt-1 text-xs leading-5 text-gray-500">{hint}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SubjectStep({ stepId, title }: { stepId: string; title: string }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();

  const [issuerType, setIssuerType] = useState('self');
  const [formerEmployeeName, setFormerEmployeeName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('sale');
  const [contractDate, setContractDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const selectedBlockData = BLOCK_OPTIONS.find((block) => block.id === selectedBlock);
  const unitOptions = useMemo(
    () => selectedBlockData?.units.map((unit) => ({ label: unit, value: unit })) ?? [],
    [selectedBlockData],
  );

  const handleBack = () => router.push(basePath);
  const handleSubmit = () => {
    console.log('Form submitted', {
      stepId,
      issuerType,
      formerEmployeeName,
      selectedStaff,
      selectedContractType,
      contractDate,
      deliveryDate,
      contractNumber,
      selectedBlock,
      selectedUnit,
    });
    router.push(basePath);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-gray-500">اطلاعات پایه و اولیه قرارداد را در این بخش وارد کنید.</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          بازگشت به مراحل
        </button>
      </div>

      <div className="grid gap-4">
        <FormBox title="منعقد کننده قرارداد" description="مشخص کنید قرارداد توسط چه شخصی منعقد می‌شود.">
          <div className="grid gap-3 md:grid-cols-3">
            <ChoiceCard title="خودم" active={issuerType === 'self'} onClick={() => setIssuerType('self')} />
            <ChoiceCard title="کارمند سابق" active={issuerType === 'former'} onClick={() => setIssuerType('former')} />
            <ChoiceCard title="سایر کارمندان" active={issuerType === 'staff'} onClick={() => setIssuerType('staff')} />
          </div>

          {issuerType === 'former' && (
            <div className="mt-4">
              <FieldLabel label="نام کارمند سابق" />
              <Input
                value={formerEmployeeName}
                onChange={(event) => setFormerEmployeeName(event.target.value)}
                placeholder="نام کارمند سابق را وارد کنید"
                className="mt-2"
              />
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
            <ChoiceCard
              title="پیش فروش"
              active={selectedContractType === 'pre-sale'}
              onClick={() => setSelectedContractType('pre-sale')}
            />
          </div>
        </FormBox>

        <FormBox title="اطلاعات ثبت قرارداد" description="تاریخ‌ها و شماره قرارداد را در این بخش با جزئیات کامل ثبت کنید.">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">ثبت مشخصات سند قرارداد</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  این سه مقدار، شناسه اصلی قرارداد شما را می‌سازند و بهتر است قبل از ادامه فرم کامل شوند.
                </p>
              </div>
              <div className="inline-flex w-fit items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                اطلاعات کلیدی
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <ContractMetaField
                icon={<CalendarDays className="h-5 w-5" />}
                label="تاریخ قرارداد"
                hint="تاریخ رسمی انعقاد قرارداد را از تقویم شمسی انتخاب کنید."
              >
                <PersianDatePicker
                  value={contractDate}
                  onChange={setContractDate}
                  placeholder="تاریخ قرارداد را انتخاب کنید"
                />
              </ContractMetaField>

              <ContractMetaField
                icon={<KeyRound className="h-5 w-5" />}
                label="شماره قرارداد"
                hint="شماره یا کد یکتای قرارداد را دقیقاً مطابق مستندات ثبت کنید."
              >
                <Input
                  value={contractNumber}
                  onChange={(event) => setContractNumber(event.target.value)}
                  placeholder="شماره قرارداد را وارد کنید"
                />
              </ContractMetaField>

              <ContractMetaField
                icon={<FileText className="h-5 w-5" />}
                label="تاریخ تحویل واحد"
                hint="اگر زمان تحویل مشخص است، آن را به‌صورت شمسی برای پیگیری‌ها"
              >
                <PersianDatePicker
                  value={deliveryDate}
                  onChange={setDeliveryDate}
                  placeholder="تاریخ تحویل واحد را انتخاب کنید"
                />
              </ContractMetaField>
            </div>
          </div>
        </FormBox>

        <FormBox title="انتخاب واحد" description="ابتدا بلوک و سپس واحد را انتخاب کنید.">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="انتخاب بلوک" />
              <SearchableSelect
                value={selectedBlock}
                onSelect={(value) => {
                  setSelectedBlock(value);
                  setSelectedUnit('');
                }}
                placeholder="بلوک را انتخاب کنید"
                searchPlaceholder="جستجو در بلوک ها..."
                options={BLOCK_OPTIONS.map((block) => ({ label: block.label, value: block.id }))}
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
