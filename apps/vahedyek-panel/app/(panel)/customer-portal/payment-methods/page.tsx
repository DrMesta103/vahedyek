import PanelLayout from '../../../components/PanelLayout';
import '../customer-portal.css';

export default function PaymentMethodsPage() {
  return (
    <PanelLayout>
      <div className="customer-contracts-page">
        <div className="page-header">
          <h1>روش‌های پرداخت بدهی</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>اطلاعات حساب‌های بانکی و روش‌های پرداخت</p>
        </div>

        <div className="payment-methods-grid">
          <div className="payment-method-card">
            <div className="payment-method-header">
              <i className="fa fa-university" style={{ fontSize: '32px', color: '#008080' }}></i>
              <h3>واریز به حساب</h3>
            </div>
            <div className="payment-method-body">
              <div className="payment-info-row">
                <span>بانک:</span>
                <strong>بانک ملی ایران</strong>
              </div>
              <div className="payment-info-row">
                <span>شماره حساب:</span>
                <strong dir="ltr">0123456789</strong>
              </div>
              <div className="payment-info-row">
                <span>شماره کارت:</span>
                <strong dir="ltr">6037-9971-****-****</strong>
              </div>
              <div className="payment-info-row">
                <span>صاحب حساب:</span>
                <strong>شرکت واحد یک</strong>
              </div>
              <button className="btn-copy">
                <i className="fa fa-copy"></i>
                کپی شماره حساب
              </button>
            </div>
          </div>

          <div className="payment-method-card">
            <div className="payment-method-header">
              <i className="fa fa-credit-card" style={{ fontSize: '32px', color: '#008080' }}></i>
              <h3>کارت به کارت</h3>
            </div>
            <div className="payment-method-body">
              <div className="payment-info-row">
                <span>بانک:</span>
                <strong>بانک ملت</strong>
              </div>
              <div className="payment-info-row">
                <span>شماره کارت:</span>
                <strong dir="ltr">6104-3378-****-****</strong>
              </div>
              <div className="payment-info-row">
                <span>صاحب کارت:</span>
                <strong>شرکت واحد یک</strong>
              </div>
              <button className="btn-copy">
                <i className="fa fa-copy"></i>
                کپی شماره کارت
              </button>
            </div>
          </div>

          <div className="payment-method-card">
            <div className="payment-method-header">
              <i className="fa fa-money-check" style={{ fontSize: '32px', color: '#008080' }}></i>
              <h3>چک</h3>
            </div>
            <div className="payment-method-body">
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                چک به نام شرکت واحد یک صادر کنید و به آدرس دفتر مرکزی ارسال نمایید.
              </p>
              <div className="payment-info-row">
                <span>آدرس:</span>
                <strong>تهران، خیابان ولیعصر، پلاک 123</strong>
              </div>
              <div className="payment-info-row">
                <span>کد پستی:</span>
                <strong dir="ltr">1234567890</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-notice">
          <i className="fa fa-info-circle"></i>
          <div>
            <strong>توجه:</strong>
            <p>پس از واریز، حتماً فیش پرداختی خود را در بخش قراردادها ثبت کنید تا پرداخت شما پیگیری شود.</p>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
