'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, User } from 'lucide-react';
import { createEmployeeFromQuickSetupAction } from '../../../lib/actions';

type Employee = { id: string; firstName: string; lastName: string; email?: string; mobile?: string };

type DialogStep = 'contact' | 'name';

function AddEmployeeDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (emp: Employee) => void;
}) {
  const [step, setStep] = useState<DialogStep>('contact');
  const [contact, setContact] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [saving, setSaving] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: 44, border: '1px solid rgba(126,142,187,0.38)', borderRadius: 12,
    background: 'rgba(18,25,46,0.96)', color: '#fff', padding: '0 16px', fontSize: 14, boxSizing: 'border-box',
  };

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff',
    border: 'none', padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      const isEmail = contact.includes('@');
      const result = await createEmployeeFromQuickSetupAction({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: nationalId.trim() || undefined,
        email: isEmail ? contact.trim() : undefined,
        mobile: !isEmail ? contact.trim() : undefined,
      });
      onAdd({ id: result.id, firstName: result.firstName, lastName: result.lastName, email: isEmail ? contact : undefined, mobile: !isEmail ? contact : undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', padding: 16 }}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', background: '#0d1829', padding: 28, display: 'grid', gap: 20 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>افزودن کارمند</div>
            <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 4 }}>
              {step === 'contact' ? 'مرحله ۱: ابتدا موبایل یا ایمیل کارمند را وارد کنید' : 'مرحله ۲: نام و نام خانوادگی کارمند را تکمیل کنید'}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {step === 'contact' ? (
          <>
            <label style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
              <span style={{ color: '#d0d8f0', fontSize: 13, fontWeight: 700 }}>ایمیل یا موبایل</span>
              <div style={{ position: 'relative' }}>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="example@email.com یا 09..."
                  style={{ ...inputStyle, paddingLeft: 44 }}
                  dir="ltr"
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aeb8d9' }}>
                  🔍
                </span>
              </div>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={contact.trim() ? btnStyle : { ...btnStyle, opacity: 0.5, cursor: 'not-allowed' }}
                disabled={!contact.trim()}
                onClick={() => setStep('name')}
              >
                ادامه ←
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(112,99,255,0.15)', border: '2px solid rgba(112,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <User size={36} style={{ color: '#8d82ff' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ color: '#fff', fontSize: 12 }}>📷</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
                <span style={{ color: '#d0d8f0', fontSize: 13, fontWeight: 700 }}>نام</span>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="نام" style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
                <span style={{ color: '#d0d8f0', fontSize: 13, fontWeight: 700 }}>نام خانوادگی</span>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="نام خانوادگی" style={inputStyle} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
              <span style={{ color: '#d0d8f0', fontSize: 13, fontWeight: 700 }}>کد ملی (اختیاری)</span>
              <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="کد ملی ۱۰ رقمی" style={inputStyle} dir="ltr" />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button type="button" onClick={() => setStep('contact')} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#d7ddf7', padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>مرحله قبل</button>
              <button
                type="button"
                style={firstName.trim() && lastName.trim() && !saving ? btnStyle : { ...btnStyle, opacity: 0.5, cursor: 'not-allowed' }}
                disabled={!firstName.trim() || !lastName.trim() || saving}
                onClick={handleSave}
              >
                {saving ? 'در حال ذخیره...' : 'ثبت اطلاعات'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Step4Employees({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const removeEmployee = (id: string) => setEmployees((prev) => prev.filter((e) => e.id !== id));

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    borderRadius: 12, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff',
    border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  };

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, background: 'rgba(12,19,36,0.8)', padding: 20, display: 'grid', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>مرحله ۴: ثبت کارمندان</div>
        <span style={{ background: 'rgba(112,99,255,0.15)', color: '#8d82ff', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>Step 4</span>
      </div>

      {/* Add buttons */}
      <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => setShowDialog(true)} style={btnStyle}>
            <Plus size={16} /> افزودن کارمند
          </button>
          <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: '#aeb8d9', padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            📄 افزودن با اکسل
          </button>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>افزودن کاربر</div>
          <div style={{ color: '#aeb8d9', fontSize: 12, marginTop: 4 }}>ابتدا لیست خالی را می‌بینید و از طریق دیالوگ، موبایل و سپس نام و نام خانوادگی را ثبت می‌کنید.</div>
        </div>
      </div>

      {/* Employee list */}
      {employees.length > 0 ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {employees.map((emp) => (
            <div key={emp.id} style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(255,255,255,0.02)', padding: '12px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(112,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} style={{ color: '#8d82ff' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{emp.firstName} {emp.lastName}</div>
                {(emp.email || emp.mobile) && (
                  <div style={{ color: '#aeb8d9', fontSize: 12, marginTop: 2, display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
                    <span>✉</span>
                    <span>{emp.email || emp.mobile}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => removeEmployee(emp.id)} style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', display: 'flex', padding: 6 }}>
                  <Trash2 size={15} />
                </button>
                <button type="button" style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', display: 'flex', padding: 6 }}>
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>آیتمی یافت نشد</div>
          <div style={{ color: '#aeb8d9', fontSize: 13 }}>برای شروع، روی دکمه «افزودن کارمند» بزنید.</div>
        </div>
      )}

      {/* Footer navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, marginTop: 4 }}>
        <button type="button" onClick={onComplete} style={btnStyle}>
          تایید و ادامه
        </button>
        <button type="button" onClick={onBack} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: '#d7ddf7', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          مرحله قبل
        </button>
      </div>

      {showDialog ? (
        <AddEmployeeDialog
          onClose={() => setShowDialog(false)}
          onAdd={(emp) => setEmployees((prev) => [...prev, emp])}
        />
      ) : null}
    </div>
  );
}
