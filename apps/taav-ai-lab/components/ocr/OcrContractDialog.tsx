'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileCode2, Layers3 } from 'lucide-react';
import { TaavBadge } from '@repo/ui/taav/primitives';
import { TaavTabs, TaavTabsContent, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav/overlays';
import {
  buildOcrContracts,
  getOcrContractForTransport,
  getOcrContractTransportTabLabel,
  OCR_CONTRACT_LAYER_LABELS,
  OCR_CONTRACT_TRANSPORT_ORDER,
  type OcrContractLayerKey,
} from '@/app/lib/ocr-contracts';
import type { OcrTransportMode } from '@/app/lib/ocr-transport';
import { normalizeOcrTransportMode } from '@/app/lib/ocr-transport';
import type { OcrSampleDocument } from '@/app/lib/ocr-simulator-data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { OcrVisibleHelp } from '@/components/ocr/OcrVisibleHelp';
import { OcrContractCodePanel } from '@/components/ocr/OcrContractCodePanel';
import './ocr-contract.css';

const LAYER_ORDER: OcrContractLayerKey[] = ['request', 'response'];

const TRANSPORT_TOOLTIPS: Record<OcrTransportMode, keyof typeof AI_LAB_TOOLTIPS.ocr> = {
  rest: 'contractTransportRest',
  'grpc-streaming': 'contractTransportGrpcStream',
  'grpc-unary': 'contractTransportGrpcUnary',
};

type OcrContractDialogProps = {
  sample: OcrSampleDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTransport?: OcrTransportMode | null;
};

export function OcrContractDialog({
  sample,
  open,
  onOpenChange,
  initialTransport = 'rest',
}: OcrContractDialogProps) {
  const [transportTab, setTransportTab] = useState<OcrTransportMode>('rest');
  const [layerTab, setLayerTab] = useState<OcrContractLayerKey>('request');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const contracts = useMemo(() => (sample ? buildOcrContracts(sample) : []), [sample]);
  const activeContract = useMemo(
    () => (sample ? getOcrContractForTransport(sample, transportTab) : null),
    [sample, transportTab],
  );

  useEffect(() => {
    if (!open) return;
    setTransportTab(normalizeOcrTransportMode(initialTransport));
    setLayerTab('request');
    setCopiedKey(null);
  }, [open, initialTransport, sample?.id]);

  const handleCopy = async (key: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1400);
    } catch {
      setCopiedKey(null);
    }
  };

  if (!sample || !activeContract) return null;

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="lg" contentClassName="ai-lab-ocr-contract-dialog" dir="rtl" lang="fa">
        <TaavDialogHeader className="ai-lab-ocr-contract-header">
          <div className="ai-lab-ocr-contract-header-badges">
            <TaavBadge tone="brand" variant="soft" iconStart={<FileCode2 className="h-3.5 w-3.5" />}>
              قرارداد .NET ↔ Python
            </TaavBadge>
            <TaavBadge tone="neutral" variant="soft">
              Sync
            </TaavBadge>
          </div>
          <TaavDialogTitle className="ai-lab-ocr-contract-title">
            {sample.title} · قرارداد Document AI
          </TaavDialogTitle>
          <TaavDialogDescription className="ai-lab-ocr-contract-description">
            قرارداد ارتباط Domain Backend (.NET) با سرویس Document AI (Python). بر اساس سند طراحی Document AI.
          </TaavDialogDescription>
          <OcrVisibleHelp content={AI_LAB_TOOLTIPS.ocr.contractDialog} variant="compact" />
        </TaavDialogHeader>

        <TaavTabs
          value={transportTab}
          onValueChange={(value) => setTransportTab(normalizeOcrTransportMode(value))}
        >
          <div className="ai-lab-ocr-contract-transport-tabs">
            <TaavTabsList variant="pill" size="sm" className="ai-lab-ocr-contract-tabs-list w-full">
              {OCR_CONTRACT_TRANSPORT_ORDER.map((transport) => (
                <TaavTabsTrigger key={transport} value={transport} variant="pill" size="sm">
                  {getOcrContractTransportTabLabel(transport)}
                </TaavTabsTrigger>
              ))}
            </TaavTabsList>
            <OcrVisibleHelp
              content={AI_LAB_TOOLTIPS.ocr[TRANSPORT_TOOLTIPS[transportTab]]}
              variant="compact"
            />
          </div>

          {OCR_CONTRACT_TRANSPORT_ORDER.map((transport) => {
            const contract = contracts.find((item) => item.transport === transport);
            if (!contract) return null;

            return (
              <TaavTabsContent key={transport} value={transport} className="ai-lab-ocr-contract-transport-content">
                <TaavTabs value={layerTab} onValueChange={(value) => setLayerTab(value as OcrContractLayerKey)}>
                  <div className="ai-lab-ocr-contract-layer-tabs">
                    <TaavTabsList variant="pill" size="sm" className="ai-lab-ocr-contract-tabs-list w-full">
                      {LAYER_ORDER.map((layer) => (
                        <TaavTabsTrigger key={layer} value={layer} variant="pill" size="sm">
                          <Layers3 className="h-3 w-3" aria-hidden />
                          {OCR_CONTRACT_LAYER_LABELS[layer]}
                        </TaavTabsTrigger>
                      ))}
                    </TaavTabsList>
                  </div>

                  {LAYER_ORDER.map((layer) => {
                    const panel = contract[layer];
                    const copyKey = `${transport}:${layer}`;

                    return (
                      <TaavTabsContent key={layer} value={layer} className="ai-lab-ocr-contract-layer-content">
                        <OcrContractCodePanel
                          panel={panel}
                          copied={copiedKey === copyKey}
                          onCopy={() => void handleCopy(copyKey, panel.content)}
                        />
                      </TaavTabsContent>
                    );
                  })}
                </TaavTabs>
              </TaavTabsContent>
            );
          })}
        </TaavTabs>

        <p className="ai-lab-ocr-contract-footnote">
          Async، Webhook و RabbitMQ در فاز بعدی به این قرارداد اضافه می‌شوند.
        </p>

        <TaavDialogFooter className="ai-lab-ocr-contract-footer">
          <button type="button" className="ai-lab-ocr-contract-close" onClick={() => onOpenChange(false)}>
            بستن
          </button>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
