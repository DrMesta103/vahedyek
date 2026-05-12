import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { getMembershipAccess, hasPermission } from '../../lib/access-control';
import { enrichLegacyContractSubjectDiff } from '../../lib/audit-log-presenters';
import { requireSessionContext } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { handlePrismaApiError } from '../../lib/prismaApiError';

const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date;
}

type AuditLogRow = Awaited<ReturnType<typeof prisma.auditLog.findMany>>[number];

function collectDiffValues(logs: AuditLogRow[], field: string) {
  const values = new Set<string>();
  for (const log of logs) {
    if (log.action !== 'contract.subject.update' || !Array.isArray(log.diff)) continue;
    for (const item of log.diff) {
      if (!item || typeof item !== 'object') continue;
      const diff = item as { field?: unknown; before?: unknown; after?: unknown };
      if (diff.field !== field) continue;
      if (typeof diff.before === 'string' && diff.before && diff.before !== 'خالی') values.add(diff.before);
      if (typeof diff.after === 'string' && diff.after && diff.after !== 'خالی') values.add(diff.after);
    }
  }
  return Array.from(values);
}

async function enrichAuditLogsForDisplay(tenantId: string, logs: AuditLogRow[]) {
  const subjectLogs = logs.filter((log) => log.action === 'contract.subject.update' && Array.isArray(log.diff));
  if (!subjectLogs.length) return logs;

  const employeeIds = collectDiffValues(subjectLogs, 'contractorEmployeeId');
  const blockIds = collectDiffValues(subjectLogs, 'blockId');
  const unitIds = collectDiffValues(subjectLogs, 'unitId');

  const [tenant, employees, blocks, units] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    employeeIds.length
      ? prisma.employee.findMany({
          where: { tenantId, id: { in: employeeIds } },
          select: { id: true, firstName: true, lastName: true, nationalCode: true },
        })
      : Promise.resolve([]),
    blockIds.length
      ? prisma.block.findMany({
          where: { tenantId, id: { in: blockIds } },
          select: { id: true, name: true, mainPlate: true, subPlate: true },
        })
      : Promise.resolve([]),
    unitIds.length
      ? prisma.unit.findMany({
          where: { tenantId, id: { in: unitIds } },
          select: {
            id: true,
            name: true,
            floorName: true,
            blockId: true,
            block: { select: { id: true, name: true, mainPlate: true, subPlate: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const lookup = {
    tenantName: tenant?.name ?? 'سازنده اصلی',
    employeesById: new Map(employees.map((employee) => [employee.id, employee])),
    blocksById: new Map([...blocks, ...units.map((unit) => unit.block)].filter(Boolean).map((block) => [block.id, block])),
    unitsById: new Map(units.map((unit) => [unit.id, unit])),
  };

  return logs.map((log) =>
    log.action === 'contract.subject.update'
      ? {
          ...log,
          diff: enrichLegacyContractSubjectDiff(log.diff, lookup),
        }
      : log,
  );
}

export async function GET(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const access = await getMembershipAccess(session.userId, session.tenantId);
    if (!hasPermission(access, 'audit.logs.view')) {
      return NextResponse.json({ message: 'شما به مشاهده لاگ‌ها دسترسی ندارید.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get('pageSize'), 25), MAX_PAGE_SIZE);
    const q = url.searchParams.get('q')?.trim();
    const actorUserId = url.searchParams.get('actorUserId')?.trim();
    const action = url.searchParams.get('action')?.trim();
    const entityType = url.searchParams.get('entityType')?.trim();
    const dateFrom = parseDate(url.searchParams.get('dateFrom'));
    const dateTo = parseDate(url.searchParams.get('dateTo'), true);

    const where: Prisma.AuditLogWhereInput = {
      tenantId: session.tenantId,
      ...(actorUserId ? { actorUserId } : {}),
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { actorName: { contains: q, mode: 'insensitive' } },
              { action: { contains: q, mode: 'insensitive' } },
              { entityType: { contains: q, mode: 'insensitive' } },
              { entityLabel: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, logs, facets] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.findMany({
        where: { tenantId: session.tenantId },
        select: { actorUserId: true, actorName: true, action: true, entityType: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const enrichedLogs = await enrichAuditLogsForDisplay(session.tenantId, logs);

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      },
      filters: {
        actors: Array.from(new Map(facets.filter((item) => item.actorUserId).map((item) => [item.actorUserId, item.actorName])).entries()).map(
          ([id, name]) => ({ id, name }),
        ),
        actions: Array.from(new Set(facets.map((item) => item.action))).sort(),
        entityTypes: Array.from(new Set(facets.map((item) => item.entityType))).sort(),
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
