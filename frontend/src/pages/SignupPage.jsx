import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, Factory, Leaf, Eye, EyeOff, ArrowLeft, User, Mail, ShieldCheck } from 'lucide-react';
import { useMockData } from '../context/MockDataContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, auth } = useMockData();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'collector'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to their role page
  if (auth.isLoggedIn) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    const result = await signup(formData);
    
    if (result.success) {
      navigate(`/${formData.role}`);
    } else {
      alert(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
            <p className="font-body text-sm text-gray-500">Join the VanSetu supply chain ecosystem</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-botanical pl-11"
                  required
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-botanical pl-11"
                  required
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'collector', icon: Leaf, label: 'Collector' },
                  { id: 'lab', icon: FlaskConical, label: 'Lab Tech' },
                  { id: 'manufacturer', icon: Factory, label: 'Maker' },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      formData.role === role.id
                        ? 'border-botanical-500 bg-botanical-50 text-botanical-700'
                        : 'border-gray-100 bg-white text-gray-400 hover:border-botanical-200'
                    }`}
                  >
                    <role.icon className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-botanical pl-11 pr-12"
                  required
                />
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                  Creating Account...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="font-body text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login/lab"
                className="font-semibold text-botanical-600 hover:text-botanical-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
