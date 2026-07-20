import type { CreateAiProviderAccountTransactionV2Input } from './types/ai-provider-v2';

export function validateAccountTransactionV2(input: CreateAiProviderAccountTransactionV2Input): string | null {
  if (!Number.isFinite(input.amountUsd) || input.amountUsd === 0) {
    return 'مبلغ دلاری باید عددی غیر صفر باشد.';
  }
  if (!Number.isFinite(input.amountToman) || !Number.isInteger(input.amountToman) || input.amountToman === 0) {
    return 'مبلغ تومان باید عدد صحیح غیر صفر باشد.';
  }

  const sameSign = Math.sign(input.amountUsd) === Math.sign(input.amountToman);
  if (!sameSign) {
    return 'مبلغ دلار و تومان باید علامت یکسان داشته باشند.';
  }

  if (input.transactionType === 'PURCHASE') {
    if (input.amountUsd <= 0 || input.amountToman <= 0) {
      return 'در خرید اعتبار، مبلغ باید مثبت باشد.';
    }
  }

  if (input.transactionType === 'MANUAL_ADJUSTMENT') {
    if (!input.description?.trim()) {
      return 'برای اصلاح دستی، توضیحات اجباری است.';
    }
  }

  return null;
}

