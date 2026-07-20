'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { SubjectContractorBox, type IssuerType } from './SubjectContractorBox';
import { SubjectDetailsBox } from './SubjectDetailsBox';
import { SubjectUnitBox } from './SubjectUnitBox';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { createDraftId, getActiveDraftId, getReferenceData, getStepData, saveStepData } from '../../../../lib/contractDraftClient';
import { validateStep1 } from '../../../../lib/contractValidation';
import type { ContractSubjectData } from '../../../../types/contract';
import { buildValidationSummary } from './validationPresentation';
import { useContractDraftAutosave } from './useContractDraftAutosave';

type EmployeeOption = { id: string; firstName: string; lastName: string };
type BlockOption = {
  id: string;
  name: string;
  units: Array<{
    id: string;
    name: string;
    floorName: string;
    title: string;
    category: string;
    area: number | null;
    assignedToUnitId: string | null;
    isLocked: boolean;
    lockedByDraftId: string | null;
    lockedByContractNumber: string | null;
    lockedByStatus: 'draft' | 'pending_approval' | 'completed' | null;
  }>;
};

export function SubjectStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [formerEmployees, setFormerEmployees] = useState<Array<{ id: string; fullName: string }>>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);

  const [issuerType, setIssuerType] = useState<IssuerType>('self');
  const [formerEmployeeName, setFormerEmployeeName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedContractType, setSelectedContractType] = useState<'sale' | 'pre-sale'>('pre-sale');
  const [contractDate, setContractDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const staffOptions = useMemo(
    () => employees.map((employee) => ({ label: `${employee.firstName} ${employee.lastName}`, value: employee.id })),
    [employees],
  );

  const formerEmployeeOptions = useMemo(
    () => formerEmployees.map((employee) => ({ label: employee.fullName, value: employee.fullName })),
    [formerEmployees],
  );

  const payload = useMemo<ContractSubjectData>(() => buildPayload(), [
    contractDate,
    contractNumber,
    deliveryDate,
    formerEmployeeName,
    issuerType,
    selectedBlock,
    selectedContractType,
    selectedStaff,
    selectedUnit,
  ]);
  const validation = useMemo(() => validateStep1(payload), [payload]);
  useContractDraftAutosave({
    draftId,
    step: 'subject',
    payload,
    enabled: !loading && Boolean(draftId),
    onError: (error) => setFormError(error instanceof Error ? `ذخیره خودکار اطلاعات پایه انجام نشد: ${error.message}` : 'ذخیره خودکار اطلاعات پایه انجام نشد.'),
  });
  const visibleErrors = showValidation ? validation.errors : {};
  const shortcutBlockId = searchParams.get('selectedBlock') ?? '';
  const shortcutUnitId = searchParams.get('selectedUnit') ?? '';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const existingId = getActiveDraftId();
        const referenceData = await getReferenceData(existingId);
        const subjectData = existingId ? await getStepData<ContractSubjectData>(existingId, 'subject') : null;
        if (!mounted) return;

        setDraftId(existingId);
        setEmployees(referenceData.employees);
        setFormerEmployees(referenceData.formerEmployees);
        setBlocks(referenceData.blocks);
        const preferredBlockId = shortcutBlockId || subjectData?.blockId || '';
        const preferredBlock = referenceData.blocks.find((block) => block.id === preferredBlockId) ?? null;
        const preferredUnitId = shortcutUnitId || subjectData?.unitId || '';
        const preferredUnit = preferredBlock?.units.find((unit) => unit.id === preferredUnitId && unit.category === 'unit') ?? null;

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
        }
        setSelectedBlock(preferredBlock?.id ?? subjectData?.blockId ?? '');
        setSelectedUnit(preferredUnit?.id ?? (preferredBlock?.id === subjectData?.blockId ? subjectData?.unitId ?? '' : ''));
      } catch (error) {
        if (mounted) setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات پایه انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [shortcutBlockId, shortcutUnitId]);

  function buildPayload(): ContractSubjectData {
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
  }

  const handleSubmit = async () => {
    if (!validation.valid) {
      setShowValidation(true);
      setFormError(
        buildValidationSummary(
          validation.errors,
          {
            contractType: 'نوع قرارداد',
            contractDate: 'زمان عقد قرارداد',
            contractNumber: 'شماره قرارداد',
            deliveryDate: 'تاریخ تحویل واحد',
            blockId: 'بلوک',
            unitId: 'واحد',
            'contractor.employeeId': 'انتخاب کارمند',
            'contractor.formerFirstName': 'نام کارمند سابق',
            'contractor.formerLastName': 'نام خانوادگی کارمند سابق',
          },
          'اطلاعات پایه معتبر نیست.',
        ),
      );
      return;
    }

    setSaving(true);
    setFormError('');
    setShowValidation(false);
    try {
      const id = draftId ?? (await createDraftId());
      if (!draftId) setDraftId(id);
      await saveStepData(id, 'subject', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'subject', false);
      dispatchContractFlowSavedForDraft(id, stepId as 'subject', Date.now(), payload);
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
    const snapshot = JSON.stringify(payload);
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty(stepId as 'subject', false);
      return;
    }
    dispatchContractFlowDirty(stepId as 'subject', snapshot !== initialSnapshotRef.current);
  }, [draftId, loading, payload, stepId]);

  if (loading) {
    return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات پایه قرارداد..." />;
  }

  return (
    <div className="space-y-5" dir="rtl">
      {!embedded ? (
        <div className="rounded-[8px] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.3)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 text-right lg:flex-row-reverse lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2 text-right">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[28px] font-black tracking-tight text-slate-700 sm:text-[32px]">{title}</h1>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-500">
                  شروع نشده
                </span>
              </div>
              <p className="text-[14px] leading-7 text-slate-500">هنوز اطلاعات پایه‌ای برای این قرارداد ثبت نشده است.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push(basePath)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              بازگشت
            </button>
          </div>
        </div>
      ) : null}

      {formError ? (
        <div className="flex items-start gap-2.5 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      <div
        className={
          visibleErrors['contractor.employeeId'] || visibleErrors['contractor.formerFirstName'] || visibleErrors['contractor.formerLastName']
            ? 'rounded-[8px] border border-rose-300 bg-rose-50/20 p-1'
            : ''
        }
      >
        <SubjectContractorBox
          issuerType={issuerType}
          onIssuerTypeChange={setIssuerType}
          formerEmployeeName={formerEmployeeName}
          onFormerEmployeeNameChange={setFormerEmployeeName}
          selectedStaff={selectedStaff}
          onSelectedStaffChange={setSelectedStaff}
          formerEmployeeOptions={formerEmployeeOptions}
          staffOptions={staffOptions}
          formerEmployeeInvalid={Boolean(visibleErrors['contractor.formerFirstName'] || visibleErrors['contractor.formerLastName'])}
          selectedStaffInvalid={Boolean(visibleErrors['contractor.employeeId'])}
        />
      </div>

      <div
        className={
          visibleErrors.contractType || visibleErrors.contractNumber || visibleErrors.contractDate || visibleErrors.deliveryDate
            ? 'rounded-[8px] border border-rose-300 bg-rose-50/20 p-1'
            : ''
        }
      >
        <SubjectDetailsBox
          selectedContractType={selectedContractType}
          onContractTypeChange={setSelectedContractType}
          contractNumber={contractNumber}
          onContractNumberChange={setContractNumber}
          contractDate={contractDate}
          onContractDateChange={setContractDate}
          deliveryDate={deliveryDate}
          onDeliveryDateChange={setDeliveryDate}
          contractTypeInvalid={Boolean(visibleErrors.contractType)}
          contractNumberInvalid={Boolean(visibleErrors.contractNumber)}
          contractDateInvalid={Boolean(visibleErrors.contractDate)}
          deliveryDateInvalid={Boolean(visibleErrors.deliveryDate)}
        />
      </div>

      <div className={visibleErrors.blockId || visibleErrors.unitId ? 'rounded-[8px] border border-rose-300 bg-rose-50/20 p-1' : ''}>
        <SubjectUnitBox
          blocks={blocks}
          selectedBlock={selectedBlock}
          selectedUnit={selectedUnit}
          onBlockChange={setSelectedBlock}
          onUnitChange={setSelectedUnit}
          blockInvalid={Boolean(visibleErrors.blockId)}
          unitInvalid={Boolean(visibleErrors.unitId)}
        />
      </div>

      <StickySubmitBar
        label="ذخیره اطلاعات پایه"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}


