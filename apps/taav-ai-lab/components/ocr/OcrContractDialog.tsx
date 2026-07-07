'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileCode2, Layers3 } from 'lucide-react';
import { TaavBadge } from '@repo/ui/taav/primitives';
import { TaavTabs, TaavTabsContent, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import {
  TaavDialog,
  TaavDialogContent,
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
  type OcrContractBuildContext,
  type OcrContractLayerKey,
  type OcrContractView,
} from '@/app/lib/ocr-contracts';
import type { OcrExtractionFieldDraft } from '@/app/lib/ocr-extraction-fields';
import type { OcrTransportMode } from '@/app/lib/ocr-transport';
import { getOcrTransportLabel, normalizeOcrTransportMode } from '@/app/lib/ocr-transport';
import { DEFAULT_OCR_MODEL_ID, resolveOcrModel } from '@/app/lib/ocr-models';
import type { OcrSampleDocument } from '@/app/lib/ocr-simulator-data';
import { OcrContractCodePanel } from '@/components/ocr/OcrContractCodePanel';
import './ocr-contract.css';

const LAYER_ORDER: OcrContractLayerKey[] = ['request', 'response'];

type OcrContractDialogProps = {
  sample: OcrSampleDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTransport?: OcrTransportMode | null;
  lockedTransport?: OcrTransportMode | null;
  modelId?: string;
  tenantId?: string;
  extractionFields?: OcrExtractionFieldDraft[];
};

function ContractLayerTabs({
  contract,
  transport,
  layerTab,
  onLayerTabChange,
  copiedKey,
  onCopy,
}: {
  contract: OcrContractView;
  transport: OcrTransportMode;
  layerTab: OcrContractLayerKey;
  onLayerTabChange: (layer: OcrContractLayerKey) => void;
  copiedKey: string | null;
  onCopy: (key: string, content: string) => void;
}) {
  return (
    <TaavTabs value={layerTab} onValueChange={(value) => onLayerTabChange(value as OcrContractLayerKey)}>
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
              onCopy={() => onCopy(copyKey, panel.content)}
            />
          </TaavTabsContent>
        );
      })}
    </TaavTabs>
  );
}

export function OcrContractDialog({
  sample,
  open,
  onOpenChange,
  initialTransport = 'rest',
  lockedTransport = null,
  modelId,
  tenantId,
  extractionFields,
}: OcrContractDialogProps) {
  const [transportTab, setTransportTab] = useState<OcrTransportMode>('rest');
  const [layerTab, setLayerTab] = useState<OcrContractLayerKey>('request');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isLocked = lockedTransport !== null;
  const resolvedTransport = normalizeOcrTransportMode(isLocked ? lockedTransport : transportTab);

  const contractContext = useMemo<OcrContractBuildContext>(
    () => ({
      tenantId: tenantId ?? 'tenant_demo',
      modelId: modelId ?? DEFAULT_OCR_MODEL_ID,
      extractionFields,
    }),
    [extractionFields, modelId, tenantId],
  );

  const contracts = useMemo(
    () => (sample ? buildOcrContracts(sample, contractContext) : []),
    [contractContext, sample],
  );
  const activeContract = useMemo(
    () => (sample ? getOcrContractForTransport(sample, resolvedTransport, contractContext) : null),
    [contractContext, resolvedTransport, sample],
  );

  useEffect(() => {
    if (!open) return;
    const nextTransport = normalizeOcrTransportMode(isLocked ? lockedTransport : initialTransport);
    setTransportTab(nextTransport);
    setLayerTab('request');
    setCopiedKey(null);
  }, [open, initialTransport, isLocked, lockedTransport, sample?.id]);

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

  const selectedModel = resolveOcrModel(contractContext.modelId);

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
            {isLocked ? (
              <TaavBadge tone="brand" variant="outline">
                {getOcrTransportLabel(resolvedTransport)}
              </TaavBadge>
            ) : null}
            <TaavBadge tone="neutral" variant="outline">
              {selectedModel.providerLabel}
            </TaavBadge>
            <TaavBadge tone="neutral" variant="soft">
              {selectedModel.name}
            </TaavBadge>
          </div>
          <TaavDialogTitle className="ai-lab-ocr-contract-title">
            {extractionFields?.length ? 'سند داینامیک' : sample.title} · قرارداد Document AI
          </TaavDialogTitle>
        </TaavDialogHeader>

        <div className="ai-lab-ocr-contract-body">
        {isLocked ? (
          <div className="ai-lab-ocr-contract-transport-content">
            <ContractLayerTabs
              contract={activeContract}
              transport={resolvedTransport}
              layerTab={layerTab}
              onLayerTabChange={setLayerTab}
              copiedKey={copiedKey}
              onCopy={(key, content) => void handleCopy(key, content)}
            />
          </div>
        ) : (
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
            </div>

            {OCR_CONTRACT_TRANSPORT_ORDER.map((transport) => {
              const contract = contracts.find((item) => item.transport === transport);
              if (!contract) return null;

              return (
                <TaavTabsContent key={transport} value={transport} className="ai-lab-ocr-contract-transport-content">
                  <ContractLayerTabs
                    contract={contract}
                    transport={transport}
                    layerTab={layerTab}
                    onLayerTabChange={setLayerTab}
                    copiedKey={copiedKey}
                    onCopy={(key, content) => void handleCopy(key, content)}
                  />
                </TaavTabsContent>
              );
            })}
          </TaavTabs>
        )}
        </div>

        <div className="ai-lab-ocr-contract-bottom">
        <p className="ai-lab-ocr-contract-footnote">
          Async، Webhook و RabbitMQ در فاز بعدی به این قرارداد اضافه می‌شوند.
        </p>

        <TaavDialogFooter className="ai-lab-ocr-contract-footer">
          <button type="button" className="ai-lab-ocr-contract-close" onClick={() => onOpenChange(false)}>
            بستن
          </button>
        </TaavDialogFooter>
        </div>
      </TaavDialogContent>
    </TaavDialog>
  );
}
