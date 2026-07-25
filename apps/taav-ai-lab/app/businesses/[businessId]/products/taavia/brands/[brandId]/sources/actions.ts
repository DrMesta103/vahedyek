"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/app/lib/session";
import { archiveBrandInfo, reactivateBrandInfo } from "@/app/lib/brand-info/service";
import { assertTenantAccess } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

type Input = { businessId: string; brandId: string; sourceId: string; sourceType: "brand_info" | "knowledge" | "product" | "faq"; revision: string; nextStatus: "ACTIVE" | "ARCHIVED" };
export async function changeBrandSourceStatus(input: Input): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireSession();
  if (!(await assertTenantAccess(session.userId, input.businessId))) return { ok: false, message: "دسترسی مجاز نیست." };
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: input.brandId, tenantId: input.businessId }, select: { id: true } });
  if (!brand) return { ok: false, message: "برند پیدا نشد." };
  try {
    if (input.sourceType === "brand_info") {
      if (input.nextStatus === "ARCHIVED") await archiveBrandInfo(session.userId, { tenantId: input.businessId, brandId: input.brandId, id: input.sourceId, expectedRevision: input.revision });
      else await reactivateBrandInfo(session.userId, { tenantId: input.businessId, brandId: input.brandId, id: input.sourceId, expectedRevision: input.revision });
    } else {
      const where = { id: input.sourceId, tenantId: input.businessId, brandId: input.brandId, revision: BigInt(input.revision) };
      const data = { status: input.nextStatus, archivedAt: input.nextStatus === "ARCHIVED" ? new Date() : null, archivedBy: input.nextStatus === "ARCHIVED" ? session.userId : null, updatedAt: new Date(), updatedBy: session.userId, revision: { increment: BigInt(1) } };
      const result = input.sourceType === "knowledge" ? await prisma.taaviaBrandKnowledge.updateMany({ where, data }) : input.sourceType === "product" ? await prisma.taaviaBrandProduct.updateMany({ where, data }) : await prisma.taaviaBrandFaq.updateMany({ where, data });
      if (result.count !== 1) return { ok: false, message: "منبع تغییر کرده یا در دسترس نیست." };
    }
    const base = `/businesses/${input.businessId}/products/taavia/brands/${input.brandId}`;
    revalidatePath(`${base}/sources`);
    revalidatePath(base);
    return { ok: true };
  } catch {
    return { ok: false, message: "ذخیرهٔ تغییر وضعیت انجام نشد." };
  }
}
