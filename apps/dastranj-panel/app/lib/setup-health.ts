import { prisma } from './prisma';
import { getSessionContext } from './auth';

export type SetupHealthItemKey =
  | 'workplace'
  | 'calendar'
  | 'work_policy'
  | 'employees'
  | 'work_groups';

export type SetupHealthItemStatus = 'completed' | 'incomplete';

export type SetupHealthItem = {
  key: SetupHealthItemKey;
  label: string;
  status: SetupHealthItemStatus;
  priority: number;
  route: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export type SetupHealthReminder = {
  key: SetupHealthItemKey;
  title: string;
  description: string;
  ctaLabel: string;
  route: string;
  priority: number;
};

export type TenantSetupHealth = {
  score: number;
  completedCount: number;
  totalCriticalCount: number;
  criticalItems: SetupHealthItem[];
  nextReminder: SetupHealthReminder | null;
};

export const QUICK_SETUP_REMINDER_KEYS: SetupHealthItemKey[] = [
  'workplace',
  'calendar',
  'work_policy',
  'employees',
  'work_groups',
];

type SetupHealthDefinition = {
  key: SetupHealthItemKey;
  label: string;
  priority: number;
  route: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export const SETUP_HEALTH_ITEMS: SetupHealthDefinition[] = [
  {
    key: 'workplace',
    label: 'محل کار',
    priority: 1,
    route: '/locations',
    title: 'محل کار هنوز ثبت نشده است.',
    description: 'برای اینکه کارکنان بتوانند ورود و خروج خود را با موبایل ثبت کنند، باید محل کار و محدوده مجاز تردد مشخص شود.',
    ctaLabel: 'ثبت محل کار',
  },
  {
    key: 'calendar',
    label: 'تقویم کاری',
    priority: 2,
    route: '/calendars',
    title: 'تقویم کاری هنوز تکمیل نشده است.',
    description: 'بدون تقویم کاری، سیستم نمی‌تواند روزهای کاری، تعطیلات و روزهای غیرکاری را درست تشخیص دهد.',
    ctaLabel: 'تکمیل تقویم کاری',
  },
  {
    key: 'work_policy',
    label: 'سیاست کاری',
    priority: 3,
    route: '/policies',
    title: 'سیاست کاری هنوز تکمیل نشده است.',
    description: 'سیاست کاری مشخص می‌کند قوانین تردد، فرجه ورود و خروج، مرخصی، اضافه‌کاری و درخواست‌ها چگونه مدیریت شوند.',
    ctaLabel: 'تکمیل سیاست کاری',
  },
  {
    key: 'employees',
    label: 'کارمندان',
    priority: 5,
    route: '/employees',
    title: 'هنوز کارمندی در سیستم ثبت نشده است.',
    description: 'برای شروع استفاده از دسترنج، کارکنان را اضافه کنید یا برای آن‌ها لینک تکمیل اطلاعات ارسال کنید.',
    ctaLabel: 'افزودن کارمندان',
  },
  {
    key: 'work_groups',
    label: 'گروه‌های کاری',
    priority: 6,
    route: '/work-groups',
    title: 'هنوز گروه کاری تعریف نشده است.',
    description: 'برای اینکه کارکنان بر اساس محل کار، سیاست کاری و شیفت مناسب مدیریت شوند، حداقل یک گروه کاری تعریف کنید.',
    ctaLabel: 'تعریف گروه کاری',
  },
];

export function buildDefaultTenantSetupHealth(): TenantSetupHealth {
  const criticalItems: SetupHealthItem[] = SETUP_HEALTH_ITEMS.map((item) => ({
    ...item,
    status: 'incomplete',
  }));

  return {
    score: 0,
    completedCount: 0,
    totalCriticalCount: criticalItems.length,
    criticalItems,
    nextReminder: {
      key: 'workplace',
      title: SETUP_HEALTH_ITEMS[0]?.title ?? 'محل کار هنوز ثبت نشده است.',
      description: SETUP_HEALTH_ITEMS[0]?.description ?? '',
      ctaLabel: SETUP_HEALTH_ITEMS[0]?.ctaLabel ?? 'ثبت محل کار',
      route: SETUP_HEALTH_ITEMS[0]?.route ?? '/locations',
      priority: SETUP_HEALTH_ITEMS[0]?.priority ?? 1,
    },
  };
}

type SetupAccess = {
  allowed: boolean;
  tenantId: string | null;
  userId: string | null;
  roleKeys: string[];
};

type ReminderStateRecord = {
  reminderKey: string;
  dismissedUntil: Date | null;
};

function normalizeRoleKey(value: string) {
  return value.trim().toLowerCase();
}

export async function getSetupReminderAccess(): Promise<SetupAccess> {
  const session = await getSessionContext();
  if (!session?.tenantId) {
    return { allowed: false, tenantId: null, userId: session?.userId ?? null, roleKeys: [] };
  }

  const membership = await prisma.userTenantMembership.findUnique({
    where: {
      userId_tenantId: {
        userId: session.userId,
        tenantId: session.tenantId,
      },
    },
    include: {
      roles: {
        include: {
          role: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return { allowed: false, tenantId: session.tenantId, userId: session.userId, roleKeys: [] };
  }

  const roleKeys = new Set<string>();
  if (membership.role) roleKeys.add(normalizeRoleKey(membership.role));
  for (const role of membership.roles) {
    if (role.role?.key) roleKeys.add(normalizeRoleKey(role.role.key));
  }

  const effectiveRoleKeys = Array.from(roleKeys);
  const allowed = effectiveRoleKeys.some((roleKey) => roleKey === 'owner' || roleKey === 'admin' || roleKey === 'hr_manager');

  return {
    allowed,
    tenantId: session.tenantId,
    userId: session.userId,
    roleKeys: effectiveRoleKeys,
  };
}

export async function resolveTenantSetupHealthForCurrentUser(options?: { fallbackOnError?: boolean; debugLabel?: string }) {
  const access = await getSetupReminderAccess();
  if (!access.allowed || !access.tenantId) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[setup-health]', options?.debugLabel ?? 'resolve', 'hidden because permission=false', {
        tenantId: access.tenantId,
        userId: access.userId,
        roleKeys: access.roleKeys,
      });
    }
    return { access, setupHealth: null as TenantSetupHealth | null, error: null as unknown };
  }

  try {
    const setupHealth = await getTenantSetupHealth(access.tenantId, access.userId);
    if (process.env.NODE_ENV !== 'production') {
      console.info('[setup-health]', options?.debugLabel ?? 'resolve', {
        tenantId: access.tenantId,
        userId: access.userId,
        score: setupHealth.score,
        completedCount: setupHealth.completedCount,
        totalCriticalCount: setupHealth.totalCriticalCount,
        nextReminder: setupHealth.nextReminder?.key ?? null,
      });
    }
    return { access, setupHealth, error: null as unknown };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[setup-health]', options?.debugLabel ?? 'resolve', 'load failed, using fallback health', error);
    }
    return {
      access,
      setupHealth: options?.fallbackOnError === false ? null : buildDefaultTenantSetupHealth(),
      error,
    };
  }
}

async function listReminderStates(tenantId: string, userId: string): Promise<Map<string, ReminderStateRecord>> {
  const rows = await prisma.tenantSetupReminderState.findMany({
    where: {
      tenantId,
      userId,
    },
    select: {
      reminderKey: true,
      dismissedUntil: true,
    },
  });

  return new Map<string, ReminderStateRecord>(rows.map((row) => [row.reminderKey, row] satisfies [string, ReminderStateRecord]));
}

function isReminderSnoozed(state: ReminderStateRecord | undefined, now: Date) {
  return Boolean(state?.dismissedUntil && state.dismissedUntil.getTime() > now.getTime());
}

export async function getTenantSetupHealth(tenantId: string, userId?: string | null): Promise<TenantSetupHealth> {
  const now = new Date();
  const [locations, calendars, workPolicies, employees, workGroups, reminderStates] = await Promise.all([
    prisma.location.count({
      where: {
        tenantId,
        title: { not: '' },
        address: { not: '' },
        radius: { gt: 0 },
      },
    }),
    prisma.calendar.count({
      where: {
        tenantId,
        status: 'active',
        title: { not: '' },
      },
    }),
    prisma.workPolicy.count({
      where: {
        tenantId,
        title: { not: '' },
        calendarId: { not: null },
      },
    }),
    prisma.employee.count({
      where: {
        tenantId,
      },
    }),
    prisma.workGroup.count({
      where: {
        tenantId,
        title: { not: '' },
        policyId: { not: null },
        locationId: { not: null },
      },
    }),
    userId ? listReminderStates(tenantId, userId) : Promise.resolve(new Map<string, ReminderStateRecord>()),
  ]);

  const completionMap: Record<SetupHealthItemKey, boolean> = {
    workplace: locations > 0,
    calendar: calendars > 0,
    work_policy: workPolicies > 0,
    employees: employees > 0,
    work_groups: workGroups > 0,
  };

  const criticalItems: SetupHealthItem[] = SETUP_HEALTH_ITEMS.map((item) => ({
    ...item,
    status: completionMap[item.key] ? 'completed' : 'incomplete',
  }));

  const completedCount = criticalItems.filter((item) => item.status === 'completed').length;
  const totalCriticalCount = criticalItems.length;
  const score = Math.round((completedCount / totalCriticalCount) * 100);

  const nextReminderCandidate = criticalItems
    .filter((item) => item.status === 'incomplete')
    .filter((item) => !isReminderSnoozed(reminderStates.get(item.key), now))
    .sort((a, b) => a.priority - b.priority)[0] ?? null;

  const nextReminder = nextReminderCandidate
    ? {
        key: nextReminderCandidate.key,
        title: nextReminderCandidate.title,
        description: nextReminderCandidate.description,
        ctaLabel: nextReminderCandidate.ctaLabel,
        route: nextReminderCandidate.route,
        priority: nextReminderCandidate.priority,
      }
    : null;

  return {
    score,
    completedCount,
    totalCriticalCount,
    criticalItems,
    nextReminder,
  };
}

export function getQuickSetupReminderPayload(setupHealth: TenantSetupHealth | null) {
  if (!setupHealth) {
    return {
      criticalItems: [] as SetupHealthItem[],
      nextReminder: null as SetupHealthReminder | null,
    };
  }

  const criticalItems = setupHealth.criticalItems.filter((item) => QUICK_SETUP_REMINDER_KEYS.includes(item.key));
  const nextReminder =
    criticalItems
      .filter((item) => item.status === 'incomplete')
      .sort((a, b) => a.priority - b.priority)
      .map((item) => ({
        key: item.key,
        title: item.title,
        description: item.description,
        ctaLabel: item.ctaLabel,
        route: item.route,
        priority: item.priority,
      }))
      .at(0) ?? null;

  return { criticalItems, nextReminder };
}
