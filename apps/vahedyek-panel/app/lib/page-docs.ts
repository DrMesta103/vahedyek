export const PAGE_DOC_TYPES = ['technical', 'business', 'api-dto', 'note', 'free'] as const;
export const PAGE_DOC_EVENT_TYPES = ['create', 'update', 'delete'] as const;

export type PageDocType = (typeof PAGE_DOC_TYPES)[number];
export type PageDocEventType = (typeof PAGE_DOC_EVENT_TYPES)[number];

export type PageDocRecord = {
  id: string;
  title: string;
  docType: PageDocType;
  contentHtml: string;
  labels: string[];
  audioDataUrl: string | null;
  audioMimeType: string | null;
  pagePath: string;
  pageKey: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  author: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  updatedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

export type PageDocEventRecord = {
  id: string;
  eventType: PageDocEventType;
  docId: string | null;
  docTitle: string | null;
  docType: PageDocType | null;
  labels: string[];
  pagePath: string;
  pageKey: string;
  appId: string;
  createdAt: string;
  isRead: boolean | null;
  actor: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  details: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CUID_RE = /^c[a-z0-9]{8,}$/i;
const NUMERIC_RE = /^\d+$/;
const HEX_RE = /^[0-9a-f]{12,}$/i;

export function normalizePagePath(input: string) {
  const pathname = input.split('?')[0]?.split('#')[0]?.trim() || '/';
  const pagePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const pageKey =
    pagePath
      .split('/')
      .filter(Boolean)
      .map((segment) => {
        if (UUID_RE.test(segment) || CUID_RE.test(segment) || NUMERIC_RE.test(segment) || HEX_RE.test(segment)) {
          return '[id]';
        }

        return segment;
      })
      .join('/') || 'home';

  return {
    pagePath,
    pageKey: `/${pageKey}`,
  };
}

export function normalizeDocType(value: unknown): PageDocType {
  return typeof value === 'string' && PAGE_DOC_TYPES.includes(value as PageDocType) ? (value as PageDocType) : 'free';
}

export function normalizeEventType(value: unknown): PageDocEventType {
  return typeof value === 'string' && PAGE_DOC_EVENT_TYPES.includes(value as PageDocEventType) ? (value as PageDocEventType) : 'update';
}

export function normalizeLabels(input: unknown) {
  if (!Array.isArray(input)) return [] as string[];

  return Array.from(
    new Set(
      input
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
        .slice(0, 12),
    ),
  );
}

export function getDocTypeLabel(type: PageDocType) {
  switch (type) {
    case 'technical':
      return 'فنی';
    case 'business':
      return 'بیزینسی';
    case 'api-dto':
      return 'API / DTO';
    case 'note':
      return 'یادداشت';
    default:
      return 'آزاد';
  }
}

export function getEventTypeLabel(type: PageDocEventType) {
  switch (type) {
    case 'create':
      return 'ایجاد';
    case 'update':
      return 'ویرایش';
    case 'delete':
      return 'حذف';
    default:
      return 'رویداد';
  }
}

export function sanitizeDocumentHtml(input: string) {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '');
}

export function sanitizeAudioDataUrl(input: unknown) {
  if (typeof input !== 'string' || !input.startsWith('data:audio/')) {
    return null;
  }

  return input.length <= 8_000_000 ? input : null;
}

export function safeJsonParseStringArray(input: unknown) {
  if (typeof input !== 'string' || !input.trim()) {
    return [] as string[];
  }

  try {
    return normalizeLabels(JSON.parse(input));
  } catch {
    return [] as string[];
  }
}
