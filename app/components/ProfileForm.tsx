'use client';

export default function ProfileForm() {
  return (
    <>
      {/* کارت اطلاعات پایه */}
      <div className="card">
        <div className="card-title">
          <i className="fa fa-info-circle"></i> اطلاعات پایه
        </div>
        <button className="btn-outline">فهرست بلوک ها</button>

        <div className="center-avatar-wrapper">
          <div className="big-avatar">
            <span style={{ fontSize: '14px' }}>lind</span>
            <div className="camera-badge">
              <i className="fa fa-camera"></i>
            </div>
          </div>
          <h3 style={{ marginTop: '15px', fontWeight: 'normal', fontSize: '18px' }}>lind</h3>
        </div>

        <div className="input-row">
          <div className="input-group">
            <span className="floating-label">تعداد بلوک *</span>
            <input type="text" defaultValue="20" />
          </div>
          <div className="input-group">
            <span className="floating-label">تعداد واحد *</span>
            <input type="text" defaultValue="2000" />
          </div>
        </div>
      </div>

      {/* کارت نوع کاربری */}
      <div className="card">
        <div className="card-title">
          <i className="fa fa-layer-group"></i> نوع کاربری مجتمع
        </div>
        <div className="chips-container">
          <div className="chip active"><i className="fa fa-check"></i> مسکونی</div>
          <div className="chip active"><i className="fa fa-check"></i> اداری</div>
          <div className="chip active"><i className="fa fa-check"></i> تجاری</div>
          <div className="chip active"><i className="fa fa-check"></i> پارکینگ</div>
        </div>
      </div>

      {/* کارت نوع مالکیت */}
      <div className="card">
        <div className="card-title">
          <i className="fa fa-id-card"></i> نوع مالکیت
        </div>
        <div className="chips-container">
          <div className="chip active"><i className="fa fa-check"></i> ملکی</div>
          <div className="chip">وقفی</div>
          <div className="chip">استیجاری</div>
        </div>
      </div>

      {/* کارت نوع ساخت */}
      <div className="card">
        <div className="card-title">
          <i className="fa fa-hard-hat"></i> نوع ساخت
        </div>
        <div className="chips-container">
          <div className="chip">شخصی ساز</div>
          <div className="chip">تعاونی</div>
          <div className="chip">مسکن مهر</div>
          <div className="chip">بنیاد مسکن</div>
          <div className="chip active"><i className="fa fa-check"></i> سایر</div>
        </div>
        <div className="input-group" style={{ marginTop: '30px' }}>
          <span className="floating-label">توضیحات *</span>
          <textarea rows={4} style={{ textAlign: 'right', paddingRight: '15px' }} defaultValue="به تو چه"></textarea>
        </div>
      </div>

      <button className="btn-submit">ذخیره اطلاعات</button>
      <div style={{ clear: 'both' }}></div>
    </>
  );
}
