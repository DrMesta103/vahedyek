import Sidebar from './components/Sidebar';
import ProfileForm from './components/ProfileForm';

export default function Home() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeItem="complex" />
      <main className="main-content">
        <div className="top-header">
          <div></div>
          <div className="breadcrumb">
            خانه <i className="fa fa-chevron-left"></i> جزئیات مجتمع
          </div>
        </div>
        <div className="content-body">
          <ProfileForm />
        </div>
      </main>
    </div>
  );
}
