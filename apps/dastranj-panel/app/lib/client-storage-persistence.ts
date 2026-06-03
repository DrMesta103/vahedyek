import { prisma } from './prisma';

export type HydratedClientStorageState = {
  storageKey: string;
  value: string;
};

const GLOBAL_SCOPE = 'global';
const CONTRACT_TEMPLATES_KEY = 'dastranj-contract-draft-templates-v1';
const EMPLOYEE_DRAFTS_KEY = 'dastranj-employee-contract-drafts-v1';
const EMPLOYEE_SUPPLEMENTAL_KEY = 'dastranj-employee-supplemental-profile-v1';
const CONTRACT_TEMPLATE_MARKER = 'contract-draft-template-v1';

function tenantScope(tenantId: string) {
  return `tenant:${tenantId}`;
}

function getScopeForStorageKey(storageKey: string, tenantId: string | null | undefined) {
  if (!tenantId) return { scope: GLOBAL_SCOPE, tenantId: null };
  if (
    storageKey === CONTRACT_TEMPLATES_KEY ||
    storageKey.startsWith(`${CONTRACT_TEMPLATES_KEY}:`) ||
    storageKey.startsWith(EMPLOYEE_DRAFTS_KEY) ||
    storageKey.startsWith(EMPLOYEE_SUPPLEMENTAL_KEY) ||
    storageKey.endsWith(`:${tenantId}`)
  ) {
    return { scope: tenantScope(tenantId), tenantId };
  }
  return { scope: GLOBAL_SCOPE, tenantId: null };
}

function parseContractTemplates(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Record<string, unknown> => {
      return Boolean(item && typeof item === 'object' && 'id' in item && 'name' in item);
    });
  } catch {
    return [];
  }
}

async function mirrorContractTemplatesToDraftTemplateTable(storageKey: string, value: string, tenantId: string | null | undefined) {
  if (!tenantId) return;
  if (storageKey !== CONTRACT_TEMPLATES_KEY && !storageKey.startsWith(`${CONTRACT_TEMPLATES_KEY}:`)) return;

  const templates = parseContractTemplates(value);
  const ids = templates.map((template) => String(template.id));

  await prisma.$transaction([
    prisma.draftTemplate.deleteMany({
      where: {
        tenantId,
        body: { contains: `"storageKind":"${CONTRACT_TEMPLATE_MARKER}"` },
        ...(ids.length ? { id: { notIn: ids } } : {}),
      },
    }),
    ...templates.map((template) =>
      prisma.draftTemplate.upsert({
        where: { id: String(template.id) },
        create: {
          id: String(template.id),
          tenantId,
          title: String(template.name),
          description: null,
          category: 'hr',
          body: JSON.stringify({ ...template, storageKind: CONTRACT_TEMPLATE_MARKER }),
          version: 1,
          isActive: true,
        },
        update: {
          tenantId,
          title: String(template.name),
          body: JSON.stringify({ ...template, storageKind: CONTRACT_TEMPLATE_MARKER }),
          version: 1,
          isActive: true,
        },
      }),
    ),
  ]);
}

export async function listClientStorageStates(tenantId: string | null | undefined): Promise<HydratedClientStorageState[]> {
  const scopes = tenantId ? [GLOBAL_SCOPE, tenantScope(tenantId)] : [GLOBAL_SCOPE];
  const rows =
    scopes.length === 1
      ? await prisma.$queryRaw<Array<{ storageKey: string; value: string }>>`
          SELECT "storageKey", "value"
          FROM "ClientStorageState"
          WHERE "scope" = ${scopes[0]}
          ORDER BY "scope" ASC, "updatedAt" ASC
        `
      : await prisma.$queryRaw<Array<{ storageKey: string; value: string }>>`
          SELECT "storageKey", "value"
          FROM "ClientStorageState"
          WHERE "scope" = ${scopes[0]} OR "scope" = ${scopes[1]}
          ORDER BY "scope" ASC, "updatedAt" ASC
        `;

  return rows.map((row) => ({ storageKey: row.storageKey, value: row.value }));
}

export async function upsertClientStorageState(storageKey: string, value: string, tenantId: string | null | undefined) {
  const scope = getScopeForStorageKey(storageKey, tenantId);

  await prisma.$executeRaw`
    INSERT INTO "ClientStorageState" ("id", "scope", "tenantId", "storageKey", "value", "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${scope.scope}, ${scope.tenantId}, ${storageKey}, ${value}, NOW(), NOW())
    ON CONFLICT ("scope", "storageKey")
    DO UPDATE SET "tenantId" = EXCLUDED."tenantId", "value" = EXCLUDED."value", "updatedAt" = NOW()
  `;

  await mirrorContractTemplatesToDraftTemplateTable(storageKey, value, scope.tenantId);
}

export async function upsertClientStorageStates(entries: HydratedClientStorageState[], tenantId: string | null | undefined) {
  for (const entry of entries) {
    await upsertClientStorageState(entry.storageKey, entry.value, tenantId);
  }
}

export async function removeClientStorageState(storageKey: string, tenantId: string | null | undefined) {
  const scope = getScopeForStorageKey(storageKey, tenantId);
  await prisma.$executeRaw`
    DELETE FROM "ClientStorageState"
    WHERE "scope" = ${scope.scope} AND "storageKey" = ${storageKey}
  `;

  if (scope.tenantId && (storageKey === CONTRACT_TEMPLATES_KEY || storageKey.startsWith(`${CONTRACT_TEMPLATES_KEY}:`))) {
    await mirrorContractTemplatesToDraftTemplateTable(storageKey, '[]', scope.tenantId);
  }
}
