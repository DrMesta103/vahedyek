import type { ApprovalUsageKey } from './contractApprovalAccess';

export type WorkflowStepLogic =
  | { mode: 'ALL_MUST_APPROVE' }
  | { mode: 'MINIMUM_COUNT'; count: number };

export type WorkflowStepPermissions = {
  /** چه کسانی می‌توانند قرارداد را به پیش‌نویس برگردانند */
  rejectToDraftApproverIds?: string[] | 'ALL_APPROVERS';
  /** چه کسانی می‌توانند درخواست اصلاح (بازگشت به مرحله) بدهند */
  requestRevisionApproverIds?: string[] | 'ALL_APPROVERS';
};

export type WorkflowStepDefinition = {
  id: string;
  title: string;
  /** شناسهٔ کاربران پنل (AppUser.id) */
  approvers: string[];
  /** تأییدکننده نهایی مرحله؛ در صورت تأیید، مرحله فوراً تکمیل می‌شود. */
  finalApproverId?: string | null;
  logic: WorkflowStepLogic;
  type: 'PARALLEL' | 'SEQUENTIAL';
  permissions?: WorkflowStepPermissions;
  /** اگر true، پس از تکمیل این مرحله کل فرایند تمام می‌شود (معمولاً فقط آخرین مرحله) */
  isFinal?: boolean;
};

export function isAllApproversFlag(
  v: string[] | 'ALL_APPROVERS' | undefined,
): v is 'ALL_APPROVERS' | undefined {
  return v === undefined || v === 'ALL_APPROVERS';
}

export function approverAllowedForPermission(
  userId: string,
  approverIds: string[],
  perm: string[] | 'ALL_APPROVERS' | undefined,
): boolean {
  if (!approverIds.includes(userId)) return false;
  if (perm === undefined || perm === 'ALL_APPROVERS') return true;
  return perm.includes(userId);
}

export type WorkflowDefinitionPayload = {
  title: string;
  usageTypes: ApprovalUsageKey[];
  steps: WorkflowStepDefinition[];
  /** تأییدکننده نهایی اختیاری برای کل فرایند */
  finalApproverUserId?: string | null;
  buyerShouldApprove?: boolean;
  active?: boolean;
};

export function normalizeWorkflowSteps(raw: unknown): WorkflowStepDefinition[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkflowStepDefinition[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = String(o.id ?? '').trim();
    const title = String(o.title ?? '').trim();
    const approvers = Array.isArray(o.approvers)
      ? o.approvers.map((a) => String(a).trim()).filter(Boolean)
      : [];
    if (!id || !title) continue;

    let logic: WorkflowStepLogic = { mode: 'ALL_MUST_APPROVE' };
    const logicRaw = o.logic;
    if (logicRaw && typeof logicRaw === 'object') {
      const l = logicRaw as Record<string, unknown>;
      if (l.mode === 'MINIMUM_COUNT') {
        const c = Math.max(1, Math.floor(Number(l.count) || 1));
        logic = { mode: 'MINIMUM_COUNT', count: c };
      } else {
        logic = { mode: 'ALL_MUST_APPROVE' };
      }
    }

    const type = o.type === 'SEQUENTIAL' ? 'SEQUENTIAL' : 'PARALLEL';

    const finalApproverId = String(o.finalApproverId ?? '').trim() || null;

    let permissions: WorkflowStepPermissions | undefined;
    const p = o.permissions;
    if (p && typeof p === 'object') {
      const pr = p as Record<string, unknown>;
      const rej = pr.rejectToDraftApproverIds;
      const req = pr.requestRevisionApproverIds;
      permissions = {
        rejectToDraftApproverIds:
          rej === 'ALL_APPROVERS'
            ? 'ALL_APPROVERS'
            : Array.isArray(rej)
              ? rej.map((x) => String(x).trim()).filter(Boolean)
              : undefined,
        requestRevisionApproverIds:
          req === 'ALL_APPROVERS'
            ? 'ALL_APPROVERS'
            : Array.isArray(req)
              ? req.map((x) => String(x).trim()).filter(Boolean)
              : undefined,
      };
    }

    out.push({
      id,
      title,
      approvers,
      finalApproverId,
      logic,
      type,
      permissions,
      isFinal: Boolean(o.isFinal),
    });
  }
  return out;
}

export function validateWorkflowPayload(
  payload: WorkflowDefinitionPayload,
  options?: { allowEmptyApprovers?: boolean; allowEmptySteps?: boolean },
): { ok: true } | { ok: false; message: string } {
  if (!payload.title?.trim()) return { ok: false, message: 'عنوان فرایند الزامی است.' };
  if (!payload.usageTypes?.length) return { ok: false, message: 'حداقل یک نوع کاربری انتخاب کنید.' };
  if (payload.usageTypes.length !== 1) return { ok: false, message: 'هر فرایند فقط می‌تواند یک نوع کاربری داشته باشد.' };
  const steps = normalizeWorkflowSteps(payload.steps);
  if (!steps.length && !options?.allowEmptySteps) return { ok: false, message: 'حداقل یک مرحله تعریف کنید.' };
  if (!options?.allowEmptyApprovers) {
    for (const s of steps) {
      if (s.approvers.length === 0) {
        return { ok: false, message: `برای مرحله «${s.title}» حداقل یک تأییدکننده انتخاب کنید.` };
      }
    }
  }
  for (const s of steps) {
    if (s.finalApproverId && !s.approvers.includes(s.finalApproverId)) {
      return { ok: false, message: `مرحله «${s.title}»: تأییدکنندهٔ نهایی باید یکی از تأییدکنندگان همین مرحله باشد.` };
    }
    if (s.logic.mode === 'MINIMUM_COUNT' && s.logic.count > s.approvers.length) {
      return { ok: false, message: `مرحله «${s.title}»: حداقل تأیید نمی‌تواند بیشتر از تعداد تأییدکنندگان باشد.` };
    }
  }
  const finalCount = steps.filter((s) => s.isFinal).length;
  if (finalCount > 1) return { ok: false, message: 'فقط یک مرحله می‌تواند به‌عنوان مرحلهٔ نهایی علامت بخورد.' };
  return { ok: true };
}
