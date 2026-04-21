import { NextResponse } from 'next/server';
import { MENU_PERMISSION_ITEMS, ensureOwnerMembershipRole, ensureTenantDefaultRoles, requireBusinessOwner } from '../../../lib/access-control';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

function normalizeRoleKey(label: string) {
  const fallback = `custom_${Date.now()}`;
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\u0600-\u06ff]/g, '') || fallback
  );
}

async function getAccessPayload(tenantId: string) {
  await ensureTenantDefaultRoles(tenantId);

  const [roles, memberships, representatives] = await Promise.all([
    prisma.tenantRole.findMany({
      where: { tenantId },
      include: { permissions: true },
      orderBy: [{ system: 'desc' }, { createdAt: 'asc' }],
    }),
    prisma.userTenantMembership.findMany({
      where: { tenantId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        roles: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.directoryRepresentative.findMany({
      where: { tenantId },
      include: {
        principal: { select: { id: true, name: true, role: true, personType: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    menuItems: MENU_PERMISSION_ITEMS,
    roles: roles.map((role) => ({
      id: role.id,
      key: role.key,
      label: role.label,
      system: role.system,
      menuItemIds: role.permissions.map((permission) => permission.menuItemId),
    })),
    members: memberships.map((membership) => ({
      id: membership.id,
      userId: membership.userId,
      fullName: membership.user.fullName,
      email: membership.user.email,
      legacyRole: membership.role,
      roleIds: membership.roles.map((role) => role.roleId),
    })),
    representatives: representatives.map((representative) => ({
      id: representative.id,
      principalType: representative.principalType,
      principalName: representative.principal.name,
      fullName: representative.fullName,
      email: representative.email,
      hasSigningAuthority: representative.hasSigningAuthority,
      panelAccessEnabled: representative.panelAccessEnabled,
      user: representative.user,
    })),
  };
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const isOwner = await requireBusinessOwner(session.userId, session.tenantId);
    if (!isOwner) {
      return NextResponse.json({ message: 'فقط صاحب کسب و کار به مدیریت نقش‌ها و دسترسی‌ها دسترسی دارد.' }, { status: 403 });
    }

    const payload = await getAccessPayload(session.tenantId);
    return NextResponse.json(payload);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const isOwner = await requireBusinessOwner(session.userId, session.tenantId);
    if (!isOwner) {
      return NextResponse.json({ message: 'فقط صاحب کسب و کار می‌تواند نقش جدید بسازد.' }, { status: 403 });
    }

    const body = (await request.json()) as { label?: string };
    const label = body.label?.trim();
    if (!label) {
      return NextResponse.json({ message: 'عنوان نقش الزامی است.' }, { status: 400 });
    }

    let key = normalizeRoleKey(label);
    const existing = await prisma.tenantRole.findUnique({ where: { tenantId_key: { tenantId: session.tenantId, key } } });
    if (existing) key = `${key}_${Date.now()}`;

    await prisma.tenantRole.create({
      data: {
        tenantId: session.tenantId,
        key,
        label,
        system: false,
      },
    });

    const payload = await getAccessPayload(session.tenantId);
    return NextResponse.json(payload);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const isOwner = await requireBusinessOwner(session.userId, session.tenantId);
    if (!isOwner) {
      return NextResponse.json({ message: 'فقط صاحب کسب و کار می‌تواند دسترسی‌ها را تغییر دهد.' }, { status: 403 });
    }

    const body = (await request.json()) as {
      roleId?: string;
      menuItemIds?: string[];
      membershipId?: string;
      roleIds?: string[];
    };

    if (body.roleId) {
      const role = await prisma.tenantRole.findFirst({ where: { id: body.roleId, tenantId: session.tenantId } });
      if (!role) return NextResponse.json({ message: 'نقش پیدا نشد.' }, { status: 404 });

      const validMenuIds = new Set(MENU_PERMISSION_ITEMS.map((item) => item.id));
      const menuItemIds = Array.from(new Set((body.menuItemIds ?? []).filter((id) => validMenuIds.has(id))));

      await prisma.$transaction([
        prisma.tenantRoleMenuPermission.deleteMany({ where: { roleId: role.id } }),
        prisma.tenantRoleMenuPermission.createMany({
          data: menuItemIds.map((menuItemId) => ({ roleId: role.id, menuItemId })),
          skipDuplicates: true,
        }),
      ]);
    }

    if (body.membershipId) {
      const membership = await prisma.userTenantMembership.findFirst({ where: { id: body.membershipId, tenantId: session.tenantId } });
      if (!membership) return NextResponse.json({ message: 'عضو پیدا نشد.' }, { status: 404 });

      const roles = await prisma.tenantRole.findMany({
        where: { tenantId: session.tenantId, id: { in: body.roleIds ?? [] } },
        select: { id: true, key: true },
      });

      await prisma.$transaction([
        prisma.userTenantMembershipRole.deleteMany({ where: { membershipId: membership.id } }),
        prisma.userTenantMembershipRole.createMany({
          data: roles.map((role) => ({ membershipId: membership.id, roleId: role.id })),
          skipDuplicates: true,
        }),
      ]);

      if (membership.role === 'owner') {
        await ensureOwnerMembershipRole(membership.id, session.tenantId);
      }
    }

    const payload = await getAccessPayload(session.tenantId);
    return NextResponse.json(payload);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
