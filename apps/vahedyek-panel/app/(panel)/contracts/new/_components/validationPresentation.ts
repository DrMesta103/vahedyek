'use client';

const REQUIRED_MSG = 'این فیلد الزامی است';

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildValidationSummary(
  errors: Record<string, string>,
  fieldLabels: Record<string, string>,
  fallbackMessage: string,
) {
  const missingRequiredLabels = unique(
    Object.entries(errors)
      .filter(([, message]) => message === REQUIRED_MSG)
      .map(([field]) => fieldLabels[field])
      .filter(Boolean),
  );

  const otherMessages = unique(
    Object.entries(errors)
      .filter(([, message]) => message !== REQUIRED_MSG)
      .map(([, message]) => message),
  );

  const chunks: string[] = [];

  if (missingRequiredLabels.length === 1) {
    chunks.push(`تکمیل فیلد اجباری «${missingRequiredLabels[0]}» لازم است.`);
  } else if (missingRequiredLabels.length > 1) {
    chunks.push(`تکمیل این فیلدهای اجباری لازم است: ${missingRequiredLabels.map((label) => `«${label}»`).join('، ')}.`);
  }

  if (otherMessages.length > 0) {
    chunks.push(otherMessages[0]);
  }

  return chunks.join(' ') || fallbackMessage;
}
