import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VideoOff, Loader2 } from 'lucide-react';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' or 'views'
  
  const fetchVideos = async (pageNum = 1, sortField = 'createdAt', isAppend = false, query = '') => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : '';
      const res = await api.get(`/videos?page=${pageNum}&limit=12&sortBy=${sortField}&sortType=desc${queryParam}`);
      
      const fetchedVideos = res.data?.data?.videos || [];
      const total = res.data?.data?.totalPages || 1;
      
      if (isAppend) {
        setVideos((prev) => [...prev, ...fetchedVideos]);
      } else {
        setVideos(fetchedVideos);
      }
      setTotalPages(total);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchVideos(1, sortBy, false, searchQuery);
  }, [sortBy, searchQuery]);


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
