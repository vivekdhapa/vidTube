import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Check, AlertCircle, Loader2, Camera } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

/* ─── tiny helpers ─── */
const GlassCard = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl p-7 ${className}`}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <>
    <h2 className="font-outfit text-lg font-semibold text-[#F4F4F5] mb-3">{children}</h2>
    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '24px' }} />
  </>
);

const SuccessMsg = ({ msg }) =>
  msg ? (
    <div
      className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] text-[#34D399] mt-4"
      style={{
        background: 'rgba(52,211,153,0.08)',
        border: '1px solid rgba(52,211,153,0.15)',
      }}
    >
      <Check size={15} />
      {msg}
    </div>
  ) : null;

const ErrorMsg = ({ msg }) =>
  msg ? (
    <div
      className="flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-[13px] text-[#F87171] mt-4"
      style={{
        background: 'rgba(248,113,113,0.08)',
        border: '1px solid rgba(248,113,113,0.15)',
      }}
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      {msg}
    </div>
  ) : null;

const GlassInput = ({ label, id, error, rightSlot, ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="block text-[#A1A1AA] text-[13px] mb-1.5 font-medium">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        id={id}
        className="w-full rounded-[10px] px-4 py-3 text-[#F4F4F5] text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: error ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.08)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid #6366F1';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = error
            ? '1px solid rgba(248,113,113,0.5)'
            : '1px solid rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
    {error && <p className="text-[#F87171] text-[12px] mt-1">{error}</p>}
  </div>
);

const PrimaryBtn = ({ children, loading, className = '', ...props }) => (
  <button
    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all ${className}`}
    style={{ background: '#6366F1' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = '#4F46E5')}
    onMouseLeave={(e) => (e.currentTarget.style.background = '#6366F1')}
    disabled={loading}
    {...props}
  >
    {loading && <Loader2 size={15} className="animate-spin" />}
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    className="rounded-full px-4 py-2 text-sm font-medium text-[#F4F4F5] transition-all"
    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    {children}
  </button>
);

/* ═══════════════════════════════════════════════════════
   CARD 1 — Profile Details
═══════════════════════════════════════════════════════ */
const ProfileDetailsCard = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { fullname: user?.fullname || '', email: user?.email || '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.patch('/users/update-account', { fullname: data.fullname, email: data.email });
      // refresh user from server
      const me = await api.get('/users/current-user');
      setUser(me.data.data);
      setSuccess('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <SectionTitle>Profile Details</SectionTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <GlassInput
          id="fullname"
          label="Full Name"
          placeholder="Your display name"
          error={errors.fullname?.message}
          {...register('fullname', { required: 'Full name is required' })}
        />
        <GlassInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
          })}
        />
        <div className="flex justify-end pt-1">
          <PrimaryBtn loading={loading} type="submit">
            Save Changes
          </PrimaryBtn>
        </div>
        <SuccessMsg msg={success} />
        <ErrorMsg msg={error} />
      </form>
    </GlassCard>
  );
};

