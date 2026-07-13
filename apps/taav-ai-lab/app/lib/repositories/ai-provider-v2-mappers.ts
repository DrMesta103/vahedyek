import type { Prisma } from '@prisma/client';
import {
  AI_PROVIDER_LABELS_V2,
  type AiProviderAccountTransactionTypeV2,
  type AiProviderAccountV2CreditSummary,
  type AiProviderAccountV2Public,
  type AiProviderModelCapabilityTypeV2,
  type AiProviderModelTypeV2,
  type AiProviderModelV2Public,
  type AiProviderTypeV2,
} from '../types/ai-provider-v2';

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

export function mapProviderTypeToPrisma(value: AiProviderTypeV2): Prisma.AiProviderTypeV2 {
  switch (value) {
    case 'OPENAI':
      return 'OpenAi';
    case 'AZURE_OPENAI':
      return 'AzureOpenAi';
    case 'GEMINI':
      return 'GoogleGemini';
    case 'DEEPSEEK':
      return 'DeepSeek';
    case 'GROK':
      return 'Grok';
    case 'OPENROUTER':
      return 'OpenRouter';
  }
}

export function mapProviderTypeFromPrisma(value: Prisma.AiProviderTypeV2): AiProviderTypeV2 {
  switch (value) {
    case 'OpenAi':
      return 'OPENAI';
    case 'AzureOpenAi':
      return 'AZURE_OPENAI';
    case 'GoogleGemini':
      return 'GEMINI';
    case 'DeepSeek':
      return 'DEEPSEEK';
    case 'Grok':
      return 'GROK';
    case 'OpenRouter':
      return 'OPENROUTER';
  }
}

export function mapTransactionTypeToPrisma(
  value: AiProviderAccountTransactionTypeV2,
): Prisma.AiProviderAccountTransactionTypeV2 {
  return value === 'PURCHASE' ? 'Purchase' : 'ManualAdjustment';
}

export function mapTransactionTypeFromPrisma(
  value: Prisma.AiProviderAccountTransactionTypeV2,
): AiProviderAccountTransactionTypeV2 {
  return value === 'Purchase' ? 'PURCHASE' : 'MANUAL_ADJUSTMENT';
}

export function mapModelTypeToPrisma(value: AiProviderModelTypeV2): Prisma.AiProviderModelTypeV2 {
  switch (value) {
    case 'TEXT_GENERATION':
      return 'TextGeneration';
    case 'EMBEDDING':
      return 'Embedding';
    case 'RERANKING':
      return 'Reranking';
    case 'SPEECH_TO_TEXT':
      return 'SpeechToText';
    case 'TEXT_TO_SPEECH':
      return 'TextToSpeech';
    case 'IMAGE_GENERATION':
      return 'ImageGeneration';
    case 'DOCUMENT_EXTRACTION':
      return 'DocumentExtraction';
    case 'MODERATION':
      return 'Moderation';
  }
}

export function mapModelTypeFromPrisma(value: Prisma.AiProviderModelTypeV2): AiProviderModelTypeV2 {
  switch (value) {
    case 'TextGeneration':
      return 'TEXT_GENERATION';
    case 'Embedding':
      return 'EMBEDDING';
    case 'Reranking':
      return 'RERANKING';
    case 'SpeechToText':
      return 'SPEECH_TO_TEXT';
    case 'TextToSpeech':
      return 'TEXT_TO_SPEECH';
    case 'ImageGeneration':
      return 'IMAGE_GENERATION';
    case 'DocumentExtraction':
      return 'DOCUMENT_EXTRACTION';
    case 'Moderation':
      return 'MODERATION';
  }
}

