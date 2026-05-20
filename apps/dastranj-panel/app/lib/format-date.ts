const persianDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatPersianDate(value: Date | string) {
  return persianDateFormatter.format(new Date(value));
}
