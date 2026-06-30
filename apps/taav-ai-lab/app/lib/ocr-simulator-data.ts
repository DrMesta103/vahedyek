export type OcrSimulationSourceType = 'sample' | 'upload';
export type OcrSimulationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type OcrSampleLane = 'quick' | 'long';
export type OcrTemplateScenario = 'recognize' | 'miss';

export type OcrTemplateFieldType = 'string' | 'number' | 'date' | 'boolean';
export type OcrFieldValidationStatus = 'valid' | 'invalid' | 'missing' | 'not_applicable';
export type OcrFieldReviewStatus = 'accepted' | 'needs_review' | 'rejected';
export type OcrOverallStatus = 'completed' | 'completed_with_review_required' | 'failed' | 'needs_review';

export type OcrTemplateValidation = {
  regex?: string;
  min_length?: number;
  max_length?: number;
  min?: number;
  max?: number;
};

export type OcrTemplateNormalization = {
  remove_spaces?: boolean;
  convert_persian_digits?: boolean;
  trim?: boolean;
  uppercase?: boolean;
  collapse_spaces?: boolean;
};

export type OcrTemplateFieldSchema = {
  key: string;
  label: string;
  description: string;
  type: OcrTemplateFieldType;
  required: boolean;
  validation?: OcrTemplateValidation;
  normalization?: OcrTemplateNormalization;
};

export type OcrTemplateInputSchema = {
  fields: OcrTemplateFieldSchema[];
};

export type OcrTemplateOutputField = {
  key: string;
  value: string;
  normalized_value: string;
  confidence: number;
  validation_status: OcrFieldValidationStatus;
  review_status: OcrFieldReviewStatus;
  warnings: string[];
};

export type OcrTemplateOutputResult = {
  overall_status: OcrOverallStatus;
  fields: OcrTemplateOutputField[];
  message?: string;
};

export type OcrTemplateScenarioResult = {
  label: string;
  confidence: number;
  tokensUsed: number;
  summary: string;
  previewLines: string[];
  result: OcrTemplateOutputResult;
  warnings: string[];
  error?: string | null;
};

export type OcrSampleDocument = {
  id: string;
  title: string;
  description: string;
  lane: OcrSampleLane;
  fileName: string;
  fileType: string;
  previewLines: string[];
  tokensUsed: number;
  confidence: number;
  pageCount: number;
  summary: string;
  prompt: string;
  inputSchema: OcrTemplateInputSchema;
  expectedResult: OcrTemplateOutputResult;
  sampleText: string;
  scenarios: Partial<Record<OcrTemplateScenario, OcrTemplateScenarioResult>> & {
    recognize: OcrTemplateScenarioResult;
  };
};

export const OCR_QUICK_SAMPLE_IDS = ['invoice', 'id-card', 'receipt'] as const;
export const OCR_LONG_SAMPLE_IDS = ['contract'] as const;

function field(
  key: string,
  label: string,
  description: string,
  type: OcrTemplateFieldType,
  required = true,
  validation?: OcrTemplateValidation,
  normalization?: OcrTemplateNormalization,
): OcrTemplateFieldSchema {
  return { key, label, description, type, required, validation, normalization };
}

function resultField(
  key: string,
  value: string,
  normalizedValue: string,
  confidence: number,
  validation_status: OcrFieldValidationStatus,
  review_status: OcrFieldReviewStatus,
  warnings: string[] = [],
): OcrTemplateOutputField {
  return { key, value, normalized_value: normalizedValue, confidence, validation_status, review_status, warnings };
}

function normalizedWarnings(result: OcrTemplateOutputResult) {
  return result.fields.flatMap((item) => item.warnings);
}