/* ═══════════════════════════════════════════════════════
   CARD 2 — Change Password
═══════════════════════════════════════════════════════ */
const ChangePasswordCard = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const EyeToggle = ({ field }) => (
    <button
      type="button"
      onClick={() => toggle(field)}
      className="text-[#52525B] hover:text-[#A1A1AA] transition-colors"
    >
      {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/users/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setSuccess('Password updated successfully');
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <SectionTitle>Change Password</SectionTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <GlassInput
          id="oldPassword"
          label="Current Password"
          type={show.old ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.oldPassword?.message}
          rightSlot={<EyeToggle field="old" />}
          {...register('oldPassword', { required: 'Current password is required' })}
        />
        <GlassInput
          id="newPassword"
          label="New Password"
          type={show.new ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.newPassword?.message}
          rightSlot={<EyeToggle field="new" />}
          {...register('newPassword', {
            required: 'New password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />
        <GlassInput
          id="confirmPassword"
          label="Confirm New Password"
          type={show.confirm ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          rightSlot={<EyeToggle field="confirm" />}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (val) => val === newPassword || 'Passwords do not match',
          })}
        />
        <div className="flex justify-end pt-1">
          <PrimaryBtn loading={loading} type="submit">
            Update Password
          </PrimaryBtn>
        </div>
        <SuccessMsg msg={success} />
        <ErrorMsg msg={error} />
      </form>
    </GlassCard>
  );
};

/* ═══════════════════════════════════════════════════════
   CARD 3 — Avatar & Cover Image
═══════════════════════════════════════════════════════ */
const ProfileMediaCard = () => {
  const { user, setUser } = useAuthStore();

  /* avatar state */
  const avatarInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  /* cover state */
  const coverInputRef = useRef(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverSuccess, setCoverSuccess] = useState('');
  const [coverError, setCoverError] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarSuccess('');
    setAvatarError('');
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverSuccess('');
    setCoverError('');
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setAvatarSuccess('');
    setAvatarError('');
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await api.patch('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data);
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarSuccess('Avatar updated successfully');
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const saveCover = async () => {
    if (!coverFile) return;
    setCoverLoading(true);
    setCoverSuccess('');
    setCoverError('');
    try {
      const fd = new FormData();
      fd.append('coverImage', coverFile);
      const res = await api.patch('/users/cover-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data);
      setCoverPreview(null);
      setCoverFile(null);
      setCoverSuccess('Cover image updated successfully');
    } catch (err) {
      setCoverError(err.response?.data?.message || 'Failed to update cover image');
    } finally {
      setCoverLoading(false);
    }
  };

  /* derive initials for avatar fallback */
  const initials = (user?.fullname || user?.username || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarSrc = avatarPreview || user?.avatar;
  const coverSrc = coverPreview || user?.coverImage;

  return (
    <GlassCard>
      <SectionTitle>Profile Media</SectionTitle>

      {/* ── Avatar ── */}
      <div className="flex items-center gap-6">
        {/* Avatar preview */}
        <div className="shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: '2px solid rgba(255,255,255,0.1)' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-semibold font-outfit text-[#F4F4F5]"
              style={{
                background: 'rgba(99,102,241,0.2)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0">
          <p className="text-[#F4F4F5] text-sm font-medium mb-0.5">Profile Photo</p>
          <p className="text-[#52525B] text-[12px] mb-3">JPG, PNG up to 5MB</p>
          <div className="flex items-center gap-3 flex-wrap">
            <GhostBtn onClick={() => avatarInputRef.current?.click()}>Change Avatar</GhostBtn>
            {avatarFile && (
              <PrimaryBtn
                loading={avatarLoading}
                onClick={saveAvatar}
                className="text-sm px-4 py-2"
              >
                Save Avatar
              </PrimaryBtn>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <SuccessMsg msg={avatarSuccess} />
          <ErrorMsg msg={avatarError} />
        </div>
      </div>

      {/* Divider */}
      <div
        className="my-6"
        style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
      />

      {/* ── Cover Image ── */}
      <div>
        <p className="text-[#F4F4F5] text-sm font-medium mb-3">Channel Banner</p>

        {/* Cover preview */}
        {coverSrc ? (
          <img
            src={coverSrc}
            alt="Cover"
            className="w-full object-cover rounded-xl mb-4"
            style={{ height: '120px' }}
          />
        ) : (
          <div
            className="w-full rounded-xl mb-4"
            style={{
              height: '120px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(16,16,20,0.8) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <GhostBtn onClick={() => coverInputRef.current?.click()}>Change Cover Image</GhostBtn>
          {coverFile && (
            <PrimaryBtn
              loading={coverLoading}
              onClick={saveCover}
              className="text-sm px-4 py-2"
            >
              Save Cover
            </PrimaryBtn>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        <SuccessMsg msg={coverSuccess} />
        <ErrorMsg msg={coverError} />
      </div>
    </GlassCard>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
const Settings = () => {
  return (
    <div
      className="mx-auto px-6"
      style={{ maxWidth: '680px', paddingTop: '40px', paddingBottom: '60px' }}
    >
      <h1 className="font-outfit text-[28px] font-semibold text-[#F4F4F5] mb-8">Settings</h1>

      <div className="flex flex-col gap-5">
        <ProfileDetailsCard />
        <ChangePasswordCard />
        <ProfileMediaCard />
      </div>
    </div>
  );
};

export default Settings;
