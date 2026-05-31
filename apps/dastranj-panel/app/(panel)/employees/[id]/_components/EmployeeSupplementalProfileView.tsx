'use client';

import { Info, Pencil, UserRound } from 'lucide-react';
import Link from 'next/link';
import { formatFaNumber, formatPersianJalaliDate } from '../../../../lib/format-fa';
import type { EmployeeSupplementalProfile } from '../../../../lib/employee-contract-drafts';
import {
  EMPLOYEE_PARTY_FIELD_GROUPS,
  computeSupplementalCompleteness,
  resolveEmployeePartyFieldValue,
  type EmployeePartyDataSource,
} from '../../../../lib/employee-supplemental-fields';

function fieldBadge(text: string, tone: 'success' | 'warning' | 'muted' = 'muted') {
  const styles =
    tone === 'success'
      ? { border: '1px solid rgba(34,197,94,0.32)', background: 'rgba(34,197,94,0.12)', color: '#dcfce7' }
      : tone === 'warning'
        ? { border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.12)', color: '#fecdd3' }
        : { border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(148,163,184,0.12)', color: '#dbeafe' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 10,
        fontWeight: 900,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {text}
    </span>
  );
}

function displayValue(value: string) {
  return value.trim() ? value : 'ثبت نشده';
}

function formatRecordDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'ثبت نشده';
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return formatPersianJalaliDate(parsed);
}

export function EmployeeSupplementalProfileView({
  employeeName,
  employee,
  supplemental,
  onEdit,
  editHref,
  showFooterLink = false,
  profileHref,
}: {
  employeeName: string;
  employee: EmployeePartyDataSource;
  supplemental: EmployeeSupplementalProfile;
  onEdit?: () => void;
  editHref?: string;
  showFooterLink?: boolean;
  profileHref?: string;
}) {
  const completion = computeSupplementalCompleteness(supplemental, employee);
  const missing = completion < 70;

  const editButton =
    onEdit || editHref ? (
      editHref ? (
        <Link href={editHref} className="contract-party-card-edit" aria-label="ویرایش مشخصات کارمند">
          <Pencil className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <button type="button" className="contract-party-card-edit" aria-label="ویرایش مشخصات کارمند" onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
      )
    ) : null;

  return (
    <div className="business-payroll-subcard contract-party-card contract-party-card--employee">
      <div className="contract-party-card-toolbar">
        <div className="business-draft-section-title">
          <h3>طرف دوم قرارداد</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">کارمند</span>
        </div>
        {editButton}
      </div>

      <p className="contract-party-card-hint">
        <Info className="h-3.5 w-3.5" aria-hidden />
        <span>طرف دوم قرارداد، فردی است که تحت این قرارداد در سازمان استخدام می‌شود.</span>
      </p>

      <div className="contract-party-card-identity">
        <span className="contract-party-card-avatar is-employee" aria-hidden>
          <UserRound className="h-5 w-5" />
        </span>
        <div className="contract-party-card-identity-copy">
          <div className="contract-party-card-identity-line">
            <span className="contract-party-stat-label">نام و نام خانوادگی:</span>
            <strong>{employeeName || 'ثبت نشده'}</strong>
          </div>
        </div>
      </div>

      {EMPLOYEE_PARTY_FIELD_GROUPS.map((group) => (
        <section key={group.title} className="contract-party-section">
          <h4 className="contract-party-section-title">{group.title}</h4>

          {group.kind === 'fields' ? (
            <div className={`contract-party-card-stats${group.title === 'اطلاعات آدرس' ? ' is-address' : ''}`}>
              {group.fields.map((field) => (
                <div key={field.label} className="contract-party-stat">
                  <span className="contract-party-stat-label">{field.label}</span>
                  <strong className="contract-party-stat-value">
                    {resolveEmployeePartyFieldValue(field, supplemental, employee)}
                  </strong>
                </div>
              ))}
            </div>
          ) : null}

          {group.kind === 'educationRecords' ? (
            <div className="contract-party-record-stack">
              {supplemental.educationRecords.map((record, index) => (
                <div key={record.id} className="contract-party-record-card">
                  <span className="contract-party-record-index">مدرک {index + 1}</span>
                  <div className="contract-party-card-stats">
                    <div className="contract-party-stat">
                      <span className="contract-party-stat-label">رشته تحصیلی</span>
                      <strong className="contract-party-stat-value">{displayValue(record.field)}</strong>
                    </div>
                    <div className="contract-party-stat">
                      <span className="contract-party-stat-label">مدرک تحصیلی</span>
                      <strong className="contract-party-stat-value">{displayValue(record.degree)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {group.kind === 'jobRecords' ? (
            <div className="contract-party-record-stack">
              {supplemental.jobRecords.map((record, index) => (
                <div key={record.id} className="contract-party-record-card">
                  <span className="contract-party-record-index">سابقه {index + 1}</span>
                  <div className="contract-party-card-stats">
                    <div className="contract-party-stat">
                      <span className="contract-party-stat-label">عنوان شغل</span>
                      <strong className="contract-party-stat-value">{displayValue(record.title)}</strong>
                    </div>
                    <div className="contract-party-stat">
                      <span className="contract-party-stat-label">تاریخ شروع</span>
                      <strong className="contract-party-stat-value">{formatRecordDate(record.startDate)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ))}

      {missing ? (
        <div className="contract-party-card-footer">
          {fieldBadge(`تکمیل مشخصات: ${formatFaNumber(completion, { useGrouping: false })}%`, 'warning')}
          {showFooterLink && profileHref ? (
            <Link href={profileHref} className="draft-template-flow-action is-primary">
              تکمیل مشخصات کارمند
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="contract-party-card-footer">{fieldBadge(`تکمیل مشخصات: ${formatFaNumber(completion, { useGrouping: false })}%`, 'success')}</div>
      )}
    </div>
  );
}
