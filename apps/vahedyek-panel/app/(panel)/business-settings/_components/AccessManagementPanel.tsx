'use client';

import { useEffect, useMemo, useState } from 'react';

type PermissionItem = {
  key: string;
  label: string;
  group: string;
};

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  disabled: boolean;
  toolbarOnly: boolean;
  requiredPermission?: string;
};

type RoleItem = {
  id: string;
  key: string;
  label: string;
  system: boolean;
  permissionKeys: string[];
  allowedMenuItemIds: string[];
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
  panelAccessEligible: boolean;
  user: { id: string; fullName: string; email: string } | null;
};

type AccessPayload = {
  permissions: PermissionItem[];
  menuItems: MenuItem[];
  roles: RoleItem[];
  members: MemberItem[];
  representatives: RepresentativeItem[];
};

const GROUP_LABELS: Record<string, string> = {
  platform: 'زیرساخت و پنل',
  business: 'کسب و کار',
  complex: 'مجتمع',
  contracts: 'قراردادها',
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
      const response = await fetch('/api/settings/access', { cache: 'no-store' });
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

  const permissionsByGroup = useMemo(() => {
    const groups = new Map<string, PermissionItem[]>();
    for (const permission of data?.permissions ?? []) {
      groups.set(permission.group, [...(groups.get(permission.group) ?? []), permission]);
    }
    return Array.from(groups.entries());
  }, [data?.permissions]);

  const updateRolePermissions = async (role: RoleItem, permissionKey: string) => {
    if (!data) return;
    const permissionKeys = role.permissionKeys.includes(permissionKey)
      ? role.permissionKeys.filter((key) => key !== permissionKey)
      : [...role.permissionKeys, permissionKey];

    setSavingKey(`role-${role.id}`);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/settings/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id, permissionKeys }),
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
      const response = await fetch('/api/settings/access', {
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
      const response = await fetch('/api/settings/access', {
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
          <p>دسترسی‌ها action-based هستند. منو، صفحه، API و اکشن‌های هر ماژول باید همین permission keyها را مصرف کنند.</p>
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
          <h3>دسترسی نقش‌ها</h3>
          <div className="access-roles-list">
            {data.roles.map((role) => (
              <article key={role.id} className="access-role-row">
                <div className="access-role-title">
                  <strong>{role.label}</strong>
                  {role.system ? <span>پیش‌فرض</span> : <span>سفارشی</span>}
                </div>

                <div className="access-permission-groups">
                  {permissionsByGroup.map(([group, permissions]) => (
                    <div key={`${role.id}-${group}`} className="access-permission-group">
                      <h4>{GROUP_LABELS[group] ?? group}</h4>
                      <div className="access-menu-checks">
                        {permissions.map((permission) => (
                          <label key={permission.key} className="access-check">
                            <input
                              type="checkbox"
                              checked={role.permissionKeys.includes(permission.key)}
                              disabled={savingKey === `role-${role.id}`}
                              onChange={() => updateRolePermissions(role, permission.key)}
                            />
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="access-menu-preview">
                  <span>منوهای قابل مشاهده:</span>
                  {role.allowedMenuItemIds.length ? (
                    role.allowedMenuItemIds.map((menuItemId) => {
                      const item = data.menuItems.find((menuItem) => menuItem.id === menuItemId);
                      if (!item) return null;
                      return (
                        <span key={item.id} className="access-menu-chip">
                          <i className={`fa ${item.icon}`} />
                          {item.label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="access-menu-chip">بدون منوی مجاز</span>
                  )}
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
        <h3>نماینده‌های قابل اتصال به پنل</h3>
        <p className="access-panel-note">
          نماینده شریک و نماینده سهام‌دار حقوقی فقط وقتی می‌تواند دسترسی پنل داشته باشد که هم حق امضا داشته باشد و هم دسترسی پنل برای او فعال باشد.
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
                <span className={representative.panelAccessEligible ? 'access-ok' : 'access-bad'}>
                  {representative.panelAccessEligible ? 'مجاز برای اتصال' : 'غیرمجاز برای اتصال'}
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
