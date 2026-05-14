import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/likes/videos');
      const likedItems = res.data?.data || [];
      // Backend returns video details in videoDetails field for liked videos
      const extractedVideos = likedItems.map(item => item.videoDetails).filter(Boolean);
      setVideos(extractedVideos);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch liked videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(99,102,241,0.1)] flex items-center justify-center border border-[rgba(99,102,241,0.2)]">
          <Heart size={30} className="text-[#6366F1] fill-[#6366F1]" />
        </div>
        <div>
          <h1 className="text-[28px] font-semibold text-[#F4F4F5] font-['Outfit'] tracking-tight">Liked Videos</h1>
          <p className="text-[#A1A1AA] text-[14px] mt-0.5">{videos.length} liked videos</p>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
           <p className="text-[#F87171] bg-[rgba(248,113,113,0.1)] px-4 py-2 rounded-lg border border-[rgba(248,113,113,0.2)]">
             {error}
           </p>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[24px] backdrop-blur-sm">
          <Heart size={48} className="text-[#52525B] mb-4 opacity-50" />
          <h3 className="text-[#A1A1AA] text-lg font-medium mb-2">No liked videos yet</h3>
          <p className="text-[#52525B] text-sm mb-8 max-w-xs">When you like a video, it will appear here for you to watch again later.</p>
          <Link
            to="/"
            className="px-8 py-3 rounded-full border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] transition-all text-sm font-medium hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5"
          >
            Explore videos
          </Link>
        </div>
      )}
    </div>
  );
}

export default LikedVideos;
