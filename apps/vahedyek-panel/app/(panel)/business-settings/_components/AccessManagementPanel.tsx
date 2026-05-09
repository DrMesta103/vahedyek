'use client';

import { Check, ChevronLeft, KeyRound, Loader2, Plus, Search, ShieldCheck, UsersRound } from 'lucide-react';
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
  platform: 'پنل و کاربران',
  business: 'کسب و کار',
  complex: 'مجتمع',
  contracts: 'قراردادها',
  customer: 'پنل خریدار',
};

function getRoleTone(role: RoleItem) {
  if (role.key === 'business_owner') return 'is-owner';
  if (role.key === 'employee') return 'is-employee';
  if (role.key.includes('shareholder')) return 'is-shareholder';
  return '';
}

export function AccessManagementPanel() {
  const [data, setData] = useState<AccessPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
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
      setSelectedRoleId((current) => current || payload.roles.find((role: RoleItem) => role.key === 'employee')?.id || payload.roles[0]?.id || '');
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'دریافت تنظیمات دسترسی انجام نشد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const roles = data?.roles ?? [];
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const selectedRoleMembers = useMemo(
    () => (selectedRole ? (data?.members ?? []).filter((member) => member.roleIds.includes(selectedRole.id)) : []),
    [data?.members, selectedRole],
  );

  const permissionsByGroup = useMemo(() => {
    const groups = new Map<string, PermissionItem[]>();
    for (const permission of data?.permissions ?? []) {
      groups.set(permission.group, [...(groups.get(permission.group) ?? []), permission]);
    }
    return Array.from(groups.entries());
  }, [data?.permissions]);

  const filteredMembers = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    if (!query) return data?.members ?? [];
    return (data?.members ?? []).filter((member) => `${member.fullName} ${member.email}`.toLowerCase().includes(query));
  }, [data?.members, memberQuery]);

  const allowedMenus = useMemo(() => {
    if (!data || !selectedRole) return [];
    return selectedRole.allowedMenuItemIds
      .map((menuItemId) => data.menuItems.find((menuItem) => menuItem.id === menuItemId))
      .filter(Boolean) as MenuItem[];
  }, [data, selectedRole]);

  const saveRolePermissions = async (role: RoleItem, permissionKeys: string[], successMessage = 'دسترسی نقش ذخیره شد.') => {
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
      setMessage(successMessage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره دسترسی نقش انجام نشد.');
    } finally {
      setSavingKey('');
    }
  };

  const togglePermission = async (role: RoleItem, permissionKey: string) => {
    const permissionKeys = role.permissionKeys.includes(permissionKey)
      ? role.permissionKeys.filter((key) => key !== permissionKey)
      : [...role.permissionKeys, permissionKey];
    await saveRolePermissions(role, permissionKeys);
  };

  const togglePermissionGroup = async (role: RoleItem, permissions: PermissionItem[]) => {
    const groupKeys = permissions.map((permission) => permission.key);
    const hasAll = groupKeys.every((key) => role.permissionKeys.includes(key));
    const permissionKeys = hasAll
      ? role.permissionKeys.filter((key) => !groupKeys.includes(key))
      : Array.from(new Set([...role.permissionKeys, ...groupKeys]));
    await saveRolePermissions(role, permissionKeys, hasAll ? 'دسترسی‌های گروه برداشته شد.' : 'همه دسترسی‌های گروه فعال شد.');
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
      setSelectedRoleId(payload.roles.find((role: RoleItem) => role.label === label)?.id ?? payload.roles[0]?.id ?? '');
      setNewRoleLabel('');
      setMessage('نقش جدید ساخته شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ساخت نقش انجام نشد.');
    } finally {
      setSavingKey('');
    }
  };

  if (loading) {
    return (
      <section className="access-panel-card access-loading-state">
        <Loader2 />
        <span>در حال دریافت نقش‌ها و دسترسی‌ها...</span>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="access-panel-card access-panel-muted">
        <strong>مدیریت نقش‌ها و دسترسی‌ها</strong>
        <p>{error}</p>
      </section>
    );
  }

  if (!data || !selectedRole) return null;

  return (
    <section className="access-panel-card" dir="rtl">
      <div className="access-panel-heading">
        <div>
          <span className="access-eyebrow">
            <ShieldCheck />
            مدیریت سطح دسترسی
          </span>
          <h2>نقش‌ها، اعضا و مجوزهای پنل</h2>
          <p>هر کاربر می‌تواند چند نقش داشته باشد. اضافه شدن کارمند به صورت خودکار نقش کارمند را به کاربر اضافه می‌کند.</p>
        </div>
        <div className="access-role-create">
          <input
            value={newRoleLabel}
            onChange={(event) => setNewRoleLabel(event.target.value)}
            placeholder="عنوان نقش جدید"
            className="app-control"
          />
          <button type="button" onClick={createRole} disabled={savingKey === 'new-role'} className="app-button access-primary-button">
            {savingKey === 'new-role' ? <Loader2 /> : <Plus />}
            افزودن
          </button>
        </div>
      </div>

      {message ? <div className="access-panel-message">{message}</div> : null}
      {error ? <div className="access-panel-error">{error}</div> : null}

      <div className="access-overview-strip">
        <div>
          <strong>{roles.length}</strong>
          <span>نقش فعال</span>
        </div>
        <div>
          <strong>{data.members.length}</strong>
          <span>عضو پنل</span>
        </div>
        <div>
          <strong>{selectedRole.permissionKeys.length}</strong>
          <span>دسترسی نقش انتخابی</span>
        </div>
        <div>
          <strong>{selectedRoleMembers.length}</strong>
          <span>عضو با این نقش</span>
        </div>
      </div>

      <div className="access-workspace">
        <aside className="access-role-sidebar" aria-label="نقش‌ها">
          <div className="access-section-title">
            <KeyRound />
            <span>نقش‌ها</span>
          </div>
          <div className="access-role-list">
            {roles.map((role) => {
              const memberCount = data.members.filter((member) => member.roleIds.includes(role.id)).length;
              const active = role.id === selectedRole.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  className={`access-role-button ${getRoleTone(role)}${active ? ' is-active' : ''}`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <span>
                    <strong>{role.label}</strong>
                    <small>{role.system ? 'پیش‌فرض سیستم' : 'سفارشی'} · {memberCount} عضو</small>
                  </span>
                  <ChevronLeft />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="access-role-detail">
          <div className="access-detail-header">
            <div>
              <h3>{selectedRole.label}</h3>
              <p>{selectedRole.system ? 'نقش پیش‌فرض سیستم' : 'نقش سفارشی'} با {selectedRole.permissionKeys.length} دسترسی فعال</p>
            </div>
            <div className="access-menu-preview">
              {allowedMenus.length ? (
                allowedMenus.map((item) => (
                  <span key={item.id} className="access-menu-chip">
                    <i className={`fa ${item.icon}`} />
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="access-menu-chip is-empty">بدون منوی مجاز</span>
              )}
            </div>
          </div>

          <div className="access-permission-groups">
            {permissionsByGroup.map(([group, permissions]) => {
              const enabledCount = permissions.filter((permission) => selectedRole.permissionKeys.includes(permission.key)).length;
              const allEnabled = enabledCount === permissions.length;
              return (
                <article key={`${selectedRole.id}-${group}`} className="access-permission-group">
                  <div className="access-permission-group-head">
                    <div>
                      <h4>{GROUP_LABELS[group] ?? group}</h4>
                      <span>{enabledCount} از {permissions.length} فعال</span>
                    </div>
                    <button
                      type="button"
                      className="access-small-button"
                      disabled={savingKey === `role-${selectedRole.id}`}
                      onClick={() => togglePermissionGroup(selectedRole, permissions)}
                    >
                      {allEnabled ? 'برداشتن همه' : 'فعال کردن همه'}
                    </button>
                  </div>
                  <div className="access-permission-list">
                    {permissions.map((permission) => {
                      const checked = selectedRole.permissionKeys.includes(permission.key);
                      return (
                        <button
                          key={permission.key}
                          type="button"
                          className={`access-permission-toggle${checked ? ' is-checked' : ''}`}
                          disabled={savingKey === `role-${selectedRole.id}`}
                          onClick={() => togglePermission(selectedRole, permission.key)}
                        >
                          <span className="access-toggle-box">{checked ? <Check /> : null}</span>
                          <span>{permission.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="access-members-panel">
        <div className="access-members-head">
          <div className="access-section-title">
            <UsersRound />
            <span>تخصیص نقش به اعضا</span>
          </div>
          <label className="access-member-search">
            <Search />
            <input value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="جستجوی عضو" />
          </label>
        </div>
        <div className="access-members-list">
          {filteredMembers.map((member) => (
            <article key={member.id} className="access-member-row">
              <div className="access-member-identity">
                <strong>{member.fullName || 'کاربر بدون نام'}</strong>
                <span dir="ltr">{member.email || '-'}</span>
              </div>
              <div className="access-member-roles">
                {data.roles.map((role) => (
                  <label key={role.id} className={`access-check access-check-compact${member.roleIds.includes(role.id) ? ' is-checked' : ''}`}>
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

      <div className="access-representatives-block">
        <div className="access-section-title">
          <UsersRound />
          <span>نماینده‌های قابل اتصال به پنل</span>
        </div>
        <div className="access-representatives-list">
          {data.representatives.length ? (
            data.representatives.map((representative) => (
              <div key={representative.id} className="access-representative-row">
                <strong>{representative.fullName}</strong>
                <span>{representative.principalType === 'partner' ? 'نماینده شریک' : 'نماینده سهامدار حقوقی'}</span>
                <span>{representative.principalName}</span>
                <span className={representative.hasSigningAuthority ? 'access-ok' : 'access-bad'}>
                  {representative.hasSigningAuthority ? 'حق امضا دارد' : 'بدون حق امضا'}
                </span>
                <span className={representative.panelAccessEnabled ? 'access-ok' : 'access-bad'}>
                  {representative.panelAccessEnabled ? 'دسترسی پنل فعال' : 'دسترسی پنل غیرفعال'}
                </span>
                <span className={representative.panelAccessEligible ? 'access-ok' : 'access-bad'}>
                  {representative.panelAccessEligible ? 'مجاز برای اتصال' : 'غیرمجاز'}
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
