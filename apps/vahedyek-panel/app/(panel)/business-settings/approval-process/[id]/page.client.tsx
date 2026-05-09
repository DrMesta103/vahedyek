'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, Pencil, Plus, ShieldCheck, Trash2, UserRound, Workflow, X } from 'lucide-react';
import { FieldGroup, FormTextInput, InlineSelect, TagPill } from '../../../contracts/new/_components/ContractFormPrimitives';
import { buildValidationSummary } from '../../../contracts/new/_components/validationPresentation';
import { ContractRegistrationSwitch, LoanPageShell, LoanSectionCard } from '../../_components/LoanSettingsPrimitives';
import type { ApprovalUsageOption } from '../../_components/approvalProcessConfig';

type StageRole = 'controller' | 'intermediate' | 'final';

type ApprovalStage = {
  id: string;
  title: string;
  role: StageRole;
  employeeId: string;
};

type SelectOption = { value: string; label: string };

function normalizeStageRole(value: unknown): StageRole {
  const s = String(value ?? '');
  if (s === 'intermediate' || s === 'final' || s === 'controller') return s;
  return 'controller';
}

const roleOptions: Array<{ value: StageRole; label: string }> = [
  { value: 'controller', label: '┌⌐┘å╪¬╪▒┘ä ┌⌐┘å┘å╪»┘ç ┘é╪▒╪º╪▒╪»╪º╪»' },
  { value: 'intermediate', label: '╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç ┘à█î╪º┘å█î' },
  { value: 'final', label: '╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç ┘å┘ç╪º█î█î' },
];

const roleDescriptions: Record<StageRole, string> = {
  controller: '╪º█î┘å ┘à╪▒╪¡┘ä┘ç ╪¿╪▒╪º█î ┌⌐┘å╪¬╪▒┘ä ╪º┘ê┘ä█î┘ç ┘ê ╪¿╪▒╪▒╪│█î ┘╛█î╪┤ ╪º╪▓ ┘ê╪▒┘ê╪» ┘é╪▒╪º╪▒╪»╪º╪» ╪¿┘ç ╪▒┘ê┘å╪» ╪¬╪º█î█î╪» ╪º╪│╪¬┘ü╪º╪»┘ç ┘à█îΓÇî╪┤┘ê╪».',
  intermediate: '╪º█î┘å ┘à╪▒╪¡┘ä┘ç ╪¿╪▒╪º█î ╪¿╪▒╪▒╪│█îΓÇî┘ç╪º█î ╪¿█î┘åΓÇî╪▒╪º┘ç█î ┘ê ╪╣╪¿┘ê╪▒ ┘é╪▒╪º╪▒╪»╪º╪» ╪¿█î┘å ╪º╪╣╪╢╪º█î ╪│╪º╪▓┘à╪º┘å ╪¬╪╣╪▒█î┘ü ┘à█îΓÇî╪┤┘ê╪».',
  final: '╪º█î┘å ┘à╪▒╪¡┘ä┘ç ╪º╪«╪¬█î╪º╪▒ ┘å┘ç╪º█î█îΓÇî╪│╪º╪▓█î ┘é╪▒╪º╪▒╪»╪º╪» ╪▒╪º ╪»╪º╪▒╪» ┘ê ╪»╪▒ ╪º┘å╪¬┘ç╪º█î ┘ü╪▒╪ó█î┘å╪» ┘é╪▒╪º╪▒ ┘à█îΓÇî┌»█î╪▒╪».',
};

const roleBadgeLabels: Record<StageRole, string> = {
  controller: '┌⌐┘å╪¬╪▒┘ä ┌⌐┘å┘å╪»┘ç ┘é╪▒╪º╪▒╪»╪º╪»',
  intermediate: '╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç ┘à█î╪º┘å█î',
  final: '╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç ┘å┘ç╪º█î█î',
};

