export async function readApiErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Ignore invalid or empty error bodies and fall back to the caller message.
  }

  return fallbackMessage;
}
