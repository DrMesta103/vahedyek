import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { ACTIVE_BUILD_SOURCE_LOCK_MESSAGE, assertNoActiveBuild, findActiveBuild } from "../app/lib/taavia-active-build";
import { prisma } from "../app/lib/prisma";
import { advanceInitialKnowledgeBuild, completeInitialKnowledgeBuild, failInitialKnowledgeBuild, MAX_KNOWLEDGE_BASE_VERSIONS, retryInitialKnowledgeBuild, startInitialKnowledgeBuild, startRebuildKnowledgeBuild, startUpdateKnowledgeBuild } from "../app/lib/taavia-initial-kb-build";

const suffix = randomUUID().slice(0, 8);
const tenantId = `kb-test-tenant-${suffix}`;
const brandId = `kb-test-brand-${suffix}`;
const userId = `kb-test-user-${suffix}`;
const sourceId = `kb-test-source-${suffix}`;
const expectReject = async (fn: () => Promise<unknown>, message?: string | RegExp) => assert.rejects(fn, message ? { message } : undefined);

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
    assert.equal((await findActiveBuild(tenantId, brandId))?.id, build.id);
    await expectReject(() => startInitialKnowledgeBuild({ tenantId, brandId, userId })); // only one active Build
    await expectReject(() => assertNoActiveBuild(tenantId, brandId), ACTIVE_BUILD_SOURCE_LOCK_MESSAGE); // source mutations locked

    // Snapshot uses the frozen selectedSources payload, not later live-source edits outside the app layer.
    await prisma.taaviaBrandKnowledge.update({ where: { id: sourceId }, data: { content: "نسخه تغییرکرده", contentHash: "changed" } });
    await advanceInitialKnowledgeBuild(build.id); // preparation
    await advanceInitialKnowledgeBuild(build.id); // snapshot
    const snapshot = await prisma.taaviaKnowledgeSourceSnapshot.findFirstOrThrow({ where: { buildId: build.id, originalSourceId: sourceId } });
    assert.equal(snapshot.content, "نسخه نخست محتوا");
    await expectReject(() => prisma.taaviaKnowledgeCategory.create({ data: { tenantId, brandId, buildId: build.id, title: "غیرمجاز", slug: "invalid-depth", level: 3, content: "x" } }));

    // Failure unlocks source mutations and does not create a KB; retry resumes the same Build.
    await failInitialKnowledgeBuild(build.id);
    assert.equal(await findActiveBuild(tenantId, brandId), null);
    await assertNoActiveBuild(tenantId, brandId);
    assert.equal(await prisma.taaviaKnowledgeBase.count({ where: { tenantId, brandId } }), 0);
    await retryInitialKnowledgeBuild(build.id);
    assert.equal((await findActiveBuild(tenantId, brandId))?.id, build.id);
    await expectReject(() => assertNoActiveBuild(tenantId, brandId), ACTIVE_BUILD_SOURCE_LOCK_MESSAGE);
    assert.equal((await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: build.id } })).id, build.id);
    for (let index = 0; index < 4; index += 1) await advanceInitialKnowledgeBuild(build.id);
    const kb = await prisma.taaviaKnowledgeBase.findFirstOrThrow({ where: { tenantId, brandId, isActive: true } });
    assert.equal(await findActiveBuild(tenantId, brandId), null);
    assert.equal(await prisma.taaviaKnowledgeBase.count({ where: { tenantId, brandId, isActive: true } }), 1);
    const categories = await prisma.taaviaKnowledgeCategory.findMany({ where: { knowledgeBaseId: kb.id }, include: { sourceReferences: true } });
    assert.ok(categories.length > 0 && categories.every(x => x.level <= 2 && x.sourceReferences.length > 0));

    // UPDATE is allowed only with a real source difference and leaves the old version immutable.
    const update = await startUpdateKnowledgeBuild({ tenantId, brandId, userId });
    assert.equal(update.buildType, "UPDATE");
    await expectReject(() => startUpdateKnowledgeBuild({ tenantId, brandId, userId })); // concurrent update rejected
    await completeInitialKnowledgeBuild(update.id);
    const versions = await prisma.taaviaKnowledgeBase.findMany({ where: { tenantId, brandId }, orderBy: { versionNumber: "asc" } });
    assert.equal(versions.length, 2);
    assert.equal(versions[0].id, kb.id);
    assert.equal(versions[0].isActive, false);
    assert.equal(versions[1].versionNumber, 2);
    assert.equal(versions[1].isActive, true);
    assert.equal(await prisma.taaviaKnowledgeSourceSnapshot.count({ where: { knowledgeBaseId: kb.id } }), 1);
    await expectReject(() => startUpdateKnowledgeBuild({ tenantId, brandId, userId }));

    // FULL_REBUILD keeps the same version id/number and replaces content in place.
    const beforeRebuild = await prisma.taaviaKnowledgeBase.findFirstOrThrow({ where: { tenantId, brandId, isActive: true } });
    const rebuild = await startRebuildKnowledgeBuild({ tenantId, brandId, userId });
    assert.equal(rebuild.buildType, "FULL_REBUILD");
    await completeInitialKnowledgeBuild(rebuild.id);
    const afterRebuild = await prisma.taaviaKnowledgeBase.findFirstOrThrow({ where: { tenantId, brandId, isActive: true } });
    assert.equal(afterRebuild.id, beforeRebuild.id);
    assert.equal(afterRebuild.versionNumber, beforeRebuild.versionNumber);
    assert.equal(afterRebuild.buildType, "FULL_REBUILD");
    assert.ok(await prisma.taaviaKnowledgeCategory.count({ where: { knowledgeBaseId: afterRebuild.id } }) > 0);

    // Forced new versions prune older inactive ones down to MAX_KNOWLEDGE_BASE_VERSIONS.
    for (let index = 0; index < MAX_KNOWLEDGE_BASE_VERSIONS + 1; index += 1) {
      const forced = await startUpdateKnowledgeBuild({ tenantId, brandId, userId, force: true });
      await completeInitialKnowledgeBuild(forced.id);
    }
    const retained = await prisma.taaviaKnowledgeBase.findMany({ where: { tenantId, brandId }, orderBy: { versionNumber: "asc" } });
    assert.equal(retained.length, MAX_KNOWLEDGE_BASE_VERSIONS);
    assert.equal(retained.filter((item) => item.isActive).length, 1);
    assert.equal(retained.at(-1)?.isActive, true);

    console.log("initial-kb-build integration test passed");
  } finally { await cleanup(); await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
