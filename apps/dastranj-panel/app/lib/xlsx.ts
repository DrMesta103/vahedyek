type Worksheet = {
  '!rows': Array<Record<string, unknown>>;
};

type Workbook = {
  SheetNames: string[];
  Sheets: Record<string, Worksheet>;
};

type ReadOptions = {
  type?: 'array' | 'buffer' | 'binary' | 'base64' | 'string';
};

type WriteOptions = {
  bookType?: string;
  type?: 'array' | 'buffer' | 'binary' | 'base64' | 'string';
};

function toUint8Array(input: ArrayBufferLike | Uint8Array | Buffer): Uint8Array {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  if (input instanceof Uint8Array) return input;
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  throw new Error('Unsupported workbook input.');
}

function decodeInput(input: ArrayBufferLike | Uint8Array | Buffer, options?: ReadOptions) {
  const bytes = toUint8Array(input);
  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    throw new Error('Binary Excel files are not supported in this build. Export or upload CSV instead.');
  }
  const decoder = new TextDecoder('utf-8');
  let text = decoder.decode(bytes);
  if (options?.type === 'binary') {
    text = String.fromCharCode(...bytes);
  }
  return text.replace(/^\uFEFF/, '').trim();
}

function parseDelimitedText(text: string) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];

  const delimiter = lines[0].includes('\t')
    ? '\t'
    : lines[0].includes(';') && !lines[0].includes(',')
      ? ';'
      : ',';

  const parseLine = (line: string) => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && char === delimiter) {
        cells.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    cells.push(current);
    return cells.map((value) => value.trim());
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
}

function escapeCsvCell(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n\r;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function serializeRows(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return '';
  const headers = Array.from(
    rows.reduce((acc, row) => {
      Object.keys(row).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>()),
  );
  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => headers.map((header) => escapeCsvCell(row[header] ?? '')).join(','));
  return [headerLine, ...dataLines].join('\n');
}

function cloneRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => ({ ...row }));
}

export function json_to_sheet(rows: Array<Record<string, unknown>>): Worksheet {
  return { '!rows': cloneRows(rows) };
}

export function book_new(): Workbook {
  return { SheetNames: [], Sheets: {} };
}

export function book_append_sheet(workbook: Workbook, sheet: Worksheet, name: string) {
  workbook.SheetNames.push(name);
  workbook.Sheets[name] = sheet;
}

export function sheet_to_json<T extends Record<string, unknown>>(sheet: Worksheet, _options?: { defval?: unknown }) {
  return cloneRows(sheet['!rows'] ?? []) as T[];
}

export function read(input: ArrayBufferLike | Uint8Array | Buffer, options?: ReadOptions): Workbook {
  const text = decodeInput(input, options);
  const rows = parseDelimitedText(text);
  const sheet = json_to_sheet(rows);
  return {
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: sheet },
  };
}

export function write(workbook: Workbook, options?: WriteOptions) {
  const firstSheetName = workbook.SheetNames[0];
  const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;
  const rows = sheet?.['!rows'] ?? [];
  const text = serializeRows(rows);

  if (options?.type === 'array') {
    return new TextEncoder().encode(text);
  }
  if (options?.type === 'buffer') {
    return Buffer.from(text, 'utf8');
  }
  return text;
}

export const utils = {
  json_to_sheet,
  book_new,
  book_append_sheet,
  sheet_to_json,
};
