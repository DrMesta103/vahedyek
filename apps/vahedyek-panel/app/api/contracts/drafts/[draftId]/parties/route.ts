import { NextResponse } from 'next/server';
import { FirstPartyRelatedParticipantRole, PartyOneMemberKind, PartySide, PersonType, Prisma, ShareMode } from '@/lib/prisma-client';
import { getActorName, recordAuditLog } from '../../../../../lib/audit-log';
import { requireSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';

type RawPartyMember = {
  personId?: unknown;
  directoryId?: unknown;
  personType?: unknown;
  name?: unknown;
  share?: { value?: unknown } | null;
  isPrimary?: unknown;
  partyOneMemberKind?: unknown;
  snapshot?: unknown;
};

type PartiesRequestBody = {
  partyOneMode?: unknown;
  partyTwoMode?: unknown;
  partyOne?: unknown;
  partyTwo?: unknown;
  firstPartyRelatedParticipants?: unknown;
};

type ParsedRelatedParticipant = {
  id: string;
  sourceId: string;
  sourceDirectoryId: string | null;
  personType: PersonType;
  role: FirstPartyRelatedParticipantRole;
  name: string;
  parentParticipantId: string | null;
  parentSourceId: string | null;
  snapshot: Prisma.InputJsonObject;
};

const RELATED_PARTICIPANT_ROLES = {
  representative: FirstPartyRelatedParticipantRole.representative,
  board_member: FirstPartyRelatedParticipantRole.board_member,
  natural_shareholder: FirstPartyRelatedParticipantRole.natural_shareholder,
  legal_shareholder: FirstPartyRelatedParticipantRole.legal_shareholder,
} as const;

function parseShareMode(value: unknown) {
  return value === 'percent' ? ShareMode.percent : ShareMode.dang;
}

function parsePersonType(value: unknown) {
  return value === 'legal' ? PersonType.legal : PersonType.natural;
}

function parsePartyOneMemberKind(value: unknown) {
  if (value === 'business') return PartyOneMemberKind.business;
  if (value === 'natural_shareholder') return PartyOneMemberKind.natural_shareholder;
  if (value === 'legal_shareholder') return PartyOneMemberKind.legal_shareholder;
  return null;
}

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
}

const SNAPSHOT_KEYS = [
  'fullName',
  'mobile',
  'email',
  'legalName',
  'tradeName',
  'nationalId',
  'registrationNumber',
  'registrationDate',
  'economicCode',
  'contactName',
] as const;

function parseSnapshot(value: unknown): Prisma.InputJsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  return Object.fromEntries(
    SNAPSHOT_KEYS.flatMap((key) => (typeof source[key] === 'string' ? [[key, source[key]]] : [])),
  );
}

function parseRelatedParticipants(value: unknown): { data: ParsedRelatedParticipant[]; error?: string } {
  if (value === undefined || value === null) return { data: [] };
  if (!Array.isArray(value)) return { data: [], error: 'ساختار افراد وابسته به طرف اول نامعتبر است.' };

  const parsed: ParsedRelatedParticipant[] = [];
  const ids = new Set<string>();
  const sources = new Set<string>();

  for (const rawItem of value) {
    if (!rawItem || typeof rawItem !== 'object') {
      return { data: [], error: 'یکی از افراد وابسته به طرف اول نامعتبر است.' };
    }

    const item = rawItem as Record<string, unknown>;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const sourceId = typeof item.sourceId === 'string' ? item.sourceId.trim() : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const role =
      typeof item.role === 'string'
        ? RELATED_PARTICIPANT_ROLES[item.role as keyof typeof RELATED_PARTICIPANT_ROLES]
        : undefined;
    const personType = item.personType === 'legal' ? PersonType.legal : item.personType === 'natural' ? PersonType.natural : undefined;
    const sourceDirectoryId =
      typeof item.sourceDirectoryId === 'string' && item.sourceDirectoryId.trim() ? item.sourceDirectoryId.trim() : null;
    const parentParticipantId =
      typeof item.parentParticipantId === 'string' && item.parentParticipantId.trim() ? item.parentParticipantId.trim() : null;
    const parentSourceId = typeof item.parentSourceId === 'string' && item.parentSourceId.trim() ? item.parentSourceId.trim() : null;
    const snapshot = parseSnapshot(item.snapshot);

    if (!id || !sourceId || !name || !role || !personType) {
      return { data: [], error: 'اطلاعات یکی از افراد وابسته به طرف اول کامل نیست.' };
    }

    const expectedPersonType = role === FirstPartyRelatedParticipantRole.legal_shareholder ? PersonType.legal : PersonType.natural;
    if (personType !== expectedPersonType) {
      return { data: [], error: 'نوع شخص با نقش فرد وابسته به طرف اول سازگار نیست.' };
    }

    const sourceKey = `${parentSourceId ?? 'legacy'}:${role}:${sourceId}`;
    if (ids.has(id) || sources.has(sourceKey)) {
      return { data: [], error: 'فرد وابسته تکراری برای طرف اول قابل ثبت نیست.' };
    }

    ids.add(id);
    sources.add(sourceKey);
    parsed.push({ id, sourceId, sourceDirectoryId, personType, role, name, parentParticipantId, parentSourceId, snapshot });
  }

  const byId = new Map(parsed.map((item) => [item.id, item]));
  for (const item of parsed) {
    if (!item.parentParticipantId) continue;
    const parent = byId.get(item.parentParticipantId);
    if (!parent || parent.id === item.id || parent.role !== FirstPartyRelatedParticipantRole.legal_shareholder) {
      return { data: [], error: 'رابطه والد برای فرد وابسته به طرف اول نامعتبر است.' };
    }
  }

  return { data: parsed };
}

