import { NextResponse } from 'next/server';
import { getSessionContext } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { seedSampleData } from '../../lib/seed';

export async function POST() {
  const session = await getSessionContext();
  if (!session?.tenantId || session.state !== 'active') {
    return NextResponse.json({ message: 'Active tenant is required.' }, { status: 401 });
  }
  await seedSampleData(prisma, session.tenantId);
  return NextResponse.json({ success: true });
}
