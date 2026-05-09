import type { ContractApprovalInstanceStatus } from '@prisma/client';
import type { ContractStatus } from '../types/contract';

/**
 * وضعیت نمایشی قرارداد در لیست/جزئیات با درنظرگرفتن اجرای Workflow.
 */
export function resolveDisplayedContractStatus(
  formComplete: boolean,
  approvalReturnedPending: boolean,
  instanceStatus: ContractApprovalInstanceStatus | null | undefined,
  /** پس از تأیید نهایی؛ با شروع ویرایش مجدد نمونهٔ workflow حذف می‌شود و این پرچم تا ارسال مجدد «پیش‌نویس» می‌ماند. */
  releasedFromApprovedForEdit = false,
): ContractStatus {
  if (approvalReturnedPending) return 'draft';

  if (instanceStatus === 'APPROVED') return 'completed';

  if (instanceStatus === 'REVISION_REQUESTED' || instanceStatus === 'REJECTED_TO_DRAFT') {
    return 'draft';
  }

  if (instanceStatus === 'IN_REVIEW') {
    return 'pending_approval';
  }

  if (!instanceStatus && formComplete && releasedFromApprovedForEdit) {
    return 'draft';
  }

  return formComplete ? 'pending_approval' : 'draft';
}
