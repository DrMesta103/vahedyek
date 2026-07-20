'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BusinessSwitch, StickySubmitBar } from '@repo/ui';
import {
  createInitialRuleState,
  normalizeRuleState,
  RULE_CONFIGS,
  type ContractRuleId,
  type ContractRuleState,
} from '../../../../lib/businessContractRules';
import {
  ensureActiveDraftId,
  fetchContractFlowBootstrapSettings,
  getContractFlowBootstrapSettings,
  getDraftRuleStepData,
  getDraftRuleSettings,
  getFrontendStepDraft,
  saveDraftRuleStepData,
  saveDraftRuleSettings,
  setBusinessSettingsReference,
  setFrontendStepDraft,
} from '../../../../lib/contractDraftClient';
import { InterestRuleSection } from '../../../business-settings/_components/InterestRuleSection';
import { ContractStepLoader } from './ContractStepLoader';
import { ContractSettingsImportDialog } from './ContractSettingsImportDialog';
import { BusinessSettingsHint } from './BusinessSettingsHint';
import { useBusinessSettingsReference } from './useBusinessSettingsReference';
import { buildRuleStateComparison } from '../../../../lib/contractSettingsReference';
import { ForgivenessDraftRuleSection } from './ForgivenessDraftRuleSection';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft, type ContractFlowSectionId } from './contractFlowSignals';
import { useContractDraftAutosave } from './useContractDraftAutosave';

type SupportedDraftRuleId = Extract<ContractRuleId, 'interest' | 'forgiveness'>;
type SupportedDraftSectionId = Extract<ContractFlowSectionId, 'interest' | 'forgiveness'>;

function serializePayload(payload: ContractRuleState) {
  return JSON.stringify(payload);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => window.clearTimeout(timer));
  });
}

function applyPanelValue(
  setState: React.Dispatch<React.SetStateAction<ContractRuleState | null>>,
  key: string,
  value: string | boolean,
) {
  setState((current) => {
    if (!current) return current;
    if (key === 'active') return { ...current, active: Boolean(value) };
    if (key === 'activeTab' && typeof value === 'string') return { ...current, activeTab: value };
    if (key === 'activeChip' && typeof value === 'string') return { ...current, activeChip: value };
    return {
      ...current,
      values: {
        ...current.values,
        [key]: value,
      },
    };
  });
}

async function fetchBusinessRule(ruleId: SupportedDraftRuleId) {
  const response = await fetch(`/api/business-settings/contract-rules/${ruleId}`, { cache: 'no-store' });
  if (!response.ok) {
    return createInitialRuleState(ruleId);
  }
  return normalizeRuleState(ruleId, await response.json());
}

async function fetchDraftRuleState(draftId: string, stepId: SupportedDraftSectionId, ruleId: SupportedDraftRuleId) {
  const payload = stepId === 'forgiveness'
    ? await getDraftRuleStepData<ContractRuleState>(draftId, stepId)
    : await getDraftRuleSettings<ContractRuleState>(draftId, ruleId);
  return payload ? normalizeRuleState(ruleId, payload) : null;
}

async function saveDraftRuleState(draftId: string, stepId: SupportedDraftSectionId, payload: ContractRuleState) {
  if (stepId === 'forgiveness') await saveDraftRuleStepData(draftId, stepId, payload);
  else await saveDraftRuleSettings(draftId, 'interest', payload);
}

