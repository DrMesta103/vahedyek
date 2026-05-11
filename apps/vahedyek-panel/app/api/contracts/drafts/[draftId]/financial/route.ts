import { NextResponse } from 'next/server';
import { PricingType } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../../../lib/auth';
import {
  normalizeFinancialCategories,
  normalizeFinancialDueItems,
  sortFinancialCategoriesForPersistence,
  sumFinancialCapsCountedAgainstContractTotal,
  toNumber,
} from '../../../../../lib/financialUtils';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import { buildFinancialScopedId } from '../../../../../lib/financialScopedIds';
import {
  computeFixedContractTotal,
  computeMeteredContractTotal,
  normalizeAreaPricingMode,
} from '../../../../../lib/contractFinancialPricing';
import {
  mapFinancialCategoriesForClientApi,
  mapFinancialDueItemsForClientApiFiltered,
  resolveFinancialActiveTabForClientApi,
} from '../../../../../lib/financialCategoriesApiSerialize';

const PRINCIPAL_CATEGORY_ID = 'principal';

function parsePricingType(value: string) {
  return value === 'metered' ? PricingType.metered : PricingType.fixed;
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
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
        categories: true,
        dueItems: {
          orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!financial) {
      return NextResponse.json(null);
    }

    const categories = mapFinancialCategoriesForClientApi(financial.id, financial.categories);
    const categoryIds = new Set(categories.map((item) => item.id));
    const dueItems = mapFinancialDueItemsForClientApiFiltered(financial.id, financial.dueItems, categoryIds);
    const activeTab = resolveFinancialActiveTabForClientApi(
      financial.id,
      financial.activeTab,
      categoryIds,
      categories[0]?.id ?? '',
    );

    return NextResponse.json({
      pricingType: serializePricingType(financial.pricingType),
      areaPricingMode: normalizeAreaPricingMode(financial.areaPricingMode),
      unitArea: financial.unitArea ? String(Number(financial.unitArea)) : '',
      parkingArea: financial.parkingArea ? String(Number(financial.parkingArea)) : '',
      storageArea: financial.storageArea ? String(Number(financial.storageArea)) : '',
      totalArea: financial.totalArea ? String(Number(financial.totalArea)) : '',
      pricePerMeter: financial.pricePerMeter ? String(Number(financial.pricePerMeter)) : '',
      parkingPricePerMeter: financial.parkingPricePerMeter ? String(Number(financial.parkingPricePerMeter)) : '',
      storagePricePerMeter: financial.storagePricePerMeter ? String(Number(financial.storagePricePerMeter)) : '',
      fixedTotalAmount: financial.fixedTotalAmount ? String(Number(financial.fixedTotalAmount)) : '',
      parkingFixedAmount: financial.parkingFixedAmount ? String(Number(financial.parkingFixedAmount)) : '',
      storageFixedAmount: financial.storageFixedAmount ? String(Number(financial.storageFixedAmount)) : '',
      activeTab,
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
    const areaPricingMode = normalizeAreaPricingMode(body.areaPricingMode);
    const unitArea = body.unitArea ? toNumber(body.unitArea) : null;
    const parkingArea = body.parkingArea ? toNumber(body.parkingArea) : null;
    const storageArea = body.storageArea ? toNumber(body.storageArea) : null;
    const totalArea = body.totalArea ? toNumber(body.totalArea) : null;
    const pricePerMeter = body.pricePerMeter ? toNumber(body.pricePerMeter) : null;
    const parkingPricePerMeter = body.parkingPricePerMeter ? toNumber(body.parkingPricePerMeter) : null;
    const storagePricePerMeter = body.storagePricePerMeter ? toNumber(body.storagePricePerMeter) : null;
    const fixedTotalAmount = body.fixedTotalAmount ? toNumber(body.fixedTotalAmount) : null;
    const parkingFixedAmount = body.parkingFixedAmount ? toNumber(body.parkingFixedAmount) : null;
    const storageFixedAmount = body.storageFixedAmount ? toNumber(body.storageFixedAmount) : null;
    const totalContractAmount =
      pricingType === PricingType.metered
        ? computeMeteredContractTotal({
            areaPricingMode,
            unitArea: unitArea ?? Math.max((totalArea ?? 0) - (parkingArea ?? 0) - (storageArea ?? 0), 0),
            parkingArea,
            storageArea,
            pricePerMeter,
            parkingPricePerMeter,
            storagePricePerMeter,
          })
        : computeFixedContractTotal({
            areaPricingMode,
            fixedTotalAmount,
            parkingFixedAmount,
            storageFixedAmount,
          });
    const categoriesTotal = sumFinancialCapsCountedAgainstContractTotal(categories);

    if (totalContractAmount > 0 && categoriesTotal > totalContractAmount) {
      return NextResponse.json(
        { message: 'جمع ردیف‌های مالی از مبلغ قرارداد بیشتر است و امکان ثبت وجود ندارد.' },
        { status: 400 },
      );
    }

    const categoriesWithPrincipal = (() => {
      const principal = {
        id: PRINCIPAL_CATEGORY_ID,
        name: 'مبلغ اصل قرارداد',
        capAmount: totalContractAmount,
        dueAmount: 0,
        noDueAmount: totalContractAmount,
        system: true,
        requiresDue: false,
      };
      const rest = categories.filter((c) => c.id !== PRINCIPAL_CATEGORY_ID);
      return sortFinancialCategoriesForPersistence([principal, ...rest]);
    })();

    const financial = await prisma.contractFinancial.upsert({
      where: { draftId },
      update: {
        pricingType,
        areaPricingMode,
        unitArea,
        parkingArea,
        storageArea,
        totalArea,
        pricePerMeter,
        parkingPricePerMeter,
        storagePricePerMeter,
        fixedTotalAmount,
        parkingFixedAmount,
        storageFixedAmount,
        activeTab,
      },
      create: {
        draftId,
        pricingType,
        areaPricingMode,
        unitArea,
        parkingArea,
        storageArea,
        totalArea,
        pricePerMeter,
        parkingPricePerMeter,
        storagePricePerMeter,
        fixedTotalAmount,
        parkingFixedAmount,
        storageFixedAmount,
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

    if (categoriesWithPrincipal.length) {
      await prisma.financialCategory.createMany({
        data: categoriesWithPrincipal.map((item) => ({
          id: buildFinancialScopedId(financial.id, item.id),
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
          id: buildFinancialScopedId(financial.id, item.id),
          categoryId: buildFinancialScopedId(financial.id, item.categoryId),
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
