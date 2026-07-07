import type { OcrModelOption } from './ocr-models';
import { resolveOcrModel } from './ocr-models';
import {
  buildDemoOutputField,
  getDemoValueForField,
  toGrpcExtractionFields,
  toRestExtractionFields,
  type OcrExtractionFieldDraft,
} from './ocr-extraction-fields';
import type { OcrSampleDocument } from './ocr-simulator-data';
import type { OcrTransportMode } from './ocr-transport';
import { getOcrTransportLabel } from './ocr-transport';

export type OcrContractDocumentKey = 'id-card' | 'dynamic';

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

export type OcrContractBuildContext = {
  tenantId: string;
  modelId: string;
  extractionFields?: OcrExtractionFieldDraft[];
};

const DEMO_CALLER_SERVICE_ID = '9f1b3d6e-21f8-4a3c-82e1-3f6c8b8f9a11';
const DEMO_CORRELATION_ID = '7f8b8d5e-8b25-4f2f-9a8a-ocr-test-001';
const DEMO_REQUEST_ID = 'req_01HY8K2M4N9P';
const DEMO_JOB_ID = 'job_01HY8K2M4N9P';

const REST_SYNC_ENDPOINT = 'POST /api/v1/documents/extract/sync';

export const DOCUMENT_AI_EXTRACT_PROTO_PATH = 'proto/document_ai/v1/document_ai.proto';

