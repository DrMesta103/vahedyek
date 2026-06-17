type PageSize = {
  getWidth(): number;
  getHeight(): number;
};

type JsPdfOptions = {
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm';
  format?: 'a4';
  compress?: boolean;
};

type ImagePlacement = {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PdfPage = {
  placements: ImagePlacement[];
};

const A4_PORTRAIT_MM = { width: 210, height: 297 };

function mmToPt(value: number) {
  return value * 72 / 25.4;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function bytesToString(bytes: Uint8Array) {
  let result = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    result += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return result;
}

function buildImageObject(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Unsupported image data for PDF export.');
  }
  const mimeType = match[1];
  if (mimeType !== 'image/jpeg') {
    throw new Error('Only JPEG images are supported for PDF export.');
  }
  return base64ToBytes(match[2]);
}

export class jsPDF {
  internal: {
    pageSize: PageSize;
  };

  private readonly pages: PdfPage[] = [{ placements: [] }];
  private readonly orientation: 'portrait' | 'landscape';
  private readonly format: 'a4';
  private imageData: { bytes: Uint8Array; widthPx: number; heightPx: number } | null = null;

  constructor(options: JsPdfOptions = {}) {
    this.orientation = options.orientation ?? 'portrait';
    this.format = options.format ?? 'a4';
    const width = this.orientation === 'portrait' ? A4_PORTRAIT_MM.width : A4_PORTRAIT_MM.height;
    const height = this.orientation === 'portrait' ? A4_PORTRAIT_MM.height : A4_PORTRAIT_MM.width;
    this.internal = {
      pageSize: {
        getWidth: () => width,
        getHeight: () => height,
      },
    };
  }

  addImage(dataUrl: string, format: 'JPEG', x: number, y: number, width: number, height: number) {
    if (format !== 'JPEG') {
      throw new Error('Only JPEG images are supported for PDF export.');
    }
    const currentPage = this.pages[this.pages.length - 1];
    currentPage.placements.push({ dataUrl, x, y, width, height });
    if (!this.imageData) {
      const bytes = buildImageObject(dataUrl);
      this.imageData = { bytes, widthPx: width, heightPx: height };
    }
  }

  addPage() {
    this.pages.push({ placements: [] });
  }

  output(type: 'blob'): Blob;
  output(type: 'arraybuffer'): ArrayBuffer;
  output(type: 'string'): string;
  output(type: 'blob' | 'arraybuffer' | 'string') {
    const pageWidthPt = mmToPt(this.internal.pageSize.getWidth());
    const pageHeightPt = mmToPt(this.internal.pageSize.getHeight());
    const image = this.imageData;
    if (!image) {
      return type === 'blob' ? new Blob([new Uint8Array(0)]) : type === 'arraybuffer' ? new ArrayBuffer(0) : '';
    }

    const objects: string[] = [];
    const chunks: Uint8Array[] = [];
    let objectNumber = 0;

    const addObject = (body: string | Uint8Array) => {
      objectNumber += 1;
      if (typeof body === 'string') {
        chunks.push(new TextEncoder().encode(`${objectNumber} 0 obj\n${body}\nendobj\n`));
      } else {
        chunks.push(new TextEncoder().encode(`${objectNumber} 0 obj\n`));
        chunks.push(body);
        chunks.push(new TextEncoder().encode('\nendobj\n'));
      }
      objects.push(`${objectNumber} 0 obj`);
      return objectNumber;
    };

    const catalogId = objectNumber + 1;
    const pagesId = objectNumber + 2;
    const pageObjectIds: number[] = [];
    const contentObjectIds: number[] = [];
    const imageObjectId = objectNumber + 3;

    let nextObjectId = imageObjectId;

    const imageBytes = image.bytes;
    const imageWidthPt = pageWidthPt;
    const imageHeightPt = pageHeightPt;

    nextObjectId += 1;
    const imageStreamHeader = new TextEncoder().encode(
      `${nextObjectId - 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${Math.max(1, Math.round(imageWidthPt))} /Height ${Math.max(1, Math.round(imageHeightPt))} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
    );
    chunks.push(imageStreamHeader, imageBytes, new TextEncoder().encode('\nendstream\nendobj\n'));

    for (let index = 0; index < this.pages.length; index += 1) {
      const page = this.pages[index];
      const pageId = ++nextObjectId;
      const contentId = ++nextObjectId;
      pageObjectIds.push(pageId);
      contentObjectIds.push(contentId);

      const placement = page.placements[0];
      const x = mmToPt(placement?.x ?? 0);
      const y = mmToPt(placement?.y ?? 0);
      const width = mmToPt(placement?.width ?? this.internal.pageSize.getWidth());
      const height = mmToPt(placement?.height ?? this.internal.pageSize.getHeight());
      const content = [
        'q',
        `${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${(x).toFixed(2)} ${(pageHeightPt - y - height).toFixed(2)} cm`,
        '/Im0 Do',
        'Q',
      ].join('\n');
      const contentBytes = new TextEncoder().encode(content);
      chunks.push(
        new TextEncoder().encode(
          `${contentId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`,
        ),
        contentBytes,
        new TextEncoder().encode('\nendstream\nendobj\n'),
      );

      const pageObject = [
        `<< /Type /Page /Parent ${pagesId} 0 R`,
        `/MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}]`,
        `/Resources << /XObject << /Im0 ${nextObjectId - this.pages.length * 2 - 1} 0 R >> >>`,
        `/Contents ${contentId} 0 R >>`,
      ].join('\n');
      chunks.push(new TextEncoder().encode(`${pageId} 0 obj\n${pageObject}\nendobj\n`));
    }

    const kids = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
    chunks.push(
      new TextEncoder().encode(
        `${pagesId} 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectIds.length} >>\nendobj\n`,
      ),
      new TextEncoder().encode(
        `${catalogId} 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`,
      ),
    );

    const header = '%PDF-1.4\n';
    let offset = header.length;
    const bodyParts: string[] = [header];
    const bodyBytes: Uint8Array[] = [];

    for (const chunk of chunks) {
      bodyBytes.push(chunk);
      offset += chunk.length;
    }

    const body = bodyBytes.reduce((acc, chunk) => {
      const next = new Uint8Array(acc.length + chunk.length);
      next.set(acc, 0);
      next.set(chunk, acc.length);
      return next;
    }, new Uint8Array());

    const xrefOffset = header.length + body.length;
    const xrefLines = ['xref', `0 ${catalogId + 1}`, '0000000000 65535 f '];
    let runningOffset = header.length;
    for (const chunk of chunks) {
      xrefLines.push(`${runningOffset.toString().padStart(10, '0')} 00000 n `);
      runningOffset += chunk.length;
    }
    const trailer = [
      'trailer',
      `<< /Size ${catalogId + 1} /Root ${catalogId} 0 R >>`,
      'startxref',
      String(xrefOffset),
      '%%EOF',
    ].join('\n');

    const pdfBytes = new Uint8Array(header.length + body.length + new TextEncoder().encode(`\n${xrefLines.join('\n')}\n${trailer}`).length);
    pdfBytes.set(new TextEncoder().encode(header), 0);
    pdfBytes.set(body, header.length);
    pdfBytes.set(new TextEncoder().encode(`\n${xrefLines.join('\n')}\n${trailer}`), header.length + body.length);

    if (type === 'blob') return new Blob([pdfBytes], { type: 'application/pdf' });
    if (type === 'arraybuffer') return pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
    return bytesToString(pdfBytes);
  }
}

