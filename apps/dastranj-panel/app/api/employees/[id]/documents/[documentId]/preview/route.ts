import { NextResponse } from 'next/server';
import { getDocumentDownload } from '../../../../../../lib/employee-documents';

export async function GET(_: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  try {
    const { id, documentId } = await params;
    const file = await getDocumentDownload(id, documentId, 'VIEW_FILE');
    const match = /^data:([^;,]+);base64,(.+)$/.exec(file.fileUrl);
    if (!match) return NextResponse.json({ error: 'file_storage_format_not_supported' }, { status: 422 });
    return new NextResponse(Buffer.from(match[2], 'base64'), { headers: { 'Content-Type': file.fileType, 'Content-Disposition': 'inline', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "frame-ancestors 'self'", 'X-Frame-Options': 'SAMEORIGIN' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'preview_failed';
    return NextResponse.json({ error: message }, { status: message.includes('دسترسی') ? 403 : 404 });
  }
}
