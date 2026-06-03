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
import { ensureActiveDraftId, getFrontendStepDraft, setFrontendStepDraft } from '../../../../lib/contractDraftClient';
import { ForgivenessRuleSection } from '../../../business-settings/_components/ForgivenessRuleSection';
import { InterestRuleSection } from '../../../business-settings/_components/InterestRuleSection';
import { ContractStepLoader } from './ContractStepLoader';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft, type ContractFlowSectionId } from './contractFlowSignals';

type SupportedDraftRuleId = Extract<ContractRuleId, 'interest' | 'forgiveness'>;
type SupportedDraftSectionId = Extract<ContractFlowSectionId, 'interest' | 'forgiveness'>;

function serializePayload(payload: ContractRuleState) {
  return JSON.stringify(payload);
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
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [state, setState] = useState<ContractRuleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');

  const sectionTitle = useMemo(() => title || rule.title, [rule.title, title]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setFormError('');
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const frontendDraft = getFrontendStepDraft<ContractRuleState>(nextDraftId, stepId);
        const nextState = frontendDraft ? normalizeRuleState(ruleId, frontendDraft) : await fetchBusinessRule(ruleId);
        if (!mounted) return;
        setState(nextState);
        initialSnapshotRef.current = serializePayload(nextState);
        setDirty(false);
        dispatchContractFlowDirty(stepId, false);
      } catch (error) {
        if (!mounted) return;
        setFormError(error instanceof Error ? error.message : 'بارگذاری تنظیمات انجام نشد.');
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

  const handleSubmit = async () => {
    if (!draftId || !state) return;

    try {
      setSaving(true);
      setFormError('');
      setFrontendStepDraft(draftId, stepId, state);
      initialSnapshotRef.current = serializePayload(state);
      setDirty(false);
      dispatchContractFlowDirty(stepId, false);
      dispatchContractFlowSavedForDraft(draftId, stepId, Date.now(), state);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره تنظیمات انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <ContractStepLoader title={sectionTitle} description="در حال بارگذاری تنظیمات پیش‌نویس قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[color:var(--text-strong)]">{sectionTitle}</h1>
          <p className="mt-1 text-sm leading-7 text-[color:var(--text-muted)]">
            این بخش از تنظیمات کسب‌وکار مقدار اولیه می‌گیرد و برای همین پیش‌نویس قرارداد قابل تغییر است.
          </p>
        </div>
      ) : null}

      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:[direction:rtl]">
          <div className="flex min-w-0 flex-1 flex-col justify-center space-y-3 text-right [direction:rtl] lg:items-start">
            <h2 className="text-xl font-black text-[color:var(--text-strong)]">{rule.activationTitle}</h2>
            <p className="w-full text-sm leading-7 text-[color:var(--text-muted)]">{rule.activationDescription}</p>
            {!state.active ? (
              <p className="w-full text-sm text-[color:var(--text-muted)]">
                با فعال کردن این گزینه، جزئیات این بخش در پیش‌نویس قرارداد اعمال می‌شود.
              </p>
            ) : null}
          </div>

          <div className="shrink-0 self-end lg:self-auto">
            <BusinessSwitch checked={state.active} onChange={(value) => applyPanelValue(setState, 'active', value)} />
          </div>
        </div>
      </section>

      {state.active ? (
        ruleId === 'interest' ? (
          <InterestRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
        ) : (
          <ForgivenessRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
        )
      ) : null}

      {formError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <StickySubmitBar
        label={`ثبت ${sectionTitle}`}
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}
