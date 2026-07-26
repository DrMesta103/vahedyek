"use server";
import { revalidatePath } from "next/cache";
import { assertTenantAccess } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { findActiveBuild } from "@/app/lib/taavia-active-build";
import { advanceInitialKnowledgeBuild, cancelInitialKnowledgeBuild, completeInitialKnowledgeBuild, failInitialKnowledgeBuild, resetInitialKnowledgeBuild, retryInitialKnowledgeBuild, startInitialKnowledgeBuild, startUpdateKnowledgeBuild } from "@/app/lib/taavia-initial-kb-build";

const allowed = () => process.env.NODE_ENV !== "production";
async function scoped(businessId: string, brandId: string, buildId?: string) {
  const session = await requireSession();
  if (!(await assertTenantAccess(session.userId, businessId))) throw new Error("دسترسی مجاز نیست.");
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId: businessId }, select: { id: true } }); if (!brand) throw new Error("برند پیدا نشد.");
  if (buildId && !(await prisma.taaviaKnowledgeBaseBuild.findFirst({ where: { id: buildId, tenantId: businessId, brandId }, select: { id: true } }))) throw new Error("Build پیدا نشد.");
  return session;
}
function refresh(businessId: string, brandId: string) {
  const base = `/businesses/${businessId}/products/taavia/brands/${brandId}`;
  revalidatePath(base);
  revalidatePath(`${base}/sources`);
  revalidatePath(`${base}/knowledge-base`);
}
export async function startInitialBuildAction(input: { businessId: string; brandId: string }) { const session = await scoped(input.businessId, input.brandId); const build = await startInitialKnowledgeBuild({ tenantId: input.businessId, brandId: input.brandId, userId: session.userId }); refresh(input.businessId, input.brandId); return build.id; }
export async function startKnowledgeBaseUpdateAction(input: { businessId: string; brandId: string; knowledgeBaseId: string; force?: boolean }) {
  const session = await scoped(input.businessId, input.brandId);
  const active = await prisma.taaviaKnowledgeBase.findFirst({
    where: { id: input.knowledgeBaseId, tenantId: input.businessId, brandId: input.brandId, isActive: true },
    select: { id: true },
  });
  if (!active) throw new Error("فقط نسخهٔ فعال قابل بروزرسانی است.");

  const existing = await findActiveBuild(input.businessId, input.brandId);
  if (existing) {
    refresh(input.businessId, input.brandId);
    return existing.id;
  }

  const build = await startUpdateKnowledgeBuild({
    tenantId: input.businessId,
    brandId: input.brandId,
    userId: session.userId,
    force: input.force,
  });
  refresh(input.businessId, input.brandId);
  return build.id;
}
export async function simulateBuildAction(input: { businessId: string; brandId: string; buildId: string; action: "advance" | "fail" | "retry" | "completeAll" | "cancel" | "reset" }) { if (!allowed()) throw new Error("شبیه‌سازی فقط در محیط توسعه یا تست مجاز است."); await scoped(input.businessId, input.brandId, input.buildId); if (input.action === "advance") await advanceInitialKnowledgeBuild(input.buildId); else if (input.action === "fail") await failInitialKnowledgeBuild(input.buildId); else if (input.action === "retry") await retryInitialKnowledgeBuild(input.buildId); else if (input.action === "completeAll") await completeInitialKnowledgeBuild(input.buildId); else if (input.action === "reset") await resetInitialKnowledgeBuild(input.buildId); else await cancelInitialKnowledgeBuild(input.buildId); refresh(input.businessId, input.brandId); }
