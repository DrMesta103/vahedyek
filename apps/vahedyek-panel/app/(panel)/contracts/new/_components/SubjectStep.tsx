'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { SubjectContractorBox, type IssuerType } from './SubjectContractorBox';
import { SubjectDetailsBox } from './SubjectDetailsBox';
import { SubjectUnitBox } from './SubjectUnitBox';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { ensureActiveDraftId, getReferenceData, getStepData, saveStepData } from '../../../../lib/contractDraftClient';
import { validateStep1 } from '../../../../lib/contractValidation';
import type { ContractSubjectData } from '../../../../types/contract';

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
  }>;
};

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
        if (mounted) setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات پایه انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

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
      dispatchContractFlowSaved(stepId as 'subject', Date.now(), payload);
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
    dispatchContractFlowDirty(stepId as 'subject', snapshot !== initialSnapshotRef.current);
  }, [contractDate, contractNumber, deliveryDate, draftId, formerEmployeeName, issuerType, loading, selectedBlock, selectedContractType, selectedStaff, selectedUnit, stepId]);

  if (loading) {
    return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات پایه قرارداد..." />;
  }

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="mt-0.5 text-[13px] text-slate-500">اطلاعات پایه و اولیه قرارداد را وارد کنید.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-600 transition-colors hover:bg-slate-50"
          >
            بازگشت
          </button>
        </div>
      ) : null}

      {formError ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      <SubjectContractorBox
        issuerType={issuerType}
        onIssuerTypeChange={setIssuerType}
        formerEmployeeName={formerEmployeeName}
        onFormerEmployeeNameChange={setFormerEmployeeName}
        selectedStaff={selectedStaff}
        onSelectedStaffChange={setSelectedStaff}
        formerEmployeeOptions={formerEmployeeOptions}
        staffOptions={staffOptions}
      />

      <SubjectDetailsBox
        selectedContractType={selectedContractType}
        onContractTypeChange={setSelectedContractType}
        contractNumber={contractNumber}
        onContractNumberChange={setContractNumber}
        contractDate={contractDate}
        onContractDateChange={setContractDate}
        deliveryDate={deliveryDate}
        onDeliveryDateChange={setDeliveryDate}
      />

      <SubjectUnitBox
        blocks={blocks}
        selectedBlock={selectedBlock}
        selectedUnit={selectedUnit}
        onBlockChange={setSelectedBlock}
        onUnitChange={setSelectedUnit}
      />

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
