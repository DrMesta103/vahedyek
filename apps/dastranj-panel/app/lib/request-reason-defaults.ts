import type { PrismaClient, RequestReasonCategory } from './prisma-client';
import { REQUEST_REASON_CATEGORY_ORDER } from './constants';

type DefaultRequestReason = {
  title: string;
  description?: string;
  category: RequestReasonCategory;
  displayOrder: number;
};

export const DEFAULT_TENANT_REQUEST_REASONS: DefaultRequestReason[] = [
  { title: 'مرخصی روزانه استحقاقی', description: 'ثبت مرخصی روزانه', category: 'daily_leave', displayOrder: 0 },
  { title: 'مرخصی ساعتی استحقاقی', description: 'ثبت مرخصی ساعتی', category: 'hourly_leave', displayOrder: 0 },
  { title: 'مرخصی تشویقی', category: 'reward_leave', displayOrder: 0 },
  { title: 'مرخصی روزانه بدون حقوق', category: 'unpaid_leave', displayOrder: 0 },
  { title: 'مرخصی استعلاجی', category: 'sick_leave', displayOrder: 0 },
  { title: 'درخواست اضافه کاری', description: 'ثبت اضافه کاری عادی', category: 'overtime', displayOrder: 0 },
  { title: 'اصلاح خروج', category: 'attendance', displayOrder: 0 },
  { title: 'فراموشی ثبت تردد', category: 'attendance', displayOrder: 1 },
  { title: 'اصلاح ورود', description: 'ثبت درخواست اصلاح ورود', category: 'attendance', displayOrder: 2 },
  { title: 'دورکاری روزانه', description: 'ثبت دورکاری برای یک روز', category: 'remote_work', displayOrder: 0 },
  { title: 'ماموریت خارج شرکت', description: 'ثبت ماموریت ساعتی یا روزانه', category: 'mission', displayOrder: 0 },
  { title: 'درخواست مساعده', category: 'salary_advance', displayOrder: 0 },
  { title: 'درخواست وام', category: 'loan', displayOrder: 0 },
];

/** Inserts default reasons only for categories that have no rows yet. */
export async function ensureTenantDefaultRequestReasons(prisma: PrismaClient, tenantId: string) {
  const byCategory = new Map<RequestReasonCategory, DefaultRequestReason[]>();

  for (const item of DEFAULT_TENANT_REQUEST_REASONS) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  for (const category of REQUEST_REASON_CATEGORY_ORDER) {
    const items = byCategory.get(category);
    if (!items?.length) continue;

    const count = await prisma.requestReason.count({ where: { tenantId, category } });
    if (count > 0) continue;

    await prisma.requestReason.createMany({
      data: items.map((item) => ({
        tenantId,
        title: item.title,
        description: item.description ?? null,
        category: item.category,
        displayOrder: item.displayOrder,
        isActive: true,
      })),
    });
  }
}
