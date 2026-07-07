import type { OcrSampleDocument } from './ocr-simulator-data';
import type { OcrTransportMode } from './ocr-transport';
import { getOcrTransportLabel } from './ocr-transport';

export type OcrContractDocumentKey = 'id-card' | 'receipt';

export type OcrContractPanelLanguage = 'json' | 'proto' | 'text';

export type OcrContractPanel = {
  title: string;
  description: string;
  language: OcrContractPanelLanguage;
  content: string;
};

export type OcrContractLayerKey = 'request' | 'response';

export type OcrContractView = {
  transport: OcrTransportMode;
  request: OcrContractPanel;
  response: OcrContractPanel;
};

const DEMO_TENANT_ID = 'cmr7d2y9c0001wcekkhizsv7b';
const DEMO_CALLER_SERVICE = 'domain-backend';
const DEMO_CORRELATION_ID = 'corr_01HY8K2M4N9P';
const DEMO_REQUEST_ID = 'req_01HY8K2M4N9P';
const DEMO_JOB_ID = 'job_01HY8K2M4N9P';

const REST_SYNC_ENDPOINT = 'POST /api/v1/documents/extract/sync';

export const DOCUMENT_AI_EXTRACT_PROTO_PATH = 'proto/document_ai/v1/extract.proto';

export const DOCUMENT_AI_EXTRACT_PROTO = `syntax = "proto3";

package taav.documentai.v1;

service DocumentExtractService {
  rpc ExtractSync(ExtractRequest) returns (ExtractResponse);
  rpc ExtractStream(ExtractRequest) returns (stream ExtractFieldEvent);
}

message ExtractRequest {
  string tenant_id = 1;
  string caller_service = 2;
  string correlation_id = 3;
  FileRef file = 4;
  ExtractionSpec extraction = 5;
  ProcessingPolicy processing_policy = 6;
  ExtractOptions options = 7;
}

message ExtractResponse {
  string request_id = 1;
  string job_id = 2;
  string status = 3;
  string overall_status = 4;
  repeated ExtractedField fields = 5;
  repeated string warnings = 6;
  Usage usage = 7;
  DocumentQuality document_quality = 8;
  int64 duration_ms = 9;
}

message ExtractFieldEvent {
  int32 sequence = 1;
  string field_key = 2;
  string partial_value = 3;
  bool is_final = 4;
  double confidence = 5;
}
// See ${DOCUMENT_AI_EXTRACT_PROTO_PATH} for full message definitions.`;

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function estimateUsage(tokensUsed: number) {
  const inputTokens = Math.max(1, Math.round(tokensUsed * 0.58));
  const outputTokens = Math.max(1, tokensUsed - inputTokens);
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
    model: 'gpt-4o-ocr',
  };
}

function buildBaseRequestBody(sample: OcrSampleDocument) {
  return {
    tenant_id: DEMO_TENANT_ID,
    caller_service: DEMO_CALLER_SERVICE,
    correlation_id: DEMO_CORRELATION_ID,
    file: {
      download_url: `https://minio.internal/temp/${sample.fileName}?X-Amz-Expires=900`,
      file_name: sample.fileName,
      mime_type: sample.fileType,
    },
    extraction: {
      schema: sample.inputSchema,
      prompt: sample.prompt,
    },
    processing_policy: {
      store_result: true,
      store_raw_text: false,
      allow_vector_indexing: false,
      retention_days: 30,
      data_classification: 'sensitive',
    },
    options: {
      include_raw_text: false,
      include_document_quality: true,
    },
  };
}

function buildRestResponseBody(sample: OcrSampleDocument) {
  const scenario = sample.scenarios.recognize;
  const durationMs = sample.id === 'receipt' ? 2100 : 2840;

  return {
    request_id: DEMO_REQUEST_ID,
    job_id: DEMO_JOB_ID,
    status: 'completed',
    overall_status: sample.expectedResult.overall_status,
    fields: sample.expectedResult.fields,
    warnings: scenario.warnings,
    usage: estimateUsage(sample.tokensUsed),
    document_quality: {
      score: sample.confidence / 100,
      warnings: [],
    },
    duration_ms: durationMs,
  };
}

