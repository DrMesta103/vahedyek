import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

const BLOCK_NAMES = ['بلوک سرو', 'بلوک باران', 'بلوک نگار', 'بلوک آراد', 'بلوک آسمان', 'بلوک مهر'];
const FLOOR_NAMES = ['همکف', 'اول', 'دوم', 'سوم', 'چهارم', 'پنجم'];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickBlockName(index: number) {
  const base = BLOCK_NAMES[(Date.now() + index) % BLOCK_NAMES.length];
  return `${base} ${randomInt(10, 99)}`;
}

export async function POST() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = Array.from({ length: 3 }, (_, blockIndex) => {
      const blockId = crypto.randomUUID();
      const blockName = pickBlockName(blockIndex);
      const floorsCount = randomInt(2, 4);

      const units = Array.from({ length: floorsCount }, (_, floorIndex) => {
        const floorName = floorIndex === 0 ? 'طبقه همکف' : `طبقه ${FLOOR_NAMES[floorIndex] ?? floorIndex + 1}`;
        const unitsPerFloor = randomInt(2, 4);

        return Array.from({ length: unitsPerFloor }, (_, unitIndex) => {
          const unitNumber = `${floorIndex}${String(unitIndex + 1).padStart(2, '0')}`;
          const unitName = `${floorName} - واحد ${unitNumber}`;

          return {
            id: crypto.randomUUID(),
            tenantId: session.tenantId,
            blockId,
            floorName,
            name: unitName,
          };
        });
      }).flat();

      return {
        block: {
          id: blockId,
          tenantId: session.tenantId,
          name: blockName,
        },
        units,
      };
    });

    await prisma.$transaction(async (tx) => {
      for (const item of payload) {
        await tx.block.create({ data: item.block });
        if (item.units.length) {
          await tx.unit.createMany({ data: item.units });
        }
      }
    });

    return NextResponse.json({
      success: true,
      blocksCreated: payload.length,
      unitsCreated: payload.reduce((sum, item) => sum + item.units.length, 0),
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
