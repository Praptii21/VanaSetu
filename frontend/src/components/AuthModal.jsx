import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, FlaskConical, Factory, ShieldCheck, Mail, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useMockData } from '../context/MockDataContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup', initialRole = 'collector' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [role, setRole] = useState(initialRole); // only used for signup
  const { signup, login } = useMockData();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync mode/role whenever the modal opens with new config
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setFormData({ name: '', email: '', password: '' });
      setErrorMsg('');
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    let result;
    if (mode === 'signup') {
      result = await signup({ ...formData, role });
      if (result.success) {
        onClose();
        navigate(`/${role}`);
      } else {
        setErrorMsg(result.message || 'Signup failed. Please try again.');
      }
    } else {
      // Login — pass selected role for demo fallback, backend still uses DB role
      result = await login(role, formData.email, formData.password);
      if (result.success) {
        onClose();
        navigate(`/${result.role}`);
      } else {
        setErrorMsg(result.message || 'Invalid credentials. Please try again.');
      }
    }

    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-botanical-100 mb-4">
                <Leaf className="h-7 w-7 text-botanical-700" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="font-body text-sm text-gray-500 mt-1">
                {mode === 'signup' ? 'Join the VanSetu ecosystem' : 'Sign in to your portal'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-botanical-700 shadow-sm' : 'text-gray-400'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'login' ? 'bg-white text-botanical-700 shadow-sm' : 'text-gray-400'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block font-body text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-botanical pl-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block font-body text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-botanical pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-body text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-botanical pl-10 pr-10"
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection — shown for both signup AND login */}
              <div>
                <label className="block font-body text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {mode === 'signup' ? 'I am a...' : 'Login as...'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'collector', Icon: Leaf, label: 'Collector' },
                      { id: 'lab', Icon: FlaskConical, label: 'Lab Tech' },
                      { id: 'manufacturer', Icon: Factory, label: 'Maker' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                          role === r.id
                            ? 'border-botanical-500 bg-botanical-50 text-botanical-700'
                            : 'border-gray-100 bg-white text-gray-400 hover:border-botanical-200'
                        }`}
                      >
                        <r.Icon className="h-4 w-4 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{r.label}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Error message */}
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 font-body bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center"
                >
                  {errorMsg}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