function buildGrpcRequestExample(sample: OcrSampleDocument) {
  const body = buildBaseRequestBody(sample);
  return {
    tenant_id: body.tenant_id,
    caller_service: body.caller_service,
    correlation_id: body.correlation_id,
    file: body.file,
    extraction: body.extraction,
    processing_policy: body.processing_policy,
    options: body.options,
  };
}

function buildStreamingEvents(sample: OcrSampleDocument) {
  const events: Array<Record<string, string | number | boolean>> = [];
  let sequence = 1;

  for (const field of sample.expectedResult.fields) {
    const fullValue = field.normalized_value || field.value || '—';
    if (fullValue.length > 2) {
      const partialLength = Math.max(1, Math.ceil(fullValue.length / 2));
      events.push({
        sequence,
        field_key: field.key,
        partial_value: fullValue.slice(0, partialLength),
        is_final: false,
      });
      sequence += 1;
    }

    events.push({
      sequence,
      field_key: field.key,
      partial_value: fullValue,
      is_final: true,
      confidence: field.confidence,
    });
    sequence += 1;
  }

  return events;
}

function panel(
  title: string,
  description: string,
  language: OcrContractPanelLanguage,
  content: string,
): OcrContractPanel {
  return { title, description, language, content };
}

function buildRestContract(sample: OcrSampleDocument): OcrContractView {
  return {
    transport: 'rest',
    request: panel(
      'درخواست .NET → Python',
      `${REST_SYNC_ENDPOINT} — Domain Backend پس از اعتبارسنجی مالکیت فایل و schema، درخواست sync را ارسال می‌کند.`,
      'json',
      formatJson(buildBaseRequestBody(sample)),
    ),
    response: panel(
      'پاسخ Python → .NET',
      'خروجی structured extraction همراه usage، confidence و وضعیت بازبینی.',
      'json',
      formatJson(buildRestResponseBody(sample)),
    ),
  };
}

function buildGrpcUnaryContract(sample: OcrSampleDocument): OcrContractView {
  return {
    transport: 'grpc-unary',
    request: panel(
      'ExtractRequest (proto)',
      'RPC: DocumentExtractService.ExtractSync — درخواست unary از Domain Backend (.NET) به Document AI (Python).',
      'proto',
      `${DOCUMENT_AI_EXTRACT_PROTO}\n\n// Example payload (JSON representation)\n${formatJson(buildGrpcRequestExample(sample))}`,
    ),
    response: panel(
      'ExtractResponse (proto)',
      'پاسخ کامل در یک message؛ معمولاً سریع‌تر از REST برای پردازش sync.',
      'json',
      formatJson(buildRestResponseBody(sample)),
    ),
  };
}

function buildGrpcStreamingContract(sample: OcrSampleDocument): OcrContractView {
  const events = buildStreamingEvents(sample);

  return {
    transport: 'grpc-streaming',
    request: panel(
      'ExtractRequest (proto)',
      'RPC: DocumentExtractService.ExtractStream — همان درخواست unary، اما پاسخ به‌صورت stream از Python به .NET.',
      'proto',
      `${DOCUMENT_AI_EXTRACT_PROTO}\n\n// Example payload (JSON representation)\n${formatJson(buildGrpcRequestExample(sample))}`,
    ),
    response: panel(
      'ExtractFieldEvent stream',
      'هر رویداد یک تکه از مقدار فیلد را برمی‌گرداند؛ is_final=true یعنی فیلد کامل شد.',
      'json',
      formatJson(events),
    ),
  };
}

export function buildOcrContracts(sample: OcrSampleDocument): OcrContractView[] {
  return [
    buildRestContract(sample),
    buildGrpcStreamingContract(sample),
    buildGrpcUnaryContract(sample),
  ];
}

export function getOcrContractForTransport(
  sample: OcrSampleDocument,
  transport: OcrTransportMode,
): OcrContractView {
  const contracts = buildOcrContracts(sample);
  return contracts.find((item) => item.transport === transport) ?? contracts[0]!;
}

export const OCR_CONTRACT_LAYER_LABELS: Record<OcrContractLayerKey, string> = {
  request: 'درخواست .NET → Python',
  response: 'پاسخ Python → .NET',
};

export const OCR_CONTRACT_TRANSPORT_ORDER: OcrTransportMode[] = ['rest', 'grpc-streaming', 'grpc-unary'];

export function getOcrContractTransportTabLabel(transport: OcrTransportMode) {
  return getOcrTransportLabel(transport);
}
