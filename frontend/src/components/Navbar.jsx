import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';
import { FlaskConical, Factory, LogOut, Leaf } from 'lucide-react';

export default function Navbar() {
  const { auth, logout } = useMockData();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-botanical-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-botanical-700 p-2 rounded-xl group-hover:bg-botanical-600 transition-colors">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-botanical-800 tracking-tight">
              VanaSetu
            </span>
          </Link>

          {/* Center Nav */}
          <div className="flex items-center gap-1">
            {auth.role === 'lab' && (
              <Link
                to="/lab"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                  isActive('/lab')
                    ? 'bg-botanical-100 text-botanical-700'
                    : 'text-gray-500 hover:text-botanical-600 hover:bg-botanical-50'
                }`}
              >
                <FlaskConical className="h-4 w-4" />
                Lab Portal
              </Link>
            )}
            {auth.role === 'manufacturer' && (
              <Link
                to="/manufacturer"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                  isActive('/manufacturer')
                    ? 'bg-botanical-100 text-botanical-700'
                    : 'text-gray-500 hover:text-botanical-600 hover:bg-botanical-50'
                }`}
              >
                <Factory className="h-4 w-4" />
                Manufacturer
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {auth.isLoggedIn && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-botanical-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-botanical-700">
                      {auth.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800 font-body leading-tight">{auth.username}</p>
                    <p className="text-xs text-gray-400 font-body capitalize">{auth.role === 'lab' ? 'Lab Technician' : 'Manufacturer'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
