import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { seedSampleData } from '../../lib/seed';

export async function POST() {
  await seedSampleData(prisma);
  return NextResponse.json({ success: true });
}
