import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Trash2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import SubscribeButton from '../components/SubscribeButton';
import LikeButton from '../components/LikeButton';

// Utils
const formatViews = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v;
};

const formatDuration = (s) => {
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

function Watch() {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  // Video State
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Like State
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Channel State
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // UI States
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentInputFocused, setCommentInputFocused] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // Data States
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo(0, 0);

        const res = await api.get(`/videos/${videoId}`);
        const videoData = res.data.data;
        
        if (!videoData) throw new Error("Video data not found");

        setVideo(videoData);
        setIsLiked(videoData.isLiked || false);
        setLikeCount(videoData.likeCount || 0);

        // Fetch channel subscription status
        if (videoData.ownerDetails?.username) {
          api.get(`/users/channel/${videoData.ownerDetails.username}`)
            .then((chRes) => setIsSubscribed(chRes.data.data.isSubscribed))
            .catch(() => {});
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  // Fetch Comments
  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setCommentsLoading(true);
      const res = await api.get(`/comments/video-comments/${videoId}?page=${pageNum}&limit=10`);
      const { comments: newComments, totalComments: total, totalPages } = res.data.data;
      
      setComments(prev => append ? [...prev, ...newComments] : newComments);
      setTotalComments(total);
      setCommentsTotalPages(totalPages);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    setCommentsPage(1);
    fetchComments(1);
  }, [videoId]);

  // Fetch Related Videos
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setRelatedLoading(true);
        const res = await api.get(`/videos?limit=10`);
        const videos = res.data.data.videos || [];
        setRelatedVideos(videos.filter(v => v._id !== videoId));
      } catch (err) {
        console.error('Failed to fetch related videos', err);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [videoId]);

  // Handlers
  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    // Optimistic Toggle
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      await api.post(`/likes/video/${videoId}`);
    } catch (err) {
      // Revert on failure
      setIsLiked(!newIsLiked);
      setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || postingComment) return;
    
    try {
      setPostingComment(true);
      const res = await api.post(`/comments/video/${videoId}`, { content: commentText });
      
      // Optimistic Addition
      const newComment = {
        _id: res.data.data._id || Date.now().toString(),
        content: commentText,
        createdAt: new Date().toISOString(),
        ownerDetails: {
          username: user.username,
          fullname: user.fullname,
          avatar: user.avatar
        }
      };
      
      setComments(prev => [newComment, ...prev]);
      setTotalComments(prev => prev + 1);
      setCommentText('');
      setCommentInputFocused(false);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const prevComments = [...comments];
    setComments(comments.filter(c => c._id !== commentId));
    setTotalComments(prev => prev - 1);

    try {
      await api.delete(`/comments/delete/${commentId}`);
    } catch (err) {
      setComments(prevComments);
      setTotalComments(prev => prev + 1);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-[24px]">
        <div className="w-full lg:w-[68%]">
          <div className="w-full aspect-video rounded-[16px] animate-shimmer bg-[rgba(255,255,255,0.05)]" />
          <div className="h-7 w-3/4 bg-[rgba(255,255,255,0.05)] animate-shimmer rounded mt-4" />
          <div className="h-4 w-1/4 bg-[rgba(255,255,255,0.05)] animate-shimmer rounded mt-2" />
          <div className="h-20 w-full bg-[rgba(255,255,255,0.04)] rounded-[12px] mt-4 animate-shimmer" />
        </div>
        <div className="w-full lg:w-[32%] space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-[160px] h-[90px] rounded-[8px] animate-shimmer bg-[rgba(255,255,255,0.05)]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-full bg-[rgba(255,255,255,0.05)] animate-shimmer rounded" />
                <div className="h-3 w-2/3 bg-[rgba(255,255,255,0.05)] animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 max-w-md backdrop-blur-xl">
          <p className="text-[#F87171] text-lg font-medium mb-6">{error || 'Video not found'}</p>
          <Link to="/" className="px-6 py-2 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-[24px]">
      
      {/* Left Column (68%) */}
      <div className="w-full lg:w-[68%]">
        
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-[#000] rounded-[16px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
          <video
            controls
            src={video.videoFile}
            poster={video.thumbnail}
            className="w-full h-full object-contain outline-none"
          />
        </div>

        {/* Title & Metadata */}
        <h1 className="font-['Outfit'] text-[20px] font-semibold text-[#F4F4F5] mt-4 leading-snug">
          {video.title}
        </h1>

        <div className="flex items-center justify-between mt-2 mb-4">
          <p className="text-[#A1A1AA] text-[14px]">
            {formatViews(video.views || 0)} views · {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Recently'}
          </p>

          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-110 ${
              isLiked 
                ? 'bg-[rgba(99,102,241,0.12)] border-[rgba(99,102,241,0.3)] text-[#6366F1]' 
                : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#52525B] hover:bg-[rgba(255,255,255,0.08)]'
            }`}
          >
            <ThumbsUp size={18} className={isLiked ? 'fill-[#6366F1]' : ''} />
            <span className="text-[14px] font-medium">{formatViews(likeCount)}</span>
          </button>
        </div>

        {/* Channel Row (Glass Card) */}
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.ownerDetails?.username}`}>
              {video.ownerDetails?.avatar ? (
                <img src={video.ownerDetails.avatar} alt={video.ownerDetails.fullname} className="w-[44px] h-[44px] rounded-full object-cover border border-[rgba(255,255,255,0.1)]" />
              ) : (
                <div className="w-[44px] h-[44px] rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#F4F4F5] font-semibold">
                  {video.ownerDetails?.fullname?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link to={`/channel/${video.ownerDetails?.username}`} className="text-[#F4F4F5] text-[15px] font-medium block hover:text-[#6366F1] transition-colors">
                {video.ownerDetails?.fullname}
              </Link>
              <p className="text-[#A1A1AA] text-[13px]">@{video.ownerDetails?.username}</p>
            </div>
          </div>
          <SubscribeButton 
            channelId={video.ownerDetails?._id} 
            initialSubscribed={isSubscribed} 
            onToggle={(status) => setIsSubscribed(status)}
          />
        </div>

        {/* Description (Glass Card) */}
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 mt-3 backdrop-blur-sm">
          <p className={`text-[#A1A1AA] text-[14px] leading-[1.7] font-['Inter'] whitespace-pre-wrap ${!showFullDesc && 'line-clamp-3'}`}>
            {video.description}
          </p>
          <button
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="text-[#6366F1] text-[14px] font-medium mt-2 hover:underline"
          >
            {showFullDesc ? 'Show less' : 'Show more'}
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-[24px]">
          <h2 className="font-['Outfit'] text-[16px] font-semibold text-[#F4F4F5] flex items-center gap-3 mb-6">
            Comments
            <span className="bg-[rgba(255,255,255,0.06)] px-2.5 py-0.5 rounded-full text-[#A1A1AA] text-[12px] font-['JetBrains_Mono']">
              {totalComments}
            </span>
          </h2>

          {/* Add Comment Input */}
          {isAuthenticated && (
            <div className="flex gap-4 mb-8">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-[32px] h-[32px] rounded-full object-cover shrink-0 border border-[rgba(255,255,255,0.05)]" />
              ) : (
                <div className="w-[32px] h-[32px] rounded-full bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[11px] font-semibold text-[#6366F1] shrink-0">
                  {(user.fullname || user.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setCommentInputFocused(true)}
                  placeholder="Add a comment..."
                  className={`w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-[#F4F4F5] px-4 py-3 outline-none transition-all resize-none font-['Inter'] text-[14px] placeholder-[#52525B] focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${
                    commentInputFocused ? 'min-h-[100px]' : 'min-h-[46px]'
                  }`}
                  rows={commentInputFocused ? 4 : 2}
                />
                {(commentInputFocused || commentText) && (
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      onClick={() => { setCommentText(''); setCommentInputFocused(false); }}
                      className="px-4 py-1.5 rounded-full text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.05)] text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePostComment}
                      disabled={!commentText.trim() || postingComment}
                      className="px-5 py-1.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                      {postingComment && <Loader2 size={14} className="animate-spin" />}
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comment List (Linear Style) */}
          <div className="space-y-0">
            {comments.map((comment, idx) => (
              <div key={comment._id}>
                <div className="flex gap-4 py-5 group">
                  <Link to={`/channel/${comment.ownerDetails?.username}`} className="shrink-0">
                    {comment.ownerDetails?.avatar ? (
                      <img src={comment.ownerDetails.avatar} alt={comment.ownerDetails?.username} className="w-[36px] h-[36px] rounded-full object-cover" />
                    ) : (
                      <div className="w-[36px] h-[36px] rounded-full bg-[rgba(99,102,241,0.2)] flex items-center justify-center text-[13px] font-semibold text-[#6366F1]">
                        {(comment.ownerDetails?.fullname || comment.ownerDetails?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F4F4F5] text-[13px] font-medium">@{comment.ownerDetails?.username}</span>
                      <span className="text-[#52525B] text-[12px]">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-[#A1A1AA] text-[14px] mt-1 leading-relaxed font-['Inter']">
                      {comment.content}
                    </p>
                    <div className="mt-2">
                      <LikeButton 
                        entityId={comment._id} 
                        entityType="comment" 
                        initialLiked={comment.isLiked} 
                        initialCount={comment.likeCount} 
                        size={14} 
                      />
                    </div>
                  </div>
                  {user?.username === comment.ownerDetails?.username && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-[#52525B] hover:text-[#F87171] transition-all self-start"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {idx !== comments.length - 1 && <div className="h-[1px] w-full bg-[rgba(255,255,255,0.04)]" />}
              </div>
            ))}
            
            {commentsPage < commentsTotalPages && (
              <button
                onClick={() => { const next = commentsPage + 1; setCommentsPage(next); fetchComments(next, true); }}
                className="w-full py-4 mt-2 text-[#6366F1] hover:bg-[rgba(99,102,241,0.05)] rounded-full text-sm font-medium transition-colors"
              >
                Load more comments
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (Up Next - 32%) */}
      <div className="w-full lg:w-[32%] lg:sticky lg:top-[80px] lg:self-start">
        <h3 className="font-['Outfit'] text-[15px] font-medium text-[#A1A1AA] mb-[12px]">Up next</h3>
        <div className="flex flex-col gap-3">
          {relatedLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 bg-[rgba(255,255,255,0.02)] p-2 rounded-[12px]">
                <div className="w-[160px] h-[90px] rounded-[8px] animate-shimmer bg-[rgba(255,255,255,0.05)] shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-full bg-[rgba(255,255,255,0.05)] animate-shimmer rounded" />
                  <div className="h-3 w-2/3 bg-[rgba(255,255,255,0.05)] animate-shimmer rounded" />
                </div>
              </div>
            ))
          ) : (
            relatedVideos.map((v) => (
              <Link
                key={v._id}
                to={`/watch/${v._id}`}
                className="flex gap-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] p-2 rounded-[12px] hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.06)] transition-all group"
              >
                <div className="relative shrink-0 w-[160px]">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-[90px] object-cover rounded-[8px]" />
                  <div className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.75)] backdrop-blur-[4px] rounded-[4px] px-2 py-0.5 text-[#F4F4F5] text-[10px] font-['JetBrains_Mono']">
                    {formatDuration(v.duration || 0)}
                  </div>
                </div>
                <div className="flex flex-col py-1 overflow-hidden">
                  <h4 className="text-[#F4F4F5] text-[13px] font-medium line-clamp-2 leading-snug group-hover:text-[#6366F1] transition-colors">{v.title}</h4>
                  <p className="text-[#A1A1AA] text-[12px] mt-1.5 truncate">{v.ownerDetails?.fullname}</p>
                  <p className="text-[#52525B] text-[12px] mt-0.5 truncate">{formatViews(v.views || 0)} views</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Watch;