export const DOCUMENT_AI_EXTRACT_PROTO = `syntax = "proto3";

package taav.document_ai.v1;

service DocumentAiService {
  rpc ExtractDocument(ExtractDocumentRequest) returns (ExtractDocumentResponse);

  rpc ExtractDocumentStream(ExtractDocumentRequest) returns (stream ExtractDocumentStreamResponse);
}

message ExtractDocumentRequest {
  string correlation_id = 1;
  string tenant_id = 2;
  string caller_service_id = 3;

  string provider = 4;
  string model = 5;

  DocumentInput document = 6;
  ExtractionRequest extraction = 7;
}

message DocumentInput {
  string download_url = 1;
  string mime_type = 2;
}

message ExtractionRequest {
  repeated ExtractionField fields = 1;
}

message ExtractionField {
  string key = 1;
  string label = 2;
  FieldType type = 3;
  bool required = 4;
  FieldValidation validation = 5;
}

enum FieldType {
  FIELD_TYPE_UNSPECIFIED = 0;
  FIELD_TYPE_STRING = 1;
  FIELD_TYPE_DATE = 2;
  FIELD_TYPE_NUMBER = 3;
  FIELD_TYPE_BOOLEAN = 4;
}

message FieldValidation {
  optional string regex = 1;
  optional int32 min_length = 2;
  optional int32 max_length = 3;
  optional string calendar = 4;
  repeated string accepted_formats = 5;
}

message ExtractDocumentResponse {
  string correlation_id = 1;
  string tenant_id = 2;
  string caller_service_id = 3;

  ProcessingStatus status = 4;

  string provider = 5;
  string model = 6;

  ExtractionResult result = 7;
  DocumentQuality document_quality = 8;
  TokenUsage usage = 9;

  repeated ProcessingError errors = 10;
}

message ExtractionResult {
  repeated ExtractedField fields = 1;
}

message ExtractedField {
  string key = 1;
  string label = 2;
  optional string value = 3;

  double confidence = 4;

  ValidationStatus validation_status = 5;
  HumanReviewStatus human_review_status = 6;

  repeated FieldWarning warnings = 7;
  repeated FieldError errors = 8;
}

message DocumentQuality {
  double score = 1;
  repeated DocumentQualityWarning warnings = 2;
}

message TokenUsage {
  int32 input_tokens = 1;
  int32 output_tokens = 2;
  int32 total_tokens = 3;
}

message ProcessingError {
  ProcessingErrorCode code = 1;
  string message = 2;
}

message FieldWarning {
  FieldWarningCode code = 1;
  string message = 2;
}

message FieldError {
  FieldErrorCode code = 1;
  string message = 2;
}

enum ProcessingStatus {
  PROCESSING_STATUS_UNSPECIFIED = 0;
  PROCESSING_STATUS_COMPLETED = 1;
  PROCESSING_STATUS_COMPLETED_WITH_HUMAN_REVIEW_REQUIRED = 2;
  PROCESSING_STATUS_FAILED = 3;
}

enum ValidationStatus {
  VALIDATION_STATUS_UNSPECIFIED = 0;
  VALIDATION_STATUS_VALID = 1;
  VALIDATION_STATUS_INVALID_FORMAT = 2;
  VALIDATION_STATUS_MISSING_REQUIRED_FIELD = 3;
  VALIDATION_STATUS_NOT_FOUND = 4;
}

enum HumanReviewStatus {
  HUMAN_REVIEW_STATUS_UNSPECIFIED = 0;
  HUMAN_REVIEW_STATUS_NOT_REQUIRED = 1;
  HUMAN_REVIEW_STATUS_REQUIRED = 2;
  HUMAN_REVIEW_STATUS_REJECTED = 3;
}

enum FieldWarningCode {
  FIELD_WARNING_CODE_UNSPECIFIED = 0;
  FIELD_WARNING_CODE_LOW_CONFIDENCE = 1;
  FIELD_WARNING_CODE_FIELD_NOT_DETECTED = 2;
  FIELD_WARNING_CODE_BLUR_DETECTED = 3;
  FIELD_WARNING_CODE_LOW_RESOLUTION = 4;
  FIELD_WARNING_CODE_BAD_LIGHTING = 5;
  FIELD_WARNING_CODE_PARTIAL_VALUE_DETECTED = 6;
  FIELD_WARNING_CODE_POSSIBLE_WRONG_FIELD = 7;
  FIELD_WARNING_CODE_MULTIPLE_CANDIDATES_FOUND = 8;
  FIELD_WARNING_CODE_DATE_FORMAT_UNCERTAIN = 9;
}

enum FieldErrorCode {
  FIELD_ERROR_CODE_UNSPECIFIED = 0;
  FIELD_ERROR_CODE_REQUIRED_FIELD_MISSING = 1;
  FIELD_ERROR_CODE_INVALID_FORMAT = 2;
  FIELD_ERROR_CODE_REGEX_NOT_MATCHED = 3;
  FIELD_ERROR_CODE_MIN_LENGTH_NOT_MET = 4;
  FIELD_ERROR_CODE_MAX_LENGTH_EXCEEDED = 5;
  FIELD_ERROR_CODE_UNSUPPORTED_FIELD_TYPE = 6;
  FIELD_ERROR_CODE_EXTRACTION_FAILED = 7;
}

enum DocumentQualityWarning {
  DOCUMENT_QUALITY_WARNING_UNSPECIFIED = 0;
  DOCUMENT_QUALITY_WARNING_LOW_RESOLUTION = 1;
  DOCUMENT_QUALITY_WARNING_BLUR_DETECTED = 2;
  DOCUMENT_QUALITY_WARNING_BAD_LIGHTING = 3;
  DOCUMENT_QUALITY_WARNING_ROTATED_IMAGE = 4;
  DOCUMENT_QUALITY_WARNING_CROPPED_DOCUMENT = 5;
  DOCUMENT_QUALITY_WARNING_SHADOW_DETECTED = 6;
  DOCUMENT_QUALITY_WARNING_GLARE_DETECTED = 7;
  DOCUMENT_QUALITY_WARNING_LOW_CONTRAST = 8;
}

enum ProcessingErrorCode {
  PROCESSING_ERROR_CODE_UNSPECIFIED = 0;
  PROCESSING_ERROR_CODE_DOWNLOAD_FAILED = 1;
  PROCESSING_ERROR_CODE_UNSUPPORTED_MIME_TYPE = 2;
  PROCESSING_ERROR_CODE_FILE_TOO_LARGE = 3;
  PROCESSING_ERROR_CODE_PROVIDER_TIMEOUT = 4;
  PROCESSING_ERROR_CODE_PROVIDER_ERROR = 5;
  PROCESSING_ERROR_CODE_OCR_FAILED = 6;
  PROCESSING_ERROR_CODE_VALIDATION_FAILED = 7;
  PROCESSING_ERROR_CODE_INTERNAL_ERROR = 8;
}

message ExtractDocumentStreamResponse {
  string correlation_id = 1;
  StreamEventType event_type = 2;
  string message = 3;
  int32 progress_percent = 4;

  optional ExtractDocumentResponse final_response = 5;
  repeated ProcessingError errors = 6;
}

enum StreamEventType {
  STREAM_EVENT_TYPE_UNSPECIFIED = 0;
  STREAM_EVENT_TYPE_STARTED = 1;
  STREAM_EVENT_TYPE_FILE_DOWNLOADED = 2;
  STREAM_EVENT_TYPE_OCR_STARTED = 3;
  STREAM_EVENT_TYPE_EXTRACTION_STARTED = 4;
  STREAM_EVENT_TYPE_FIELD_EXTRACTED = 5;
  STREAM_EVENT_TYPE_VALIDATION_STARTED = 6;
  STREAM_EVENT_TYPE_COMPLETED = 7;
  STREAM_EVENT_TYPE_FAILED = 8;
}`;

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function resolveModel(modelId: string): OcrModelOption {
  return resolveOcrModel(modelId);
}

