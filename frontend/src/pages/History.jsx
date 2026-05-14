import { useState, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';

const formatDuration = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const formatViews = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v;
};

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/history');
      setHistory(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch watch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <Clock size={30} className="text-[#6366F1]" />
        <div>
          <h1 className="text-[28px] font-semibold text-[#F4F4F5] font-['Outfit'] tracking-tight">Watch History</h1>
          <p className="text-[#A1A1AA] text-[14px] mt-0.5">{history.length} videos watched</p>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
           <p className="text-[#F87171] bg-[rgba(248,113,113,0.1)] px-4 py-2 rounded-lg border border-[rgba(248,113,113,0.2)]">
             {error}
           </p>
        </div>
      ) : history.length > 0 ? (
        <div className="flex flex-col gap-2">
          {history.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              className="flex flex-col sm:flex-row gap-4 p-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] transition-all duration-300 hover:bg-[rgba(255,255,255,0.07)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.12)] group backdrop-blur-sm mb-2 last:mb-0"
            >
              {/* Thumbnail Left */}
              <div className="relative flex-shrink-0 w-full sm:w-[240px] aspect-video sm:h-[135px] rounded-[10px] overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 bg-[rgba(0,0,0,0.75)] backdrop-blur-[4px] rounded-[6px] px-2 py-0.5 text-[#F4F4F5] text-[12px] font-['JetBrains_Mono']">
                  {formatDuration(video.duration || 0)}
                </div>
              </div>

              {/* Details Right */}
              <div className="flex flex-col py-0.5 flex-1 min-w-0">
                <h3 className="text-[#F4F4F5] font-medium text-[16px] line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                
                <p className="text-[#A1A1AA] text-[13px] font-medium mt-[6px] truncate">
                  {video.ownerDetails?.fullname || 'Unknown Channel'}
                </p>

                <div className="text-[#52525B] text-[12px] mt-[4px] flex items-center gap-1.5">
                  <span>{formatViews(video.views || 0)} views</span>
                  <span className="opacity-30">·</span>
                  <span>{video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Recently'}</span>
                </div>
                
                {video.description && (
                  <p className="text-[#52525B] text-[13px] line-clamp-2 mt-3 leading-relaxed hidden md:block opacity-60">
                    {video.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[24px] backdrop-blur-sm">
          <Clock size={48} className="text-[#52525B] mb-4 opacity-50" />
          <h3 className="text-[#A1A1AA] text-lg font-medium mb-2">Your watch history is empty</h3>
          <p className="text-[#52525B] text-sm mb-8 max-w-xs">Videos you've watched will be listed here for you to find them again easily.</p>
          <Link
            to="/"
            className="px-8 py-3 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] transition-all text-sm font-medium hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5"
          >
            Start watching
          </Link>
        </div>
      )}
    </div>
  );
}

export default History;
