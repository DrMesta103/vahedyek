import { NextResponse } from 'next/server';
import { PartySide, PersonType, ShareMode } from '@prisma/client';
import { requireSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';

function parseShareMode(value: string) {
  return value === 'percent' ? ShareMode.percent : ShareMode.dang;
}

function parsePersonType(value: string) {
  return value === 'legal' ? PersonType.legal : PersonType.natural;
}

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
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
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const body = await request.json();

    const contractParties = await prisma.contractParties.upsert({
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

    await prisma.contractPartyMember.deleteMany({
      where: { partiesId: contractParties.id },
    });

    const items = [
      ...(body.partyOne ?? []).map((member: any) => ({
        partiesId: contractParties.id,
        side: PartySide.party_one,
        personId: member.personId,
        directoryId: typeof member.directoryId === 'string' && member.directoryId.trim() ? member.directoryId : null,
        personType: parsePersonType(member.personType),
        name: member.name,
        shareValue: Number(member.share?.value ?? 0),
        isPrimary: Boolean(member.isPrimary),
      })),
      ...(body.partyTwo ?? []).map((member: any) => ({
        partiesId: contractParties.id,
        side: PartySide.party_two,
        personId: member.personId,
        directoryId: typeof member.directoryId === 'string' && member.directoryId.trim() ? member.directoryId : null,
        personType: parsePersonType(member.personType),
        name: member.name,
        shareValue: Number(member.share?.value ?? 0),
        isPrimary: Boolean(member.isPrimary),
      })),
    ];

    if (items.length) {
      await prisma.contractPartyMember.createMany({
        data: items,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
