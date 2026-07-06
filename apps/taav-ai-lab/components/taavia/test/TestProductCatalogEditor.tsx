'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { ProductCatalogSnapshot, ProductField, ProductFieldType, ProductRow } from '@/app/lib/types/taavia-workspace';

const FIELD_TYPE_OPTIONS: Array<{ value: ProductFieldType; label: string }> = [
  { value: 'text', label: 'متن' },
  { value: 'number', label: 'عدد' },
  { value: 'textarea', label: 'متن بلند' },
  { value: 'date', label: 'تاریخ' },
  { value: 'boolean', label: 'بله / خیر' },
];

function createEmptyField(index: number): ProductField {
  return {
    id: `field-${Date.now()}-${index}`,
    label: `فیلد ${index}`,
    type: 'text',
  };
}

function createEmptyRow(fields: ProductField[]): ProductRow {
  return {
    id: `product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    values: Object.fromEntries(fields.map((field) => [field.id, ''])),
  };
}

function getFieldTypeLabel(type: ProductFieldType) {
  return FIELD_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

type TestProductCatalogEditorProps = {
  catalog: ProductCatalogSnapshot;
  onChange: (catalog: ProductCatalogSnapshot) => void;
};

export function TestProductCatalogEditor({ catalog, onChange }: TestProductCatalogEditorProps) {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draftRow, setDraftRow] = useState<ProductRow | null>(null);

  const validRows = useMemo(
    () => catalog.rows.filter((row) => catalog.fields.some((field) => row.values[field.id]?.trim())),
    [catalog],
  );

  const updateCatalog = (next: ProductCatalogSnapshot) => onChange(next);

  const addField = () => {
    const nextField = createEmptyField(catalog.fields.length + 1);
    updateCatalog({
      fields: [...catalog.fields, nextField],
      rows: catalog.rows.map((row) => ({ ...row, values: { ...row.values, [nextField.id]: '' } })),
    });
  };

  const updateField = (fieldId: string, patch: Partial<Pick<ProductField, 'label' | 'type'>>) => {
    updateCatalog({
      ...catalog,
      fields: catalog.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    });
  };

  const deleteField = (fieldId: string) => {
    if (catalog.fields.length === 1) return;
    updateCatalog({
      fields: catalog.fields.filter((field) => field.id !== fieldId),
      rows: catalog.rows.map((row) => {
        const nextValues = { ...row.values };
        delete nextValues[fieldId];
        return { ...row, values: nextValues };
      }),
    });
  };

  const startAddProduct = () => {
    const row = createEmptyRow(catalog.fields);
    setDraftRow(row);
    setEditingRowId(row.id);
  };

  const startEditProduct = (row: ProductRow) => {
    setDraftRow({ ...row, values: { ...row.values } });
    setEditingRowId(row.id);
  };

  const saveDraftProduct = () => {
    if (!draftRow) return;
    const exists = catalog.rows.some((row) => row.id === draftRow.id);
    updateCatalog({
      ...catalog,
      rows: exists ? catalog.rows.map((row) => (row.id === draftRow.id ? draftRow : row)) : [...catalog.rows, draftRow],
    });
    setDraftRow(null);
    setEditingRowId(null);
  };

  const deleteProduct = (rowId: string) => {
    updateCatalog({ ...catalog, rows: catalog.rows.filter((row) => row.id !== rowId) });
    if (editingRowId === rowId) {
      setEditingRowId(null);
      setDraftRow(null);
    }
  };

  const renderFieldInput = (row: ProductRow, field: ProductField, onValueChange: (value: string) => void) => {
    const value = row.values[field.id] ?? '';
    const inputClassName =
      'w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none transition placeholder:text-[rgba(217,229,255,0.34)] focus:border-[rgba(66,237,211,0.36)]';

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={`مقدار ${field.label}`}
          rows={3}
          className={`${inputClassName} resize-y leading-7`}
        />
      );
    }

    if (field.type === 'boolean') {
      return (
        <select value={value} onChange={(event) => onValueChange(event.target.value)} className={inputClassName}>
          <option value="">انتخاب کن</option>
          <option value="yes">بله</option>
          <option value="no">خیر</option>
        </select>
      );
    }

    return (
      <input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={`مقدار ${field.label}`}
        className={inputClassName}
      />
    );
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.26)] bg-[rgba(66,237,211,0.12)] px-4 py-2 text-[12px] font-black text-[rgb(150,246,231)]"
          >
            <Plus className="h-4 w-4" />
            افزودن فیلد
          </button>
          <div className="text-right">
            <div className="text-[15px] font-semibold text-white">طراحی ساختار جدول محصول</div>
            <div className="mt-1 text-[12px] text-[rgba(217,229,255,0.58)]">فیلدهای داینامیک را تعریف کن</div>
          </div>
        </div>

        <div className="grid gap-3">
          {catalog.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-[18px] border border-white/10 bg-[rgba(8,16,31,0.55)] p-3 md:grid-cols-[auto_minmax(0,1.2fr)_minmax(180px,0.7fr)_auto] md:items-center"
            >
              <span className="text-center text-[11px] font-bold text-[rgba(217,229,255,0.52)]">#{index + 1}</span>
              <input
                value={field.label}
                onChange={(event) => updateField(field.id, { label: event.target.value })}
                placeholder="نام فیلد"
                className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
              />
              <select
                value={field.type}
                onChange={(event) => updateField(field.id, { type: event.target.value as ProductFieldType })}
                className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
              >
                {FIELD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => deleteField(field.id)}
                disabled={catalog.fields.length === 1}
                className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.10)] text-[rgb(254,202,202)] disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingRowId && draftRow ? (
        <div className="rounded-[24px] border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.06)] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingRowId(null);
                setDraftRow(null);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-[14px] font-black text-white">ثبت / ویرایش محصول</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {catalog.fields.map((field) => (
              <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="mb-2 block text-[12px] font-bold text-[rgba(217,229,255,0.72)]">{field.label}</label>
                {renderFieldInput(draftRow, field, (value) =>
                  setDraftRow((current) =>
                    current ? { ...current, values: { ...current.values, [field.id]: value } } : current,
                  ),
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveDraftProduct}
              className="rounded-full border border-[rgba(66,237,211,0.34)] bg-[rgba(66,237,211,0.16)] px-5 py-2.5 text-[13px] font-black text-[rgb(150,246,231)]"
            >
              ذخیره محصول
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={startAddProduct}
            disabled={catalog.fields.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.28)] bg-[rgba(130,158,255,0.12)] px-4 py-2.5 text-[13px] font-black text-[rgb(199,210,254)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            افزودن محصول / خدمت
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.78)_0%,rgba(10,19,38,0.78)_100%)]">
        {validRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-right">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {catalog.fields.map((field) => (
                    <th key={field.id} className="px-4 py-3 text-[12px] font-bold text-[rgba(217,229,255,0.82)]">
                      {field.label}
                      <span className="mt-1 block text-[10px] font-medium text-[rgba(217,229,255,0.52)]">
                        {getFieldTypeLabel(field.type)}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[12px] font-bold text-[rgba(217,229,255,0.72)]">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {validRows.map((row) => (
                  <tr key={row.id} className="border-b border-white/8 align-top">
                    {catalog.fields.map((field) => (
                      <td key={`${row.id}-${field.id}`} className="px-4 py-3 text-[12px] text-white">
                        {row.values[field.id] || '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditProduct(row)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(row.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.10)] text-[rgb(254,202,202)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[rgba(217,229,255,0.62)]">
              هنوز محصولی ثبت نشده. ابتدا فیلدها را تعریف کن، سپس محصول اضافه کن.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
