'use client';

import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { AdaptiveChipGroup } from '../AdaptiveChipGroup';

export type ContractSubjectSubOption = {
  value: string;
  label: string;
  helper?: string;
};

type ContractSubjectChipSectionProps = {
  title: string;
  description: string;
  mainOptions: string[];
  mainValue: string;
  onMainChange: (value: string) => void;
  subOptions?: ContractSubjectSubOption[];
  subValue?: string | string[];
  subMulti?: boolean;
  subHint?: string;
  onSubChange?: (value: string | string[]) => void;
  subPanelHint?: string;
  selectedSubNote?: string;
  footer?: ReactNode;
  className?: string;
};

export function ContractSubjectChipSection({
  title,
  description,
  mainOptions,
  mainValue,
  onMainChange,
  subOptions,
  subValue = '',
  subMulti = false,
  subHint,
  onSubChange,
  subPanelHint,
  selectedSubNote,
  footer,
  className = '',
}: ContractSubjectChipSectionProps) {
  const showSubPanel = Boolean(mainValue && subOptions?.length && onSubChange);

  return (
    <section className={`business-payroll-subcard contract-subject-chip-section${className ? ` ${className}` : ''}`}>
      <div className="business-draft-section-title">
        <h3>{title}</h3>
        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
      </div>
      <p className="contract-draft-field-hint">{description}</p>

      <AdaptiveChipGroup
        className="contract-subject-chip-group"
        items={mainOptions.map((option) => ({ value: option, label: option }))}
        selected={mainValue}
        onChange={(value) => onMainChange(typeof value === 'string' ? value : value[0] ?? '')}
      />

      {showSubPanel ? (
        <div className="contract-draft-subchoice-panel">
          {subPanelHint ? (
            <p className="contract-draft-subcategory-note">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{subPanelHint}</span>
            </p>
          ) : null}
          {subHint ? <p className="contract-draft-subchoice-hint">{subHint}</p> : null}
          <AdaptiveChipGroup
            className="contract-subject-chip-group"
            items={subOptions!.map((option) => ({ value: option.value, label: option.label }))}
            selected={subValue}
            multi={subMulti}
            onChange={onSubChange!}
          />
          {selectedSubNote ? <p className="contract-draft-subchoice-footnote">{selectedSubNote}</p> : null}
        </div>
      ) : null}

      {footer ? <div className="contract-subject-chip-section-footer">{footer}</div> : null}
    </section>
  );
}
