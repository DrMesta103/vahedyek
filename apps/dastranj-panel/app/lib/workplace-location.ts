export const WORKPLACE_LOCATION_DEFAULT_RADIUS = 10;
export const WORKPLACE_LOCATION_MIN_RADIUS = 5;
export const WORKPLACE_LOCATION_MAX_RADIUS = 500;
export const WORKPLACE_LOCATION_RADIUS_PRESETS = [5, 10, 15, 30, 50] as const;

export type WorkplaceLocationDraft = {
  title: string;
  address: string;
  description: string;
  radius: string;
  latitude: string;
  longitude: string;
};

export type WorkplaceLocationValues = {
  title: string;
  address: string;
  description: string | null;
  radius: number;
  latitude: number;
  longitude: number;
};

export type WorkplaceLocationErrors = Partial<Record<keyof WorkplaceLocationDraft, string>> & {
  general?: string;
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

function trimText(value: string) {
  return normalizeDigits(value).trim();
}

function normalizeNumberText(value: string) {
  return trimText(value).replace(/[^\d.-]/g, '');
}

function parseNumber(value: string) {
  const normalized = normalizeNumberText(value);
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toWorkplaceLocationDraft(input: Partial<WorkplaceLocationDraft> = {}): WorkplaceLocationDraft {
  return {
    title: input.title ?? '',
    address: input.address ?? '',
    description: input.description ?? '',
    radius: input.radius ?? String(WORKPLACE_LOCATION_DEFAULT_RADIUS),
    latitude: input.latitude ?? '',
    longitude: input.longitude ?? '',
  };
}

export function validateWorkplaceLocationDraft(input: WorkplaceLocationDraft) {
  const errors: WorkplaceLocationErrors = {};
  const title = trimText(input.title);
  const address = trimText(input.address);
  const description = trimText(input.description);
  const radiusText = trimText(input.radius);
  const latitude = parseNumber(input.latitude);
  const longitude = parseNumber(input.longitude);
  const radius = parseNumber(radiusText);

  if (!title) errors.title = 'عنوان محل کار را وارد کنید.';
  if (!address) errors.address = 'آدرس محل کار را وارد کنید.';
  if (latitude == null || longitude == null) errors.latitude = 'محل کار را روی نقشه انتخاب کنید.';
  if (!radiusText) errors.radius = 'مقدار دلخواه شعاع را وارد کنید.';
  else if (radius == null) errors.radius = 'شعاع مجاز باید عددی و بر حسب متر باشد.';
  else if (radius <= 0) errors.radius = 'شعاع مجاز باید عددی و بر حسب متر باشد.';
  else if (radius < WORKPLACE_LOCATION_MIN_RADIUS) errors.radius = `شعاع مجاز نباید کمتر از ${WORKPLACE_LOCATION_MIN_RADIUS.toLocaleString('fa-IR')} متر باشد.`;
  else if (radius > WORKPLACE_LOCATION_MAX_RADIUS) errors.radius = `شعاع مجاز نباید بیشتر از ${WORKPLACE_LOCATION_MAX_RADIUS.toLocaleString('fa-IR')} متر باشد.`;

  if (Object.keys(errors).length) {
    return { valid: false as const, errors };
  }

  return {
    valid: true as const,
    errors,
    values: {
      title,
      address,
      description: description || null,
      radius: radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS,
      latitude: latitude as number,
      longitude: longitude as number,
    } satisfies WorkplaceLocationValues,
  };
}
