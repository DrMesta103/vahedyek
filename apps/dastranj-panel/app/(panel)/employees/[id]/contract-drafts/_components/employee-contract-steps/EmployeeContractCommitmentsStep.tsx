'use client';

import { Scale } from 'lucide-react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
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

function commitmentLabel(
  item: string,
  snapshot: EmployeeContractDraft['templateSnapshot'],
  isSelected: boolean,
  isTemplateSelected: boolean,
) {
  if (!snapshot) return item;
  if (isSelected && !isTemplateSelected) return `${item} · اختصاصی این قرارداد`;
  if (!isSelected && isTemplateSelected) return `${item} · غیرفعال نسبت به قالب`;
  if (isSelected && isTemplateSelected) return `${item} · مطابق قالب`;
  return item;
}

export function EmployeeContractCommitmentsStep({
  specialCommitments,
  templateSnapshot,
  draftId,
  onCommitmentsChange,
}: Props) {
  if (!specialCommitments) return <SectionPlaceholder />;

  const snapshot = templateSnapshot?.specialCommitments;
  const templateSelected = new Set(snapshot?.selected ?? []);

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
          <TaavChoiceChipGroup
            selectionMode="multiple"
            options={category.items.map((item) => ({
              value: item,
              label: commitmentLabel(
                item,
                templateSnapshot,
                specialCommitments.selected.includes(item),
                templateSelected.has(item),
              ),
            }))}
            value={specialCommitments.selected}
            onValueChange={(next) =>
              onCommitmentsChange({
                ...specialCommitments,
                selected: Array.isArray(next) ? next : [next],
              })
            }
          />
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
