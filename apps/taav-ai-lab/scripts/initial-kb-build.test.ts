import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../app/lib/prisma";
import { advanceInitialKnowledgeBuild, failInitialKnowledgeBuild, retryInitialKnowledgeBuild, startInitialKnowledgeBuild } from "../app/lib/taavia-initial-kb-build";

const suffix = randomUUID().slice(0, 8);
const tenantId = `kb-test-tenant-${suffix}`;
const brandId = `kb-test-brand-${suffix}`;
const userId = `kb-test-user-${suffix}`;
const sourceId = `kb-test-source-${suffix}`;
const expectReject = async (fn: () => Promise<unknown>) => assert.rejects(fn);

async function cleanup() {
  await prisma.tenant.deleteMany({ where: { id: tenantId } });
  await prisma.appUser.deleteMany({ where: { id: userId } });
}

async function main() {
  try {
    await prisma.appUser.create({ data: { id: userId, firstName: "Test", lastName: "User", fullName: "KB Test", email: `${userId}@local.test`, passwordHash: "test", passwordSalt: "test" } });
    await prisma.tenant.create({ data: { id: tenantId, slug: tenantId, name: "KB test", logoUrl: "", tokenLimit: 1, memberships: { create: { userId, role: "owner" } } } });
    await prisma.taaviaBrand.create({ data: { id: brandId, tenantId, name: "KB test", status: "ACTIVE", setupMode: "MANUAL", createdAt: new Date(), updatedAt: new Date(), createdByUserId: userId } });

    // A Build cannot start without an ACTIVE source.
    await expectReject(() => startInitialKnowledgeBuild({ tenantId, brandId, userId }));
    await prisma.taaviaBrandKnowledge.create({ data: { id: sourceId, tenantId, brandId, title: "منبع آزمایشی", content: "نسخه نخست محتوا", contentHash: "test", createdBy: userId, updatedBy: userId } });
    const build = await startInitialKnowledgeBuild({ tenantId, brandId, userId });
    assert.equal(build.status, "PROCESSING"); assert.equal(build.steps.length, 6);
    await expectReject(() => startInitialKnowledgeBuild({ tenantId, brandId, userId })); // only one active Build

    // Selected source payload remains stable after the live source changes.
    await prisma.taaviaBrandKnowledge.update({ where: { id: sourceId }, data: { content: "نسخه تغییرکرده", contentHash: "changed" } });
    await advanceInitialKnowledgeBuild(build.id); // preparation
    await advanceInitialKnowledgeBuild(build.id); // snapshot
    const snapshot = await prisma.taaviaKnowledgeSourceSnapshot.findFirstOrThrow({ where: { buildId: build.id, originalSourceId: sourceId } });
    assert.equal(snapshot.content, "نسخه نخست محتوا");
    await expectReject(() => prisma.taaviaKnowledgeCategory.create({ data: { tenantId, brandId, buildId: build.id, title: "غیرمجاز", slug: "invalid-depth", level: 3, content: "x" } }));

    // Failure does not create a KB; retry resumes the same Build.
    await failInitialKnowledgeBuild(build.id);
    assert.equal(await prisma.taaviaKnowledgeBase.count({ where: { tenantId, brandId } }), 0);
    await retryInitialKnowledgeBuild(build.id);
    assert.equal((await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: build.id } })).id, build.id);
    for (let index = 0; index < 4; index += 1) await advanceInitialKnowledgeBuild(build.id);
    const kb = await prisma.taaviaKnowledgeBase.findFirstOrThrow({ where: { tenantId, brandId, isActive: true } });
    assert.equal(await prisma.taaviaKnowledgeBase.count({ where: { tenantId, brandId, isActive: true } }), 1);
    const categories = await prisma.taaviaKnowledgeCategory.findMany({ where: { knowledgeBaseId: kb.id }, include: { sourceReferences: true } });
    assert.ok(categories.length > 0 && categories.every(x => x.level <= 2 && x.sourceReferences.length > 0));
    console.log("initial-kb-build integration test passed");
  } finally { await cleanup(); await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
