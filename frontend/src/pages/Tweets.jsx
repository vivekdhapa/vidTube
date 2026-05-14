import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Pencil,
  Trash2,
  Check,
  X,
  Heart,
  Loader2,
  Feather,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

/* ─────────────────────────────────────────────────
   Helpers / Shared micro-components
───────────────────────────────────────────────── */
const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

const Avatar = ({ src, name, size = 36 }) => {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return src ? (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover shrink-0"
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        background: 'rgba(99,102,241,0.25)',
        border: '1px solid rgba(99,102,241,0.3)',
        fontSize: size * 0.35,
      }}
      className="rounded-full flex items-center justify-center font-semibold text-[#6366F1] shrink-0 font-outfit"
    >
      {initials}
    </div>
  );
};

const GlassCard = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─────────────────────────────────────────────────
   Like Button (tweets)
───────────────────────────────────────────────── */
const LikeBtn = ({ tweetId }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [anim, setAnim] = useState(false);

  const toggle = async () => {
    try {
      setAnim(true);
      setTimeout(() => setAnim(false), 300);
      const res = await api.post(`/likes/tweet/${tweetId}`);
      const msg = res.data?.message || '';
      if (msg.toLowerCase().includes('unlike') || msg.toLowerCase().includes('removed')) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch {
      // silently fail
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-[12px] transition-all"
      style={{ color: liked ? '#6366F1' : '#52525B' }}
    >
      <Heart
        size={15}
        fill={liked ? '#6366F1' : 'none'}
        style={{
          transform: anim ? 'scale(1.35)' : 'scale(1)',
          transition: 'transform 0.15s ease',
          color: liked ? '#6366F1' : '#52525B',
        }}
      />
      {count > 0 && <span className="font-mono">{count}</span>}
    </button>
  );
};

/* ─────────────────────────────────────────────────
   Single Tweet Card
───────────────────────────────────────────────── */
const TweetCard = ({ tweet, currentUserId, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState('');
  const textareaRef = useRef(null);

  const isOwner = tweet.ownerDetails?.username === currentUserId || // compare username
    String(tweet.owner) === currentUserId; // or raw owner id

  const startEdit = () => {
    setEditing(true);
    setEditContent(tweet.content);
    setEditError('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editContent.trim()) {
      setEditError('Tweet cannot be empty');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      const res = await api.patch(`/tweets/update/${tweet._id}`, {
        content: editContent.trim(),
      });
      onUpdate(tweet._id, res.data.data?.content || editContent.trim());
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update tweet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this tweet?')) return;
    setDeleting(true);
    try {
      await api.delete(`/tweets/delete/${tweet._id}`);
      onDelete(tweet._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <GlassCard className="p-4 transition-all duration-200 hover:border-[rgba(255,255,255,0.12)]">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Avatar
          src={tweet.ownerDetails?.avatar}
          name={tweet.ownerDetails?.fullname || tweet.ownerDetails?.username}
          size={38}
        />

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-[#F4F4F5] text-[14px] font-medium">
                {tweet.ownerDetails?.fullname || tweet.ownerDetails?.username}
              </span>
              <span className="text-[#52525B] text-[12px] ml-2">
                @{tweet.ownerDetails?.username}
              </span>
              <span className="text-[#52525B] text-[11px] ml-2">
                · {timeAgo(tweet.createdAt)}
              </span>
            </div>

            {/* Owner actions */}
            {isOwner && !editing && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={startEdit}
                  title="Edit"
                  className="p-1.5 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/5 transition-all"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete"
                  className="p-1.5 rounded-lg text-[#52525B] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.08)] transition-all"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Content / Edit area */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-[#F4F4F5] text-sm resize-none outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: editError
                    ? '1px solid rgba(248,113,113,0.5)'
                    : '1px solid rgba(99,102,241,0.4)',
                  boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                }}
              />
              {editError && (
                <p className="text-[#F87171] text-[12px]">{editError}</p>
              )}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] text-[#A1A1AA] hover:text-[#F4F4F5] transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-white transition-all"
                  style={{ background: '#6366F1' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#4F46E5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#6366F1')}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[#F4F4F5] text-[14px] leading-relaxed whitespace-pre-wrap">
              {tweet.content}
            </p>
          )}

          {/* Footer */}
          {!editing && (
            <div className="mt-3">
              <LikeBtn tweetId={tweet._id} />
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────────
   Compose Box
───────────────────────────────────────────────── */
const ComposeBox = ({ user, onTweetCreated }) => {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const MAX = 280;
  const remaining = MAX - content.length;

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError('');
    try {
      const res = await api.post('/tweets/create-tweet', { content: content.trim() });
      // Reconstruct the tweet shape with ownerDetails (backend returns minimal object)
      const newTweet = {
        ...res.data.data,
        ownerDetails: {
          username: user.username,
          fullname: user.fullname,
          avatar: user.avatar,
        },
      };
      onTweetCreated(newTweet);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post tweet');
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
  };

  return (
    <GlassCard className="p-5">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.fullname || user?.username} size={40} />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX))}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[#F4F4F5] text-[14px] placeholder-[#52525B] resize-none outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {error && (
            <div
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-[#F87171] text-[13px]"
              style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.15)',
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span
              className="text-[12px] font-mono"
              style={{ color: remaining < 20 ? '#F87171' : '#52525B' }}
            >
              {remaining}
            </span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#6366F1' }}
              onMouseEnter={(e) => !posting && content.trim() && (e.currentTarget.style.background = '#4F46E5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#6366F1')}
            >
              {posting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Post
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────── */
const TweetSkeleton = () => (
  <GlassCard className="p-4">
    <div className="flex gap-3">
      <div
        className="w-10 h-10 rounded-full shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite' }}
      />
      <div className="flex-1 space-y-2">
        <div
          className="h-3 w-32 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
        <div
          className="h-3 w-full rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
        <div
          className="h-3 w-3/4 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
      </div>
    </div>
  </GlassCard>
);

/* ─────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────── */
const Tweets = () => {
  const { user } = useAuthStore();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.username) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/tweets/user-tweets/${user.username}`);
        setTweets(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tweets');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.username]);

  const handleTweetCreated = (newTweet) => {
    setTweets((prev) => [newTweet, ...prev]);
  };

  const handleDelete = (id) => {
    setTweets((prev) => prev.filter((t) => t._id !== id));
  };

  const handleUpdate = (id, newContent) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === id ? { ...t, content: newContent } : t))
    );
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '640px' }}>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Feather size={20} className="text-[#6366F1]" />
        </div>
        <div>
          <h1 className="font-outfit text-[24px] font-semibold text-[#F4F4F5] leading-tight">
            My Tweets
          </h1>
          <p className="text-[#52525B] text-[13px]">Share what's on your mind</p>
        </div>
      </div>

      {/* Compose */}
      <div className="mb-5">
        <ComposeBox user={user} onTweetCreated={handleTweetCreated} />
      </div>

      {/* Divider */}
      <div
        className="mb-5"
        style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
      />

      {/* Tweet feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TweetSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <GlassCard className="p-6 text-center">
          <AlertCircle size={32} className="text-[#F87171] mx-auto mb-2" />
          <p className="text-[#F87171] text-sm">{error}</p>
        </GlassCard>
      ) : tweets.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <Feather size={36} className="text-[#52525B] mx-auto mb-3" />
          <p className="text-[#A1A1AA] text-sm font-medium mb-1">No tweets yet</p>
          <p className="text-[#52525B] text-[13px]">
            Write your first tweet above to get started.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              currentUserId={user?.username}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%,100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Tweets;
