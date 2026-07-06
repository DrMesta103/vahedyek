export type AiToolStatus = 'active' | 'coming-soon';

export type AiToolIconKey =
  | 'ocr'
  | 'speech-to-text'
  | 'text-to-speech'
  | 'web-scraper'
  | 'video-analysis'
  | 'live-voice'
  | 'file-summary'
  | 'smart-category'
  | 'structured-extraction';

export type AiToolDefinition = {
  key: string;
  title: string;
  description: string;
  status: AiToolStatus;
  icon: AiToolIconKey;
  segment?: string;
  ctaLabel?: string;
};

export const AI_TOOLS_CATALOG: AiToolDefinition[] = [
  {
    key: 'ocr',
    title: 'OCR / Document AI',
    description: 'تشخیص متن از تصاویر و اسناد و استخراج اطلاعات متنی',
    status: 'active',
    icon: 'ocr',
    segment: 'ocr',
    ctaLabel: 'ورود به شبیه‌ساز OCR',
  },
  {
    key: 'speech-to-text',
    title: 'گفتار به متن',
    description: 'تبدیل گفتار به متن با دقت بالا',
    status: 'coming-soon',
    icon: 'speech-to-text',
  },
  {
    key: 'text-to-speech',
    title: 'متن به گفتار',
    description: 'تبدیل متن به گفتار طبیعی',
    status: 'coming-soon',
    icon: 'text-to-speech',
  },
  {
    key: 'web-scraper',
    title: 'وب اسکرپر',
    description: 'استخراج داده از وب‌سایت‌ها',
    status: 'coming-soon',
    icon: 'web-scraper',
  },
  {
    key: 'video-analysis',
    title: 'تحلیل ویدیو',
    description: 'تحلیل محتوای ویدیویی با هوش مصنوعی',
    status: 'coming-soon',
    icon: 'video-analysis',
  },
  {
    key: 'live-voice',
    title: 'گفت‌وگوی صوتی زنده',
    description: 'مکالمه صوتی زنده با هوش مصنوعی',
    status: 'coming-soon',
    icon: 'live-voice',
  },
  {
    key: 'file-summary',
    title: 'خلاصه‌سازی فایل',
    description: 'خلاصه‌سازی هوشمند اسناد و فایل‌ها',
    status: 'coming-soon',
    icon: 'file-summary',
  },
  {
    key: 'smart-category',
    title: 'دسته‌بندی هوشمند',
    description: 'دسته‌بندی خودکار داده‌ها و محتوا',
    status: 'coming-soon',
    icon: 'smart-category',
  },
  {
    key: 'structured-extraction',
    title: 'استخراج اطلاعات ساختاریافته',
    description: 'استخراج اطلاعات ساختاریافته از متن',
    status: 'coming-soon',
    icon: 'structured-extraction',
  },
];

export function getAiToolsStats() {
  const activeCount = AI_TOOLS_CATALOG.filter((tool) => tool.status === 'active').length;
  const upcomingCount = AI_TOOLS_CATALOG.filter((tool) => tool.status === 'coming-soon').length;
  return { activeCount, upcomingCount };
}
