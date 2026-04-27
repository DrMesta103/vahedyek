'use client';

import { useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { createPolicyFromQuickSetupAction } from '../../../lib/actions';

type CalendarItem = { id: string; title: string; yearLabel: string };
type PolicyTemplate = { id: string; title: string; description: string };

const POLICY_TEMPLATES: PolicyTemplate[] = [
  { id: 'standard', title: 'سیاست استاندارد اداری', description: 'مناسب برای کارمندان اداری با ساعت کاری ثابت' },
  { id: 'shift', title: 'سیاست شیفتی', description: 'مناسب برای کارمندان با شیفت‌های متغیر' },
  { id: 'remote', title: 'سیاست دورکاری', description: 'مناسب برای کارمندان دورکار' },
];

type PolicySummary = { id: string; title: string };

function SectionShell({
  title, icon, isOpen, canOpen = true, onToggle, children,
}: {
  title: string; icon: React.ReactNode; isOpen: boolean; canOpen?: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, background: 'rgba(12,19,36,0.8)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={canOpen ? onToggle : undefined}
        disabled={!canOpen}
        style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', border: 'none', background: 'transparent', cursor: canOpen ? 'pointer' : 'not-allowed', opacity: canOpen ? 1 : 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aeb8d9', fontSize: 13 }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {isOpen ? 'بستن' : 'مشاهده جزئیات'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(118,104,255,0.14)', color: '#8d82ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{title}</span>
        </div>
      </button>
      {isOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px' }}>{children}</div>}
    </div>
  );
}

export default function Step3Policy({
  calendars,
  onComplete,
  onBack,
}: {
  calendars: CalendarItem[];
  onComplete: (summary: PolicySummary) => void;
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState<'calendar' | 'policy'>('calendar');
  const [calendarDone, setCalendarDone] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(calendars[0]?.id ?? '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCalendar = calendars.find((c) => c.id === selectedCalendarId);

  const completeBtnStyle: React.CSSProperties = {
    display: 'inline-flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    borderRadius: 999, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff',
    border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  };
  const disabledBtnStyle: React.CSSProperties = { ...completeBtnStyle, opacity: 0.5, cursor: 'not-allowed' };
  const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: 38, border: '1px solid rgba(126,142,187,0.38)', borderRadius: 10,
    background: 'rgba(18,25,46,0.96)', color: '#fff', padding: '0 14px', fontSize: 13, boxSizing: 'border-box',
  };

  const handleComplete = async () => {
    if (!selectedCalendarId || !selectedTemplateId) return;
    setSaving(true);
    try {
      const template = POLICY_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const result = await createPolicyFromQuickSetupAction({
        calendarId: selectedCalendarId,
        policyTemplateId: selectedTemplateId,
        title: template?.title ?? 'سیاست کاری',
      });
      onComplete(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>

      {/* Section 1: Calendar */}
      <SectionShell
        title="تقویم کاری سیاست را انتخاب کنید"
        icon={<CalendarDays size={18} />}
        isOpen={activeSection === 'calendar'}
        onToggle={() => setActiveSection('calendar')}
      >
        <div style={{ display: 'grid', gap: 14, textAlign: 'right' }}>
          {calendars.length === 0 ? (
            <div style={{ color: '#aeb8d9', fontSize: 13, padding: '12px 0' }}>
              هنوز تقویمی ثبت نشده است. ابتدا استپ تقویم کاری را تکمیل کنید.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {calendars.map((cal) => {
                const isSelected = selectedCalendarId === cal.id;
                return (
                  <button
                    key={cal.id}
                    type="button"
                    onClick={() => setSelectedCalendarId(cal.id)}
                    style={{
                      border: `1px solid ${isSelected ? 'rgba(122,109,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 18, background: isSelected ? 'rgba(122,109,255,0.1)' : 'rgba(255,255,255,0.02)',
                      padding: 16, textAlign: 'right', cursor: 'pointer', width: '100%',
                    }}
                  >
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{cal.title}</div>
                    <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>ثبت نشده است</div>
                    <div style={{ color: '#aeb8d9', fontSize: 12, marginTop: 4 }}>سال کاری: {cal.yearLabel}</div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCalendar ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" style={completeBtnStyle} onClick={() => { setCalendarDone(true); setActiveSection('policy'); }}>
                تایید و ادامه <Check size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </SectionShell>

      {/* Section 2: Policy template */}
      <SectionShell
        title="قالب سیاست کاری را انتخاب کنید"
        icon={<ShieldCheck size={18} />}
        isOpen={activeSection === 'policy'}
        canOpen={calendarDone}
        onToggle={() => { if (calendarDone) setActiveSection('policy'); }}
      >
        <div style={{ display: 'grid', gap: 14, textAlign: 'right' }}>
          <div style={{ color: '#aeb8d9', fontSize: 13 }}>یکی از سیاست‌های پیش‌فرض سیستم را انتخاب کنید:</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {POLICY_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  style={{
                    border: `1px solid ${isSelected ? 'rgba(122,109,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 18, background: isSelected ? 'rgba(122,109,255,0.1)' : 'rgba(255,255,255,0.02)',
                    padding: 16, textAlign: 'right', cursor: 'pointer', width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{tmpl.title}</div>
                    {isSelected && (
                      <span style={{ background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>انتخاب شده</span>
                    )}
                  </div>
                  <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>{tmpl.description}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={selectedTemplateId && !saving ? completeBtnStyle : disabledBtnStyle}
              disabled={!selectedTemplateId || saving}
              onClick={handleComplete}
            >
              {saving ? 'در حال ذخیره...' : 'تکمیل مرحله'} <Check size={16} />
            </button>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
