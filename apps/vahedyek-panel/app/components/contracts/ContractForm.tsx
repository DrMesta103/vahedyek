'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ContractFormData, ContractSubjectData, ContractPartiesData, Employee, Block, Unit, Partner, Buyer } from '../../types/contract';
import { validateStep1, validateStep2 } from '../../lib/contractValidation';
import { useContracts } from '../../hooks/useContracts';
import Step1_ContractSubject from './Step1_ContractSubject';
import Step2_ContractParties from './Step2_ContractParties';
import FormNavigation from './FormNavigation';

interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  contractId?: string;
  employees: Employee[];
  blocks: Block[];
  units: Unit[];
  partners: Partner[];
  buyers: Buyer[];
}

const STEPS = [
  { label: 'موضوع قرارداد', icon: 'fa-file-alt' },
  { label: 'طرفین قرارداد', icon: 'fa-users' },
];

export default function ContractForm({ initialData, contractId, employees, blocks, units, partners, buyers }: ContractFormProps) {
  const router = useRouter();
  const { saveContract } = useContracts();
  const [currentStep, setCurrentStep] = useState(1);
  const [subjectData, setSubjectData] = useState<Partial<ContractSubjectData>>(initialData?.subject ?? {});
  const [partiesData, setPartiesData] = useState<Partial<ContractPartiesData>>(initialData?.parties ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData?.subject) setSubjectData(initialData.subject);
    if (initialData?.parties) setPartiesData(initialData.parties);
  }, [initialData]);

  const buildFormData = (): ContractFormData => ({
    subject: subjectData as ContractSubjectData,
    parties: partiesData as ContractPartiesData,
  });

  const handleNext = () => {
    if (currentStep === 1) {
      const result = validateStep1(subjectData);
      if (!result.valid) { setErrors(result.errors); return; }
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handlePrev = () => { setErrors({}); setCurrentStep((s) => Math.max(s - 1, 1)); };

  const handleSaveDraft = () => { saveContract(buildFormData(), 'draft', contractId); router.push('/contracts'); };

  const handleFinalize = () => {
    const r1 = validateStep1(subjectData);
    const r2 = validateStep2(partiesData);
    if (!r1.valid || !r2.valid) {
      setErrors({ ...r1.errors, ...r2.errors });
      if (!r1.valid) setCurrentStep(1);
      return;
    }
    saveContract(buildFormData(), 'pending_approval', contractId);
    router.push('/contracts');
  };

  return (
    <div className="card">
      {/* عنوان */}
      <div className="card-title">
        <i className="fa fa-file-signature"></i>
        ثبت قرارداد جدید
      </div>

      {/* نوار مراحل */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '30px', marginTop: '10px' }}>
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? 'var(--primary-teal)' : isActive ? 'var(--dark-teal)' : '#e5e7eb',
                  color: isDone || isActive ? '#fff' : '#9ca3af', fontSize: '13px', flexShrink: 0,
                }}>
                  {isDone ? <i className="fa fa-check"></i> : <i className={`fa ${step.icon}`}></i>}
                </div>
                <span style={{ fontSize: '12px', color: isActive ? 'var(--dark-teal)' : isDone ? '#374151' : '#9ca3af', fontWeight: isActive ? '600' : 'normal' }}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: isDone ? 'var(--primary-teal)' : '#e5e7eb', margin: '0 12px' }}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* محتوا */}
      {currentStep === 1 && (
        <Step1_ContractSubject data={subjectData} employees={employees} blocks={blocks} units={units} errors={errors} onChange={setSubjectData} />
      )}
      {currentStep === 2 && (
        <Step2_ContractParties data={partiesData} partners={partners} buyers={buyers} errors={errors} onChange={setPartiesData} />
      )}

      <FormNavigation currentStep={currentStep} totalSteps={STEPS.length} onPrev={handlePrev} onNext={handleNext} onSaveDraft={handleSaveDraft} onFinalize={handleFinalize} />
    </div>
  );
}
