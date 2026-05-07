'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ReceiptForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contractId: '',
    bankName: '',
    trackingNumber: '',
    paymentDate: '',
    amount: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Submit to API
    setTimeout(() => {
      setSubmitting(false);
      router.push('/customer-portal/financial/receipts');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="receipt-form">
      <div className="form-card">
        <div className="form-section">
          <h3>اطلاعات پرداخت</h3>

          <div className="form-group">
            <label htmlFor="contractId">
              قرارداد <span className="required">*</span>
            </label>
            <select
              id="contractId"
              value={formData.contractId}
              onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
              required
            >
              <option value="">انتخاب کنید</option>
              <option value="1">قرارداد 1001 - بلوک A - واحد 12</option>
              <option value="2">قرارداد 1002 - بلوک B - واحد 8</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bankName">
                بانک مقصد <span className="required">*</span>
              </label>
              <select
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                required
              >
                <option value="">انتخاب کنید</option>
                <option value="ملی">بانک ملی</option>
                <option value="ملت">بانک ملت</option>
                <option value="صادرات">بانک صادرات</option>
                <option value="تجارت">بانک تجارت</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="trackingNumber">
                شماره پیگیری <span className="required">*</span>
              </label>
              <input
                type="text"
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                placeholder="123456789"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentDate">
                تاریخ واریز <span className="required">*</span>
              </label>
              <input
                type="text"
                id="paymentDate"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                placeholder="1403/09/25"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">
                مبلغ واریزی (ریال) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="50000000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">توضیحات (اختیاری)</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="توضیحات اضافی در صورت نیاز..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>تصویر فیش پرداختی</h3>

          <div className="image-upload-area">
            <input type="file" id="receiptImage" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="پیش‌نمایش فیش" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ) : (
              <label htmlFor="receiptImage" className="upload-label">
                <i className="fa fa-cloud-upload-alt"></i>
                <span>کلیک کنید یا تصویر را بکشید</span>
                <span className="upload-hint">فرمت‌های مجاز: JPG, PNG (حداکثر 5MB)</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => router.back()} disabled={submitting}>
            انصراف
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <i className="fa fa-spinner fa-spin"></i>
                در حال ثبت...
              </>
            ) : (
              <>
                <i className="fa fa-check"></i>
                ثبت فیش پرداختی
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
