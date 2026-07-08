'use client';

import { Check, Copy } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import type { OcrContractPanel } from '@/app/lib/ocr-contracts';

type OcrContractCodePanelProps = {
  panel: OcrContractPanel;
  copied: boolean;
  onCopy: () => void;
};

export function OcrContractCodePanel({ panel, copied, onCopy }: OcrContractCodePanelProps) {
  return (
    <div className="ai-lab-ocr-contract-panel">
      <div className="ai-lab-ocr-contract-panel-toolbar">
        <TaavButton
          size="sm"
          variant="secondary"
          tone="neutral"
          iconStart={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          onClick={onCopy}
        >
          {copied ? 'کپی شد' : 'کپی'}
        </TaavButton>
      </div>
      <pre
        className={`ai-lab-ocr-contract-code ai-lab-ocr-contract-code--${panel.language}`}
        dir="ltr"
      >
        {panel.content}
      </pre>
    </div>
  );
}
