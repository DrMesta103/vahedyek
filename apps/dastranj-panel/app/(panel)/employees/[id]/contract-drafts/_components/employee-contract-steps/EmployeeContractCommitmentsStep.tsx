'use client';

import { Scale } from 'lucide-react';
import { AttachmentManager } from '../../../../../../components/AttachmentManager';
import type { EmployeeContractDraft } from '../../../../../../lib/employee-contract-drafts';
import { EMPLOYEE_CONTRACT_COMMITMENT_CATEGORIES } from './employee-contract-commitment-categories';
import { EmployeeContractStepShell, SectionPlaceholder } from './employee-contract-ui';

type Props = {
  specialCommitments: NonNullable<EmployeeContractDraft['specialCommitments']> | undefined;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  draftId: string;
  onCommitmentsChange: (next: NonNullable<EmployeeContractDraft['specialCommitments']>) => void;
};

export function EmployeeContractCommitmentsStep({
  specialCommitments,
  templateSnapshot,
  draftId,
  onCommitmentsChange,
}: Props) {
  if (!specialCommitments) return <SectionPlaceholder />;

  const snapshot = templateSnapshot?.specialCommitments;
  const selected = new Set(specialCommitments.selected);
  const templateSelected = new Set(snapshot?.selected ?? []);

  const toggleCommitment = (item: string) => {
    const exists = specialCommitments.selected.includes(item);
    onCommitmentsChange({
      ...specialCommitments,
      selected: exists
        ? specialCommitments.selected.filter((entry) => entry !== item)
        : [...specialCommitments.selected, item],
    });
  };

  return (
    <EmployeeContractStepShell
      title="تعهدات خاص قرارداد"
      tag={snapshot ? 'قالب انتخاب‌شده' : 'بدون قالب'}
      description="تعهدات خاص این قرارداد را انتخاب و پیوست‌های مرتبط را اضافه کنید."
      icon={<Scale className="h-4 w-4" />}
    >
      {EMPLOYEE_CONTRACT_COMMITMENT_CATEGORIES.map((category) => (
        <section key={category.title} className="business-payroll-subcard">
          <div className="business-draft-section-title">
            <h3>{category.title}</h3>
            <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">پیوست هر دسته اختیاری است</span>
          </div>
          <div className="business-payroll-chips">
            {category.items.map((item) => {
              const isSelected = selected.has(item);
              const isTemplateSelected = templateSelected.has(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={isSelected ? 'is-selected' : ''}
                  onClick={() => toggleCommitment(item)}
                >
                  {item}
                  {snapshot && isSelected && !isTemplateSelected ? <small>اختصاصی این قرارداد</small> : null}
                  {snapshot && !isSelected && isTemplateSelected ? <small>غیرفعال نسبت به قالب</small> : null}
                  {snapshot && isSelected && isTemplateSelected ? <small>مطابق قالب</small> : null}
                </button>
              );
            })}
          </div>
          <div className="employee-contract-commitment-attachments">
            <AttachmentManager
              value={specialCommitments.attachments.filter((item) => item.categoryName === category.title)}
              ownerType="employee-contract-commitment"
              ownerId={draftId}
              initialCategory={category.title}
              onChange={(nextCategoryFiles) =>
                onCommitmentsChange({
                  ...specialCommitments,
                  attachments: [
                    ...specialCommitments.attachments.filter((item) => item.categoryName !== category.title),
                    ...nextCategoryFiles,
                  ],
                })
              }
            />
          </div>
        </section>
      ))}
    </EmployeeContractStepShell>
  );
}
