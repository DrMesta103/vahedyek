import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { getTaaviaBrandModelAssignmentHistory } from '@/app/lib/repositories/taavia-brand-model-assignments';

export async function GET(request: Request, context: { params: Promise<{ businessId: string; brandId: string }> }) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  const { businessId, brandId } = await context.params;
  const purpose = new URL(request.url).searchParams.get('purpose') ?? undefined;
  try {
    return NextResponse.json({ assignments: await getTaaviaBrandModelAssignmentHistory(session.userId, businessId, brandId, purpose) });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'تاریخچه در دسترس نیست.' }, { status: 400 });
  }
}
