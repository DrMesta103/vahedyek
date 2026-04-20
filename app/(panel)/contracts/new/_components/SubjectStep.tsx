'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Check, CalendarDays, KeyRound } from 'lucide-react';
import { FormBox } from './FormBox';
import { StickySubmitBar } from './StickySubmitBar';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { SearchableSelect } from './SearchableSelect';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { Input } from '../../../../components/ui/input';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';
import { validateStep1 } from '../../../../lib/contractValidation';
import { ensureActiveDraftId, getReferenceData, getStepData, saveStepData } from '../../../../lib/contractDraftClient';
import type { ContractSubjectData } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';

type EmployeeOption = { id: string; firstName: string; lastName: string };
type BlockOption = { id: string; name: string; units: Array<{ id: string; name: string; floorName: string; title: string }> };

function ContractMetaField({
  icon,
  label,
  hint,
  children,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-[0.5px] border-[#ededed] bg-white p-4 shadow-sm transition-colors hover:border-blue-200">
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

function ReferenceDivider() {
  return <div className="h-px w-full bg-[#c8d0da]" />;
}

function ReferenceSection({
  title,
  helper,
  children,
}: {
  title: string;
  helper: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-right text-[20px] font-bold text-[#314a67]">{title}</h3>
      {children}
      <p className="text-center text-[15px] leading-7 text-[#3d4f65]">{helper}</p>
    </section>
  );
}

function SelectionPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[43px] items-center gap-2 rounded-full border-[0.5px] px-5 py-2 text-[14px] transition-all ${
        active
          ? 'border-[#a6e8ef] bg-[#a6e8ef] font-semibold text-[#123b69]'
          : 'border-[#6e86a3] bg-white text-[#314a67]'
      }`}
    >
      {active ? <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.75]" /> : null}
      <span>{label}</span>
    </button>
  );
}

export function SubjectStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [formerEmployees, setFormerEmployees] = useState<Array<{ id: string; fullName: string }>>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);

  const [issuerType, setIssuerType] = useState<'self' | 'former' | 'staff'>('self');
  const [formerEmployeeName, setFormerEmployeeName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedContractType, setSelectedContractType] = useState<'sale' | 'pre-sale'>('pre-sale');
  const [contractDate, setContractDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const selectedBlockData = blocks.find((block) => block.id === selectedBlock);
  const selectedUnitData = selectedBlockData?.units.find((unit) => unit.id === selectedUnit);
  const unitOptions = useMemo(
    () => selectedBlockData?.units.map((unit) => ({ label: unit.title, value: unit.id })) ?? [],
    [selectedBlockData],
  );

  const staffOptions = useMemo(
    () =>
      employees.map((employee) => ({
        label: `${employee.firstName} ${employee.lastName}`,
        value: employee.id,
      })),
    [employees],
  );

  const formerEmployeeOptions = useMemo(
    () =>
      formerEmployees.map((employee) => ({
        label: employee.fullName,
        value: employee.fullName,
      })),
    [formerEmployees],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [referenceData, subjectData] = await Promise.all([
          getReferenceData(),
          getStepData<ContractSubjectData>(id, 'subject'),
        ]);

        if (!mounted) return;

        setDraftId(id);
        setEmployees(referenceData.employees);
        setFormerEmployees(referenceData.formerEmployees);
        setBlocks(referenceData.blocks);

        if (subjectData) {
          if (subjectData.contractor.type === 'employee') setIssuerType('staff');
          else if (subjectData.contractor.type === 'former-employee') setIssuerType('former');
          else setIssuerType('self');

          setFormerEmployeeName(
            [subjectData.contractor.formerFirstName, subjectData.contractor.formerLastName].filter(Boolean).join(' '),
          );
          setSelectedStaff(subjectData.contractor.employeeId ?? '');
          setSelectedContractType(subjectData.contractType);
          setContractDate(subjectData.contractDate);
          setDeliveryDate(subjectData.deliveryDate);
          setContractNumber(subjectData.contractNumber);
          setSelectedBlock(subjectData.blockId);
          setSelectedUnit(subjectData.unitId);
        }
      } catch (error) {
        if (mounted) {
          setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات پایه انجام نشد.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBack = () => router.push(basePath);

  const buildPayload = (): ContractSubjectData => {
    const contractor =
      issuerType === 'staff'
        ? { type: 'employee' as const, employeeId: selectedStaff }
        : issuerType === 'former'
          ? {
              type: 'former-employee' as const,
              formerFirstName: formerEmployeeName.split(' ')[0] ?? '',
              formerLastName: formerEmployeeName.split(' ').slice(1).join(' '),
            }
          : { type: 'self' as const };

    return {
      contractor,
      contractType: selectedContractType,
      contractDate,
      contractNumber,
      deliveryDate,
      blockId: selectedBlock,
      unitId: selectedUnit,
    };
  };

  const handleSubmit = async () => {
    if (!draftId) return;

    const payload = buildPayload();
    const validation = validateStep1(payload);
    if (!validation.valid) {
      setFormError(
        validation.errors.contractType ??
          validation.errors.contractDate ??
          validation.errors.contractNumber ??
          validation.errors.deliveryDate ??
          validation.errors.blockId ??
          validation.errors.unitId ??
          validation.errors['contractor.employeeId'] ??
          validation.errors['contractor.formerFirstName'] ??
          validation.errors['contractor.formerLastName'] ??
          'اطلاعات پایه معتبر نیست.',
      );
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await saveStepData(draftId, 'subject', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'subject', false);
      dispatchContractFlowSaved(stepId as 'subject');
      router.push(basePath);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره اطلاعات پایه انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snapshot = JSON.stringify(buildPayload());
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty(stepId as 'subject', false);
      return;
    }

    const dirty = snapshot !== initialSnapshotRef.current;
    dispatchContractFlowDirty(stepId as 'subject', dirty);
  }, [
    contractDate,
    contractNumber,
    deliveryDate,
    draftId,
    formerEmployeeName,
    issuerType,
    loading,
    selectedBlock,
    selectedContractType,
    selectedStaff,
    selectedUnit,
    stepId,
  ]);

  return (
    <div className="space-y-5">
      {!embedded ? (
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
      ) : null}

      <div className="grid gap-4">
        {formError ? <div className="rounded-xl border-[0.5px] border-[#ededed] bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

        <FormBox
          title="منعقدکننده قرارداد"
          description="فردی که قرارداد را با مشتری منعقد کرده مشخص کنید. خودتان، یکی از کارمندان فعلی یا یکی از کارمندان سابق شرکت. در صورت نیاز نام کارمند سابق را به صورت دستی وارد کنید."
        >
          <div className="flex flex-wrap gap-2 text-right">
            <ChoiceCard title="خودم" active={issuerType === 'self'} onClick={() => setIssuerType('self')} variant="pill" />
            <ChoiceCard title="کارمند سابق" active={issuerType === 'former'} onClick={() => setIssuerType('former')} variant="pill" />
            <ChoiceCard title="سایرکارمندان" active={issuerType === 'staff'} onClick={() => setIssuerType('staff')} variant="pill" />
          </div>

          {issuerType === 'former' ? (
            <div className="mt-4 space-y-4">
              <div>
                <FieldLabel label="انتخاب از کارمندان سابق قبلی" />
                <SearchableSelect
                  value={formerEmployeeName}
                  onSelect={setFormerEmployeeName}
                  placeholder="در صورت وجود، از لیست انتخاب کنید"
                  searchPlaceholder="جستجو در کارمندان سابق..."
                  options={formerEmployeeOptions}
                  emptyText="کارمند سابقی ثبت نشده"
                />
              </div>

              <div>
                <FieldLabel label="نام و نام خانوادگی کارمند سابق" />
                <Input
                  value={formerEmployeeName}
                  onChange={(event) => setFormerEmployeeName(event.target.value)}
                  placeholder="نام کامل کارمند سابق را وارد کنید"
                  className="mt-2"
                />
              </div>
            </div>
          ) : null}

          {issuerType === 'staff' ? (
            <div className="mt-4">
              <FieldLabel label="انتخاب از سایر کارمندان" />
              <SearchableSelect
                value={selectedStaff}
                onSelect={setSelectedStaff}
                placeholder="یک کارمند را انتخاب کنید"
                searchPlaceholder="جستجو در کارمندان..."
                options={staffOptions}
                emptyText="کارمندی پیدا نشد"
              />
            </div>
          ) : null}
        </FormBox>

        <FormBox
          title="نوع قرارداد"
          description="با انتخاب نوع مناسب قرارداد (فروش یا پیش فروش)، اطلاعات و جزئیات لازم به صورت دقیق برای ادامه فرآیند ثبت قرارداد تنظیم می‌شود"
        >
          <div className="flex flex-wrap gap-2 text-right">
            <ChoiceCard title="فروش" active={selectedContractType === 'sale'} onClick={() => setSelectedContractType('sale')} variant="pill" />
            <ChoiceCard
              title="پیش فروش"
              active={selectedContractType === 'pre-sale'}
              onClick={() => setSelectedContractType('pre-sale')}
              variant="pill"
            />
          </div>
        </FormBox>

        <ReferenceDivider />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReferenceSection title="شماره قرارداد*" helper="شماره قرارداد باید یکتا باشد.">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f86a3]" />
              <Input
                value={contractNumber}
                onChange={(event) => setContractNumber(event.target.value)}
                placeholder="مثلاً ۱۴۰۳-۰۰۱"
                className="h-[54px] rounded-[14px] border-[#c8d4e0] bg-white pr-11 pl-5 text-base text-[#314a67] shadow-sm transition-all focus:border-[#4a90d9] focus:ring-2 focus:ring-[#4a90d9]/15"
              />
            </div>
          </ReferenceSection>

          <ReferenceSection title="زمان عقد قرارداد*" helper="تاریخ قرارداد می‌تواند امروز یا در گذشته باشد.">
            <div className="relative">
              <PersianDatePicker
                value={contractDate}
                onChange={setContractDate}
                placeholder="تاریخ قرارداد را انتخاب کنید"
                className="h-[54px] rounded-[14px] border-[#c8d4e0] bg-white pr-5 pl-12 text-base text-[#314a67] shadow-sm transition-all focus:border-[#4a90d9] focus:ring-2 focus:ring-[#4a90d9]/15"
              />
              <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f86a3]" />
            </div>
          </ReferenceSection>
        </div>

        <ReferenceDivider />

        <ReferenceSection
          title="تاریخ تحویل واحد*"
          helper="تاریخ تحویل باید مطابق با برنامه زمان بندی پروژه تعیین شود و در متن قرارداد درج گردد. این تاریخ تعهدی رسمی از سوی شرکت سازنده محسوب شده و باید با دقت انتخاب شود"
        >
          <div className="relative">
            <PersianDatePicker
              value={deliveryDate}
              onChange={setDeliveryDate}
              placeholder="تاریخ تحویل واحد را انتخاب کنید"
              className="h-[54px] rounded-[14px] border-[#c8d4e0] bg-white pr-5 pl-12 text-base text-[#314a67] shadow-sm transition-all focus:border-[#4a90d9] focus:ring-2 focus:ring-[#4a90d9]/15"
            />
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f86a3]" />
          </div>
        </ReferenceSection>

        <ReferenceDivider />

        <section className="space-y-4">
          <h3 className="text-right text-[20px] font-bold text-[#314a67]">انتخاب واحد</h3>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {blocks.map((block) => (
                <SelectionPill
                  key={block.id}
                  label={block.name}
                  active={selectedBlock === block.id}
                  onClick={() => {
                    setSelectedBlock(block.id);
                    setSelectedUnit('');
                  }}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedBlockData?.units.map((unit) => (
                <SelectionPill
                  key={unit.id}
                  label={unit.name}
                  active={selectedUnit === unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                />
              ))}
            </div>
          </div>

          {selectedUnitData ? (
            <p className="text-right text-[18px] font-medium text-[#1778ff]">مشخصات {selectedUnitData.name}</p>
          ) : null}

          <p className="text-center text-[15px] leading-7 text-[#3d4f65]">
            برای ثبت دقیق قرارداد، ابتدا بلوک سپس واحد موردنظر را انتخاب کنید. این انتخاب برای شفاف سازی و جلوگیری از تداخل در فروش واحدها ضروری است.
          </p>
        </section>
      </div>

      <StickySubmitBar
        label="ثبت اطلاعات پایه"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}
