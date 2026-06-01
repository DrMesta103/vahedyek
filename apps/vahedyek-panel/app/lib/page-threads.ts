export const THREAD_PRIORITIES = ['p0', 'p1', 'p2', 'p3'] as const;
export const THREAD_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type ThreadPriority = (typeof THREAD_PRIORITIES)[number];
export type ThreadStatus = (typeof THREAD_STATUSES)[number];

export type PageThreadRecord = {
  id: string;
  appId: string;
  pageKey: string;
  pagePathSample: string;
  title: string;
  docType: string;
  priority: ThreadPriority;
  status: ThreadStatus;
  labels: string[];
  isOpened: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
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

export const MESSAGE_TYPES = ['text', 'image', 'audio', 'pdf', 'system'] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

export type PageMessageRecord = {
  id: string;
  threadId: string;
  messageType: MessageType;
  text: string | null;
  attachmentDataUrl: string | null;
  attachmentMimeType: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  replyToMessageId: string | null;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  replyTo?: {
    id: string;
    messageType: MessageType;
    text: string | null;
  } | null;
};

export const DEFAULT_DOC_TYPES = ['technical', 'business', 'api-dto', 'note', 'free'] as const;

export function normalizeDocTypeTag(value: unknown) {
  if (typeof value !== 'string') return 'free';
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return 'free';
  if (cleaned.length > 42) return cleaned.slice(0, 42);
  return cleaned;
}

export function normalizePriority(value: unknown): ThreadPriority {
  return typeof value === 'string' && (THREAD_PRIORITIES as readonly string[]).includes(value)
    ? (value as ThreadPriority)
    : 'p2';
}

export function normalizeThreadStatus(value: unknown): ThreadStatus {
  return typeof value === 'string' && (THREAD_STATUSES as readonly string[]).includes(value)
    ? (value as ThreadStatus)
    : 'todo';
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

export function normalizeMessageType(value: unknown): MessageType {
  return typeof value === 'string' && (MESSAGE_TYPES as readonly string[]).includes(value) ? (value as MessageType) : 'text';
}

const DATA_URL_LIMIT = 8_000_000;

export function sanitizeDataUrl(input: unknown, allowedPrefix: 'data:image/' | 'data:audio/' | 'data:application/pdf') {
  if (typeof input !== 'string') return null;
  if (!input.startsWith(allowedPrefix)) return null;
  return input.length <= DATA_URL_LIMIT ? input : null;
}

export function sanitizeText(input: unknown) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed.length > 10_000 ? trimmed.slice(0, 10_000) : trimmed;
}

