export const DEV_DOC_THREAD_PRIORITIES = ['p0', 'p1', 'p2', 'p3'] as const;
export const DEV_DOC_THREAD_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type DevDocThreadPriority = (typeof DEV_DOC_THREAD_PRIORITIES)[number];
export type DevDocThreadStatus = (typeof DEV_DOC_THREAD_STATUSES)[number];

export type DevDocThreadRecord = {
  id: string;
  appId: string;
  pageKey: string;
  pagePathSample: string;
  title: string;
  docType: string;
  priority: DevDocThreadPriority;
  status: DevDocThreadStatus;
  labels: string[];
  isOpened: boolean;
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

export const DEV_DOC_PRIORITY_LABELS: Record<DevDocThreadPriority, string> = {
  p0: 'خیلی فوری',
  p1: 'فوری',
  p2: 'عادی',
  p3: 'کم‌اهمیت',
};

export function normalizeDevDocThreadPriority(value: unknown): DevDocThreadPriority {
  return typeof value === 'string' && (DEV_DOC_THREAD_PRIORITIES as readonly string[]).includes(value)
    ? (value as DevDocThreadPriority)
    : 'p2';
}

export function normalizeDevDocThreadStatus(value: unknown): DevDocThreadStatus {
  return typeof value === 'string' && (DEV_DOC_THREAD_STATUSES as readonly string[]).includes(value)
    ? (value as DevDocThreadStatus)
    : 'todo';
}

export function normalizeDevDocLabels(input: unknown) {
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
