'use client';

import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { FixedAdjustmentDialog } from './FixedAdjustmentDialog';
import { type FixedAdjustmentItem, type FixedAdjustmentItemType } from './fixed-adjustment-types';

type FixedAdjustmentsSectionProps = {
  items: FixedAdjustmentItem[];
  onItemsChange: (items: FixedAdjustmentItem[]) => void;
  onFocus: () => void;
  onDirty: () => void;
  stepDirty: boolean;
  stepSavedAt: number | null;
  stepSaving: boolean;
  onSave: () => void;
};

const itemTypeLabels = {
  addition: 'اضافه',
  deduction: 'کسور',
} as const;

const calculationLabels = {
  fixed_amount: 'مبلغ ثابت',
  base_coefficient: 'ضریبی از مزد مبنا',
} as const;

export function FixedAdjustmentsSection({
  items,
  onItemsChange,
  onFocus,
  onDirty,
  stepDirty,
  stepSavedAt,
  stepSaving,
  onSave,
}: FixedAdjustmentsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItemType, setDialogItemType] = useState<FixedAdjustmentItemType>('addition');
  const [editingItem, setEditingItem] = useState<FixedAdjustmentItem | null>(null);

  const openDialog = (itemType: FixedAdjustmentItemType, item: FixedAdjustmentItem | null = null) => {
    setDialogItemType(itemType);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleConfirm = (item: FixedAdjustmentItem) => {
    const exists = items.some((row) => row.id === item.id);
    const next = exists ? items.map((row) => (row.id === item.id ? item : row)) : [...items, item];
    onItemsChange(next);
    onDirty();
  };

  const handleRemove = (id: string) => {
    onItemsChange(items.filter((row) => row.id !== id));
    onDirty();
  };

  return (
    <>
      <section
        id="fixedAdjustments"
        className="draft-template-flow-section draft-template-flow-fixed-adjustments-section"
        onFocus={onFocus}
      >
        <div className="draft-template-fixed-adjustments-panel">
          <div className="draft-template-fixed-adjustments-panel-copy">
            <h2>اضافات و کسورات ثابت</h2>
            <p>تعریف آیتم‌های مبلغ ثابت یا ضرایب مزد مبنا</p>
          </div>

          <div className="draft-template-fixed-adjustments-panel-actions">
            <button type="button" className="draft-template-fixed-adjustments-add is-primary" onClick={() => openDialog('addition')}>
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              افزودن اضافه
            </button>
            <button type="button" className="draft-template-fixed-adjustments-add is-outline" onClick={() => openDialog('deduction')}>
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              افزودن کسر
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="draft-template-fixed-adjustments-empty">آیتمی برای اضافات/کسورات ثابت ثبت نشده است.</p>
        ) : (
          <ul className="draft-template-fixed-adjustments-list">
            {items.map((item) => (
              <li key={item.id} className="draft-template-fixed-adjustments-item">
                <div className="draft-template-fixed-adjustments-item-copy">
                  <strong>{item.title}</strong>
                  <span>
                    {itemTypeLabels[item.itemType]} · {calculationLabels[item.calculationMethod]}
                    {item.calculationMethod === 'fixed_amount'
                      ? item.amount
                        ? ` · ${item.amount} ریال`
                        : ''
                      : item.coefficient
                        ? ` · ضریب ${item.coefficient}`
                        : ''}
                  </span>
                </div>
                <div className="draft-template-fixed-adjustments-item-actions">
                  <button type="button" onClick={() => openDialog(item.itemType, item)}>
                    ویرایش
                  </button>
                  <button type="button" className="is-danger" onClick={() => handleRemove(item.id)}>
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="draft-template-flow-section-footer">
          <button
            type="button"
            className={`draft-template-flow-section-save ${stepDirty ? 'is-dirty' : 'is-saved'}`}
            disabled={Boolean(!stepDirty && stepSavedAt) || stepSaving}
            onClick={onSave}
          >
            <Save className="h-4 w-4" strokeWidth={2.1} />
            {stepSaving ? 'در حال ذخیره...' : stepDirty ? 'ذخیره تغییرات' : stepSavedAt ? 'ذخیره شده' : 'ذخیره'}
          </button>
        </div>
      </section>

      <FixedAdjustmentDialog
        open={dialogOpen}
        defaultItemType={dialogItemType}
        initialItem={editingItem}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