export function mapCapabilityToPrisma(
  value: AiProviderModelCapabilityTypeV2,
): Prisma.AiProviderModelCapabilityTypeV2 {
  switch (value) {
    case 'TEXT_INPUT':
      return 'TextInput';
    case 'IMAGE_INPUT':
      return 'ImageInput';
    case 'AUDIO_INPUT':
      return 'AudioInput';
    case 'VIDEO_INPUT':
      return 'VideoInput';
    case 'FILE_INPUT':
      return 'FileInput';
    case 'TEXT_OUTPUT':
      return 'TextOutput';
    case 'IMAGE_OUTPUT':
      return 'ImageOutput';
    case 'AUDIO_OUTPUT':
      return 'AudioOutput';
    case 'STREAMING':
      return 'Streaming';
    case 'TOOL_CALLING':
      return 'ToolCalling';
    case 'STRUCTURED_OUTPUT':
      return 'StructuredOutput';
  }
}

export function mapCapabilityFromPrisma(
  value: Prisma.AiProviderModelCapabilityTypeV2,
): AiProviderModelCapabilityTypeV2 {
  switch (value) {
    case 'TextInput':
      return 'TEXT_INPUT';
    case 'ImageInput':
      return 'IMAGE_INPUT';
    case 'AudioInput':
      return 'AUDIO_INPUT';
    case 'VideoInput':
      return 'VIDEO_INPUT';
    case 'FileInput':
      return 'FILE_INPUT';
    case 'TextOutput':
      return 'TEXT_OUTPUT';
    case 'ImageOutput':
      return 'IMAGE_OUTPUT';
    case 'AudioOutput':
      return 'AUDIO_OUTPUT';
    case 'Streaming':
      return 'STREAMING';
    case 'ToolCalling':
      return 'TOOL_CALLING';
    case 'StructuredOutput':
      return 'STRUCTURED_OUTPUT';
  }
}

export function mapAccountPublic(row: {
  id: string;
  name: string;
  providerType: Prisma.AiProviderTypeV2;
  apiKeyMasked: string;
  endpoint: string | null;
  apiVersion: string | null;
  billingEmail: string | null;
  isSystem: boolean;
  isActive: boolean;
  description: string | null;
  apiKeyUpdatedAt: Date;
  apiKeyUpdatedBy: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}): AiProviderAccountV2Public {
  const providerType = mapProviderTypeFromPrisma(row.providerType);
  return {
    id: row.id,
    name: row.name,
    providerType,
    providerLabel: AI_PROVIDER_LABELS_V2[providerType],
    apiKeyMasked: row.apiKeyMasked,
    endpoint: row.endpoint,
    apiVersion: row.apiVersion,
    billingEmail: row.billingEmail,
    isSystem: row.isSystem,
    isActive: row.isActive,
    description: row.description,
    apiKeyUpdatedAt: row.apiKeyUpdatedAt.toISOString(),
    apiKeyUpdatedBy: row.apiKeyUpdatedBy,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function buildCreditSummary(input: {
  purchasedCreditUsd: number;
  manualAdjustmentUsd: number;
  usedCreditUsd: number;
}): AiProviderAccountV2CreditSummary {
  const totalCreditUsd = input.purchasedCreditUsd + input.manualAdjustmentUsd;
  const remainingCreditUsd = totalCreditUsd - input.usedCreditUsd;
  return {
    totalCreditUsd,
    purchasedCreditUsd: input.purchasedCreditUsd,
    manualAdjustmentUsd: input.manualAdjustmentUsd,
    usedCreditUsd: input.usedCreditUsd,
    remainingCreditUsd,
  };
}

export function mapModelPublic(row: {
  id: string;
  aiProviderAccountId: string;
  name: string;
  providerModelId: string;
  modelType: Prisma.AiProviderModelTypeV2;
  isSystem: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  capabilities: Array<{ capabilityType: Prisma.AiProviderModelCapabilityTypeV2 }>;
}): AiProviderModelV2Public {
  return {
    id: row.id,
    aiProviderAccountId: row.aiProviderAccountId,
    name: row.name,
    providerModelId: row.providerModelId,
    modelType: mapModelTypeFromPrisma(row.modelType),
    isSystem: row.isSystem,
    isActive: row.isActive,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    capabilities: row.capabilities.map((c) => mapCapabilityFromPrisma(c.capabilityType)),
  };
}

export { toNumber };