function hasDynamicExtractionFields(context: OcrContractBuildContext) {
  return Boolean(context.extractionFields?.length);
}

function estimateUsage(tokensUsed: number, model: OcrModelOption) {
  const inputTokens = Math.max(1, Math.round(tokensUsed * model.inputRatio));
  const outputTokens = Math.max(1, tokensUsed - inputTokens);
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
    provider: model.provider,
    model: model.id,
  };
}

function buildIdCardRestRequestBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    correlationId: DEMO_CORRELATION_ID,
    tenantId: context.tenantId,
    callerServiceId: DEMO_CALLER_SERVICE_ID,
    provider: model.provider,
    model: model.id,
    document: {
      downloadUrl: 'https://files.taav.local/temp/secure-download/abc123',
      mimeType: 'image/jpeg',
    },
    extraction: {
      fields: [
        {
          key: 'firstName',
          label: 'نام',
          type: 'string',
          required: true,
          validation: { minLength: 2, maxLength: 80 },
        },
        {
          key: 'lastName',
          label: 'نام خانوادگی',
          type: 'string',
          required: true,
          validation: { minLength: 2, maxLength: 100 },
        },
        {
          key: 'fatherName',
          label: 'نام پدر',
          type: 'string',
          required: false,
          validation: { minLength: 2, maxLength: 80 },
        },
        {
          key: 'nationalCode',
          label: 'کد ملی',
          type: 'string',
          required: true,
          validation: {
            regex: '^[0-9۰-۹]{10}$',
            minLength: 10,
            maxLength: 10,
          },
        },
        {
          key: 'birthDate',
          label: 'تاریخ تولد',
          type: 'date',
          required: false,
          validation: {
            calendar: 'jalali',
            acceptedFormats: ['yyyy/MM/dd', 'yyyy-MM-dd'],
          },
        },
        {
          key: 'cardSerial',
          label: 'سریال کارت',
          type: 'string',
          required: false,
          validation: { minLength: 3, maxLength: 30 },
        },
      ],
    },
  };
}

function buildIdCardGrpcRequestBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    correlation_id: DEMO_CORRELATION_ID,
    tenant_id: context.tenantId,
    caller_service_id: DEMO_CALLER_SERVICE_ID,
    provider: model.provider,
    model: model.id,
    document: {
      download_url: 'https://files.taav.local/temp/secure-download/abc123',
      mime_type: 'image/jpeg',
    },
    extraction: {
      fields: [
        {
          key: 'firstName',
          label: 'نام',
          type: 'FIELD_TYPE_STRING',
          required: true,
          validation: { min_length: 2, max_length: 80 },
        },
        {
          key: 'lastName',
          label: 'نام خانوادگی',
          type: 'FIELD_TYPE_STRING',
          required: true,
          validation: { min_length: 2, max_length: 100 },
        },
        {
          key: 'fatherName',
          label: 'نام پدر',
          type: 'FIELD_TYPE_STRING',
          required: false,
          validation: { min_length: 2, max_length: 80 },
        },
        {
          key: 'nationalCode',
          label: 'کد ملی',
          type: 'FIELD_TYPE_STRING',
          required: true,
          validation: {
            regex: '^[0-9۰-۹]{10}$',
            min_length: 10,
            max_length: 10,
          },
        },
        {
          key: 'birthDate',
          label: 'تاریخ تولد',
          type: 'FIELD_TYPE_DATE',
          required: false,
          validation: {
            calendar: 'jalali',
            accepted_formats: ['yyyy/MM/dd', 'yyyy-MM-dd'],
          },
        },
        {
          key: 'cardSerial',
          label: 'سریال کارت',
          type: 'FIELD_TYPE_STRING',
          required: false,
          validation: { min_length: 3, max_length: 30 },
        },
      ],
    },
  };
}

function buildBaseRequestBody(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    tenant_id: context.tenantId,
    caller_service: DEMO_CALLER_SERVICE_ID,
    correlation_id: DEMO_CORRELATION_ID,
    provider: model.provider,
    model: model.id,
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

function buildRestRequestBody(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  if (hasDynamicExtractionFields(context)) {
    return buildDynamicRestRequestBody(context);
  }

  if (sample.id === 'id-card') {
    return buildIdCardRestRequestBody(context);
  }

  return buildBaseRequestBody(sample, context);
}

function buildIdCardRestResponseBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    correlationId: DEMO_CORRELATION_ID,
    tenantId: context.tenantId,
    callerServiceId: DEMO_CALLER_SERVICE_ID,
    status: 'completed_with_human_review_required',
    provider: model.provider,
    model: model.id,
    result: {
      fields: [
        {
          key: 'firstName',
          label: 'نام',
          value: 'علی',
          confidence: 0.97,
          validationStatus: 'valid',
          humanReviewStatus: 'not_required',
          warnings: [],
          errors: [],
        },
        {
          key: 'lastName',
          label: 'نام خانوادگی',
          value: 'رضایی',
          confidence: 0.95,
          validationStatus: 'valid',
          humanReviewStatus: 'not_required',
          warnings: [],
          errors: [],
        },
        {
          key: 'fatherName',
          label: 'نام پدر',
          value: 'حسین',
          confidence: 0.88,
          validationStatus: 'valid',
          humanReviewStatus: 'not_required',
          warnings: [],
          errors: [],
        },
        {
          key: 'nationalCode',
          label: 'کد ملی',
          value: '0012345678',
          confidence: 0.98,
          validationStatus: 'valid',
          humanReviewStatus: 'not_required',
          warnings: [],
          errors: [],
        },
        {
          key: 'birthDate',
          label: 'تاریخ تولد',
          value: '1375/05/21',
          confidence: 0.82,
          validationStatus: 'valid',
          humanReviewStatus: 'required',
          warnings: ['low_confidence'],
          errors: [],
        },
        {
          key: 'cardSerial',
          label: 'سریال کارت',
          value: null,
          confidence: 0.31,
          validationStatus: 'not_found',
          humanReviewStatus: 'required',
          warnings: ['field_not_detected'],
          errors: [],
        },
      ],
    },
    documentQuality: {
      score: 0.86,
      warnings: [],
    },
    usage: {
      inputTokens: 1200,
      outputTokens: 350,
      totalTokens: 1550,
    },
    errors: [],
  };
}

function buildDynamicRestRequestBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    correlationId: DEMO_CORRELATION_ID,
    tenantId: context.tenantId,
    callerServiceId: DEMO_CALLER_SERVICE_ID,
    provider: model.provider,
    model: model.id,
    document: {
      downloadUrl: 'https://files.taav.local/temp/secure-download/uploaded-document',
      mimeType: 'application/pdf',
    },
    extraction: {
      fields: toRestExtractionFields(context.extractionFields ?? []),
    },
  };
}

function buildDynamicRestResponseBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);
  const fields = context.extractionFields ?? [];

  return {
    correlationId: DEMO_CORRELATION_ID,
    tenantId: context.tenantId,
    callerServiceId: DEMO_CALLER_SERVICE_ID,
    status: 'completed',
    provider: model.provider,
    model: model.id,
    result: {
      fields: fields.map((field) => ({
        key: field.key,
        label: field.label,
        value: getDemoValueForField(field),
        confidence: field.required ? 0.92 : 0.86,
        validationStatus: 'valid',
        humanReviewStatus: field.required ? 'not_required' : 'required',
        warnings: field.required ? [] : ['optional_field_review_suggested'],
        errors: [],
      })),
    },
    documentQuality: {
      score: 0.88,
      warnings: [],
    },
    usage: {
      inputTokens: 1250,
      outputTokens: 320,
      totalTokens: 1570,
    },
    errors: [],
  };
}

function buildIdCardGrpcUnaryResponseBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    correlation_id: DEMO_CORRELATION_ID,
    tenant_id: context.tenantId,
    caller_service_id: DEMO_CALLER_SERVICE_ID,
    status: 'PROCESSING_STATUS_COMPLETED_WITH_HUMAN_REVIEW_REQUIRED',
    provider: model.provider,
    model: model.id,
    result: {
      fields: [
        {
          key: 'firstName',
          label: 'نام',
          value: 'علی',
          confidence: 0.97,
          validation_status: 'VALIDATION_STATUS_VALID',
          human_review_status: 'HUMAN_REVIEW_STATUS_NOT_REQUIRED',
          warnings: [],
          errors: [],
        },
        {
          key: 'lastName',
          label: 'نام خانوادگی',
          value: 'رضایی',
          confidence: 0.95,
          validation_status: 'VALIDATION_STATUS_VALID',
          human_review_status: 'HUMAN_REVIEW_STATUS_NOT_REQUIRED',
          warnings: [],
          errors: [],
        },
        {
          key: 'fatherName',
          label: 'نام پدر',
          value: 'حسین',
          confidence: 0.88,
          validation_status: 'VALIDATION_STATUS_VALID',
          human_review_status: 'HUMAN_REVIEW_STATUS_NOT_REQUIRED',
          warnings: [],
          errors: [],
        },
        {
          key: 'nationalCode',
          label: 'کد ملی',
          value: '0012345678',
          confidence: 0.98,
          validation_status: 'VALIDATION_STATUS_VALID',
          human_review_status: 'HUMAN_REVIEW_STATUS_NOT_REQUIRED',
          warnings: [],
          errors: [],
        },
        {
          key: 'birthDate',
          label: 'تاریخ تولد',
          value: '1375/05/21',
          confidence: 0.82,
          validation_status: 'VALIDATION_STATUS_VALID',
          human_review_status: 'HUMAN_REVIEW_STATUS_REQUIRED',
          warnings: [
            {
              code: 'FIELD_WARNING_CODE_LOW_CONFIDENCE',
              message: 'Confidence below threshold',
            },
          ],
          errors: [],
        },
        {
          key: 'cardSerial',
          label: 'سریال کارت',
          value: null,
          confidence: 0.31,
          validation_status: 'VALIDATION_STATUS_NOT_FOUND',
          human_review_status: 'HUMAN_REVIEW_STATUS_REQUIRED',
          warnings: [
            {
              code: 'FIELD_WARNING_CODE_FIELD_NOT_DETECTED',
              message: 'Field not detected in document',
            },
          ],
          errors: [],
        },
      ],
    },
    document_quality: {
      score: 0.86,
      warnings: [],
    },
    usage: {
      input_tokens: 1200,
      output_tokens: 350,
      total_tokens: 1550,
    },
    errors: [],
  };
}