export function ContractRuleDraftStep({
  stepId,
  title,
  ruleId,
  embedded = false,
}: {
  stepId: SupportedDraftSectionId;
  title: string;
  ruleId: SupportedDraftRuleId;
  embedded?: boolean;
}) {
  const rule = RULE_CONFIGS[ruleId];
  const { snapshot } = useBusinessSettingsReference();
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [state, setState] = useState<ContractRuleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState('');

  const sectionTitle = useMemo(() => title || rule.title, [rule.title, title]);

  const applySettingsFromBusiness = async () => {
    if (!draftId || importBusy) return;
    setImportBusy(true);
    setImportError('');
    try {
      const bootstrap = await fetchContractFlowBootstrapSettings();
      setBusinessSettingsReference(bootstrap);
      const bootstrapRule = bootstrap.rules[ruleId] ?? null;
      if (!bootstrapRule) {
        throw new Error('انتخاب وضعیت قرارداد ناموفق بود.');
      }
      const nextState = normalizeRuleState(ruleId, bootstrapRule);
      setState(nextState);
      await saveDraftRuleState(draftId, stepId, nextState);
      setFrontendStepDraft(draftId, stepId, nextState);
      initialSnapshotRef.current = serializePayload(nextState);
      setDirty(false);
      dispatchContractFlowDirty(stepId, false);
      dispatchContractFlowSavedForDraft(draftId, stepId, Date.now(), nextState);
      setImportDialogOpen(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'دریافت پیش‌نویس قرارداد ناموفق بود.');
    } finally {
      setImportBusy(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setFormError('');
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const bootstrap = getContractFlowBootstrapSettings();
        const frontendDraft = getFrontendStepDraft<ContractRuleState>(nextDraftId, stepId);
        const persistedDraft = await withTimeout(fetchDraftRuleState(nextDraftId, stepId, ruleId), 1500, null);
        const fallbackState = createInitialRuleState(ruleId);
        // Business settings are used as an initial value only when the user
        // explicitly chose the import flow. In the blank flow they remain a
        // reference for hints and must not populate the draft.
        const businessRule = persistedDraft || !bootstrap ? null : await withTimeout(fetchBusinessRule(ruleId), 2000, fallbackState);
        const bootstrapRule = bootstrap?.rules?.[ruleId] ?? null;
        const nextState =
          normalizeRuleState(ruleId, persistedDraft ?? frontendDraft ?? bootstrapRule ?? businessRule ?? fallbackState);
        if (!mounted) return;
        setState(nextState);
        initialSnapshotRef.current = serializePayload(nextState);
        setDirty(false);
        dispatchContractFlowDirty(stepId, false);
      } catch (error) {
        if (!mounted) return;
        setFormError(error instanceof Error ? error.message : 'بارگذاری پیش‌نویس قرارداد ناموفق بود.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [ruleId, stepId]);

  useEffect(() => {
    if (!draftId || loading || !state) return;
    setFrontendStepDraft(draftId, stepId, state);
    const nextDirty = serializePayload(state) !== initialSnapshotRef.current;
    if (nextDirty !== dirty) {
      setDirty(nextDirty);
      dispatchContractFlowDirty(stepId, nextDirty);
    }
  }, [dirty, draftId, loading, state, stepId]);

  useContractDraftAutosave({
    draftId,
    step: stepId,
    payload: state,
    enabled: !loading && Boolean(draftId) && Boolean(state),
    save: (next) => saveDraftRuleState(draftId as string, stepId as SupportedDraftSectionId, next),
    onError: (error) => setFormError(error instanceof Error ? `ذخیره خودکار ${sectionTitle} انجام نشد: ${error.message}` : `ذخیره خودکار ${sectionTitle} انجام نشد.`),
  });

  const handleSubmit = async () => {
    if (!draftId || !state) return;

    try {
      setSaving(true);
      setFormError('');
      setFrontendStepDraft(draftId, stepId, state);
      await saveDraftRuleState(draftId, stepId, state);
      initialSnapshotRef.current = serializePayload(state);
      setDirty(false);
      dispatchContractFlowDirty(stepId, false);
      dispatchContractFlowSavedForDraft(draftId, stepId, Date.now(), state);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره پیش‌نویس قرارداد ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <ContractStepLoader title={sectionTitle} description="در حال دریافت اطلاعات مرحله قرارداد..." />;
  }

  if (ruleId === 'forgiveness') {
    return (
      <div className="space-y-5">
        {!embedded ? (
          <div className="text-right">
            <h1 className="text-2xl font-bold text-[color:var(--text-strong)]">{sectionTitle}</h1>
            <p className="mt-1 text-sm leading-7 text-[color:var(--text-muted)]">
              ??????????? ???? ??????? ?? ??? ???????? ?? ????? ??? ????? ???? ? ????? ????.
            </p>
          </div>
        ) : null}

        <ForgivenessDraftRuleSection
          state={state}
          onValueChange={(key, value) => applyPanelValue(setState, key, value)}
          onSave={() => void handleSubmit()}
        />

        {formError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

        <StickySubmitBar
          label={`??? ${sectionTitle}`}
          loadingLabel={loading ? 'در حال دریافت...' : 'در حال ذخیره...'}
          disabled={loading || saving}
          onClick={handleSubmit}
          embedded={embedded}
          submitId={stepId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-3 text-right sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--text-strong)]">{sectionTitle}</h1>
            <p className="mt-1 text-sm leading-7 text-[color:var(--text-muted)]">
              این مرحله برای تنظیم قانون و متن قرارداد استفاده می‌شود.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="rounded-[8px] border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
          >
            ذخیره در پیش‌نویس
          </button>
        </div>
      ) : null}

      {embedded ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="rounded-[8px] border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
          >
            بارگذاری از پیش‌نویس
          </button>
        </div>
      ) : null}

      <section className="rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:[direction:rtl]">
          <div className="flex min-w-0 flex-1 flex-col justify-center space-y-3 text-right [direction:rtl] lg:items-start">
            <h2 className="text-xl font-black text-[color:var(--text-strong)]">{rule.activationTitle}</h2>
            <p className="w-full text-sm leading-7 text-[color:var(--text-muted)]">{rule.activationDescription}</p>
            <BusinessSettingsHint comparison={buildRuleStateComparison(rule, snapshot?.rules?.[ruleId], state)} />
            {!state.active ? (
              <p className="w-full text-sm text-[color:var(--text-muted)]">
                برای ادامه، وضعیت‌های مالی و حقوقی را از همین بخش تنظیم کنید.
              </p>
            ) : null}
          </div>

          <div className="shrink-0 self-end lg:self-auto">
            <BusinessSwitch checked={state.active} onChange={(value) => applyPanelValue(setState, 'active', value)} />
          </div>
        </div>
      </section>

      {state.active ? <InterestRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} /> : null}

      {formError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <StickySubmitBar
        label={`??? ${sectionTitle}`}
        loadingLabel={loading ? 'در حال دریافت...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />

      <ContractSettingsImportDialog
        open={importDialogOpen}
        loading={importBusy}
        error={importError}
        title={`تنظیمات قرارداد ${sectionTitle}`}
        description="در این بخش می‌توانید وضعیت قرارداد و قواعد وابسته را نهایی کنید."
        onConfirm={() => void applySettingsFromBusiness()}
        onClose={() => setImportDialogOpen(false)}
      />
    </div>
  );
}

