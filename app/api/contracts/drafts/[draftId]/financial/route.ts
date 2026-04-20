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


export async function GET(_: Request, { params }: { params: { draftId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: params.draftId, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const financial = await prisma.contractFinancial.findUnique({
      where: { draftId: params.draftId },
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
      id: item.id,
      name: item.name,
      capAmount: Number(item.capAmount),
      dueAmount: Number(item.dueAmount),
      noDueAmount: Number(item.noDueAmount),
      system: item.system,
      requiresDue: item.requiresDue,
    }));

    const categoryIds = new Set(categories.map((item) => item.id));
    const dueItems = financial.dueItems
      .filter((item) => categoryIds.has(item.categoryId))
      .map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        title: item.title,
        amount: Number(item.amount),
        dueDate: item.dueDate,
      }));

    return NextResponse.json({
      pricingType: serializePricingType(financial.pricingType),
      totalArea: financial.totalArea ? String(Number(financial.totalArea)) : '',
      pricePerMeter: financial.pricePerMeter ? String(Number(financial.pricePerMeter)) : '',
      fixedTotalAmount: financial.fixedTotalAmount ? String(Number(financial.fixedTotalAmount)) : '',
      activeTab: categoryIds.has(financial.activeTab ?? '') ? financial.activeTab : categories[0]?.id ?? '',
      categories,
      dueItems,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { draftId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: params.draftId, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const body = await request.json();
    const categories = normalizeFinancialCategories(body.categories ?? []);
    const categoryIds = new Set(categories.map((item) => item.id));
    const dueItems = normalizeFinancialDueItems(body.dueItems ?? [], categoryIds);
    const activeTab = categoryIds.has(body.activeTab) ? body.activeTab : categories[0]?.id ?? null;
    const pricingType = parsePricingType(body.pricingType);
    const totalArea = body.totalArea ? toNumber(body.totalArea) : null;
    const pricePerMeter = body.pricePerMeter ? toNumber(body.pricePerMeter) : null;
    const fixedTotalAmount = body.fixedTotalAmount ? toNumber(body.fixedTotalAmount) : null;
    const totalContractAmount =
      pricingType === PricingType.metered ? (totalArea ?? 0) * (pricePerMeter ?? 0) : (fixedTotalAmount ?? 0);
    const categoriesTotal = categories.reduce((sum, item) => sum + item.capAmount, 0);

    if (totalContractAmount > 0 && categoriesTotal > totalContractAmount) {
      return NextResponse.json(
        { message: 'جمع ردیف‌های مالی از مبلغ قرارداد بیشتر است و امکان ثبت وجود ندارد.' },
        { status: 400 },
      );
    }

    const financial = await prisma.contractFinancial.upsert({
      where: { draftId: params.draftId },
      update: {
        pricingType,
        totalArea,
        pricePerMeter,
        fixedTotalAmount,
        activeTab,
      },
      create: {
        draftId: params.draftId,
        pricingType,
        totalArea,
        pricePerMeter,
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
          ...item,
          financialId: financial.id,
        })),
      });
    }

    if (dueItems.length) {
      await prisma.financialDueItem.createMany({
        data: dueItems.map((item) => ({
          ...item,
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
