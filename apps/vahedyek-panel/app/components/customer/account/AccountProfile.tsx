'use client';

import { useState } from 'react';

export default function AccountProfile() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'علی احمدی',
    nationalId: '1234567890',
    birthDate: '1365/05/15',
    mobile: '09123456789',
    email: 'ali.ahmadi@example.com',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
  });

  const handleSave = () => {
    // TODO: Save to API
    setEditing(false);
  };

  return (
    <div className="account-profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fa fa-user"></i>
          </div>
          <div className="profile-info">
            <h2>{formData.fullName}</h2>
            <p>{formData.email}</p>
          </div>
          {!editing && (
            <button className="btn-primary" onClick={() => setEditing(true)}>
              <i className="fa fa-edit"></i>
              ویرایش اطلاعات
            </button>
          )}
        </div>

        <div className="profile-body">
          <div className="info-section">
            <h3>اطلاعات شخصی</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>نام و نام خانوادگی</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                ) : (
                  <span>{formData.fullName}</span>
                )}
              </div>

              <div className="info-item">
                <label>کد ملی</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  />
                ) : (
                  <span>{formData.nationalId}</span>
                )}
              </div>

              <div className="info-item">
                <label>تاریخ تولد</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                ) : (
                  <span>{formData.birthDate}</span>
                )}
              </div>

              <div className="info-item">
                <label>شماره موبایل</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                ) : (
                  <span>{formData.mobile}</span>
                )}
              </div>

              <div className="info-item">
                <label>ایمیل</label>
                {editing ? (
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                ) : (
                  <span>{formData.email}</span>
                )}
              </div>

              <div className="info-item full-width">
                <label>آدرس</label>
                {editing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                ) : (
                  <span>{formData.address}</span>
                )}
              </div>
            </div>
          </div>

          {editing && (
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setEditing(false)}>
                انصراف
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <i className="fa fa-check"></i>
                ذخیره تغییرات
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="security-card">
        <h3>امنیت حساب</h3>
        <div className="security-item">
          <div>
            <strong>رمز عبور</strong>
            <p>آخرین تغییر: 30 روز پیش</p>
          </div>
          <button className="btn-secondary">
            <i className="fa fa-key"></i>
            تغییر رمز عبور
          </button>
        </div>
      </div>
    </div>
  );
}
