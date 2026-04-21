'use client';

import { useEffect, useState } from 'react';

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  disabled: boolean;
};

type RoleItem = {
  id: string;
  key: string;
  label: string;
  system: boolean;
  menuItemIds: string[];
};

type MemberItem = {
  id: string;
  fullName: string;
  email: string;
  legacyRole: string;
  roleIds: string[];
};

type RepresentativeItem = {
  id: string;
  principalType: 'partner' | 'legal_shareholder';
  principalName: string;
  fullName: string;
  email: string | null;
  hasSigningAuthority: boolean;
  panelAccessEnabled: boolean;
  user: { id: string; fullName: string; email: string } | null;
};

type AccessPayload = {
  menuItems: MenuItem[];
  roles: RoleItem[];
  members: MemberItem[];
  representatives: RepresentativeItem[];
};

export function AccessManagementPanel() {
  const [data, setData] = useState<AccessPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/business-settings/access', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? 'دریافت تنظیمات دسترسی انجام نشد.');
      }

      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'دریافت تنظیمات دسترسی انجام نشد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateRolePermissions = async (role: RoleItem, menuItemId: string) => {
    if (!data) return;
    const menuItemIds = role.menuItemIds.includes(menuItemId)
      ? role.menuItemIds.filter((id) => id !== menuItemId)
      : [...role.menuItemIds, menuItemId];

    setSavingKey(`role-${role.id}`);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id, menuItemIds }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'ذخیره دسترسی نقش انجام نشد.');
      setData(payload);
      setMessage('دسترسی نقش ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره دسترسی نقش انجام نشد.');
    } finally {
      setSavingKey('');
    }
  };

  const updateMemberRoles = async (member: MemberItem, roleId: string) => {
    if (!data) return;
    const roleIds = member.roleIds.includes(roleId) ? member.roleIds.filter((id) => id !== roleId) : [...member.roleIds, roleId];

    setSavingKey(`member-${member.id}`);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: member.id, roleIds }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'ذخیره نقش عضو انجام نشد.');
      setData(payload);
      setMessage('نقش‌های عضو ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره نقش عضو انجام نشد.');
    } finally {
      setSavingKey('');
    }
  };

  const createRole = async () => {
    const label = newRoleLabel.trim();
    if (!label) return;

    setSavingKey('new-role');
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'ساخت نقش انجام نشد.');
      setData(payload);
      setNewRoleLabel('');
      setMessage('نقش جدید ساخته شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ساخت نقش انجام نشد.');
    } finally {
      setSavingKey('');
    }
  };

  if (loading) {
    return <section className="access-panel-card">در حال دریافت تنظیمات نقش‌ها و دسترسی‌ها...</section>;
  }

  if (error && !data) {
    return (
      <section className="access-panel-card access-panel-muted">
        <strong>مدیریت نقش‌ها و دسترسی‌ها</strong>
        <p>{error}</p>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="access-panel-card">
      <div className="access-panel-heading">
        <div>
          <h2>مدیریت نقش‌ها و دسترسی‌ها</h2>
          <p>هر عضو می‌تواند چند نقش داشته باشد و دسترسی نهایی از مجموع نقش‌های او محاسبه می‌شود.</p>
        </div>
        <div className="access-role-create">
          <input
            value={newRoleLabel}
            onChange={(event) => setNewRoleLabel(event.target.value)}
            placeholder="عنوان نقش جدید"
            className="app-control"
          />
          <button type="button" onClick={createRole} disabled={savingKey === 'new-role'} className="app-button access-primary-button">
            افزودن نقش
          </button>
        </div>
      </div>

      {message ? <div className="access-panel-message">{message}</div> : null}
      {error ? <div className="access-panel-error">{error}</div> : null}

      <div className="access-panel-grid">
        <div className="access-panel-block">
          <h3>دسترسی نقش‌ها به منو</h3>
          <div className="access-roles-list">
            {data.roles.map((role) => (
              <article key={role.id} className="access-role-row">
                <div className="access-role-title">
                  <strong>{role.label}</strong>
                  {role.system ? <span>پیش‌فرض</span> : <span>سفارشی</span>}
                </div>
                <div className="access-menu-checks">
                  {data.menuItems.map((item) => (
                    <label key={item.id} className="access-check">
                      <input
                        type="checkbox"
                        checked={role.menuItemIds.includes(item.id)}
                        disabled={savingKey === `role-${role.id}`}
                        onChange={() => updateRolePermissions(role, item.id)}
                      />
                      <i className={`fa ${item.icon}`} />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="access-panel-block">
          <h3>نقش‌های اعضا</h3>
          <div className="access-members-list">
            {data.members.map((member) => (
              <article key={member.id} className="access-member-row">
                <div>
                  <strong>{member.fullName}</strong>
                  <p>{member.email}</p>
                </div>
                <div className="access-member-roles">
                  {data.roles.map((role) => (
                    <label key={role.id} className="access-check access-check-compact">
                      <input
                        type="checkbox"
                        checked={member.roleIds.includes(role.id)}
                        disabled={savingKey === `member-${member.id}`}
                        onChange={() => updateMemberRoles(member, role.id)}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="access-panel-block access-representatives-block">
        <h3>نماینده‌های دارای حق امضا</h3>
        <p className="access-panel-note">
          نماینده شریک و نماینده سهام‌دار حقوقی فقط وقتی می‌تواند دسترسی پنل داشته باشد که هم حق امضا و هم دسترسی پنل برای او فعال باشد.
        </p>
        <div className="access-representatives-list">
          {data.representatives.length ? (
            data.representatives.map((representative) => (
              <div key={representative.id} className="access-representative-row">
                <strong>{representative.fullName}</strong>
                <span>{representative.principalType === 'partner' ? 'نماینده شریک' : 'نماینده سهام دار حقوقی'}</span>
                <span>{representative.principalName}</span>
                <span className={representative.hasSigningAuthority ? 'access-ok' : 'access-bad'}>
                  {representative.hasSigningAuthority ? 'حق امضا دارد' : 'بدون حق امضا'}
                </span>
                <span className={representative.panelAccessEnabled ? 'access-ok' : 'access-bad'}>
                  {representative.panelAccessEnabled ? 'دسترسی پنل فعال' : 'دسترسی پنل غیرفعال'}
                </span>
              </div>
            ))
          ) : (
            <div className="access-empty-state">هنوز نماینده‌ای برای شریک یا سهام‌دار حقوقی ثبت نشده است.</div>
          )}
        </div>
      </div>
    </section>
  );
}
