import { Routes, Route, Navigate } from 'react-router-dom';
import { useMockData } from './context/MockDataContext';
import Landing from './pages/Landing';
import LabPortal from './pages/LabPortal';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import ConsumerScan from './pages/ConsumerScan';
import Navbar from './components/Navbar';

// Layout wrapper for authenticated portal pages
function PortalLayout({ children, requiredRole }) {
  const { auth } = useMockData();

  if (!auth.isLoggedIn || auth.role !== requiredRole) {
    return <Navigate to="/" replace />;
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
      {/* Single landing page — auth handled via modal */}
      <Route path="/" element={<Landing />} />

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
      <Route
        path="/collector"
        element={
          <PortalLayout requiredRole="collector">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold">Collector Portal</h2>
              <p className="text-gray-500">Please use the Android mobile app for harvesting data.</p>
            </div>
          </PortalLayout>
        }
      />
      <Route path="/product/:productId" element={<ConsumerScan />} />

      {/* Redirect old standalone auth routes back to landing */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