function buildRestResponseBody(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  if (hasDynamicExtractionFields(context)) {
    return buildDynamicRestResponseBody(context);
  }

  const scenario = sample.scenarios.recognize;
  const model = resolveModel(context.modelId);
  const durationMs = sample.id === 'receipt' ? 2100 : 2840;

  if (sample.id === 'id-card') {
    return buildIdCardRestResponseBody(context);
  }

  return {
    request_id: DEMO_REQUEST_ID,
    job_id: DEMO_JOB_ID,
    status: 'completed',
    overall_status: sample.expectedResult.overall_status,
    fields: sample.expectedResult.fields,
    warnings: scenario.warnings,
    usage: estimateUsage(sample.tokensUsed, model),
    document_quality: {
      score: sample.confidence / 100,
      warnings: [],
    },
    duration_ms: durationMs,
  };
}

function buildGenericGrpcRequestBody(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);
  const base = buildBaseRequestBody(sample, context);

  return {
    correlation_id: DEMO_CORRELATION_ID,
    tenant_id: context.tenantId,
    caller_service_id: DEMO_CALLER_SERVICE_ID,
    provider: model.provider,
    model: model.id,
    document: {
      download_url: base.file.download_url,
      mime_type: base.file.mime_type,
    },
    extraction: {
      fields: sample.expectedResult.fields.map((field) => ({
        key: field.key,
        label: field.key,
        type: 'FIELD_TYPE_STRING',
        required: false,
      })),
    },
  };
}

function buildGrpcRequestExample(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  if (hasDynamicExtractionFields(context)) {
    return buildDynamicGrpcRequestBody(context);
  }

  if (sample.id === 'id-card') {
    return buildIdCardGrpcRequestBody(context);
  }

  return buildGenericGrpcRequestBody(sample, context);
}

function buildGenericGrpcUnaryResponseBody(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);
  const usage = estimateUsage(sample.tokensUsed, model);

  return {
    correlation_id: DEMO_CORRELATION_ID,
    tenant_id: context.tenantId,
    caller_service_id: DEMO_CALLER_SERVICE_ID,
    status: 'PROCESSING_STATUS_COMPLETED',
    provider: model.provider,
    model: model.id,
    result: {
      fields: sample.expectedResult.fields.map((field) => ({
        key: field.key,
        label: field.key,
        value: field.normalized_value || field.value,
        confidence: field.confidence,
        validation_status: 'VALIDATION_STATUS_VALID',
        human_review_status: 'HUMAN_REVIEW_STATUS_NOT_REQUIRED',
        warnings: [],
        errors: [],
      })),
    },
    document_quality: {
      score: sample.confidence / 100,
      warnings: [],
    },
    usage: {
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      total_tokens: usage.total_tokens,
    },
    errors: [],
  };
}

function buildGrpcUnaryResponseBody(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  if (hasDynamicExtractionFields(context)) {
    return buildDynamicGrpcUnaryResponseBody(context);
  }

  if (sample.id === 'id-card') {
    return buildIdCardGrpcUnaryResponseBody(context);
  }

  return buildGenericGrpcUnaryResponseBody(sample, context);
}

function buildIdCardGrpcStreamEvents(context: OcrContractBuildContext) {
  const finalResponse = buildIdCardGrpcUnaryResponseBody(context);
  const correlationId = DEMO_CORRELATION_ID;

  return [
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_STARTED',
      message: 'Document extraction started',
      progress_percent: 0,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FILE_DOWNLOADED',
      message: 'Document downloaded successfully',
      progress_percent: 15,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_OCR_STARTED',
      message: 'OCR processing started',
      progress_percent: 30,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_EXTRACTION_STARTED',
      message: 'Field extraction started',
      progress_percent: 45,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FIELD_EXTRACTED',
      message: 'firstName extracted',
      progress_percent: 55,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FIELD_EXTRACTED',
      message: 'nationalCode extracted',
      progress_percent: 70,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_VALIDATION_STARTED',
      message: 'Field validation started',
      progress_percent: 85,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_COMPLETED',
      message: 'Extraction completed',
      progress_percent: 100,
      final_response: finalResponse,
    },
  ];
}

function buildDynamicGrpcRequestBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);

  return {
    correlation_id: DEMO_CORRELATION_ID,
    tenant_id: context.tenantId,
    caller_service_id: DEMO_CALLER_SERVICE_ID,
    provider: model.provider,
    model: model.id,
    document: {
      download_url: 'https://files.taav.local/temp/secure-download/uploaded-document',
      mime_type: 'application/pdf',
    },
    extraction: {
      fields: toGrpcExtractionFields(context.extractionFields ?? []),
    },
  };
}

function buildDynamicGrpcUnaryResponseBody(context: OcrContractBuildContext) {
  const model = resolveModel(context.modelId);
  const fields = (context.extractionFields ?? []).map(buildDemoOutputField);

  return {
    correlation_id: DEMO_CORRELATION_ID,
    tenant_id: context.tenantId,
    caller_service_id: DEMO_CALLER_SERVICE_ID,
    status: 'PROCESSING_STATUS_COMPLETED',
    provider: model.provider,
    model: model.id,
    result: {
      fields: fields.map((field) => ({
        key: field.key,
        label: context.extractionFields?.find((item) => item.key === field.key)?.label ?? field.key,
        value: field.normalized_value || field.value,
        confidence: field.confidence,
        validation_status: 'VALIDATION_STATUS_VALID',
        human_review_status:
          field.review_status === 'needs_review'
            ? 'HUMAN_REVIEW_STATUS_REQUIRED'
            : 'HUMAN_REVIEW_STATUS_NOT_REQUIRED',
        warnings: field.warnings.map((warning) => ({
          code: 'FIELD_WARNING_CODE_LOW_CONFIDENCE',
          message: warning,
        })),
        errors: [],
      })),
    },
    document_quality: {
      score: 0.88,
      warnings: [],
    },
    usage: {
      input_tokens: 1250,
      output_tokens: 320,
      total_tokens: 1570,
    },
    errors: [],
  };
}

function buildDynamicGrpcStreamEvents(context: OcrContractBuildContext) {
  const correlationId = DEMO_CORRELATION_ID;
  const finalResponse = buildDynamicGrpcUnaryResponseBody(context);
  const events: Array<Record<string, unknown>> = [
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_STARTED',
      message: 'Document extraction started',
      progress_percent: 0,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FILE_DOWNLOADED',
      message: 'Document downloaded successfully',
      progress_percent: 15,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_OCR_STARTED',
      message: 'OCR processing started',
      progress_percent: 32,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_EXTRACTION_STARTED',
      message: 'Dynamic field extraction started',
      progress_percent: 48,
    },
  ];

  let progress = 58;
  for (const field of context.extractionFields ?? []) {
    events.push({
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FIELD_EXTRACTED',
      message: `${field.key} extracted`,
      progress_percent: progress,
    });
    progress = Math.min(progress + 10, 88);
  }

  events.push(
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_VALIDATION_STARTED',
      message: 'Field validation started',
      progress_percent: 92,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_COMPLETED',
      message: 'Extraction completed',
      progress_percent: 100,
      final_response: finalResponse,
    },
  );

  return events;
}

