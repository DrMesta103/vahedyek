import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

const BLOCKS = [
  { name: 'بلوک آفتاب', mainPlate: '100', subPlate: '1' },
  { name: 'بلوک باران', mainPlate: '100', subPlate: '2' },
  { name: 'بلوک سپهر', mainPlate: '100', subPlate: '3' },
];

const RESIDENTIAL_FLOORS = ['طبقه اول', 'طبقه دوم', 'طبقه سوم', 'طبقه چهارم'];
const SERVICE_FLOORS = ['پارکینگ', 'انباری', 'رفاهی'];
const DIRECTIONS = ['north', 'south', 'east', 'west'] as const;
const UNIT_TYPES = ['تیپ A', 'تیپ B', 'تیپ C', 'تیپ D'];

type UnitSeed = {
  id: string;
  tenantId: string;
  blockId: string;
  floorName: string;
  name: string;
  category?: string;
  unitType?: string | null;
  usage?: string;
  saleEnabled?: boolean;
  deliveryStatus?: string;
  area?: number | null;
  balconyCount?: number;
  bedroomCount?: number;
  postalCode?: string | null;
  amenities?: Array<{ title: string; count: number }>;
  baseInfo?: string | null;
  direction?: string;
  assignedToUnitId?: string | null;
};

function makeResidentialUnit(tenantId: string, blockId: string, blockIndex: number, floorIndex: number, unitIndex: number): UnitSeed {
  const id = crypto.randomUUID();
  const floorNumber = floorIndex + 1;
  const unitNumber = `${blockIndex + 1}${floorNumber}${String(unitIndex + 1).padStart(2, '0')}`;

  return {
    id,
    tenantId,
    blockId,
    floorName: RESIDENTIAL_FLOORS[floorIndex],
    name: `واحد ${unitNumber}`,
    category: 'unit',
    unitType: UNIT_TYPES[unitIndex],
    usage: unitIndex === 3 ? 'office' : 'residential',
    saleEnabled: true,
    deliveryStatus: floorIndex === 3 ? 'presale' : 'ready',
    area: 86 + floorIndex * 8 + unitIndex * 6,
    balconyCount: unitIndex % 2 === 0 ? 1 : 2,
    bedroomCount: unitIndex < 2 ? 2 : 3,
    postalCode: `199${blockIndex + 1}${floorNumber}${String(unitIndex + 1).padStart(2, '0')}000`,
    amenities: [
      { title: 'آسانسور', count: 1 },
      { title: 'تراس', count: unitIndex % 2 === 0 ? 1 : 2 },
      { title: 'آیفون تصویری', count: 1 },
    ],
    baseInfo: `واحد ${unitNumber} با نورگیری ${DIRECTIONS[unitIndex]} و دسترسی کامل به مشاعات بلوک.`,
    direction: DIRECTIONS[unitIndex],
  };
}

function makeAssignedServiceUnit(
  tenantId: string,
  blockId: string,
  category: 'parking' | 'storage',
  assignedToUnitId: string,
  index: number,
): UnitSeed {
  const isParking = category === 'parking';

  return {
    id: crypto.randomUUID(),
    tenantId,
    blockId,
    floorName: isParking ? 'پارکینگ' : 'انباری',
    name: `${isParking ? 'پارکینگ' : 'انباری'} ${String(index + 1).padStart(2, '0')}`,
    category,
    unitType: null,
    usage: 'residential',
    saleEnabled: false,
    deliveryStatus: 'ready',
    area: isParking ? 12.5 : 4.5,
    balconyCount: 0,
    bedroomCount: 0,
    postalCode: null,
    amenities: [],
    baseInfo: `${isParking ? 'جای پارک اختصاصی' : 'انباری اختصاصی'} متصل به واحد مسکونی.`,
    direction: 'unknown',
    assignedToUnitId,
  };
}

function makeAmenityUnits(tenantId: string, blockId: string): UnitSeed[] {
  return [
    { name: 'لابی', area: 85, baseInfo: 'فضای لابی با نگهبانی و محل انتظار ساکنان.' },
    { name: 'سالن اجتماعات', area: 120, baseInfo: 'سالن چندمنظوره برای جلسات و رویدادهای ساکنان.' },
    { name: 'اتاق ورزش', area: 70, baseInfo: 'فضای ورزشی عمومی با تجهیزات پایه.' },
    { name: 'اتاق تاسیسات', area: 45, baseInfo: 'فضای پشتیبانی و تاسیسات بلوک.' },
  ].map((item) => ({
    id: crypto.randomUUID(),
    tenantId,
    blockId,
    floorName: 'رفاهی',
    name: item.name,
    category: 'amenity',
    unitType: null,
    usage: 'residential',
    saleEnabled: false,
    deliveryStatus: 'ready',
    area: item.area,
    balconyCount: 0,
    bedroomCount: 0,
    postalCode: null,
    amenities: [],
    baseInfo: item.baseInfo,
    direction: 'unknown',
  }));
}

export async function POST() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    let blocksCreated = 0;
    let floorsCreated = 0;
    let unitsCreated = 0;

    await prisma.$transaction(async (tx) => {
      await tx.unit.deleteMany({ where: { tenantId: session.tenantId } });
      await tx.blockFloor.deleteMany({ where: { tenantId: session.tenantId } });
      await tx.block.deleteMany({ where: { tenantId: session.tenantId } });

      for (let blockIndex = 0; blockIndex < BLOCKS.length; blockIndex += 1) {
        const blockSeed = BLOCKS[blockIndex];
        const blockId = crypto.randomUUID();
        const residentialUnits = RESIDENTIAL_FLOORS.flatMap((_, floorIndex) =>
          Array.from({ length: 4 }, (_, unitIndex) => makeResidentialUnit(session.tenantId, blockId, blockIndex, floorIndex, unitIndex)),
        );

        const serviceUnits = residentialUnits.flatMap((unit, index) => [
          makeAssignedServiceUnit(session.tenantId, blockId, 'parking', unit.id, index),
          makeAssignedServiceUnit(session.tenantId, blockId, 'storage', unit.id, index),
        ]);

        const amenityUnits = makeAmenityUnits(session.tenantId, blockId);
        const units = [...residentialUnits, ...serviceUnits, ...amenityUnits];

        await tx.block.create({
          data: {
            id: blockId,
            tenantId: session.tenantId,
            name: blockSeed.name,
            mainPlate: blockSeed.mainPlate,
            subPlate: blockSeed.subPlate,
            status: 'complete',
            usageCounts: {
              residential: residentialUnits.filter((unit) => unit.usage === 'residential').length,
              commercial: 0,
              office: residentialUnits.filter((unit) => unit.usage === 'office').length,
              parking: residentialUnits.length,
              storage: residentialUnits.length,
              amenity: amenityUnits.length,
            },
          },
        });

        const floorNames = [...RESIDENTIAL_FLOORS, ...SERVICE_FLOORS];
        await tx.blockFloor.createMany({
          data: floorNames.map((name) => ({
            id: crypto.randomUUID(),
            tenantId: session.tenantId,
            blockId,
            name,
          })),
        });

        await tx.unit.createMany({
          data: units.map((unit) => ({
            ...unit,
            amenities: unit.amenities ?? [],
          })),
        });

        blocksCreated += 1;
        floorsCreated += floorNames.length;
        unitsCreated += units.length;
      }
    });

    return NextResponse.json({
      success: true,
      blocksCreated,
      floorsCreated,
      unitsCreated,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
