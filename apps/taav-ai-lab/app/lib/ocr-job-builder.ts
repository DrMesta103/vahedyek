import { randomBytes } from 'node:crypto';
import {
  getOcrSampleById,
  type OcrSampleDocument,
  type OcrTemplateOutputField,
  type OcrTemplateOutputResult,
  type OcrTemplateScenario,
  type OcrTemplateScenarioResult,
} from './ocr-simulator-data';
import type {
  CreateOcrSimulationInput,
  OcrSimulationField,
  OcrSimulationJob,
  OcrSimulationSourceType,
} from './types/domain';
import { buildOcrAiMetaFromModel, resolveOcrModel } from './ocr-models';

function createOcrId() {
  return `ocr_${randomBytes(8).toString('hex')}`;
}

function lookupOcrTemplateDocument(templateId?: string | null) {
  if (!templateId) return null;
  return getOcrSampleById(templateId);
}

function classifyUploadedDocument(sourceName: string, contentSnippet?: string | null) {
  const text = `${sourceName} ${contentSnippet ?? ''}`.toLowerCase();
  if (/invoice|factor|فاکتور/.test(text)) return 'invoice';
  if (/contract|agreement|قرارداد/.test(text)) return 'contract';
  if (/id|melli|identity|کارت ملی|شناسنامه/.test(text)) return 'id-card';
  if (/receipt|payment|رسید|پرداخت/.test(text)) return 'receipt';
  return null;
}

function buildGenericOcrPayload(sourceName: string, fileType: string, contentSnippet?: string | null) {
  const trimmedSnippet = (contentSnippet ?? '').trim();
  const previewLines = trimmedSnippet ? trimmedSnippet.split(/\r?\n/).filter(Boolean).slice(0, 5) : [];
  return {
    summary: trimmedSnippet
      ? `نسخه‌ی شبیه‌سازی شده از فایل «${sourceName}» با خواندن متن ورودی ساخته شد.`
      : `فایل «${sourceName}» در حالت شبیه‌سازی OCR پردازش شد و خروجی ساختارمند تولید شد.`,
    previewText: previewLines.length ? previewLines.join('\n') : `Document: ${sourceName}\nType: ${fileType}\nMode: simulated OCR`,
    extractedFields: [
      { key: 'fileName', label: 'نام فایل', value: sourceName },
      { key: 'fileType', label: 'نوع فایل', value: fileType || 'نامشخص' },
      { key: 'mode', label: 'حالت', value: 'شبیه‌سازی Next.js' },
      { key: 'result', label: 'نتیجه', value: 'استخراج ساختارمند' },
    ],
    confidence: trimmedSnippet ? 84 : 74,
    pageCount: 1,
    tokensUsed: trimmedSnippet ? 2600 : 1800,
  };
}

function buildResultFields(template: OcrSampleDocument, result: OcrTemplateOutputResult) {
  const labelByKey = new Map(template.inputSchema.fields.map((field) => [field.key, field.label] as const));
  return result.fields.map<OcrSimulationField>((field: OcrTemplateOutputField) => ({
    key: field.key,
    label: labelByKey.get(field.key) ?? field.key,
    value: field.normalized_value || field.value || '—',
  }));
}

function buildOcrAiMeta(
  tokensUsed: number,
  transportMode?: 'rest' | 'grpc' | null,
  modelId?: string | null,
) {
  const model = resolveOcrModel(modelId, transportMode);
  return buildOcrAiMetaFromModel(tokensUsed, model);
}

function buildExtractedJson(
  result: OcrTemplateOutputResult,
  transportMode?: 'rest' | 'grpc' | null,
  tokensUsed?: number,
  modelId?: string | null,
) {
  const base = Object.fromEntries(result.fields.map((field) => [field.key, field.normalized_value || field.value]));
  const meta: Record<string, string> = {};

  if (transportMode === 'grpc' || transportMode === 'rest') {
    meta.__transportMode = transportMode;
  }
  if (tokensUsed && tokensUsed > 0) {
    Object.assign(meta, buildOcrAiMeta(tokensUsed, transportMode, modelId));
  }

  return Object.keys(meta).length > 0 ? { ...base, ...meta } : base;
}

function resolveScenarioResult(template: OcrSampleDocument, scenario: OcrTemplateScenario): OcrTemplateScenarioResult {
  return template.scenarios[scenario] ?? template.scenarios.recognize;
}

function canUseMissScenario(template: OcrSampleDocument, scenario?: OcrTemplateScenario | null) {
  return scenario === 'miss' && Boolean(template.scenarios.miss);
}