function buildGenericGrpcStreamEvents(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  const correlationId = DEMO_CORRELATION_ID;
  const finalResponse = buildGenericGrpcUnaryResponseBody(sample, context);
  const events: Array<Record<string, unknown>> = [
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_STARTED',
      message: 'Document extraction started',
      progress_percent: 0,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FILE_DOWNLOADED',
      message: 'Document downloaded successfully',
      progress_percent: 20,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_OCR_STARTED',
      message: 'OCR processing started',
      progress_percent: 40,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_EXTRACTION_STARTED',
      message: 'Field extraction started',
      progress_percent: 55,
    },
  ];

  let progress = 60;
  for (const field of sample.expectedResult.fields) {
    events.push({
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_FIELD_EXTRACTED',
      message: `${field.key} extracted`,
      progress_percent: progress,
    });
    progress = Math.min(progress + 8, 90);
  }

  events.push(
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_VALIDATION_STARTED',
      message: 'Field validation started',
      progress_percent: 92,
    },
    {
      correlation_id: correlationId,
      event_type: 'STREAM_EVENT_TYPE_COMPLETED',
      message: 'Extraction completed',
      progress_percent: 100,
      final_response: finalResponse,
    },
  );

  return events;
}

function buildGrpcStreamEvents(sample: OcrSampleDocument, context: OcrContractBuildContext) {
  if (hasDynamicExtractionFields(context)) {
    return buildDynamicGrpcStreamEvents(context);
  }

  if (sample.id === 'id-card') {
    return buildIdCardGrpcStreamEvents(context);
  }

  return buildGenericGrpcStreamEvents(sample, context);
}

function panel(
  title: string,
  description: string,
  language: OcrContractPanelLanguage,
  content: string,
): OcrContractPanel {
  return { title, description, language, content };
}

function buildRestContract(sample: OcrSampleDocument, context: OcrContractBuildContext): OcrContractView {
  return {
    transport: 'rest',
    request: panel(
      'درخواست .NET → Python',
      `${REST_SYNC_ENDPOINT} — Domain Backend پس از اعتبارسنجی مالکیت فایل و schema، درخواست sync را ارسال می‌کند.`,
      'json',
      formatJson(buildRestRequestBody(sample, context)),
    ),
    response: panel(
      'پاسخ Python → .NET',
      'خروجی structured extraction همراه usage، confidence و وضعیت بازبینی.',
      'json',
      formatJson(buildRestResponseBody(sample, context)),
    ),
  };
}

function buildGrpcUnaryContract(sample: OcrSampleDocument, context: OcrContractBuildContext): OcrContractView {
  return {
    transport: 'grpc-unary',
    request: panel(
      'درخواست .NET → Python',
      'RPC: DocumentAiService.ExtractDocument — درخواست unary از Domain Backend (.NET) به Document AI (Python).',
      'json',
      formatJson(buildGrpcRequestExample(sample, context)),
    ),
    response: panel(
      'پاسخ Python → .NET',
      'خروجی ExtractDocumentResponse همراه usage، confidence و وضعیت بازبینی.',
      'json',
      formatJson(buildGrpcUnaryResponseBody(sample, context)),
    ),
  };
}

function buildGrpcStreamingContract(sample: OcrSampleDocument, context: OcrContractBuildContext): OcrContractView {
  const events = buildGrpcStreamEvents(sample, context);

  return {
    transport: 'grpc-streaming',
    request: panel(
      'درخواست .NET → Python',
      'RPC: DocumentAiService.ExtractDocumentStream — همان درخواست unary، اما پاسخ به‌صورت stream از Python به .NET.',
      'json',
      formatJson(buildGrpcRequestExample(sample, context)),
    ),
    response: panel(
      'پاسخ Python → .NET',
      'رویدادهای ExtractDocumentStreamResponse؛ STREAM_EVENT_TYPE_COMPLETED شامل final_response است.',
      'json',
      formatJson(events),
    ),
  };
}

export function buildOcrContracts(
  sample: OcrSampleDocument,
  context: OcrContractBuildContext,
): OcrContractView[] {
  return [
    buildRestContract(sample, context),
    buildGrpcStreamingContract(sample, context),
    buildGrpcUnaryContract(sample, context),
  ];
}

export function getOcrContractForTransport(
  sample: OcrSampleDocument,
  transport: OcrTransportMode,
  context: OcrContractBuildContext,
): OcrContractView {
  const contracts = buildOcrContracts(sample, context);
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
