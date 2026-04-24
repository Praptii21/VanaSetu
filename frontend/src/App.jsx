import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import LabPortal from './pages/LabPortal';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import ConsumerScan from './pages/ConsumerScan';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/lab-portal" element={<LabPortal />} />
            <Route path="/manufacturer" element={<ManufacturerDashboard />} />
            <Route path="/product/:productId" element={<ConsumerScan />} />
            <Route path="/scan" element={<ConsumerScan />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