export const OCR_SAMPLE_LIBRARY: OcrSampleDocument[] = [
  {
    id: 'invoice',
    lane: 'quick',
    title: 'فاکتور فروش',
    description: 'قالبی برای استخراج ساختاریافته‌ی فیلدهای مالی از فاکتور فروش.',
    fileName: 'invoice-taav-1048.pdf',
    fileType: 'application/pdf',
    previewLines: ['TAAV Trading', 'Invoice #1048', 'Total: 5,400,000 IRR', 'VAT: 9%'],
    tokensUsed: 4200,
    confidence: 98,
    pageCount: 2,
    summary: 'فاکتور فروش با دقت بالا به ساختار schema -> result تبدیل می‌شود.',
    prompt: 'از روی فاکتور فروش، شماره فاکتور، تاریخ، فروشنده، جمع کل، وضعیت پرداخت و نرخ مالیات را استخراج کن.',
    inputSchema: {
      fields: [
        field('invoice_number', 'شماره فاکتور', 'شناسه یکتا برای فاکتور', 'string', true, { regex: '^[0-9A-Za-z-]+$' }, { trim: true, collapse_spaces: true, uppercase: true }),
        field('invoice_date', 'تاریخ فاکتور', 'تاریخ صدور فاکتور', 'date', true, { regex: '^[0-9]{4}/[0-9]{2}/[0-9]{2}$' }, { trim: true, convert_persian_digits: true }),
        field('seller_name', 'فروشنده', 'نام یا برند فروشنده', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('total_amount', 'جمع کل', 'مبلغ نهایی قابل پرداخت', 'number', true, { min: 0 }, { trim: true, convert_persian_digits: true, remove_spaces: true }),
        field('tax_rate', 'نرخ مالیات', 'نرخ VAT یا مالیات', 'number', false, { min: 0, max: 100 }, { trim: true, convert_persian_digits: true }),
        field('payment_status', 'وضعیت پرداخت', 'پرداخت شده، معوق یا نامشخص', 'string', false, { min_length: 2 }, { trim: true, collapse_spaces: true }),
      ],
    },
    expectedResult: {
      overall_status: 'completed_with_review_required',
      fields: [
        resultField('invoice_number', '1048', '1048', 0.99, 'valid', 'accepted'),
        resultField('invoice_date', '1405/04/08', '1405/04/08', 0.98, 'valid', 'accepted'),
        resultField('seller_name', 'آزمایشگاه هوش مصنوعی تاو', 'آزمایشگاه هوش مصنوعی تاو', 0.97, 'valid', 'accepted'),
        resultField('total_amount', '5,400,000 تومان', '5400000', 0.96, 'valid', 'accepted'),
        resultField('tax_rate', '9%', '9', 0.91, 'valid', 'accepted', ['normalized_from_percent_format']),
        resultField('payment_status', 'پرداخت شده', 'پرداخت شده', 0.88, 'valid', 'needs_review', ['low_confidence']),
      ],
    },
    sampleText:
      'TAAV Trading\nInvoice #1048\nCustomer: TAAV Labs\nTotal: 5,400,000 IRR\nVAT: 9%\nStatus: Paid',
    scenarios: {
      recognize: {
        label: 'تشخیص استاندارد',
        confidence: 98,
        tokensUsed: 4200,
        summary: 'فاکتور فروش با دقت بالا خوانده شد و خروجی ساختاریافته آماده‌ی اتصال به سرویس بعدی است.',
        previewLines: ['TAAV Trading', 'Invoice #1048', 'Total: 5,400,000 IRR', 'VAT: 9%'],
        result: {
          overall_status: 'completed_with_review_required',
          fields: [
            resultField('invoice_number', '1048', '1048', 0.99, 'valid', 'accepted'),
            resultField('invoice_date', '1405/04/08', '1405/04/08', 0.98, 'valid', 'accepted'),
            resultField('seller_name', 'آزمایشگاه هوش مصنوعی تاو', 'آزمایشگاه هوش مصنوعی تاو', 0.97, 'valid', 'accepted'),
            resultField('total_amount', '5,400,000 تومان', '5400000', 0.96, 'valid', 'accepted'),
            resultField('tax_rate', '9%', '9', 0.91, 'valid', 'accepted', ['normalized_from_percent_format']),
            resultField('payment_status', 'پرداخت شده', 'پرداخت شده', 0.88, 'valid', 'needs_review', ['low_confidence']),
          ],
        },
        warnings: ['فیلد payment_status برای review دستی علامت‌گذاری شد.'],
      },
    },
  },
  {
    id: 'id-card',
    lane: 'quick',
    title: 'کارت ملی',
    description: 'قالب هویتی برای شبیه‌سازی OCR کارت ملی با دو سناریوی تشخیص و عدم تشخیص.',
    fileName: 'melli-taav-front.jpg',
    fileType: 'image/jpeg',
    previewLines: ['نام و نام خانوادگی', 'شماره ملی', 'تاریخ تولد', 'محل صدور'],
    tokensUsed: 2800,
    confidence: 92,
    pageCount: 1,
    summary: 'فیلدهای هویتی ساختارمند شناسایی می‌شوند و برای اعتبارسنجی آماده هستند.',
    prompt: 'از تصویر کارت ملی، نام، نام خانوادگی، شماره ملی، تاریخ تولد، محل صدور و شماره سریال را استخراج کن.',
    inputSchema: {
      fields: [
        field('national_code', 'کد ملی', 'کد ملی ۱۰ رقمی ایران', 'string', true, { regex: '^[0-9]{10}$', min_length: 10, max_length: 10 }, { trim: true, remove_spaces: true, convert_persian_digits: true }),
        field('first_name', 'نام', 'نام کوچک دارنده کارت', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('last_name', 'نام خانوادگی', 'نام خانوادگی دارنده کارت', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('birth_date', 'تاریخ تولد', 'تاریخ تولد روی کارت', 'date', true, { regex: '^[0-9]{4}/[0-9]{2}/[0-9]{2}$' }, { trim: true, convert_persian_digits: true }),
        field('issue_place', 'محل صدور', 'شهر یا محل صدور کارت', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('serial_number', 'شماره سریال', 'شماره سریال کارت', 'string', false, { min_length: 4 }, { trim: true, remove_spaces: true, uppercase: true }),
      ],
    },
    expectedResult: {
      overall_status: 'completed_with_review_required',
      fields: [
        resultField('national_code', '۰۰۱۲۳۴۵۶۷۸', '0012345678', 0.96, 'valid', 'accepted', ['persian_digits_normalized']),
        resultField('first_name', 'علی', 'علی', 0.97, 'valid', 'accepted'),
        resultField('last_name', 'علوی', 'علوی', 0.95, 'valid', 'accepted'),
        resultField('birth_date', '۱۳۷۵/۰۳/۱۸', '1375/03/18', 0.94, 'valid', 'accepted', ['persian_digits_normalized']),
        resultField('issue_place', 'تهران', 'تهران', 0.9, 'valid', 'needs_review', ['low_confidence']),
        resultField('serial_number', 'AB123456', 'AB123456', 0.88, 'valid', 'accepted'),
      ],
    },
    sampleText: 'نام و نام خانوادگی: علی علوی\nشماره ملی: 1234567890\nتاریخ تولد: 1375/03/18\nمحل صدور: تهران',
    scenarios: {
      recognize: {
        label: 'AI تشخیص بدهد',
        confidence: 92,
        tokensUsed: 2800,
        summary: 'کارت ملی با confidence مناسب تشخیص داده شد و برخی فیلدها برای review سبک علامت‌گذاری شدند.',
        previewLines: ['نام و نام خانوادگی', 'شماره ملی', 'تاریخ تولد', 'محل صدور'],
        result: {
          overall_status: 'completed_with_review_required',
          fields: [
            resultField('national_code', '۰۰۱۲۳۴۵۶۷۸', '0012345678', 0.96, 'valid', 'accepted', ['persian_digits_normalized']),
            resultField('first_name', 'علی', 'علی', 0.97, 'valid', 'accepted'),
            resultField('last_name', 'علوی', 'علوی', 0.95, 'valid', 'accepted'),
            resultField('birth_date', '۱۳۷۵/۰۳/۱۸', '1375/03/18', 0.94, 'valid', 'accepted', ['persian_digits_normalized']),
            resultField('issue_place', 'تهران', 'تهران', 0.9, 'valid', 'needs_review', ['low_confidence']),
            resultField('serial_number', 'AB123456', 'AB123456', 0.88, 'valid', 'accepted'),
          ],
        },
        warnings: ['محل صدور با confidence پایین‌تر برای review دستی نگه داشته شد.'],
      },
      miss: {
        label: 'AI تشخیص ندهد',
        confidence: 18,
        tokensUsed: 1400,
        summary: 'کارت ملی با اطمینان کافی شناسایی نشد و باید تصویر واضح‌تر یا زاویه‌ی بهتر ارسال شود.',
        previewLines: ['کارت ملی', 'لبه‌های سند ناقص', 'متن کافی برای استخراج نبود', 'نیاز به تصویر واضح‌تر'],
        result: {
          overall_status: 'failed',
          message: 'کارت ملی با اطمینان کافی تشخیص داده نشد.',
          fields: [
            resultField('national_code', '', '', 0.14, 'missing', 'rejected', ['document_not_detected']),
            resultField('first_name', '', '', 0.1, 'missing', 'rejected', ['document_not_detected']),
            resultField('last_name', '', '', 0.1, 'missing', 'rejected', ['document_not_detected']),
            resultField('birth_date', '', '', 0.09, 'missing', 'rejected', ['document_not_detected']),
            resultField('issue_place', '', '', 0.08, 'missing', 'rejected', ['document_not_detected']),
            resultField('serial_number', '', '', 0.08, 'missing', 'rejected', ['document_not_detected']),
          ],
        },
        warnings: [
          'AI کارت ملی را با اطمینان کافی تشخیص نداد.',
          'برای تست سناریوی fallback، یک تصویر واضح‌تر ارسال کنید.',
        ],
        error: 'کارت ملی شناسایی نشد.',
      },
    },
  },
  {
    id: 'receipt',
    lane: 'quick',
    title: 'رسید پرداخت',
    description: 'قالب کوتاه برای تست سرعت OCR و استخراج اطلاعات تراکنش.',
    fileName: 'receipt-taav-8991.png',
    fileType: 'image/png',
    previewLines: ['رسید پرداخت', 'کد پیگیری: 8991', 'مبلغ: 780,000', 'وضعیت: موفق'],
    tokensUsed: 2100,
    confidence: 90,
    pageCount: 1,
    summary: 'رسید پرداخت با چند فیلد کوتاه و قابل اتصال به جریان مالی استخراج شد.',
    prompt: 'از رسید پرداخت، کد پیگیری، مبلغ، وضعیت، کانال پرداخت و زمان تراکنش را استخراج کن.',
    inputSchema: {
      fields: [
        field('tracking_code', 'کد پیگیری', 'شناسه پیگیری تراکنش', 'string', true, { min_length: 4 }, { trim: true, remove_spaces: true, uppercase: true }),
        field('amount', 'مبلغ', 'مبلغ پرداختی', 'number', true, { min: 0 }, { trim: true, convert_persian_digits: true, remove_spaces: true }),
        field('status', 'وضعیت', 'وضعیت موفق یا ناموفق تراکنش', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('payment_channel', 'کانال پرداخت', 'درگاه، کارت‌به‌کارت یا نقدی', 'string', false, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('transaction_time', 'زمان تراکنش', 'تاریخ و ساعت ثبت تراکنش', 'string', false, { min_length: 4 }, { trim: true }),
      ],
    },
    expectedResult: {
      overall_status: 'completed',
      fields: [
        resultField('tracking_code', '8991', '8991', 0.98, 'valid', 'accepted'),
        resultField('amount', '780,000 تومان', '780000', 0.96, 'valid', 'accepted'),
        resultField('status', 'موفق', 'موفق', 0.97, 'valid', 'accepted'),
        resultField('payment_channel', 'درگاه آنلاین', 'درگاه آنلاین', 0.91, 'valid', 'accepted'),
        resultField('transaction_time', '1405/04/08 14:22', '1405/04/08 14:22', 0.89, 'valid', 'needs_review', ['low_confidence']),
      ],
    },
    sampleText: 'رسید پرداخت\nTracking: 8991\nAmount: 780,000 IRR\nStatus: successful payment',
    scenarios: {
      recognize: {
        label: 'تشخیص استاندارد',
        confidence: 90,
        tokensUsed: 2100,
        summary: 'رسید پرداخت با چند فیلد کوتاه و خروجی آماده‌ی پردازش مالی استخراج شد.',
        previewLines: ['رسید پرداخت', 'کد پیگیری: 8991', 'مبلغ: 780,000', 'وضعیت: موفق'],
        result: {
          overall_status: 'completed',
          fields: [
            resultField('tracking_code', '8991', '8991', 0.98, 'valid', 'accepted'),
            resultField('amount', '780,000 تومان', '780000', 0.96, 'valid', 'accepted'),
            resultField('status', 'موفق', 'موفق', 0.97, 'valid', 'accepted'),
            resultField('payment_channel', 'درگاه آنلاین', 'درگاه آنلاین', 0.91, 'valid', 'accepted'),
            resultField('transaction_time', '1405/04/08 14:22', '1405/04/08 14:22', 0.89, 'valid', 'needs_review', ['low_confidence']),
          ],
        },
        warnings: ['فیلد transaction_time برای review سبک نگه داشته شد.'],
      },
    },
  },
  {
    id: 'contract',
    lane: 'long',
    title: 'قرارداد واحد',
    description: 'قالب چندصفحه‌ای برای استخراج بندها و طرفین قرارداد با ساختار طولانی‌تر.',
    fileName: 'taav-contract-2026.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    previewLines: ['قرارداد واحد', 'طرف اول: تاو', 'طرف دوم: شریک تجاری', 'مدت: ۱۲ ماه'],
    tokensUsed: 5100,
    confidence: 95,
    pageCount: 6,
    summary: 'بندهای کلیدی، طرفین قرارداد و مدت همکاری با ساختار قابل پردازش استخراج شدند.',
    prompt: 'از قرارداد واحد، نوع سند، طرفین، مدت، موضوع اصلی و تاریخ شروع را استخراج کن.',
    inputSchema: {
      fields: [
        field('document_type', 'نوع سند', 'نوع قرارداد یا سند حقوقی', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('party_a', 'طرف اول', 'نام طرف اول قرارداد', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('party_b', 'طرف دوم', 'نام طرف دوم قرارداد', 'string', true, { min_length: 2 }, { trim: true, collapse_spaces: true }),
        field('duration_months', 'مدت', 'مدت همکاری به ماه', 'number', true, { min: 1, max: 120 }, { trim: true, convert_persian_digits: true }),
        field('subject', 'موضوع', 'موضوع اصلی قرارداد', 'string', true, { min_length: 5 }, { trim: true, collapse_spaces: true }),
        field('start_date', 'تاریخ شروع', 'تاریخ شروع قرارداد', 'date', false, { regex: '^[0-9]{4}/[0-9]{2}/[0-9]{2}$' }, { trim: true, convert_persian_digits: true }),
      ],
    },
    expectedResult: {
      overall_status: 'completed_with_review_required',
      fields: [
        resultField('document_type', 'قرارداد واحد', 'قرارداد واحد', 0.98, 'valid', 'accepted'),
        resultField('party_a', 'آزمایشگاه هوش مصنوعی تاو', 'آزمایشگاه هوش مصنوعی تاو', 0.97, 'valid', 'accepted'),
        resultField('party_b', 'سازمان همکار', 'سازمان همکار', 0.95, 'valid', 'accepted'),
        resultField('duration_months', '۱۲', '12', 0.96, 'valid', 'accepted', ['persian_digits_normalized']),
        resultField('subject', 'OCR testing', 'OCR testing', 0.94, 'valid', 'accepted'),
        resultField('start_date', '1405/04/08', '1405/04/08', 0.88, 'valid', 'needs_review', ['date_inferred']),
      ],
    },
    sampleText: 'قرارداد واحد\nطرف اول: آزمایشگاه هوش مصنوعی تاو\nطرف دوم: سازمان همکار\nمدت: ۱۲ ماه\nموضوع: OCR testing',
    scenarios: {
      recognize: {
        label: 'تشخیص استاندارد',
        confidence: 95,
        tokensUsed: 5100,
        summary: 'بندهای اصلی قرارداد با confidence بالا استخراج شدند و یک فیلد برای review دستی باقی ماند.',
        previewLines: ['قرارداد واحد', 'طرف اول: تاو', 'طرف دوم: شریک تجاری', 'مدت: ۱۲ ماه'],
        result: {
          overall_status: 'completed_with_review_required',
          fields: [
            resultField('document_type', 'قرارداد واحد', 'قرارداد واحد', 0.98, 'valid', 'accepted'),
            resultField('party_a', 'آزمایشگاه هوش مصنوعی تاو', 'آزمایشگاه هوش مصنوعی تاو', 0.97, 'valid', 'accepted'),
            resultField('party_b', 'سازمان همکار', 'سازمان همکار', 0.95, 'valid', 'accepted'),
            resultField('duration_months', '۱۲', '12', 0.96, 'valid', 'accepted', ['persian_digits_normalized']),
            resultField('subject', 'OCR testing', 'OCR testing', 0.94, 'valid', 'accepted'),
            resultField('start_date', '1405/04/08', '1405/04/08', 0.88, 'valid', 'needs_review', ['date_inferred']),
          ],
        },
        warnings: ['start_date به‌صورت inferred برگردانده شد.'],
      },
    },
  },
];

export function getOcrSamplesByLane(lane: OcrSampleLane) {
  return OCR_SAMPLE_LIBRARY.filter((sample) => sample.lane === lane);
}

export function getOcrSampleById(sampleId: string) {
  return OCR_SAMPLE_LIBRARY.find((sample) => sample.id === sampleId) ?? null;
}

export function getOcrTemplateInputJson(sample: OcrSampleDocument) {
  return sample.inputSchema;
}

export function getOcrTemplateResultJson(sample: OcrSampleDocument) {
  return sample.expectedResult;
}

export function getOcrScenarioResult(sample: OcrSampleDocument, scenario: OcrTemplateScenario) {
  return sample.scenarios[scenario] ?? sample.scenarios.recognize;
}

export function getOcrScenarioWarnings(sample: OcrSampleDocument, scenario: OcrTemplateScenario) {
  return getOcrScenarioResult(sample, scenario).warnings.length
    ? getOcrScenarioResult(sample, scenario).warnings
    : normalizedWarnings(getOcrScenarioResult(sample, scenario).result);
}
