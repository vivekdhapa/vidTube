import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { VideoOff, Loader2, Play, Upload, Users, MessageCircle, ThumbsUp, Zap } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import VideoCard from '../components/VideoCard';

/* ───────────────────────────────────────────────── *
 *  Hero / Landing Page for unauthenticated visitors *
 * ───────────────────────────────────────────────── */
function HeroLanding() {
  const features = [
    { icon: Play, title: 'Watch Videos', desc: 'Stream high-quality content from creators worldwide' },
    { icon: Upload, title: 'Upload & Share', desc: 'Publish your own videos with custom thumbnails' },
    { icon: Users, title: 'Build Community', desc: 'Subscribe to channels and follow your favorites' },
    { icon: MessageCircle, title: 'Engage', desc: 'Comment, like, and interact with the community' },
    { icon: ThumbsUp, title: 'Curate', desc: 'Build your collection of liked videos' },
    { icon: Zap, title: 'Discover', desc: 'Explore trending and latest content across the platform' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[rgba(99,102,241,0.08)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[rgba(99,102,241,0.05)] rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto mb-16">
        {/* Logo mark */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] mb-8 backdrop-blur-md">
          <Play size={36} className="text-[#6366F1] fill-[#6366F1]" />
        </div>

        <h1 className="font-['Outfit'] text-5xl md:text-6xl font-semibold text-[#F4F4F5] leading-tight tracking-tight mb-4">
          Your Stage.{' '}
          <span className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] bg-clip-text text-transparent">
            Your Story.
          </span>
        </h1>

        <p className="text-[#A1A1AA] text-lg md:text-xl font-['Inter'] max-w-lg mx-auto mb-10 leading-relaxed">
          A modern video platform where creators share, connect, and inspire. 
          Sign in to start exploring.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.97]"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] text-sm font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {features.map(({ icon: Icon, title, desc }, idx) => (
          <div
            key={title}
            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 backdrop-blur-md hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 group"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] flex items-center justify-center mb-3 group-hover:bg-[rgba(99,102,241,0.15)] transition-colors">
              <Icon size={20} className="text-[#6366F1]" />
            </div>
            <h3 className="text-[#F4F4F5] text-[15px] font-semibold font-['Outfit'] mb-1">{title}</h3>
            <p className="text-[#52525B] text-[13px] font-['Inter'] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom tagline */}
      <p className="relative z-10 mt-12 text-[#52525B] text-xs font-['Inter'] tracking-wide">
        Free & open-source · Built with React & Node.js
      </p>
    </div>
  );
}

/* ───────────────────────── *
 *  Authenticated Home Feed  *
 * ───────────────────────── */
function Home() {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';

  useEffect(() => {
    console.log('ENV VAR:', import.meta.env.VITE_API_BASE_URL)
    console.log('All env vars:', import.meta.env)
  }, [])

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' or 'views'
  
  const fetchVideos = async (pageNum = 1, sortField = 'createdAt', isAppend = false, query = '') => {
    console.log('fetchVideos called');
    console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : '';
      const res = await api.get(`/videos?page=${pageNum}&limit=12&sortBy=${sortField}&sortType=desc${queryParam}`);
      console.log('Videos response:', res.data);
      
      const fetchedVideos = res.data?.data?.videos || [];
      const total = res.data?.data?.totalPages || 1;
      
      if (isAppend) {
        setVideos((prev) => [...prev, ...fetchedVideos]);
      } else {
        setVideos(fetchedVideos);
      }
      setTotalPages(total);
      
    } catch (err) {
      console.log('Videos error:', err);
      console.log('Error message:', err.message);
      console.log('Error response:', err.response);
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Server is waking up, please wait a moment and try again...');
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch if not logged in
    setPage(1);
    fetchVideos(1, sortBy, false, searchQuery);
  }, [sortBy, searchQuery, isAuthenticated]);


  // Show hero landing for unauthenticated visitors
  if (!isAuthenticated) {
    return <HeroLanding />;
  }

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage, sortBy, true, searchQuery);
    }
  };

  // Error State
  if (error && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 text-center max-w-md w-full backdrop-blur-md">
          <p className="text-[#F87171] mb-6">{error}</p>
          <button
            onClick={() => fetchVideos(1, sortBy, false)}
            className="px-6 py-2 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search result heading */}
      {searchQuery && (
        <div className="mb-4">
          <p className="text-[#A1A1AA] text-sm">
            Search results for{' '}
            <span className="text-[#F4F4F5] font-medium">"{searchQuery}"</span>
          </p>
        </div>
      )}

      {/* Filter/Sort Bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setSortBy('createdAt')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            sortBy === 'createdAt'
              ? 'bg-[#6366F1] text-white'
              : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => setSortBy('views')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            sortBy === 'views'
              ? 'bg-[#6366F1] text-white'
              : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          Most Viewed
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-[rgba(255,255,255,0.04)] rounded-[16px] overflow-hidden">
              <div className="aspect-video w-full animate-shimmer" />
              <div className="p-3">
                <div className="h-4 rounded animate-shimmer w-3/4 mb-2" />
                <div className="h-4 rounded animate-shimmer w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full animate-shimmer" />
                    <div className="h-3 rounded animate-shimmer w-16" />
                  </div>
                  <div className="h-3 rounded animate-shimmer w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {loadingMore && <Loader2 size={16} className="animate-spin" />}
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-full mb-4">
            <VideoOff size={48} className="text-[#52525B]" />
          </div>
          <h3 className="text-lg font-medium text-[#F4F4F5] mb-2">No videos found</h3>
          <p className="text-[#A1A1AA] text-sm">Check back later for new content.</p>
        </div>
      )}
    </div>
  );
}

export default Home;
