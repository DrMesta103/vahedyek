'use client';

import { FileText } from 'lucide-react';
import { AttachmentManager } from '../../../../../../components/AttachmentManager';
import type { EmployeeContractDraft } from '../../../../../../lib/employee-contract-drafts';
import { EMPLOYEE_CONTRACT_DOCUMENT_CATEGORIES } from './employee-contract-commitment-categories';
import { EmployeeContractStepShell, fieldBadge, SectionPlaceholder } from './employee-contract-ui';

type Props = {
  attachments: NonNullable<EmployeeContractDraft['attachments']> | undefined;
  draftId: string;
  onAttachmentsChange: (next: NonNullable<EmployeeContractDraft['attachments']>) => void;
  onSaveDraft: () => void;
  onFinalize: () => void;
};

export function EmployeeContractAttachmentsStep({
  attachments,
  draftId,
  onAttachmentsChange,
  onSaveDraft,
  onFinalize,
}: Props) {
  if (!attachments) return <SectionPlaceholder />;

  const requiredCategories = EMPLOYEE_CONTRACT_DOCUMENT_CATEGORIES.filter((item) => item.required);
  const optionalCategories = EMPLOYEE_CONTRACT_DOCUMENT_CATEGORIES.filter((item) => !item.required);

  const renderDocumentCard = (category: (typeof EMPLOYEE_CONTRACT_DOCUMENT_CATEGORIES)[number]) => {
    const files = attachments.files.filter((item) => item.categoryName === category.title);
    const requiredTitles = attachments.requiredDocuments[category.title] ?? [];

    return (
      <article key={category.title} className="business-payroll-transfer-rule">
        <div className="business-payroll-transfer-rule-head">
          <div>
            <strong>{category.title}</strong>
            <p className="contract-benefit-section-lead">نمونه‌ها: {category.examples.join('، ')}</p>
            <div className="employee-contract-document-badges">
              {[...requiredTitles, ...files.map((item) => item.title)]
                .filter(Boolean)
                .slice(0, 6)
                .map((item) => (
                  <span key={`${category.title}-${item}`}>{fieldBadge(item, 'muted')}</span>
                ))}
            </div>
          </div>
        </div>
        <AttachmentManager
          value={files}
          ownerType="employee-contract"
          ownerId={draftId}
          initialCategory={category.title}
          initialTitle={category.examples[0]}
          onChange={(nextCategoryFiles) =>
            onAttachmentsChange({
              ...attachments,
              files: [
                ...attachments.files.filter((item) => item.categoryName !== category.title),
                ...nextCategoryFiles,
              ],
            })
          }
        />
      </article>
    );
  };

  return (
    <EmployeeContractStepShell
      title="پیوست‌ها و مدارک"
      tag="مرحله نهایی"
      description="دسته، عنوان، فایل، تاریخ و توضیحات هر مدرک را ثبت کنید."
      icon={<FileText className="h-4 w-4" />}
    >
      <section className="business-payroll-subcard">
        <h3>مدارک اجباری</h3>
        <div className="business-payroll-items">{requiredCategories.map(renderDocumentCard)}</div>
      </section>
      <section className="business-payroll-subcard">
        <h3>مدارک اختیاری</h3>
        <div className="business-payroll-items">{optionalCategories.map(renderDocumentCard)}</div>
      </section>
      <footer className="business-payroll-step-footer">
        <button type="button" className="draft-template-flow-action is-secondary" onClick={onSaveDraft}>
          ذخیره به عنوان پیش‌نویس
        </button>
        <button type="button" className="draft-template-flow-action is-primary" onClick={onFinalize}>
          ثبت نهایی و شروع قرارداد
        </button>
      </footer>
    </EmployeeContractStepShell>
  );
}
