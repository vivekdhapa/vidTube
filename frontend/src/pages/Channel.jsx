import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VideoOff, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import VideoCard from '../components/VideoCard';
import SubscribeButton from '../components/SubscribeButton';

function Channel() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const isOwnChannel = user?.username === username;

  // Channel State
  const [channel, setChannel] = useState(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Tabs State
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'tweets'

  // Videos State
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  // Tweets State
  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [tweetText, setTweetText] = useState('');
  const [postingTweet, setPostingTweet] = useState(false);

  // Fetch Channel Profile
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setChannelLoading(true);
        setChannelError(null);
        const res = await api.get(`/users/channel/${username}`);
        setChannel(res.data.data);
        setIsSubscribed(res.data.data.isSubscribed);
      } catch (err) {
        setChannelError(err.response?.data?.message || 'Channel not found');
      } finally {
        setChannelLoading(false);
      }
    };
    fetchChannel();
  }, [username]);

  // Fetch Tab Content
  useEffect(() => {
    if (activeTab === 'videos') {
      const fetchVideos = async () => {
        try {
          setVideosLoading(true);
          const res = await api.get(`/videos/${username}`);
          setVideos(res.data.data || []);
        } catch (err) {
          console.error('Failed to fetch videos', err);
          setVideos([]);
        } finally {
          setVideosLoading(false);
        }
      };
      fetchVideos();
    } else if (activeTab === 'tweets') {
      const fetchTweets = async () => {
        try {
          setTweetsLoading(true);
          const res = await api.get(`/tweets/user-tweets/${username}`);
          setTweets(res.data.data || []);
        } catch (err) {
          console.error('Failed to fetch tweets', err);
          setTweets([]);
        } finally {
          setTweetsLoading(false);
        }
      };
      fetchTweets();
    }
  }, [username, activeTab]);

  // Handlers
  const handlePostTweet = async (e) => {
    e.preventDefault();
    if (!tweetText.trim()) return;
    try {
      setPostingTweet(true);
      const res = await api.post('/tweets/create-tweet', { content: tweetText });
      
      // Optimistic insert
      const newTweet = {
        _id: res.data.data?._id || Date.now().toString(),
        content: tweetText,
        createdAt: new Date().toISOString(),
        ownerDetails: {
          username: user.username,
          fullname: user.fullname,
          avatar: user.avatar
        }
      };
      setTweets(prev => [newTweet, ...prev]);
      setTweetText('');
    } catch (err) {
      console.error('Failed to post tweet', err);
    } finally {
      setPostingTweet(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    const previousTweets = [...tweets];
    setTweets(tweets.filter(t => t._id !== tweetId));
    try {
      await api.delete(`/tweets/delete/${tweetId}`);
    } catch (err) {
      setTweets(previousTweets);
      console.error('Failed to delete tweet', err);
    }
  };

  if (channelLoading) {
    return (
      <div className="w-full bg-[#080808] min-h-screen">
        <div className="w-full h-[220px] animate-shimmer" />
        <div className="px-6 -mt-10 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-[88px] h-[88px] rounded-full animate-shimmer border-[3px] border-[#080808]" />
            <div className="mb-2">
              <div className="h-6 w-48 rounded animate-shimmer mb-2" />
              <div className="h-4 w-24 rounded animate-shimmer mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full animate-shimmer" />
                <div className="h-6 w-24 rounded-full animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (channelError || !channel) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#080808] p-6">
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 text-center max-w-md w-full">
          <p className="text-[#F87171] mb-6">{channelError || 'Channel not found'}</p>
          <Link to="/" className="px-6 py-2 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#080808] min-h-screen pb-12">
      
      {/* Cover Section */}
      <div className="w-full h-[220px] relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover absolute inset-0 z-0" />
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#080808] via-[rgba(8,8,8,0.5)] to-transparent" />
      </div>

      {/* Channel Info Row */}
      <div className="px-6 -mt-10 relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-end gap-5">
          {channel.avatar ? (
            <img src={channel.avatar} alt={channel.fullname} className="w-[88px] h-[88px] rounded-full object-cover border-[3px] border-[#080808] bg-[#111]" />
          ) : (
            <div className="w-[88px] h-[88px] rounded-full border-[3px] border-[#080808] bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-3xl font-semibold text-white">
              {channel.fullname?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="mb-1">
            <h1 className="font-['Outfit'] text-[24px] font-semibold text-[#F4F4F5] leading-tight">
              {channel.fullname}
            </h1>
            <p className="text-[#A1A1AA] text-[14px] mt-0.5">
              @{channel.username}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1 text-[13px] text-[#A1A1AA] font-medium font-['Inter']">
                {channel.subscribersCount || 0} subscribers
              </span>
              <span className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1 text-[13px] text-[#A1A1AA] font-medium font-['Inter']">
                {channel.channelsSubscribedToCount || 0} subscriptions
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-1 md:self-center md:pb-0 md:mt-10">
          {isOwnChannel ? (
            <>
              <Link to="/settings" className="px-5 py-2 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] text-[14px] font-medium transition-all">
                Edit Profile
              </Link>
              <Link to="/upload" className="px-5 py-2 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[14px] font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                Upload
              </Link>
            </>
          ) : (
            <SubscribeButton 
              channelId={channel._id} 
              initialSubscribed={isSubscribed} 
              onToggle={(status) => setIsSubscribed(status)}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 max-w-7xl mx-auto px-6 border-b border-[rgba(255,255,255,0.06)] flex gap-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-5 py-3 text-[14px] font-medium transition-colors border-b-2 font-['Inter'] ${
            activeTab === 'videos' ? 'border-[#6366F1] text-[#F4F4F5]' : 'border-transparent text-[#A1A1AA] hover:text-[#F4F4F5]'
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab('tweets')}
          className={`px-5 py-3 text-[14px] font-medium transition-colors border-b-2 font-['Inter'] ${
            activeTab === 'tweets' ? 'border-[#6366F1] text-[#F4F4F5]' : 'border-transparent text-[#A1A1AA] hover:text-[#F4F4F5]'
          }`}
        >
          Tweets
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        
        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div>
            {videosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="w-full aspect-video rounded-[16px] animate-shimmer" />
                    <div className="flex gap-3 px-1">
                      <div className="w-9 h-9 rounded-full animate-shimmer shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 w-full rounded animate-shimmer mb-2" />
                        <div className="h-3 w-2/3 rounded animate-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
                <VideoOff size={48} className="text-[#52525B] mb-4" />
                <p className="text-[16px] font-medium text-[#F4F4F5]">No videos yet</p>
                <p className="text-[14px] mt-1">This channel hasn't uploaded any videos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {videos.map(video => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TWEETS TAB */}
        {activeTab === 'tweets' && (
          <div className="max-w-2xl">
            {/* Tweet Composer */}
            {isOwnChannel && (
              <form onSubmit={handlePostTweet} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 mb-6 backdrop-blur-sm">
                <div className="flex gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[rgba(99,102,241,0.2)] flex items-center justify-center text-sm font-semibold text-[#6366F1] shrink-0">
                      {(user.fullname || user.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <textarea
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full bg-transparent text-[#F4F4F5] text-[15px] font-['Inter'] resize-none outline-none placeholder-[#52525B] min-h-[60px]"
                    />
                    <div className="flex justify-end mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                      <button
                        type="submit"
                        disabled={!tweetText.trim() || postingTweet}
                        className="px-5 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full text-[14px] font-medium disabled:opacity-50 disabled:hover:bg-[#6366F1] flex items-center gap-2 transition-colors"
                      >
                        {postingTweet && <Loader2 size={14} className="animate-spin" />}
                        Tweet
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Tweets List */}
            {tweetsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-[12px] p-4 flex gap-3">
                    <div className="w-9 h-9 rounded-full animate-shimmer shrink-0" />
                    <div className="flex-1 pt-1">
                      <div className="h-3 w-1/3 rounded animate-shimmer mb-3" />
                      <div className="h-3 w-full rounded animate-shimmer mb-2" />
                      <div className="h-3 w-2/3 rounded animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tweets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#A1A1AA] border border-dashed border-[rgba(255,255,255,0.08)] rounded-[16px]">
                <p className="text-[15px]">No tweets yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tweets.map(tweet => (
                  <div key={tweet._id} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 flex gap-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors group">
                    {tweet.ownerDetails?.avatar ? (
                      <img src={tweet.ownerDetails.avatar} alt={tweet.ownerDetails?.username} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[rgba(99,102,241,0.2)] flex items-center justify-center text-sm font-semibold text-[#6366F1] shrink-0">
                        {(tweet.ownerDetails?.fullname || tweet.ownerDetails?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#F4F4F5] text-[14px] font-medium">{tweet.ownerDetails?.fullname}</span>
                        <span className="text-[#A1A1AA] text-[13px]">@{tweet.ownerDetails?.username}</span>
                        <span className="text-[#52525B]">·</span>
                        <span className="text-[#52525B] text-[12px]">{formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-[#F4F4F5] text-[15px] mt-1.5 whitespace-pre-wrap leading-relaxed font-['Inter']">
                        {tweet.content}
                      </p>
                    </div>
                    {user?.username === tweet.ownerDetails?.username && (
                      <button
                        onClick={() => handleDeleteTweet(tweet._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[#52525B] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] rounded-full transition-all self-start"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Channel;
