import { Routes, Route, Navigate } from 'react-router-dom';
import { useMockData } from './context/MockDataContext';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import LabPortal from './pages/LabPortal';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import ConsumerScan from './pages/ConsumerScan';
import Navbar from './components/Navbar';

// Layout wrapper for authenticated portal pages
function PortalLayout({ children, requiredRole }) {
  const { auth } = useMockData();

  if (!auth.isLoggedIn || auth.role !== requiredRole) {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route
        path="/lab"
        element={
          <PortalLayout requiredRole="lab">
            <LabPortal />
          </PortalLayout>
        }
      />
      <Route
        path="/manufacturer"
        element={
          <PortalLayout requiredRole="manufacturer">
            <ManufacturerDashboard />
          </PortalLayout>
        }
      />
      <Route path="/product/:productId" element={<ConsumerScan />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