function buildOcrJobFromScenario(
  tenantId: string,
  input: CreateOcrSimulationInput,
  sample: OcrSampleDocument,
  sourceType: OcrSimulationSourceType,
  scenario: OcrTemplateScenario,
): OcrSimulationJob {
  const scenarioResult = resolveScenarioResult(sample, scenario);
  const isMiss = canUseMissScenario(sample, scenario);
  const terminalStatus: 'completed' | 'failed' =
    scenarioResult.result.overall_status === 'failed' || isMiss ? 'failed' : 'completed';
  const now = new Date().toISOString();
  const readyAt = new Date(
    Date.now() + (sourceType === 'sample' ? 2800 : 3200) + Math.round(Math.random() * (isMiss ? 800 : 1200)),
  ).toISOString();
  const fileType = input.fileType?.trim() || sample.fileType;
  const extractedFields = buildResultFields(sample, scenarioResult.result);
  const extractedJson = buildExtractedJson(
    scenarioResult.result,
    input.transportMode,
    scenarioResult.tokensUsed,
    input.modelId,
  );

  return {
    id: createOcrId(),
    tenantId,
    sourceType,
    sourceName: sourceType === 'sample' ? sample.fileName : input.sourceName || sample.fileName,
    sourceLabel: sourceType === 'sample' ? sample.title : input.sourceName || sample.title,
    fileType,
    fileSize: input.fileSize ?? null,
    sampleId: sample.id,
    templateId: sample.id,
    templateLabel: sample.title,
    scenario: isMiss ? 'miss' : 'recognize',
    status: 'processing',
    progress: sourceType === 'sample' ? 14 : 18,
    confidence: scenarioResult.confidence,
    pageCount: sample.pageCount,
    tokensUsed: scenarioResult.tokensUsed,
    summary: scenarioResult.summary,
    previewText: scenarioResult.previewLines.join('\n'),
    templateSchema: sample.inputSchema,
    resultJson: scenarioResult.result,
    extractedJson,
    extractedFields,
    warnings:
      scenarioResult.warnings.length > 0
        ? scenarioResult.warnings
        : scenarioResult.result.fields.flatMap((field) => field.warnings),
    error:
      terminalStatus === 'failed'
        ? scenarioResult.error ?? scenarioResult.result.message ?? 'سند با اطمینان کافی تشخیص داده نشد.'
        : null,
    terminalStatus,
    createdAt: now,
    startedAt: now,
    readyAt,
    completedAt: null,
    updatedAt: now,
  };
}

function buildOcrJobFromSample(tenantId: string, sample: OcrSampleDocument): OcrSimulationJob {
  return buildOcrJobFromScenario(
    tenantId,
    {
      tenantId,
      sourceType: 'sample',
      sourceName: sample.fileName,
      fileType: sample.fileType,
      sampleId: sample.id,
      templateId: sample.id,
      scenario: 'recognize',
      sampleText: sample.sampleText,
    },
    sample,
    'sample',
    'recognize',
  );
}

function buildOcrJobFromUpload(tenantId: string, input: CreateOcrSimulationInput): OcrSimulationJob {
  const explicitTemplate = lookupOcrTemplateDocument(input.templateId);
  const derivedSampleId = classifyUploadedDocument(input.sourceName, input.sampleText);
  const fallbackTemplate = lookupOcrTemplateDocument(derivedSampleId);
  const template = explicitTemplate ?? fallbackTemplate;

  if (template) {
    const scenario = canUseMissScenario(template, input.scenario) ? 'miss' : 'recognize';
    return buildOcrJobFromScenario(tenantId, input, template, 'upload', scenario);
  }

  const now = new Date().toISOString();
  const readyAt = new Date(Date.now() + 3200 + Math.round(Math.random() * 1400)).toISOString();
  const generic = buildGenericOcrPayload(
    input.sourceName,
    input.fileType?.trim() || 'application/octet-stream',
    input.sampleText,
  );

  return {
    id: createOcrId(),
    tenantId,
    sourceType: 'upload',
    sourceName: input.sourceName,
    sourceLabel: input.sourceName,
    fileType: input.fileType?.trim() || 'application/octet-stream',
    fileSize: input.fileSize ?? null,
    sampleId: null,
    templateId: null,
    templateLabel: null,
    scenario: null,
    status: 'processing',
    progress: 16,
    confidence: generic.confidence,
    pageCount: generic.pageCount,
    tokensUsed: generic.tokensUsed,
    summary: generic.summary,
    previewText: generic.previewText,
    templateSchema: null,
    resultJson: null,
    extractedJson: {
      fileName: input.sourceName,
      fileType: input.fileType?.trim() || 'application/octet-stream',
      mode: 'simulated OCR',
      source: 'upload',
      ...(input.transportMode ? { __transportMode: input.transportMode } : {}),
      ...buildOcrAiMeta(generic.tokensUsed, input.transportMode, input.modelId),
    },
    extractedFields: generic.extractedFields,
    warnings: ['خروجی با منطق شبیه‌سازی تولید شده است.'],
    error: null,
    terminalStatus: 'completed',
    createdAt: now,
    startedAt: now,
    readyAt,
    completedAt: null,
    updatedAt: now,
  };
}

