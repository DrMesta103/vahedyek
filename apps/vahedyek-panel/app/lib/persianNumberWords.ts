const ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const TEENS = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const HUNDREDS = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'هزار میلیارد'];

function joinParts(parts: string[]) {
  return parts.filter(Boolean).join(' و ');
}

function joinScale(value: string, scale: string) {
  return [value, scale].filter(Boolean).join(' ');
}

function threeDigitToWords(value: number) {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;

  if (!value) return '';
  if (remainder >= 10 && remainder < 20) {
    return joinParts([HUNDREDS[hundreds], TEENS[remainder - 10]]);
  }

  return joinParts([HUNDREDS[hundreds], TENS[tens], ONES[ones]]);
}

export function persianMoneyWords(value: number) {
  const amount = Math.round(value);
  if (!amount) return '';

  const chunks: number[] = [];
  let cursor = amount;

  while (cursor > 0 && chunks.length < SCALES.length) {
    chunks.push(cursor % 1000);
    cursor = Math.floor(cursor / 1000);
  }

  const words = chunks
    .map((chunk, index) => {
      if (!chunk) return '';
      return joinScale(threeDigitToWords(chunk), SCALES[index]);
    })
    .filter(Boolean)
    .reverse()
    .join(' و ');

  return `${words} تومان`;
}
