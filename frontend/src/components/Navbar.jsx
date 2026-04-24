import { Link, useLocation } from 'react-router-dom';
import { Leaf, FlaskConical, Factory, QrCode } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-green-800 tracking-tight">VanSetu</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/lab-portal" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/lab-portal') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>Lab Portal</span>
            </Link>
            <Link 
              to="/manufacturer" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/manufacturer') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Factory className="h-4 w-4" />
              <span>Manufacturer</span>
            </Link>
            <Link 
              to="/scan" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/scan') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Scan QR</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