export function buildOcrSimulationJob(tenantId: string, input: CreateOcrSimulationInput): OcrSimulationJob {
  if (input.sourceType === 'sample') {
    const sample = lookupOcrTemplateDocument(input.sampleId);
    if (!sample) {
      return buildOcrJobFromUpload(tenantId, input);
    }

    const scenario = canUseMissScenario(sample, input.scenario) ? 'miss' : 'recognize';
    return buildOcrJobFromScenario(tenantId, input, sample, 'sample', scenario);
  }

  return buildOcrJobFromUpload(tenantId, input);
}

export function materializeOcrJob(job: OcrSimulationJob): boolean {
  if (job.status !== 'processing') return false;

  if (Date.now() < new Date(job.readyAt).getTime()) {
    const started = new Date(job.startedAt).getTime();
    const ready = new Date(job.readyAt).getTime();
    const ratio = Math.max(0.1, Math.min(0.95, (Date.now() - started) / Math.max(1, ready - started)));
    job.progress = Math.round(12 + ratio * 80);
    job.updatedAt = new Date().toISOString();
    return true;
  }

  const now = new Date().toISOString();
  job.status = job.terminalStatus;
  job.progress = 100;
  job.completedAt = now;
  job.updatedAt = now;
  return true;
}

export function mapDbJobToDomain(row: {
  id: string;
  tenantId: string;
  sourceType: string;
  sourceName: string;
  sourceLabel: string;
  fileType: string;
  fileSize: number | null;
  sampleId: string | null;
  templateId: string | null;
  templateLabel: string | null;
  scenario: string | null;
  status: string;
  progress: number;
  confidence: number;
  pageCount: number;
  tokensUsed: number;
  summary: string;
  previewText: string;
  templateSchema: unknown;
  resultJson: unknown;
  extractedJson: unknown;
  extractedFields: unknown;
  warnings: unknown;
  error: string | null;
  terminalStatus: string;
  createdAt: Date;
  startedAt: Date;
  readyAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}): OcrSimulationJob {
  return {
    id: row.id,
    tenantId: row.tenantId,
    sourceType: row.sourceType as OcrSimulationJob['sourceType'],
    sourceName: row.sourceName,
    sourceLabel: row.sourceLabel,
    fileType: row.fileType,
    fileSize: row.fileSize,
    sampleId: row.sampleId,
    templateId: row.templateId,
    templateLabel: row.templateLabel,
    scenario: row.scenario as OcrSimulationJob['scenario'],
    status: row.status as OcrSimulationJob['status'],
    progress: row.progress,
    confidence: row.confidence,
    pageCount: row.pageCount,
    tokensUsed: row.tokensUsed,
    summary: row.summary,
    previewText: row.previewText,
    templateSchema: (row.templateSchema as OcrSimulationJob['templateSchema']) ?? null,
    resultJson: (row.resultJson as OcrSimulationJob['resultJson']) ?? null,
    extractedJson: (row.extractedJson as Record<string, string>) ?? {},
    extractedFields: (row.extractedFields as OcrSimulationField[]) ?? [],
    warnings: (row.warnings as string[]) ?? [],
    error: row.error,
    terminalStatus: row.terminalStatus === 'failed' ? 'failed' : 'completed',
    createdAt: row.createdAt.toISOString(),
    startedAt: row.startedAt.toISOString(),
    readyAt: row.readyAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapOcrJobToDbData(job: OcrSimulationJob) {
  return {
    id: job.id,
    tenantId: job.tenantId,
    sourceType: job.sourceType,
    sourceName: job.sourceName,
    sourceLabel: job.sourceLabel,
    fileType: job.fileType,
    fileSize: job.fileSize,
    sampleId: job.sampleId,
    templateId: job.templateId,
    templateLabel: job.templateLabel,
    scenario: job.scenario,
    status: job.status,
    progress: job.progress,
    confidence: job.confidence,
    pageCount: job.pageCount,
    tokensUsed: job.tokensUsed,
    summary: job.summary,
    previewText: job.previewText,
    templateSchema: job.templateSchema ?? undefined,
    resultJson: job.resultJson ?? undefined,
    extractedJson: job.extractedJson,
    extractedFields: job.extractedFields,
    warnings: job.warnings,
    error: job.error,
    terminalStatus: job.terminalStatus,
    createdAt: new Date(job.createdAt),
    startedAt: new Date(job.startedAt),
    readyAt: new Date(job.readyAt),
    completedAt: job.completedAt ? new Date(job.completedAt) : null,
    updatedAt: new Date(job.updatedAt),
  };
}