function getRawMembers(value: unknown): RawPartyMember[] {
  return Array.isArray(value) ? (value as RawPartyMember[]) : [];
}

function validatePartyOneRelationships(
  rawMembers: RawPartyMember[],
  relatedParticipants: ParsedRelatedParticipant[],
): string | null {
  const memberById = new Map<string, { name: string; kind: PartyOneMemberKind | null; personType: PersonType }>();

  for (const member of rawMembers) {
    const personId = typeof member.personId === 'string' ? member.personId.trim() : '';
    const name = typeof member.name === 'string' && member.name.trim() ? member.name.trim() : personId;
    const kind = parsePartyOneMemberKind(member.partyOneMemberKind);
    const personType = parsePersonType(member.personType);
    if (!personId) return 'شناسه یکی از اعضای طرف اول معتبر نیست.';
    if (memberById.has(personId)) return `طرف اول «${name}» تکراری است.`;
    if (kind === PartyOneMemberKind.natural_shareholder && personType !== PersonType.natural) {
      return `نوع شخص طرف اول «${name}» با سهام‌دار حقیقی سازگار نیست.`;
    }
    if (kind === PartyOneMemberKind.legal_shareholder && personType !== PersonType.legal) {
      return `نوع شخص طرف اول «${name}» با سهام‌دار حقوقی سازگار نیست.`;
    }
    memberById.set(personId, { name, kind, personType });
  }

  for (const participant of relatedParticipants) {
    if (
      participant.role !== FirstPartyRelatedParticipantRole.representative &&
      participant.role !== FirstPartyRelatedParticipantRole.board_member
    ) {
      continue;
    }
    if (!participant.parentSourceId && participant.parentParticipantId) continue;
    const parent = participant.parentSourceId ? memberById.get(participant.parentSourceId) : null;
    if (!parent) return `والد فرد وابسته «${participant.name}» در طرف اول وجود ندارد.`;
    if (participant.role === FirstPartyRelatedParticipantRole.board_member && parent.kind !== PartyOneMemberKind.business) {
      return `عضو هیئت‌مدیره «${participant.name}» فقط می‌تواند به کارت کسب‌وکار وابسته باشد.`;
    }
    if (
      participant.role === FirstPartyRelatedParticipantRole.representative &&
      parent.kind !== PartyOneMemberKind.business &&
      parent.kind !== PartyOneMemberKind.legal_shareholder
    ) {
      return `نماینده «${participant.name}» فقط می‌تواند به کسب‌وکار یا سهام‌دار حقوقی وابسته باشد.`;
    }
  }

  return null;
}