export default function ApprovalUsageTypePageClient({ usage }: { usage: ApprovalUsageOption }) {
  const hydrateRef = useRef(true);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [buyerShouldApprove, setBuyerShouldApprove] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stageRole, setStageRole] = useState<StageRole>('controller');
  const [stageTitle, setStageTitle] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [stages, setStages] = useState<ApprovalStage[]>([]);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const selectedEmployee = useMemo(
    () => employeeOptions.find((employee) => employee.value === selectedEmployeeId) ?? null,
    [employeeOptions, selectedEmployeeId],
  );

  useEffect(() => {
    let cancelled = false;
    hydrateRef.current = true;

    const load = async () => {
      try {
        const [refRes, cfgRes] = await Promise.all([fetch('/api/contracts/reference-data'), fetch('/api/settings/approval-process')]);

        if (!refRes.ok || !cfgRes.ok) return;

        const refJson = (await refRes.json()) as { employees?: Array<{ id: string; firstName: string; lastName: string }> };
        const cfgJson = (await cfgRes.json()) as { config?: Record<string, { buyerShouldApprove?: boolean; stages?: unknown[] }> };

        if (cancelled) return;

        const opts = (refJson.employees ?? []).map((e) => ({
          value: e.id,
          label: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.id,
        }));
        setEmployeeOptions(opts);

        const block = cfgJson.config?.[usage.id];
        if (block) {
          setBuyerShouldApprove(Boolean(block.buyerShouldApprove));
          const rawStages = Array.isArray(block.stages) ? block.stages : [];
          setStages(
            rawStages
              .map((s: unknown, i: number) => {
                if (!s || typeof s !== 'object') return null;
                const o = s as Record<string, unknown>;
                const employeeId = String(o.employeeId ?? '').trim();
                const title = String(o.title ?? '').trim();
                if (!employeeId || !title) return null;
                return {
                  id: String(o.id ?? `stage-${i}-${Date.now()}`),
                  title,
                  role: normalizeStageRole(o.role),
                  employeeId,
                } satisfies ApprovalStage;
              })
              .filter(Boolean) as ApprovalStage[],
          );
        } else {
          setBuyerShouldApprove(true);
          setStages([]);
        }
      } finally {
        if (!cancelled) {
          window.setTimeout(() => {
            hydrateRef.current = false;
          }, 0);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [usage.id]);

  useEffect(() => {
    if (hydrateRef.current) return;

    const t = window.setTimeout(() => {
      void fetch('/api/settings/approval-process', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usageType: usage.id,
          block: {
            buyerShouldApprove,
            stages,
          },
        }),
      });
    }, 900);

    return () => window.clearTimeout(t);
  }, [usage.id, buyerShouldApprove, stages]);

  const resetDialog = () => {
    setStageRole('controller');
    setStageTitle('');
    setSelectedEmployeeId('');
    setDialogError('');
    setShowValidation(false);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStageId(null);
    resetDialog();
  };

  const openCreateDialog = () => {
    setEditingStageId(null);
    resetDialog();
    setIsDialogOpen(true);
  };

  const openEditDialog = (stage: ApprovalStage) => {
    setEditingStageId(stage.id);
    setStageRole(stage.role);
    setStageTitle(stage.title);
    setSelectedEmployeeId(stage.employeeId);
    setIsDialogOpen(true);
  };

  const removeStage = (stageId: string) => {
    setStages((current) => current.filter((stage) => stage.id !== stageId));
  };

  const saveStage = () => {
    const errors: Record<string, string> = {};
    if (!stageTitle.trim()) errors.stageTitle = '╪º█î┘å ┘ü█î┘ä╪» ╪º┘ä╪▓╪º┘à█î ╪º╪│╪¬';
    if (!selectedEmployeeId) errors.selectedEmployeeId = '╪º█î┘å ┘ü█î┘ä╪» ╪º┘ä╪▓╪º┘à█î ╪º╪│╪¬';
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      setDialogError(
        buildValidationSummary(
          errors,
          {
            stageTitle: '╪╣┘å┘ê╪º┘å ┘à╪▒╪¡┘ä┘ç ╪¼╪»█î╪»',
            selectedEmployeeId: '╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç',
          },
          '╪º╪╖┘ä╪º╪╣╪º╪¬ ┘à╪▒╪¡┘ä┘ç ╪¬╪º█î█î╪» ┌⌐╪º┘à┘ä ┘å█î╪│╪¬.',
        ),
      );
      return;
    }

    if (editingStageId) {
      setStages((current) =>
        current.map((stage) =>
          stage.id === editingStageId
            ? {
                ...stage,
                title: stageTitle.trim(),
                role: stageRole,
                employeeId: selectedEmployeeId,
              }
            : stage,
        ),
      );
    } else {
      setStages((current) => [
        ...current,
        {
          id: `${stageRole}-${Date.now()}`,
          title: stageTitle.trim(),
          role: stageRole,
          employeeId: selectedEmployeeId,
        },
      ]);
    }

    closeDialog();
  };

  return (
    <>
      <LoanPageShell title={usage.title} description={usage.intro} backHref="/business-settings/approval-process">
        <LoanSectionCard className="overflow-hidden p-5 sm:p-6">
          <div className="project-flow-hero">
            <div className="project-flow-hero-icon">
              <Workflow />
            </div>
            <div className="project-flow-hero-copy">
              <h1>┘à╪│█î╪▒ ╪¬╪º█î█î╪» ╪¿╪▒╪º█î {usage.shortTitle}</h1>
              <p>
                ┘ç┘à┌å┘å█î┘å ┘à█îΓÇî╪¬┘ê╪º┘å█î╪» ┘à╪┤╪«╪╡ ┌⌐┘å█î╪» ┌⌐┘ç ┘╛█î╪┤ΓÇî┘å┘ê█î╪│ ┘é╪¿┘ä ╪º╪▓ ╪º╪▒╪│╪º┘ä ╪¿┘ç ╪│╪º╪▓┘à╪º┘å╪î ╪º╪¿╪¬╪»╪º ╪¬┘ê╪│╪╖ ╪«╪▒█î╪»╪º╪▒ ╪¬╪º█î█î╪» ╪┤┘ê╪» █î╪º ╪«█î╪▒. ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ┘å┘ç╪º█î█î ┘å█î╪▓
                ╪º┘à┌⌐╪º┘å ┘å┘ç╪º█î█î ┌⌐╪▒╪»┘å ┘é╪▒╪º╪▒╪»╪º╪» ╪▒╪º ╪¿╪»┘ê┘å ┘å█î╪º╪▓ ╪¿┘ç ╪¬╪º█î█î╪» ╪│╪º█î╪▒ ╪º┘ü╪▒╪º╪» ╪»╪▒ ┘ü╪▒╪ó█î┘å╪» ╪«┘ê╪º┘ç╪» ╪»╪º╪┤╪¬.
              </p>
            </div>
            <div className="project-flow-hero-actions">
              <button
                type="button"
                onClick={openCreateDialog}
                className="app-button app-button-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                ╪º┘ü╪▓┘ê╪»┘å ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ╪¿┘ç ┘ü╪▒╪ó█î┘å╪»
              </button>
            </div>
          </div>
        </LoanSectionCard>

        <LoanSectionCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2 text-right">
              <h2 className="text-lg font-black text-[color:var(--text-strong)]">╪«╪▒█î╪»╪º╪▒ ╪»╪▒ ┘ü╪▒╪ó█î┘å╪» ╪¬╪º█î█î╪» ╪¿╪º╪┤╪»</h2>
              <p className="text-sm leading-8 text-[color:var(--text-muted)]">
                ╪»╪▒ ╪╡┘ê╪▒╪¬ ┘ü╪╣╪º┘äΓÇî╪│╪º╪▓█î╪î ╪«╪▒█î╪»╪º╪▒ ╪¿╪º█î╪» ┘╛█î╪┤ ╪º╪▓ ╪¿╪▒╪▒╪│█î ╪¬┘ê╪│╪╖ ┌⌐╪º╪▒┘à┘å╪»╪º┘å ╪│╪º╪▓┘à╪º┘å╪î ┘╛█î╪┤ΓÇî┘å┘ê█î╪│ ┘é╪▒╪º╪▒╪»╪º╪» ╪▒╪º ╪¬╪º█î█î╪» ┌⌐┘å╪». ╪»╪▒ ╪║█î╪▒ ╪º█î┘å ╪╡┘ê╪▒╪¬╪î ┘é╪▒╪º╪▒╪»╪º╪»
                ┘à╪│╪¬┘é█î┘à╪º┘ï ╪¿╪▒╪º█î ╪¿╪▒╪▒╪│█î ╪¿┘ç ┌⌐╪º╪▒╪¿╪▒╪º┘å ╪¬╪╣█î█î┘åΓÇî╪┤╪»┘ç ╪»╪▒ ┘ü╪▒╪ó█î┘å╪» ╪º╪▒╪│╪º┘ä ╪«┘ê╪º┘ç╪» ╪┤╪».
              </p>
            </div>
            <div className="shrink-0">
              <ContractRegistrationSwitch
                checked={buyerShouldApprove}
                onChange={setBuyerShouldApprove}
                variant="segmented"
                activeLabel="┘ü╪╣╪º┘ä"
                inactiveLabel="╪║█î╪▒┘ü╪╣╪º┘ä"
              />
            </div>
          </div>
        </LoanSectionCard>

        <LoanSectionCard className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border-soft)] pb-4">
            <div className="text-right">
              <h2 className="text-lg font-black text-[color:var(--text-strong)]">┘à╪▒╪º╪¡┘ä ╪¬╪º█î█î╪» ╪¬╪╣╪▒█î┘üΓÇî╪┤╪»┘ç</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ╪º╪▓ ╪¿█î┘å ┌⌐╪º╪▒┘à┘å╪»╪º┘å ╪½╪¿╪¬ΓÇî╪┤╪»┘ç ╪»╪▒ ╪│╪º┘à╪º┘å┘ç ╪º┘å╪¬╪«╪º╪¿ ┘à█îΓÇî╪┤┘ê╪»╪¢ ╪┤┘å╪º╪│┘ç┘ö ┌⌐╪º╪▒╪¿╪▒█î ┘ç┘à╪º┘å ┌⌐╪º╪▒┘à┘å╪» ╪»╪▒ ╪╡┘ü╪¡┘ç┘ö ╪¬╪ú█î█î╪» ┘é╪▒╪º╪▒╪»╪º╪» ╪¿╪▒╪º█î ╪º╪╣╪╖╪º█î ╪»╪│╪¬╪▒╪│█î ╪º╪│╪¬┘ü╪º╪»┘ç ┘à█îΓÇî╪┤┘ê╪». ┘à╪º┘ä┌⌐ ┌⌐╪│╪¿ΓÇî┘ê┌⌐╪º╪▒ ┘ç┘à█î╪┤┘ç ╪º╪«╪¬█î╪º╪▒ ╪¬╪ú█î█î╪»/╪╣╪»┘à ╪¬╪ú█î█î╪» ╪▒╪º ╪»╪º╪▒╪».
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--theme-accent-border)] bg-[color:var(--theme-accent-softer)] px-4 py-2 text-xs font-black text-[color:var(--theme-action-text)]">
              {stages.length} ┘à╪▒╪¡┘ä┘ç
            </span>
          </div>

          {stages.length ? (
            <div className="mt-5 grid gap-3">
              {stages.map((stage, index) => {
                const employee = employeeOptions.find((item) => item.value === stage.employeeId);

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col gap-4 rounded-[22px] border border-[color:var(--border-soft)] bg-white px-4 py-4 text-right shadow-[0_12px_30px_var(--shadow-soft)]"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[color:var(--surface-soft)] text-sm font-black text-[color:var(--text-strong)]">
                          {index + 1}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff3ec] text-[#ff8d5f]">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black text-[color:var(--text-strong)]">{employee?.label ?? '╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ╪º┘å╪¬╪«╪º╪¿ ┘å╪┤╪»┘ç'}</h3>
                        <span className="rounded-full bg-[#ffe8dd] px-5 py-2 text-sm font-black text-[#6b4b3c]">{stage.title}</span>
                      </div>
                      <div className="flex items-center justify-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--theme-accent-softer)] text-[color:var(--theme-action-text)]">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditDialog(stage)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--surface-soft)] text-[color:var(--theme-action-text)] transition hover:opacity-80"
                          aria-label="┘ê█î╪▒╪º█î╪┤ ┘à╪▒╪¡┘ä┘ç"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStage(stage.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f2] text-[#ff6b7a] transition hover:opacity-80"
                          aria-label="╪¡╪░┘ü ┘à╪▒╪¡┘ä┘ç"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="pr-[calc(80px+0.5rem)] text-sm leading-7 text-[color:var(--text-muted)] lg:pr-0">
                      {roleBadgeLabels[stage.role]} . {roleDescriptions[stage.role]}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-4 py-8 text-center text-sm leading-7 text-[color:var(--text-muted)]">
              ┘ç┘å┘ê╪▓ ┘à╪▒╪¡┘ä┘çΓÇî╪º█î ╪¿╪▒╪º█î ╪º█î┘å ┘å┘ê╪╣ ┌⌐╪º╪▒╪¿╪▒█î ╪½╪¿╪¬ ┘å╪┤╪»┘ç ╪º╪│╪¬. ╪¿╪º ╪»┌⌐┘à┘ç ╪º┘ü╪▓┘ê╪»┘å ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ╪¿┘ç ┘ü╪▒╪ó█î┘å╪»╪î ╪º┘ê┘ä█î┘å ┘à╪▒╪¡┘ä┘ç ╪▒╪º ╪º█î╪¼╪º╪» ┌⌐┘å█î╪».
            </div>
          )}
        </LoanSectionCard>
      </LoanPageShell>

      {isDialogOpen ? (
        <div className="business-dialog-backdrop" role="presentation" onClick={closeDialog}>
          <div
            className="business-dialog !w-[min(660px,100%)] !max-w-none !gap-6 !rounded-[28px] !p-7 sm:!p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-stage-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="business-dialog-close" onClick={closeDialog} aria-label="╪¿╪│╪¬┘å">
              <X />
            </button>

            <div className="space-y-4 text-right">
              <h2 id="approval-stage-dialog-title" className="!text-[32px] !font-black sm:!text-[36px]">
                {editingStageId ? '┘ê█î╪▒╪º█î╪┤ ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ┘ü╪▒╪ó█î┘å╪»' : '╪º┘ü╪▓┘ê╪»┘å ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ╪¿┘ç ┘ü╪▒╪ó█î┘å╪»'}
              </h2>
              <div className="rounded-[22px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <Info className="mt-1 h-5 w-5 shrink-0 text-[color:var(--text-muted)]" />
                  <p className="!m-0 text-sm leading-8 text-[color:var(--text-muted)]">
                    ╪¿╪▒╪º█î ╪¬┌⌐┘à█î┘ä ┘ü╪▒╪ó█î┘å╪» ╪¬╪º█î█î╪» ┘é╪▒╪º╪▒╪»╪º╪»╪î ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┌»╪º┘å ╪▒╪º ╪¿┘ç ╪¬╪▒╪¬█î╪¿ ╪¿╪▒╪▒╪│█î ┘à╪┤╪«╪╡ ┌⌐┘å█î╪». ┘ç╪▒ ╪¬╪º█î█î╪»┌⌐┘å┘å╪»┘ç ┘à█îΓÇî╪¬┘ê╪º┘å╪» ┘å┘é╪┤ ┌⌐┘å╪¬╪▒┘ä ┌⌐┘å┘å╪»┘ç
                    ┘é╪▒╪º╪▒╪»╪º╪»╪î ╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç ┘à█î╪º┘å█î █î╪º ╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç ┘å┘ç╪º█î█î ╪▒╪º ╪»╪º╪┤╪¬┘ç ╪¿╪º╪┤╪».
                  </p>
                </div>
              </div>
            </div>

            <div className="business-dialog-inline-form !gap-5 !rounded-[22px] !border-[color:var(--border-soft)] !bg-white/80 !p-5">
              {dialogError ? <div className="business-blocks-state is-error">{dialogError}</div> : null}
              <FieldGroup label="┘å┘é╪┤ ┘à╪▒╪¡┘ä┘ç" required>
                <div className="flex flex-wrap justify-end gap-2">
                  {roleOptions.map((option) => (
                    <TagPill
                      key={option.value}
                      label={option.label}
                      active={stageRole === option.value}
                      onClick={() => setStageRole(option.value)}
                      className="!h-11 !rounded-[16px] !px-5 !text-sm !font-black"
                    />
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="╪╣┘å┘ê╪º┘å ┘à╪▒╪¡┘ä┘ç ╪¼╪»█î╪»" required invalid={showValidation && !stageTitle.trim()}>
                <FormTextInput value={stageTitle} onChange={setStageTitle} placeholder="┘à╪½┘ä╪º┘ï ╪¿╪▒╪▒╪│█î ┘à╪»█î╪▒ ┘ü╪▒┘ê╪┤" className="!h-12 !rounded-[16px] !text-sm" invalid={showValidation && !stageTitle.trim()} />
              </FieldGroup>

              <FieldGroup label="╪¬╪º█î█î╪» ┌⌐┘å┘å╪»┘ç" required invalid={showValidation && !selectedEmployeeId}>
                <InlineSelect
                  invalid={showValidation && !selectedEmployeeId}
                  value={selectedEmployeeId}
                  onSelect={setSelectedEmployeeId}
                  options={employeeOptions}
                  placeholder="╪º┘å╪¬╪«╪º╪¿ ╪º╪▓ ╪¿█î┘å ┌⌐╪º╪▒┘à┘å╪»╪º┘å"
                  searchPlaceholder="╪¼╪│╪¬╪¼┘ê ╪»╪▒ ╪¿█î┘å ┌⌐╪º╪▒┘à┘å╪»╪º┘å"
                  emptyText={employeeOptions.length ? '┌⌐╪º╪▒┘à┘å╪»█î ┘╛█î╪»╪º ┘å╪┤╪»' : '╪º╪¿╪¬╪»╪º ┌⌐╪º╪▒┘à┘å╪» ╪»╪▒ ╪¿╪«╪┤ ┌⌐╪º╪▒┌⌐┘å╪º┘å ╪½╪¿╪¬ ┌⌐┘å█î╪»'}
                />
              </FieldGroup>
            </div>

            <div className="business-dialog-actions !justify-start !gap-3">
              <button type="button" className="profile-primary-button" disabled={!stageTitle.trim() || !selectedEmployeeId} onClick={saveStage}>
                {editingStageId ? '╪¿╪▒┘ê╪▓╪▒╪│╪º┘å█î' : '╪░╪«█î╪▒┘ç'}
              </button>
              <button type="button" className="profile-primary-button is-secondary" onClick={closeDialog}>
                ╪º┘å╪╡╪▒╪º┘ü ┘ê ╪¿╪º╪▓┌»╪┤╪¬
              </button>
            </div>

            {selectedEmployee ? (
              <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-3 text-right text-sm text-[color:var(--text-muted)]">
                ╪º█î┘å ┘à╪▒╪¡┘ä┘ç ╪¿╪▒╪º█î <span className="font-black text-[color:var(--text-strong)]">{selectedEmployee.label}</span> ╪¿╪º ┘å┘é╪┤{' '}
                <span className="font-black text-[color:var(--text-strong)]">{roleBadgeLabels[stageRole]}</span> ╪½╪¿╪¬ ┘à█îΓÇî╪┤┘ê╪».
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
