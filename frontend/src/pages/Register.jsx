import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Eye, EyeOff, Loader2, ImagePlus, X } from 'lucide-react';
import api from '../api/axios';

function Register() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const navigate = useNavigate();

  // Watch file inputs to generate previews
  const avatarFile = watch('avatar');
  const coverFile = watch('coverImage');

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const clearAvatar = (e) => {
    e.preventDefault();
    setAvatarPreview(null);
    setValue('avatar', null);
  };

  const clearCover = (e) => {
    e.preventDefault();
    setCoverPreview(null);
    setValue('coverImage', null);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const formData = new FormData();
      formData.append('fullname', data.fullname);
      formData.append('username', data.username.toLowerCase());
      formData.append('email', data.email);
      formData.append('password', data.password);
      
      if (data.avatar && data.avatar[0]) {
        formData.append('avatar', data.avatar[0]);
      }
      if (data.coverImage && data.coverImage[0]) {
        formData.append('coverImage', data.coverImage[0]);
      }

      await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[480px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[24px] backdrop-blur-[12px] p-8 sm:p-10 shadow-2xl">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Play size={24} className="text-[#6366F1] fill-[#6366F1]" />
            <span className="text-white font-['Outfit'] font-semibold text-2xl tracking-tight">
              VidTube
            </span>
          </div>
          <h1 className="font-['Outfit'] text-[24px] font-semibold text-[#F4F4F5] mb-1 text-center">
            Create an account
          </h1>
          <p className="font-['Inter'] text-[14px] text-[#A1A1AA] text-center">
            Join VidTube today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...register('fullname', { required: 'Full name is required' })}
                className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-[10px] text-[#F4F4F5] px-4 py-3 outline-none transition-all font-['Inter'] text-[14px]
                  ${errors.fullname ? 'border-[#F87171] focus:border-[#F87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[rgba(255,255,255,0.08)] focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'}
                `}
              />
              {errors.fullname && <p className="text-[#F87171] text-[12px] mt-1">{errors.fullname.message}</p>}
            </div>

            <div>
              <label className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  pattern: { value: /^[a-z0-9_]+$/, message: 'Lowercase, numbers, underscores only' }
                })}
                className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-[10px] text-[#F4F4F5] px-4 py-3 outline-none transition-all font-['Inter'] text-[14px]
                  ${errors.username ? 'border-[#F87171] focus:border-[#F87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[rgba(255,255,255,0.08)] focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'}
                `}
              />
              {errors.username && <p className="text-[#F87171] text-[12px] mt-1">{errors.username.message}</p>}
            </div>
          </div>

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
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' }
                })}
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

          {/* Image Uploads */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            {/* Avatar Upload */}
            <div>
              <label className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">Avatar</label>
              {avatarPreview ? (
                <div className="relative w-20 h-20 mx-auto">
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full rounded-full object-cover border-2 border-[#6366F1]" />
                  <button onClick={clearAvatar} className="absolute -top-1 -right-1 bg-[#111] border border-[#333] text-white rounded-full p-0.5 hover:bg-[#333]">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative border border-dashed border-[rgba(255,255,255,0.15)] rounded-[12px] p-5 text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    {...register('avatar', { required: 'Avatar is required' })}
                    onChange={(e) => {
                      register('avatar').onChange(e);
                      handleAvatarChange(e);
                    }}
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <ImagePlus size={32} className="text-[#52525B] mb-2" />
                    <p className="text-[#A1A1AA] text-[14px]">Upload avatar</p>
                    <p className="text-[#52525B] text-[12px]">Click to select image</p>
                  </div>
                </div>
              )}
              {errors.avatar && !avatarPreview && <p className="text-[#F87171] text-[12px] mt-1 text-center">{errors.avatar.message}</p>}
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">Cover image (optional)</label>
              {coverPreview ? (
                <div className="relative w-full h-20">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full rounded-[8px] object-cover border-2 border-[rgba(255,255,255,0.1)]" />
                  <button onClick={clearCover} className="absolute -top-2 -right-2 bg-[#111] border border-[#333] text-white rounded-full p-1 hover:bg-[#333]">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative border border-dashed border-[rgba(255,255,255,0.15)] rounded-[12px] p-4 text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    {...register('coverImage')}
                    onChange={(e) => {
                      register('coverImage').onChange(e);
                      handleCoverChange(e);
                    }}
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <p className="text-[#A1A1AA] text-[14px]">Cover image (optional)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full py-3 text-[15px] font-medium transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
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
          Already have an account?{' '}
          <Link to="/login" className="text-[#6366F1] hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
