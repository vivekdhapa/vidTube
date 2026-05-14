import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Pencil,
  Trash2,
  Check,
  X,
  Heart,
  Loader2,
  Users,
  AlertCircle,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import LikeButton from '../components/LikeButton';

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

/* ─────────────────────────────────────────────────
   Single Tweet Card
───────────────────────────────────────────────── */
const TweetCard = ({ tweet, currentUser, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState('');
  const textareaRef = useRef(null);

  const isOwner = tweet.ownerDetails?.username === currentUser?.username;

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
      <div className="flex items-start gap-3">
        <Link to={`/channel/${tweet.ownerDetails?.username}`}>
          <Avatar
            src={tweet.ownerDetails?.avatar}
            name={tweet.ownerDetails?.fullname || tweet.ownerDetails?.username}
            size={38}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <Link to={`/channel/${tweet.ownerDetails?.username}`} className="hover:underline">
                <span className="text-[#F4F4F5] text-[14px] font-medium">
                  {tweet.ownerDetails?.fullname || tweet.ownerDetails?.username}
                </span>
              </Link>
              <span className="text-[#52525B] text-[12px] ml-2">
                @{tweet.ownerDetails?.username}
              </span>
              <span className="text-[#52525B] text-[11px] ml-2">
                · {timeAgo(tweet.createdAt)}
              </span>
            </div>

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

          {!editing && (
            <div className="mt-3">
              <LikeButton 
                entityId={tweet._id} 
                entityType="tweet" 
                initialLiked={tweet.isLiked} 
                initialCount={tweet.likeCount}
                size={16}
              />
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

  return (
    <GlassCard className="p-5">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.fullname || user?.username} size={40} />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX))}
            placeholder="Share something with the community..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[#F4F4F5] text-[14px] placeholder-[#52525B] resize-none outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          {error && (
            <p className="text-[#F87171] text-[12px] mt-2">{error}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[12px] font-mono text-[#52525B]">{remaining}</span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-white transition-all disabled:opacity-40"
              style={{ background: '#6366F1' }}
            >
              {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Post
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────── */
const Community = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllTweets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tweets/all-tweets');
      setTweets(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTweets();
  }, []);

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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.2)]">
          <Globe size={20} className="text-[#6366F1]" />
        </div>
        <div>
          <h1 className="font-outfit text-[24px] font-semibold text-[#F4F4F5]">Community Feed</h1>
          <p className="text-[#52525B] text-[13px]">Explore what everyone is saying</p>
        </div>
      </div>

      {isAuthenticated && (
        <div className="mb-8">
          <ComposeBox user={user} onTweetCreated={handleTweetCreated} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#6366F1]" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-[#F87171]">{error}</div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              currentUser={user}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
          {tweets.length === 0 && (
            <div className="text-center py-10 text-[#52525B]">No tweets yet. Be the first!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
