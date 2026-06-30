export type OcrSimulationSourceType = 'sample' | 'upload';
export type OcrSimulationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type OcrSimulationField = {
  key: string;
  label: string;
  value: string;
};

export type OcrSampleLane = 'quick' | 'long';

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
  fields: OcrSimulationField[];
  sampleText: string;
};

export const OCR_QUICK_SAMPLE_IDS = ['invoice', 'id-card', 'receipt'] as const;
export const OCR_LONG_SAMPLE_IDS = ['contract'] as const;

export const OCR_SAMPLE_LIBRARY: OcrSampleDocument[] = [
  {
    id: 'invoice',
    lane: 'quick',
    title: 'فاکتور فروش',
    description: 'استخراج سریع اقلام، مالیات و جمع کل.',
    fileName: 'invoice-taav-1048.pdf',
    fileType: 'application/pdf',
    previewLines: ['TAAV Trading', 'Invoice #1048', 'Total: 5,400,000 IRR', 'VAT: 9%'],
    tokensUsed: 4200,
    confidence: 98,
    pageCount: 2,
    summary: 'اطلاعات اصلی فاکتور با دقت بالا استخراج شد و برای اتصال به مرحله‌ی بعدی آماده است.',
    fields: [
      { key: 'invoiceNumber', label: 'شماره فاکتور', value: '1048' },
      { key: 'invoiceDate', label: 'تاریخ', value: '1405/04/08' },
      { key: 'seller', label: 'فروشنده', value: 'آزمایشگاه هوش مصنوعی تاو' },
      { key: 'total', label: 'مبلغ کل', value: '5,400,000 تومان' },
      { key: 'status', label: 'وضعیت', value: 'تأیید شده' },
    ],
    sampleText:
      'TAAV Trading\nInvoice #1048\nCustomer: TAAV Labs\nTotal: 5,400,000 IRR\nVAT: 9%\nStatus: Paid',
  },
  {
    id: 'id-card',
    lane: 'quick',
    title: 'کارت ملی',
    description: 'شناسایی فیلدهای هویتی ساختارمند.',
    fileName: 'melli-taav-front.jpg',
    fileType: 'image/jpeg',
    previewLines: ['نام و نام خانوادگی', 'شماره ملی', 'تاریخ تولد', 'محل صدور'],
    tokensUsed: 2800,
    confidence: 92,
    pageCount: 1,
    summary: 'فیلدهای هویتی ساختارمند شناسایی شد و برای اعتبارسنجی آماده است.',
    fields: [
      { key: 'fullName', label: 'نام', value: 'علی علوی' },
      { key: 'nationalId', label: 'شماره ملی', value: '۱۲۳۴۵۶۷۸۹۰' },
      { key: 'birthDate', label: 'تاریخ تولد', value: '۱۳۷۵/۰۳/۱۸' },
      { key: 'issueCity', label: 'محل صدور', value: 'تهران' },
      { key: 'match', label: 'تطبیق', value: 'موفق' },
    ],
    sampleText:
      'نام و نام خانوادگی: علی علوی\nشماره ملی: 1234567890\nتاریخ تولد: 1375/03/18\nمحل صدور: تهران',
  },
  {
    id: 'receipt',
    lane: 'quick',
    title: 'رسید پرداخت',
    description: 'پردازش کوتاه برای تست سرعت OCR.',
    fileName: 'receipt-taav-8991.png',
    fileType: 'image/png',
    previewLines: ['رسید پرداخت', 'کد پیگیری: 8991', 'مبلغ: 780,000', 'وضعیت: موفق'],
    tokensUsed: 2100,
    confidence: 90,
    pageCount: 1,
    summary: 'رسید پرداخت با چند فیلد کوتاه و قابل اتصال به جریان مالی استخراج شد.',
    fields: [
      { key: 'tracking', label: 'کد پیگیری', value: '8991' },
      { key: 'amount', label: 'مبلغ', value: '780,000 تومان' },
      { key: 'status', label: 'وضعیت', value: 'موفق' },
      { key: 'channel', label: 'کانال', value: 'درگاه آنلاین' },
      { key: 'confidence', label: 'اعتماد', value: '90%' },
    ],
    sampleText: 'رسید پرداخت\nTracking: 8991\nAmount: 780,000 IRR\nStatus: successful payment',
  },
  {
    id: 'contract',
    lane: 'long',
    title: 'قرارداد واحد',
    description: 'پردازش چندصفحه‌ای با بندهای حقوقی و متنی.',
    fileName: 'taav-contract-2026.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    previewLines: ['قرارداد واحد', 'طرف اول: تاو', 'طرف دوم: شریک تجاری', 'مدت: ۱۲ ماه'],
    tokensUsed: 5100,
    confidence: 95,
    pageCount: 6,
    summary: 'بندهای کلیدی، طرفین قرارداد و مدت همکاری با ساختار قابل پردازش استخراج شدند.',
    fields: [
      { key: 'documentType', label: 'نوع سند', value: 'قرارداد واحد' },
      { key: 'partyA', label: 'طرف اول', value: 'آزمایشگاه هوش مصنوعی تاو' },
      { key: 'partyB', label: 'طرف دوم', value: 'سازمان همکار' },
      { key: 'duration', label: 'مدت', value: '۱۲ ماه' },
      { key: 'confidence', label: 'اعتماد', value: '95%' },
    ],
    sampleText:
      'قرارداد واحد\nطرف اول: آزمایشگاه هوش مصنوعی تاو\nطرف دوم: سازمان همکار\nمدت: ۱۲ ماه\nموضوع: OCR testing',
  },
];

export function getOcrSamplesByLane(lane: OcrSampleLane) {
  return OCR_SAMPLE_LIBRARY.filter((sample) => sample.lane === lane);
}

export function getOcrSampleById(sampleId: string) {
  return OCR_SAMPLE_LIBRARY.find((sample) => sample.id === sampleId) ?? null;
}
