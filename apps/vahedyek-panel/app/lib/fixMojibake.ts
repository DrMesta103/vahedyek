const MOJIBAKE_PATTERN = /[ØÙÚÛâ]|€|™|œ|�/;

export function fixMojibake(value: string): string {
  if (!MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(Array.from(value), (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return value;
  }
}

export function fixMojibakeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return fixMojibake(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => fixMojibakeDeep(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fixMojibakeDeep(item)]),
    ) as T;
  }

  return value;
}
