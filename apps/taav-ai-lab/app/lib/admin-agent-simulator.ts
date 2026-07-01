/**
 * Deterministic mock replies for the Taavia Admin Agent chat.
 * TODO: Replace with Python/gRPC AI service when backend is ready.
 */
export function generateSimulatedAdminAgentReply(userContent: string): string {
  const text = userContent.trim();
  const normalized = text.toLowerCase();

  const introducesBrand =
    /برند|معرفی|فعالیت|کاری انجام|شرکت|کسب.?وکار|حوزه.?کار|ارائه می/.test(text) ||
    /what we do|about us|our company/i.test(normalized);

  const mentionsFaq =
    /faq|سوالات پرتکرار|سؤالات پرتکرار|پرسش.?های متداول|سوال متداول/.test(text) ||
    /frequently asked/i.test(normalized);

  const mentionsProductsOrPricing =
    /محصول|قیمت|خدمات|service|product|pricing|پکیج|فروش/.test(text) ||
    /price|catalog/i.test(normalized);

  if (introducesBrand) {
    return 'خیلی خوب. برای اینکه بتوانم نالج‌بیس برند شما را بهتر بسازم، لطفاً بگویید مشتریان شما معمولاً درباره چه موضوعاتی سؤال می‌پرسند؟ مثل قیمت، گارانتی، ارسال، مرجوعی یا راهنمای خرید.';
  }

  if (mentionsFaq) {
    return 'عالی است. می‌توانیم این موارد را بعداً به عنوان FAQ پیشنهادی ثبت کنیم. لطفاً چند نمونه سؤال پرتکرار و پاسخ مناسب آن‌ها را بنویسید.';
  }

  if (mentionsProductsOrPricing) {
    return 'متوجه شدم. در مراحل بعد می‌توانیم اطلاعات محصولات و قیمت‌گذاری را به صورت ساختاریافته وارد کنیم. فعلاً لطفاً بگویید مهم‌ترین محصولات یا خدمات این برند چه هستند.';
  }

  return 'متوجه شدم. لطفاً کمی بیشتر توضیح دهید تا بتوانم اطلاعات برند را بهتر دسته‌بندی کنم و برای ساخت نالج‌بیس آماده کنم.';
}
