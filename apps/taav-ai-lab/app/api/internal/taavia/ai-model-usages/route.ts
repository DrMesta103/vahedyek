import { NextResponse } from 'next/server';
import { recordTaaviaBrandAiUsage, type RecordTaaviaUsageInput } from '@/app/lib/repositories/taavia-brand-ai-usage';

export async function POST(request: Request) {
  const expected = process.env.TAAVIA_INTERNAL_TOKEN;
  if (!expected || request.headers.get('x-taavia-internal-token') !== expected) return NextResponse.json({ message: 'دسترسی سرویس داخلی مجاز نیست.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as RecordTaaviaUsageInput | null;
  if (!body) return NextResponse.json({ message: 'بدنه درخواست معتبر نیست.' }, { status: 400 });
  try {
    return NextResponse.json({ success: true, ...(await recordTaaviaBrandAiUsage(body)) });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'ثبت usage انجام نشد.' }, { status: 400 });
  }
}
