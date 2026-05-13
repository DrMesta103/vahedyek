'use client';

import { useAuthContext } from '../../../hooks/useAuthContext';

function valueOrDash(value: string | null | undefined) {
  const text = String(value ?? '').trim();
  return text || '—';
}

export default function AccountProfile() {
  const { data, loading } = useAuthContext();

  if (loading) {
    return <div className="empty-state">در حال بارگذاری اطلاعات حساب...</div>;
  }

  if (!data?.user) {
    return <div className="empty-state">اطلاعات حساب کاربری در دسترس نیست.</div>;
  }

  const roleLabel = data.membership?.roleLabels?.join('، ') || data.membership?.role || 'کاربر';
  const contactLabel = data.user.email || data.user.mobile || 'بدون اطلاعات تماس';

  return (
    <div className="account-profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fa fa-user" />
          </div>
          <div className="profile-info">
            <h2>{data.user.fullName}</h2>
            <p>{contactLabel}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="info-section">
            <h3>اطلاعات حساب</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>نام</label>
                <span>{valueOrDash(data.user.firstName)}</span>
              </div>
              <div className="info-item">
                <label>نام خانوادگی</label>
                <span>{valueOrDash(data.user.lastName)}</span>
              </div>
              <div className="info-item">
                <label>شماره موبایل</label>
                <span>{valueOrDash(data.user.mobile)}</span>
              </div>
              <div className="info-item">
                <label>ایمیل</label>
                <span>{valueOrDash(data.user.email)}</span>
              </div>
              <div className="info-item">
                <label>نقش‌ها</label>
                <span>{roleLabel}</span>
              </div>
              <div className="info-item">
                <label>کسب و کار فعال</label>
                <span>{valueOrDash(data.tenant?.name)}</span>
              </div>
              <div className="info-item full-width">
                <label>شناسه کسب و کار</label>
                <span>{valueOrDash(data.tenant?.slug)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="security-card">
        <h3>امنیت حساب</h3>
        <div className="security-item">
          <div>
            <strong>نشست فعال</strong>
            <p>اطلاعات این صفحه از حساب واقعی واردشده و tenant فعال خوانده می‌شود.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
