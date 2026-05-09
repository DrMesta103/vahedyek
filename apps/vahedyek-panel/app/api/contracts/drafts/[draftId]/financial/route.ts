import { NextResponse } from 'next/server';
import { PricingType } from '@prisma/client';
import { requireSessionContext } from '../../../../../lib/auth';
import { normalizeFinancialCategories, normalizeFinancialDueItems, toNumber } from '../../../../../lib/financialUtils';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';

function parsePricingType(value: string) {
  return value === 'metered' ? PricingType.metered : PricingType.fixed;
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
}

function buildScopedId(financialId: string, rawId: string) {
  return `${financialId}:${rawId}`;
}

function unwrapScopedId(financialId: string, rawId: string) {
  const prefix = `${financialId}:`;
  return rawId.startsWith(prefix) ? rawId.slice(prefix.length) : rawId;
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

    const financial = await prisma.contractFinancial.findUnique({
      where: { draftId },
      include: {
        categories: {
          orderBy: { name: 'asc' },
        },
        dueItems: {
          orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!financial) {
      return NextResponse.json(null);
    }

    const categories = financial.categories.map((item) => ({
      id: unwrapScopedId(financial.id, item.id),
      name: item.name,
      capAmount: Number(item.capAmount),
      dueAmount: Number(item.dueAmount),
      noDueAmount: Number(item.noDueAmount),
      system: item.system,
      requiresDue: item.requiresDue,
    }));

    const categoryIds = new Set(categories.map((item) => item.id));
    const dueItems = financial.dueItems
      .map((item) => ({
        id: unwrapScopedId(financial.id, item.id),
        categoryId: unwrapScopedId(financial.id, item.categoryId),
        title: item.title,
        amount: Number(item.amount),
        dueDate: item.dueDate,
      }))
      .filter((item) => categoryIds.has(item.categoryId))
      .map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        title: item.title,
        amount: item.amount,
        dueDate: item.dueDate,
      }));

    return NextResponse.json({
      pricingType: serializePricingType(financial.pricingType),
      unitArea: financial.unitArea ? String(Number(financial.unitArea)) : '',
      parkingArea: financial.parkingArea ? String(Number(financial.parkingArea)) : '',
      totalArea: financial.totalArea ? String(Number(financial.totalArea)) : '',
      pricePerMeter: financial.pricePerMeter ? String(Number(financial.pricePerMeter)) : '',
      parkingPricePerMeter: financial.parkingPricePerMeter ? String(Number(financial.parkingPricePerMeter)) : '',
      fixedTotalAmount: financial.fixedTotalAmount ? String(Number(financial.fixedTotalAmount)) : '',
      activeTab: categoryIds.has(financial.activeTab ?? '') ? financial.activeTab : categories[0]?.id ?? '',
      categories,
      dueItems,
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

    const body = await request.json();
    const categories = normalizeFinancialCategories(body.categories ?? []);
    const categoryIds = new Set(categories.map((item) => item.id));
    const dueItems = normalizeFinancialDueItems(body.dueItems ?? [], categoryIds);
    const activeTab = categoryIds.has(body.activeTab) ? body.activeTab : categories[0]?.id ?? null;
    const pricingType = parsePricingType(body.pricingType);
    const unitArea = body.unitArea ? toNumber(body.unitArea) : null;
    const parkingArea = body.parkingArea ? toNumber(body.parkingArea) : null;
    const totalArea = body.totalArea ? toNumber(body.totalArea) : null;
    const pricePerMeter = body.pricePerMeter ? toNumber(body.pricePerMeter) : null;
    const parkingPricePerMeter = body.parkingPricePerMeter ? toNumber(body.parkingPricePerMeter) : null;
    const fixedTotalAmount = body.fixedTotalAmount ? toNumber(body.fixedTotalAmount) : null;
    const totalContractAmount =
      pricingType === PricingType.metered
        ? (unitArea ?? Math.max((totalArea ?? 0) - (parkingArea ?? 0), 0)) * (pricePerMeter ?? 0) +
          (parkingArea ?? 0) * (parkingPricePerMeter ?? 0)
        : (fixedTotalAmount ?? 0);
    const categoriesTotal = categories.reduce((sum, item) => sum + item.capAmount, 0);

    if (totalContractAmount > 0 && categoriesTotal > totalContractAmount) {
      return NextResponse.json(
        { message: 'جمع ردیف‌های مالی از مبلغ قرارداد بیشتر است و امکان ثبت وجود ندارد.' },
        { status: 400 },
      );
    }

    const financial = await prisma.contractFinancial.upsert({
      where: { draftId },
      update: {
        pricingType,
        unitArea,
        parkingArea,
        totalArea,
        pricePerMeter,
        parkingPricePerMeter,
        fixedTotalAmount,
        activeTab,
      },
      create: {
        draftId,
        pricingType,
        unitArea,
        parkingArea,
        totalArea,
        pricePerMeter,
        parkingPricePerMeter,
        fixedTotalAmount,
        activeTab,
      },
      select: { id: true },
    });

    await prisma.financialDueItem.deleteMany({
      where: { financialId: financial.id },
    });

    await prisma.financialCategory.deleteMany({
      where: { financialId: financial.id },
    });

    if (categories.length) {
      await prisma.financialCategory.createMany({
        data: categories.map((item) => ({
          id: buildScopedId(financial.id, item.id),
          name: item.name,
          capAmount: item.capAmount,
          dueAmount: item.dueAmount,
          noDueAmount: item.noDueAmount,
          system: item.system,
          requiresDue: item.requiresDue,
          financialId: financial.id,
        })),
      });
    }

    if (dueItems.length) {
      await prisma.financialDueItem.createMany({
        data: dueItems.map((item) => ({
          id: buildScopedId(financial.id, item.id),
          categoryId: buildScopedId(financial.id, item.categoryId),
          title: item.title,
          amount: item.amount,
          dueDate: item.dueDate,
          financialId: financial.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      meta: {
        categoriesCount: categories.length,
        dueItemsCount: dueItems.length,
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
