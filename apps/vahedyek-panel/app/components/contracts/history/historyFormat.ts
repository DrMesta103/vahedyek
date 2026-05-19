export function formatHistoryMoney(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  const toman = Math.round(amount / 10);
  return `${toman.toLocaleString('fa-IR')} تومان`;
}
