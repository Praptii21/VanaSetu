import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useMockData } from '../context/MockDataContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, auth } = useMockData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to their role page
  if (auth.isLoggedIn && auth.role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }
    
    setIsLoading(true);

    // Backend returns the correct role based on email
    const result = await login('', username, password);
    
    if (result.success) {
      navigate(`/${result.role}`);
    } else {
      alert(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-botanical-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-botanical-100/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-body text-sm text-gray-400 hover:text-botanical-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-botanical-100 mb-4">
              <Leaf className="h-8 w-8 text-botanical-700" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Sign In</h1>
            <p className="font-body text-sm text-gray-500">Access your VanaSetu portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-botanical"
                autoFocus
              />
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter any password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-botanical pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Leaf className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo notice */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-4">
            <p className="font-body text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/signup')}
                className="font-semibold text-botanical-600 hover:text-botanical-700 transition-colors"
              >
                Sign Up
              </button>
            </p>
            <p className="font-body text-xs text-gray-400 leading-relaxed">
              🌿 <span className="font-medium text-botanical-500">Secure Mode</span> — Please use your registered credentials.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
