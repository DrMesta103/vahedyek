'use client';

import type { ReactNode } from 'react';
import type { EmployeeContractDraft } from '../../../../../lib/employee-contract-drafts';
import { ContractSubjectChipSection } from '../../../../../components/contract-subject/ContractSubjectChipSection';
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE_SUBCATEGORIES,
  JOB_GROUP_OPTIONS,
  JOB_GROUP_SUBCATEGORIES,
  WORK_LOCATION_CATEGORIES,
  WORK_LOCATION_SUBCATEGORIES,
  formatSubjectResponsibilities,
  getWorkLocationSubHint,
  parseSubjectResponsibilities,
} from '../../../../../lib/contract-subject-options';

type SubjectState = EmployeeContractDraft['subject'];

export function EmployeeContractSubjectStep({
  subject,
  onSubjectChange,
  templateDiff,
}: {
  subject: SubjectState;
  onSubjectChange: (patch: Partial<SubjectState>) => void;
  templateDiff?: {
    contract?: ReactNode;
    location?: ReactNode;
  };
}) {
  const contractConfig = subject.contractType ? CONTRACT_TYPE_SUBCATEGORIES[subject.contractType] : null;
  const locationSubOptions = subject.locationGroup ? WORK_LOCATION_SUBCATEGORIES[subject.locationGroup] ?? [] : [];
  const jobSubOptions = subject.jobGroup ? JOB_GROUP_SUBCATEGORIES[subject.jobGroup] ?? [] : [];
  const responsibilities = parseSubjectResponsibilities(subject);
  const selectedLocation = locationSubOptions.find((item) => item.label === subject.locationType);

  return (
    <>
      <ContractSubjectChipSection
        title="نوع قرارداد"
        description="نوع همکاری و شرایط کلی قرارداد را مشخص کنید."
        mainOptions={[...CONTRACT_TYPE_OPTIONS]}
        mainValue={subject.contractType}
        onMainChange={(contractType) => {
          onSubjectChange({
            contractType,
            contractSubType: '',
          });
        }}
        subOptions={contractConfig?.options.map((option) => ({ value: option, label: option }))}
        subValue={subject.contractSubType}
        subPanelHint={contractConfig?.hint}
        onSubChange={(contractSubType) =>
          onSubjectChange({ contractSubType: typeof contractSubType === 'string' ? contractSubType : contractSubType[0] ?? '' })
        }
        selectedSubNote={subject.contractSubType.trim() || undefined}
        footer={templateDiff?.contract}
      />

      <ContractSubjectChipSection
        title="نوع شغل و مسئولیت‌ها"
        description="حوزه فعالیت و مسئولیت اصلی کارمند را مشخص کنید."
        mainOptions={[...JOB_GROUP_OPTIONS]}
        mainValue={subject.jobGroup}
        onMainChange={(jobGroup) => {
          onSubjectChange({
            jobGroup,
            responsibilities: [],
            responsibility: '',
          });
        }}
        subOptions={jobSubOptions.map((option) => ({ value: option, label: option }))}
        subValue={responsibilities}
        subMulti
        subHint="می‌توانید یک یا چند مسئولیت را انتخاب کنید."
        subPanelHint="مسئولیت‌های مرتبط با حوزه انتخاب‌شده را مشخص کنید."
        onSubChange={(value) => {
          const next = Array.isArray(value) ? value : value ? [value] : [];
          onSubjectChange({
            responsibilities: next,
            responsibility: formatSubjectResponsibilities(next),
          });
        }}
        selectedSubNote={responsibilities.length ? formatSubjectResponsibilities(responsibilities) : undefined}
        className="contract-subject-chip-section--nested"
      />

      <ContractSubjectChipSection
        title="دسته‌بندی بر اساس محل انجام کار"
        description="این بخش مشخص می‌کند که کارمند در چه محیطی مشغول به کار است."
        mainOptions={[...WORK_LOCATION_CATEGORIES]}
        mainValue={subject.locationGroup}
        onMainChange={(locationGroup) => {
          onSubjectChange({ locationGroup, locationType: '' });
        }}
        subOptions={locationSubOptions.map((option) => ({ value: option.label, label: option.label, helper: option.helper }))}
        subValue={subject.locationType}
        subPanelHint={subject.locationGroup ? getWorkLocationSubHint(subject.locationGroup) : undefined}
        onSubChange={(locationType) =>
          onSubjectChange({ locationType: typeof locationType === 'string' ? locationType : locationType[0] ?? '' })
        }
        selectedSubNote={selectedLocation?.helper ?? (subject.locationType.trim() || undefined)}
        className="contract-subject-chip-section--nested"
        footer={templateDiff?.location}
      />
    </>
  );
}
