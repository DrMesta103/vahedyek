'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  toGrpcExtractionFields,
  toRestExtractionFields,
  type OcrExtractionFieldDraft,
} from '@/app/lib/ocr-extraction-fields';
import type { OcrModelProvider } from '@/app/lib/ocr-models';
import type { OcrTransportMode } from '@/app/lib/ocr-transport';

type OcrExtractionPreviewPanelProps = {
  fields: OcrExtractionFieldDraft[];
  transportMode: OcrTransportMode;
  tenantId: string;
  provider: OcrModelProvider;
  modelId: string;
  fileName?: string | null;
  mimeType?: string | null;
};

const DEMO_CALLER_SERVICE_ID = '9f1b3d6e-21f8-4a3c-82e1-3f6c8b8f9a11';
const DEMO_CORRELATION_ID = '7f8b8d5e-8b25-4f2f-9a8a-ocr-test-001';

export function OcrExtractionPreviewPanel({
  fields,
  transportMode,
  tenantId,
  provider,
  modelId,
  fileName,
  mimeType,
}: OcrExtractionPreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    const documentUrl = fileName
      ? `https://files.taav.local/temp/secure-download/${encodeURIComponent(fileName)}`
      : 'https://files.taav.local/temp/secure-download/uploaded-document';

    if (transportMode === 'rest') {
      return JSON.stringify(
        {
          correlationId: DEMO_CORRELATION_ID,
          tenantId,
          callerServiceId: DEMO_CALLER_SERVICE_ID,
          provider,
          model: modelId,
          document: {
            downloadUrl: documentUrl,
            mimeType: mimeType || 'application/pdf',
          },
          extraction: {
            fields: toRestExtractionFields(fields),
          },
        },
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        correlation_id: DEMO_CORRELATION_ID,
        tenant_id: tenantId,
        caller_service_id: DEMO_CALLER_SERVICE_ID,
        provider,
        model: modelId,
        document: {
          download_url: documentUrl,
          mime_type: mimeType || 'application/pdf',
        },
        extraction: {
          fields: toGrpcExtractionFields(fields),
        },
      },
      null,
      2,
    );
  }, [fields, fileName, mimeType, modelId, provider, tenantId, transportMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="ai-lab-ocr-create-extraction-preview" aria-label="پیش‌نمایش درخواست">
      <div className="ai-lab-ocr-create-extraction-preview-head">
        <div>
          <strong>پیش‌نمایش درخواست</strong>
          <p>{transportMode === 'rest' ? 'REST JSON' : 'gRPC JSON mapping'} بر اساس فیلدهای تعریف‌شده.</p>
        </div>
        <button type="button" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? 'کپی شد' : 'کپی'}
        </button>
      </div>
      <pre dir="ltr">{content}</pre>
    </section>
  );
}
