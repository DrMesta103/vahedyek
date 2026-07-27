import type { AiProviderModelTypeV2 } from './types/ai-provider-v2';

/** Configurable AI capabilities for a Taavia brand. */
export const TAAVIA_BRAND_AI_MODEL_PURPOSES = [
  'TEXT_GENERATION',
  'SPEECH_TO_TEXT',
  'TEXT_TO_SPEECH',
  'DOCUMENT_EXTRACTION',
] as const;

export type TaaviaBrandAiModelPurpose = (typeof TAAVIA_BRAND_AI_MODEL_PURPOSES)[number];

export const TAAVIA_PURPOSE_LABELS: Record<TaaviaBrandAiModelPurpose, string> = {
  TEXT_GENERATION: 'چت و پاسخ‌گویی',
  SPEECH_TO_TEXT: 'تبدیل صدا به متن',
  TEXT_TO_SPEECH: 'تبدیل متن به صدا',
  DOCUMENT_EXTRACTION: 'خواندن سند و تصویر (OCR)',
};

/** Short, end-user-friendly descriptions shown under each capability title. */
export const TAAVIA_PURPOSE_DESCRIPTIONS: Record<TaaviaBrandAiModelPurpose, string> = {
  TEXT_GENERATION:
    'جواب‌های متنی چت‌بات را می‌سازد؛ وقتی مشتری سؤال می‌پرسد، همین مدل پاسخ می‌دهد.',
  SPEECH_TO_TEXT:
    'پیام صوتی یا صحبت مشتری را به متن تبدیل می‌کند تا سیستم بتواند آن را بفهمد.',
  TEXT_TO_SPEECH:
    'پاسخ‌های متنی را به صدای قابل‌پخش تبدیل می‌کند؛ مناسب پاسخ صوتی به مشتری.',
  DOCUMENT_EXTRACTION:
    'از عکس یا فایل (مثل کاتالوگ، فاکتور یا کارت ویزیت) اطلاعات را می‌خواند و استخراج می‌کند.',
};

/** Rich guides for tooltips and helper copy (non-technical users). */
export const TAAVIA_PURPOSE_GUIDES: Record<
  TaaviaBrandAiModelPurpose,
  { tip: string; example: string; whenToUse: string }
> = {
  TEXT_GENERATION: {
    tip: 'این مدل مثل «مغز متنی» برند شماست. سؤال مشتری را می‌خواند و جواب مناسب می‌نویسد.',
    example: 'مشتری می‌پرسد «ساعات کاری‌تان چیست؟» → چت‌بات جواب متنی می‌دهد.',
    whenToUse: 'برای گفتگو، پشتیبانی، توضیح محصول و هر پاسخ متنی.',
  },
  SPEECH_TO_TEXT: {
    tip: 'اگر مشتری به‌جای تایپ، صدا بفرستد، این مدل صدا را به نوشته تبدیل می‌کند.',
    example: 'مشتری یک ویس می‌فرستد: «قیمت این محصول چقدره؟» → سیستم آن را به متن تبدیل می‌کند.',
    whenToUse: 'وقتی ورودی صوتی دارید و می‌خواهید سیستم حرف مشتری را بفهمد.',
  },
  TEXT_TO_SPEECH: {
    tip: 'اگر بخواهید جواب چت‌بات با صدا پخش شود، این مدل متن را به گفتار تبدیل می‌کند.',
    example: 'چت‌بات می‌نویسد «سفارش شما ثبت شد» → همان جمله با صدا برای مشتری پخش می‌شود.',
    whenToUse: 'برای پاسخ صوتی، راهنمای شنیداری یا تجربه بدون نیاز به خواندن متن.',
  },
  DOCUMENT_EXTRACTION: {
    tip: 'این مدل متن و اطلاعات داخل عکس یا PDF را می‌خواند؛ مثل اینکه کسی سند را برایتان تایپ کند.',
    example: 'آپلود عکس کارت ویزیت یا کاتالوگ → نام، قیمت و مشخصات استخراج می‌شود.',
    whenToUse: 'برای خواندن اسناد، تصاویر محصول، فاکتور و فایل‌های برند.',
  },
};

/** Keep broader catalog labels for non-brand-configurable model types. */
export const TAAVIA_ALL_PURPOSE_DESCRIPTIONS: Record<string, string> = {
  ...TAAVIA_PURPOSE_DESCRIPTIONS,
  EMBEDDING: 'مدل بردارسازی برای جست‌وجوی معنایی.',
  RERANKING: 'مدل رتبه‌بندی نتایج بازیابی‌شده.',
  IMAGE_GENERATION: 'مدل تولید تصویر.',
  MODERATION: 'مدل پایش و moderation محتوا.',
};

export const TAAVIA_OPERATION_CODES = {
  KNOWLEDGE_BASE_BUILD: 'knowledge-base-build',
  CUSTOMER_CHAT_RESPONSE: 'customer-chat-response',
  ADMIN_AGENT_RESPONSE: 'admin-agent-response',
  BRAND_INFO_OCR: 'brand-info-ocr',
  KNOWLEDGE_EMBEDDING: 'knowledge-embedding',
  KNOWLEDGE_RERANKING: 'knowledge-reranking',
  BRAND_INFO_SPEECH_TO_TEXT: 'brand-info-speech-to-text',
  BRAND_INFO_VISION_ANALYSIS: 'brand-info-vision-analysis',
} as const;

export const TAAVIA_RESOURCE_TYPES = {
  KNOWLEDGE_BUILD: 'knowledge-build',
  CONVERSATION_MESSAGE: 'conversation-message',
  BRAND_INFO: 'brand-info',
  DOCUMENT: 'document',
  KNOWLEDGE_NODE: 'knowledge-node',
} as const;

type ModelForCompatibility = {
  modelType: AiProviderModelTypeV2 | string;
  capabilities?: Array<string>;
};

function normalizedModelType(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

export function getPurposeCompatibility(purpose: TaaviaBrandAiModelPurpose, model: ModelForCompatibility) {
  const modelType = normalizedModelType(model.modelType);
  const compatible = modelType === purpose;
  return {
    compatible,
    preferred: compatible,
    reason: compatible
      ? `مدل با نوع «${TAAVIA_PURPOSE_LABELS[purpose]}» سازگار است.`
      : `برای «${TAAVIA_PURPOSE_LABELS[purpose]}» فقط مدل‌های سازگار با همین کاربرد قابل انتخاب هستند.`,
  };
}

export function assertValidPurpose(value: unknown): asserts value is TaaviaBrandAiModelPurpose {
  if (typeof value !== 'string' || !(TAAVIA_BRAND_AI_MODEL_PURPOSES as readonly string[]).includes(value)) {
    throw new Error('نوع مدل انتخاب‌شده معتبر نیست.');
  }
}
