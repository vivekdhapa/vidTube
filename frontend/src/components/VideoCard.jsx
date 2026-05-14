import { ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const formatDuration = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const formatViews = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v;
};

function VideoCard({ video }) {
  const {
    _id,
    title,
    thumbnail,
    duration,
    views,
    createdAt,
    ownerDetails,
  } = video;

  return (
    <Link
      to={`/watch/${_id}`}
      className="block bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.12)] group"
    >
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full aspect-video object-cover rounded-t-[12px]"
        />
        <div className="absolute bottom-2 right-2 bg-[rgba(0,0,0,0.75)] backdrop-blur-[4px] rounded-[6px] px-2 py-0.5 text-[#F4F4F5] text-[12px] font-['JetBrains_Mono']">
          {formatDuration(duration || 0)}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-[#F4F4F5] font-medium text-[14px] line-clamp-2 leading-snug mb-3">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {ownerDetails?.avatar ? (
              <img
                src={ownerDetails.avatar}
                alt={ownerDetails.fullname}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] text-white">
                {ownerDetails?.fullname?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-[#A1A1AA] text-[13px] font-medium truncate max-w-[100px]">
              {ownerDetails?.fullname}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-[#52525B] text-[12px] whitespace-nowrap">
            <div className="flex items-center gap-1">
              <ThumbsUp size={12} className={video.isLiked ? 'text-[#6366F1]' : ''} />
              <span>{video.likeCount || 0}</span>
            </div>
            <span>
              {formatViews(views || 0)} views · {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 'Just now'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
