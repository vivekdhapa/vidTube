import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Play, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  
  const successMessage = location.state?.message;

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const res = await api.post('/users/login', data);
      setUser(res.data.data); // The backend returns user inside res.data.data
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid credentials or something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[24px] backdrop-blur-[12px] p-10 shadow-2xl">
        
        {/* Success Toast */}
        {successMessage && (
          <div className="mb-6 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.15)] text-[#34D399] rounded-[10px] p-3 text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Play size={24} className="text-[#6366F1] fill-[#6366F1]" />
            <span className="text-white font-['Outfit'] font-semibold text-2xl tracking-tight">
              VidTube
            </span>
          </div>
          <h1 className="font-['Outfit'] text-[24px] font-semibold text-[#F4F4F5] mb-1 text-center">
            Welcome back
          </h1>
          <p className="font-['Inter'] text-[14px] text-[#A1A1AA] text-center">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-[10px] text-[#F4F4F5] px-4 py-3 outline-none transition-all font-['Inter'] text-[14px]
                ${errors.email ? 'border-[#F87171] focus:border-[#F87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[rgba(255,255,255,0.08)] focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'}
              `}
            />
            {errors.email && <p className="text-[#F87171] text-[12px] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-[10px] text-[#F4F4F5] px-4 py-3 pr-10 outline-none transition-all font-['Inter'] text-[14px]
                  ${errors.password ? 'border-[#F87171] focus:border-[#F87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[rgba(255,255,255,0.08)] focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-[#F87171] text-[12px] mt-1">{errors.password.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full py-3 text-[15px] font-medium transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Error State */}
        {errorMsg && (
          <div className="mt-6 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.15)] rounded-[10px] p-3 text-center">
            <p className="text-[#F87171] text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[#A1A1AA] text-[14px] mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#6366F1] hover:underline transition-all">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