export async function GET(_: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const parties = await prisma.contractParties.findUnique({
      where: { draftId },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
        },
        firstPartyParticipants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!parties) {
      return NextResponse.json(null);
    }

    const mapSide = (side: PartySide, mode: ShareMode) =>
      parties.members
        .filter((member) => member.side === side)
        .map((member) => ({
          personId: member.personId,
          directoryId: member.directoryId,
          personType: member.personType === PersonType.legal ? 'legal' : 'natural',
          name: member.name,
          isPrimary: member.isPrimary,
          partyOneMemberKind: member.partyOneMemberKind,
          snapshot: member.snapshot,
          share: {
            value: Number(member.shareValue),
            mode: serializeShareMode(mode),
          },
        }));

    return NextResponse.json({
      partyOneMode: serializeShareMode(parties.partyOneMode),
      partyTwoMode: serializeShareMode(parties.partyTwoMode),
      partyOne: mapSide(PartySide.party_one, parties.partyOneMode),
      partyTwo: mapSide(PartySide.party_two, parties.partyTwoMode),
      firstPartyRelatedParticipants: parties.firstPartyParticipants.map((participant) => ({
        id: participant.id,
        sourceId: participant.sourceId,
        sourceDirectoryId: participant.sourceDirectoryId,
        personType: participant.personType === PersonType.legal ? 'legal' : 'natural',
        role: participant.role,
        name: participant.name,
        parentParticipantId: participant.parentParticipantId,
        parentSourceId: participant.parentSourceId,
        snapshot: participant.snapshot,
      })),
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true, approvalInstance: { select: { status: true } } },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    if (draft.approvalInstance?.status === 'IN_REVIEW') {
      return NextResponse.json({ message: 'این پیش‌نویس در فرایند تأیید است و امکان ویرایش ندارد.' }, { status: 409 });
    }

    const body = (await request.json()) as PartiesRequestBody;
    const relatedParticipants = parseRelatedParticipants(body.firstPartyRelatedParticipants);
    if (relatedParticipants.error) {
      return NextResponse.json({ message: relatedParticipants.error }, { status: 400 });
    }
    const rawPartyOne = getRawMembers(body.partyOne);
    const relationshipError = validatePartyOneRelationships(rawPartyOne, relatedParticipants.data);
    if (relationshipError) {
      return NextResponse.json({ message: relationshipError }, { status: 400 });
    }

    const { memberCount, relatedParticipantCount } = await prisma.$transaction(async (transaction) => {
      const contractParties = await transaction.contractParties.upsert({
        where: { draftId },
        update: {
          partyOneMode: parseShareMode(body.partyOneMode),
          partyTwoMode: parseShareMode(body.partyTwoMode),
        },
        create: {
          draftId,
          partyOneMode: parseShareMode(body.partyOneMode),
          partyTwoMode: parseShareMode(body.partyTwoMode),
        },
        select: { id: true },
      });

      await transaction.contractPartyMember.deleteMany({
        where: { partiesId: contractParties.id },
      });

      const items = [
        ...rawPartyOne.map((member) => ({
          partiesId: contractParties.id,
          side: PartySide.party_one,
          personId: String(member.personId ?? ''),
          directoryId: typeof member.directoryId === 'string' && member.directoryId.trim() ? member.directoryId : null,
          personType: parsePersonType(member.personType),
          name: String(member.name ?? ''),
          shareValue: Number(member.share?.value ?? 0),
          isPrimary: Boolean(member.isPrimary),
          partyOneMemberKind: parsePartyOneMemberKind(member.partyOneMemberKind),
          snapshot: parseSnapshot(member.snapshot),
        })),
        ...getRawMembers(body.partyTwo).map((member) => ({
          partiesId: contractParties.id,
          side: PartySide.party_two,
          personId: String(member.personId ?? ''),
          directoryId: typeof member.directoryId === 'string' && member.directoryId.trim() ? member.directoryId : null,
          personType: parsePersonType(member.personType),
          name: String(member.name ?? ''),
          shareValue: Number(member.share?.value ?? 0),
          isPrimary: Boolean(member.isPrimary),
          partyOneMemberKind: null,
          snapshot: {},
        })),
      ];

      if (items.length) {
        await transaction.contractPartyMember.createMany({ data: items });
      }

      await transaction.contractFirstPartyRelatedParticipant.deleteMany({
        where: { partiesId: contractParties.id },
      });

      if (relatedParticipants.data.length) {
        await transaction.contractFirstPartyRelatedParticipant.createMany({
          data: relatedParticipants.data.map((participant) => ({ ...participant, partiesId: contractParties.id })),
        });
      }

      return {
        memberCount: items.length,
        relatedParticipantCount: relatedParticipants.data.length,
      };
    });

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.parties.update',
      entityType: 'contract_draft',
      entityId: draftId,
      entityLabel: `پیش‌نویس ${draftId}`,
      summary: `${getActorName(session)} طرفین قرارداد را ویرایش کرد.`,
      details: { membersCount: memberCount, firstPartyRelatedParticipantsCount: relatedParticipantCount },
      diff: [
        { field: 'membersCount', label: 'تعداد طرفین', before: 'نامشخص', after: String(memberCount) },
        {
          field: 'firstPartyRelatedParticipantsCount',
          label: 'تعداد افراد وابسته به طرف اول',
          before: 'نامشخص',
          after: String(relatedParticipantCount),
        },
      ],
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
