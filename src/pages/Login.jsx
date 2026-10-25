import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap } from 'react-icons/hi';
import { HiShieldCheck, HiSparkles, HiHeart } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.email) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = 'Invalid email format';
    if (!form.password) err.password = 'Password is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-50 via-orange-50 to-amber-50 flex items-center justify-center p-4 lg:p-8">
      {/* Decorative background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-6xl bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[600px]">
        {/* LEFT SIDE — Branding */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary-50 to-orange-100 overflow-hidden">
          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <HiOutlineAcademicCap className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Smart Campus</h2>
                <p className="text-xs text-gray-500">Campus Management System</p>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 my-8">
            <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Better Learning<br />
              <span className="bg-gradient-to-r from-primary-500 to-orange-500 bg-clip-text text-transparent">
                Brighter Future
              </span>
            </h1>
            <p className="text-gray-600 text-base max-w-md leading-relaxed">
              Manage students, teachers, classes, attendance and more — all in one place.
            </p>
          </div>

          {/* Illustration area */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-80 h-80 bg-gradient-to-br from-primary-300 to-orange-300 rounded-full blur-2xl"></div>
          </div>

          {/* Feature badges */}
          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-white shadow-sm">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
                <HiShieldCheck className="text-primary-600 text-lg" />
              </div>
              <p className="text-xs font-semibold text-gray-800">Secure</p>
              <p className="text-[10px] text-gray-500">& Reliable</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-white shadow-sm">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
                <HiSparkles className="text-primary-600 text-lg" />
              </div>
              <p className="text-xs font-semibold text-gray-800">Easy</p>
              <p className="text-[10px] text-gray-500">to Use</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-white shadow-sm">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
                <HiHeart className="text-primary-600 text-lg" />
              </div>
              <p className="text-xs font-semibold text-gray-800">Always</p>
              <p className="text-[10px] text-gray-500">With You</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Login form */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-white">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <HiOutlineAcademicCap className="text-white text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Smart Campus</h2>
              <p className="text-[10px] text-gray-500">Campus Management</p>
            </div>
          </div>

          <div className="max-w-sm w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                Welcome Back <span className="text-3xl">👋</span>
              </h2>
              <p className="text-gray-500 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                icon={<HiOutlineMail className="w-5 h-5" />}
                autoComplete="email"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => toast('Please contact your administrator', { icon: 'ℹ️' })}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <HiOutlineLockClosed className="w-5 h-5" />
                  </span>
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${
                      errors.password ? 'border-accent-red' : ''
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-accent-red">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 text-base"
              >
                Login
              </Button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => toast('Please contact your administrator', { icon: 'ℹ️' })}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Contact Admin
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;