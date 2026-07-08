'use client';

import { useMemo, useState } from 'react';
import { Building2, FilterX, Search, Shield, UserPlus, Users } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import type { AdminBusinessRow, AdminUserRow } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';
import { AdminUserCard } from './AdminUserCard';
import { CreateUserDialog } from './CreateUserDialog';
import { GlassSelect } from './GlassSelect';

type UsersSettingsClientProps = {
  businesses: AdminBusinessRow[];
  initialUsers: AdminUserRow[];
};

const USER_TYPE_OPTIONS = [
  { label: 'همه کاربران', value: 'all', description: 'بدون محدودیت نوع کاربر' },
  { label: 'عضو کسب‌وکار', value: 'tenant', description: 'فقط کاربرهای tenantی' },
  { label: 'سیستم تاو', value: 'system', description: 'فقط کاربرهای بدون membership' },
];

export function UsersSettingsClient({ businesses, initialUsers }: UsersSettingsClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [actionFeedback, setActionFeedback] = useState('');

  const businessOptions = useMemo(
    () => [
      { label: 'همه کسب‌وکارها', value: 'all', description: 'تمام tenantهای موجود' },
      ...businesses.map((business) => ({ label: business.name, value: business.id })),
    ],
    [businesses],
  );

  const summary = useMemo(() => {
    const tenantUsers = users.filter((user) => !user.isSystemUser).length;
    const systemUsers = users.filter((user) => user.isSystemUser).length;
    const inactiveUsers = users.filter((user) => !user.isActive).length;

    return {
      total: users.length,
      tenantUsers,
      systemUsers,
      inactiveUsers,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (normalizedSearch) {
        const haystack = [user.fullName, user.email ?? '', user.mobile ?? '', user.tenantNames.join(' ')]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      if (userTypeFilter === 'tenant' && user.isSystemUser) return false;
      if (userTypeFilter === 'system' && !user.isSystemUser) return false;

      if (businessFilter !== 'all' && !user.tenantIds.includes(businessFilter)) {
        return false;
      }

      return true;
    });
  }, [businessFilter, searchQuery, userTypeFilter, users]);

  const clearFilters = () => {
    setSearchQuery('');
    setBusinessFilter('all');
    setUserTypeFilter('all');
  };

  const upsertUser = (nextUser: AdminUserRow) => {
    setUsers((current) => {
      const exists = current.some((item) => item.id === nextUser.id);
      if (!exists) return [nextUser, ...current];
      return current.map((item) => (item.id === nextUser.id ? nextUser : item));
    });
  };

  const handleToggleActive = async (user: AdminUserRow) => {
    const optimistic = { ...user, isActive: !user.isActive };
    upsertUser(optimistic);

    try {
      const response = await fetch(`/api/settings/users/${user.id}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; user?: AdminUserRow } | null;
      if (!response.ok || !payload?.user) {
        throw new Error(payload?.message || 'تغییر وضعیت کاربر انجام نشد.');
      }

      upsertUser(payload.user);
      setActionFeedback(user.isActive ? 'کاربر غیرفعال شد.' : 'کاربر دوباره فعال شد.');
    } catch (error) {
      upsertUser(user);
      setActionFeedback(error instanceof Error ? error.message : 'تغییر وضعیت کاربر انجام نشد.');
    }
  };

  const handleSendTestNotification = async (user: AdminUserRow) => {
    try {
      const response = await fetch(`/api/settings/users/${user.id}/test-notification`, {
        method: 'POST',
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message || 'ارسال نوتیفیکیشن تستی انجام نشد.');
      }
      setActionFeedback(`نوتیفیکیشن تستی برای ${user.fullName} ارسال شد.`);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'ارسال نوتیفیکیشن تستی انجام نشد.');
    }
  };

  return (
    <div className="ai-lab-admin-users-page" dir="rtl" lang="fa">
      <section className="ai-lab-admin-users-hero">
        <div className="ai-lab-admin-users-hero-copy">
          <span className="ai-lab-admin-users-badge">تاو ادمین</span>
          <h1>
            مدیریت کاربران
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.users} label="راهنمای مدیریت کاربران" />
          </h1>
          <p>
            فهرست سراسری همه کاربران در همه tenantها را ببینید، آن‌ها را بر اساس کسب‌وکار فیلتر کنید و کاربر جدید را
            با UI جمع‌وجورتر و حرفه‌ای‌تر ثبت یا ویرایش کنید.
          </p>
        </div>

        <div className="ai-lab-admin-users-hero-actions">
          <TaavButton
            iconStart={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
          >
            ثبت کاربر
          </TaavButton>
        </div>

        <div className="ai-lab-admin-users-stats ai-lab-admin-users-stats--wide">
          <article className="ai-lab-admin-users-stat ai-lab-admin-users-stat--blue">
            <div className="ai-lab-admin-users-stat-icon">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span>کل کاربران</span>
              <strong>{new Intl.NumberFormat('fa-IR').format(summary.total)}</strong>
            </div>
          </article>
          <article className="ai-lab-admin-users-stat ai-lab-admin-users-stat--teal">
            <div className="ai-lab-admin-users-stat-icon">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span>اعضای کسب‌وکار</span>
              <strong>{new Intl.NumberFormat('fa-IR').format(summary.tenantUsers)}</strong>
            </div>
          </article>
          <article className="ai-lab-admin-users-stat ai-lab-admin-users-stat--amber">
            <div className="ai-lab-admin-users-stat-icon">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span>سیستم تاو</span>
              <strong>{new Intl.NumberFormat('fa-IR').format(summary.systemUsers)}</strong>
            </div>
          </article>
          <article className="ai-lab-admin-users-stat ai-lab-admin-users-stat--slate">
            <div className="ai-lab-admin-users-stat-icon">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span>کاربران غیرفعال</span>
              <strong>{new Intl.NumberFormat('fa-IR').format(summary.inactiveUsers)}</strong>
            </div>
          </article>
        </div>
      </section>

      <div className="ai-lab-admin-filters-bar ai-lab-admin-users-filters ai-lab-admin-users-filters--enhanced">
        <label className="ai-lab-admin-filter-search">
          <Search className="h-4 w-4" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو بر اساس نام، موبایل، ایمیل یا کسب‌وکار"
            aria-label="جستجو در کاربران"
          />
        </label>

        <GlassSelect
          id="admin-users-business-filter"
          value={businessFilter}
          onChange={setBusinessFilter}
          options={businessOptions}
          placeholder="فیلتر کسب‌وکار"
          className="ai-lab-admin-filter-select"
        />

        <GlassSelect
          id="admin-users-type-filter"
          value={userTypeFilter}
          onChange={setUserTypeFilter}
          options={USER_TYPE_OPTIONS}
          placeholder="فیلتر نوع کاربر"
          className="ai-lab-admin-filter-select"
        />

        <button type="button" className="ai-lab-admin-clear-filters" onClick={clearFilters}>
          <FilterX className="h-4 w-4" />
          پاک‌سازی فیلترها
        </button>
      </div>

      {actionFeedback ? <div className="ai-lab-admin-users-feedback">{actionFeedback}</div> : null}

      {filteredUsers.length === 0 ? (
        <div className="ai-lab-admin-empty-state">
          <p>کاربری با فیلترهای فعلی پیدا نشد.</p>
        </div>
      ) : (
        <section className="ai-lab-admin-users-grid" aria-label="فهرست کاربران">
          {filteredUsers.map((user) => (
            <AdminUserCard
              key={user.id}
              user={user}
              onEdit={(selectedUser) => {
                setEditingUser(selectedUser);
                setDialogOpen(true);
              }}
              onToggleActive={(selectedUser) => void handleToggleActive(selectedUser)}
              onSendTestNotification={(selectedUser) => void handleSendTestNotification(selectedUser)}
            />
          ))}
        </section>
      )}

      <CreateUserDialog
        businesses={businesses}
        open={dialogOpen}
        user={editingUser}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen);
          if (!nextOpen) {
            setEditingUser(null);
          }
        }}
        onCreated={(user) => {
          upsertUser(user);
          setActionFeedback(`کاربر ${user.fullName} ثبت شد.`);
        }}
        onUpdated={(user) => {
          upsertUser(user);
          setActionFeedback(`اطلاعات ${user.fullName} به‌روزرسانی شد.`);
        }}
      />
    </div>
  );
}
