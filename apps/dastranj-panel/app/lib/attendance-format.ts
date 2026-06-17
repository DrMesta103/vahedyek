export function formatMinutesLabel(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours <= 0 && rest <= 0) return '۰ دقیقه';
  if (hours <= 0) return `${rest.toLocaleString('fa-IR')} دقیقه`;
  if (rest <= 0) return `${hours.toLocaleString('fa-IR')} ساعت`;
  return `${hours.toLocaleString('fa-IR')} ساعت و ${rest.toLocaleString('fa-IR')} دقیقه`;
}
