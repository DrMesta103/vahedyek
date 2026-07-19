import { NextResponse } from 'next/server';
import {
  OCR_SAMPLE_LIBRARY,
  createOcrJobForTenant,
  getOcrJobsForTenant,
  type CreateOcrSimulationInput,
} from '@/app/lib/data';
import { validateExtractionFields, type OcrExtractionFieldDraft } from '@/app/lib/ocr-extraction-fields';
import { DEFAULT_OCR_MODEL_ID } from '@/app/lib/ocr-models';
import { parseOcrTransportMode } from '@/app/lib/ocr-transport';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = {
  params: Promise<{ businessId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId } = await context.params;
  const jobs = await getOcrJobsForTenant(session.userId, businessId);

  return NextResponse.json({ jobs, source: 'database' });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId } = await context.params;
  const body = (await request.json().catch(() => null)) as Partial<CreateOcrSimulationInput> | null;

  if (!body?.sourceType || (body.sourceType !== 'sample' && body.sourceType !== 'upload')) {
    return NextResponse.json({ message: 'نوع منبع OCR معتبر نیست.' }, { status: 400 });
  }

  if (!body.sourceName?.trim()) {
    return NextResponse.json({ message: 'نام سند الزامی است.' }, { status: 400 });
  }

  if (body.sourceType === 'sample' && !OCR_SAMPLE_LIBRARY.some((sample) => sample.id === body.sampleId)) {
    return NextResponse.json({ message: 'نمونه‌ی انتخاب‌شده معتبر نیست.' }, { status: 400 });
  }

  const isDynamicExtraction = body.templateId === 'dynamic';
  const extractionValidation = validateExtractionFields(
    Array.isArray(body.extractionFields) ? (body.extractionFields as OcrExtractionFieldDraft[]) : [],
  );

  if (isDynamicExtraction && body.sourceType !== 'upload') {
    return NextResponse.json({ message: 'برای نوع سند داینامیک، آپلود فایل الزامی است.' }, { status: 400 });
  }

  if (isDynamicExtraction && extractionValidation.errors.length > 0) {
    return NextResponse.json({ message: extractionValidation.errors[0] }, { status: 400 });
  }

  try {
    const job = await createOcrJobForTenant(session.userId, {
      tenantId: businessId,
      sourceType: body.sourceType,
      sourceName: body.sourceName.trim(),
      fileType: body.fileType?.trim() || null,
      fileSize: typeof body.fileSize === 'number' ? body.fileSize : null,
      sampleId: body.sampleId?.trim() || null,
      templateId: body.templateId?.trim() || null,
      scenario: body.scenario === 'miss' ? 'miss' : body.scenario === 'recognize' ? 'recognize' : null,
      sampleText: body.sampleText?.trim() || null,
      transportMode: parseOcrTransportMode(body.transportMode),
      modelId: body.modelId?.trim() || DEFAULT_OCR_MODEL_ID,
      chatModelId: (() => {
        const value = body.chatModelId?.trim();
        if (!value || value === '—' || !value.includes(':')) return null;
        return value;
      })(),
      extractionFields: isDynamicExtraction ? extractionValidation.fields : null,
    });

    if (!job) {
      return NextResponse.json({ message: 'این کسب‌وکار برای شما در دسترس نیست.' }, { status: 404 });
    }

    return NextResponse.json({ job, source: 'database' }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
