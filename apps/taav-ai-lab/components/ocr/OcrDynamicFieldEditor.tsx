'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  createExtractionFieldDraft,
  normalizeExtractionFields,
  slugifyExtractionKey,
  type OcrExtractionFieldDraft,
  type OcrExtractionFieldType,
} from '@/app/lib/ocr-extraction-fields';

type OcrDynamicFieldEditorProps = {
  fields: OcrExtractionFieldDraft[];
  errors: string[];
  onChange: (fields: OcrExtractionFieldDraft[]) => void;
  disabled?: boolean;
};

const FIELD_TYPE_LABELS: Record<OcrExtractionFieldType, string> = {
  string: 'متن',
  date: 'تاریخ',
  number: 'عدد',
  boolean: 'بولین',
};

export function OcrDynamicFieldEditor({
  fields,
  errors,
  onChange,
  disabled = false,
}: OcrDynamicFieldEditorProps) {
  const normalizedFields = normalizeExtractionFields(fields);

  const updateField = (id: string, patch: Partial<OcrExtractionFieldDraft>) => {
    onChange(
      fields.map((field, index) => {
        if (field.id !== id) return field;
        const nextLabel = patch.label ?? field.label;
        return {
          ...field,
          ...patch,
          key: patch.label !== undefined ? slugifyExtractionKey(nextLabel, index + 1) : patch.key ?? field.key,
        };
      }),
    );
  };

  const addField = () => {
    onChange([
      ...fields,
      createExtractionFieldDraft('', fields.length + 1, {
        id: `field-${Date.now()}`,
        required: false,
      }),
    ]);
  };

  const removeField = (id: string) => {
    if (fields.length <= 1) return;
    onChange(fields.filter((field) => field.id !== id));
  };

  return (
    <div className="ai-lab-ocr-create-dynamic-fields">
      <div className="ai-lab-ocr-create-dynamic-list">
        {fields.map((field, index) => {
          const normalized = normalizedFields[index] ?? field;
          const showStringValidation = field.type === 'string';

          return (
            <article key={field.id} className="ai-lab-ocr-create-dynamic-row">
              <div className="ai-lab-ocr-create-dynamic-row-top">
                <label className="ai-lab-ocr-create-dynamic-label">
                  <span>عنوان</span>
                  <input
                    className="ai-lab-ocr-create-input"
                    value={field.label}
                    onChange={(event) => updateField(field.id, { label: event.target.value })}
                    placeholder="مثلا: شماره قرارداد"
                    disabled={disabled}
                  />
                </label>

                <label className="ai-lab-ocr-create-dynamic-label ai-lab-ocr-create-dynamic-label--type">
                  <span>نوع</span>
                  <select
                    className="ai-lab-ocr-create-input"
                    value={field.type}
                    onChange={(event) =>
                      updateField(field.id, { type: event.target.value as OcrExtractionFieldType })
                    }
                    disabled={disabled}
                  >
                    {Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => (
                      <option key={type} value={type}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {fields.length > 1 ? (
                  <button
                    type="button"
                    className="ai-lab-ocr-create-dynamic-remove-icon"
                    onClick={() => removeField(field.id)}
                    disabled={disabled}
                    aria-label={`حذف فیلد ${field.label || index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div className="ai-lab-ocr-create-dynamic-row-meta">
                <div className="ai-lab-ocr-create-dynamic-key">
                  <span>key</span>
                  <code dir="ltr">{normalized.key}</code>
                </div>
                <label className="ai-lab-ocr-create-dynamic-required">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(event) => updateField(field.id, { required: event.target.checked })}
                    disabled={disabled}
                  />
                  اجباری
                </label>
              </div>

              {showStringValidation ? (
                <div className="ai-lab-ocr-create-dynamic-row-validation">
                  <label className="ai-lab-ocr-create-dynamic-label">
                    <span>Regex</span>
                    <input
                      className="ai-lab-ocr-create-input"
                      value={field.regex ?? ''}
                      onChange={(event) => updateField(field.id, { regex: event.target.value })}
                      placeholder="^[0-9]{6,}$"
                      dir="ltr"
                      disabled={disabled}
                    />
                  </label>
                  <label className="ai-lab-ocr-create-dynamic-label ai-lab-ocr-create-dynamic-label--short">
                    <span>حداقل</span>
                    <input
                      className="ai-lab-ocr-create-input"
                      type="number"
                      min={0}
                      value={field.minLength ?? ''}
                      onChange={(event) =>
                        updateField(field.id, {
                          minLength: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                      disabled={disabled}
                    />
                  </label>
                  <label className="ai-lab-ocr-create-dynamic-label ai-lab-ocr-create-dynamic-label--short">
                    <span>حداکثر</span>
                    <input
                      className="ai-lab-ocr-create-input"
                      type="number"
                      min={0}
                      value={field.maxLength ?? ''}
                      onChange={(event) =>
                        updateField(field.id, {
                          maxLength: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                      disabled={disabled}
                    />
                  </label>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className="ai-lab-ocr-create-dynamic-add"
        onClick={addField}
        disabled={disabled}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        افزودن فیلد
      </button>

      {errors.length > 0 ? (
        <div className="ai-lab-ocr-create-dynamic-errors">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
