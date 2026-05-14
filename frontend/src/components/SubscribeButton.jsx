import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

function SubscribeButton({ channelId, initialSubscribed = false, onToggle }) {
  const { isAuthenticated } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  // Sync internal state when the parent's async fetch resolves
  useEffect(() => {
    setIsSubscribed(initialSubscribed);
  }, [initialSubscribed]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could trigger a login modal or redirect
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/subscription/subscribe/${channelId}`);
      const newStatus = res.data.data.isSubscribed;
      setIsSubscribed(newStatus);
      if (onToggle) onToggle(newStatus);
    } catch (err) {
      console.error('Failed to toggle subscription', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-6 py-2 rounded-full text-[14px] font-semibold transition-all flex items-center gap-2 ${
        isSubscribed
          ? 'bg-transparent border border-[rgba(255,255,255,0.1)] text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.05)]'
          : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
      } ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isSubscribed ? (
        'Subscribed'
      ) : (
        'Subscribe'
      )}
    </button>
  );
}

export default SubscribeButton;
