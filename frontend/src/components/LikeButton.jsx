import { useState } from 'react';
import { Heart } from 'lucide-react';
import api from '../api/axios';

const LikeButton = ({ 
  entityId, 
  entityType = 'video', // 'video', 'tweet', 'comment'
  initialLiked = false, 
  initialCount = 0,
  size = 18
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic Update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      // Endpoint logic based on type
      let endpoint = '';
      if (entityType === 'video') endpoint = `/likes/video/${entityId}`;
      else if (entityType === 'tweet') endpoint = `/likes/tweet/${entityId}`;
      else if (entityType === 'comment') endpoint = `/likes/comment/${entityId}`;

      await api.post(endpoint);
    } catch (err) {
      // Revert on error
      setLiked(!newLiked);
      setCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 transition-all active:scale-125 ${
        liked ? 'text-[#6366F1]' : 'text-[#52525B] hover:text-[#A1A1AA]'
      }`}
    >
      <Heart
        size={size}
        className={`${liked ? 'fill-[#6366F1]' : ''} ${isAnimating ? 'scale-125' : 'scale-100'} transition-transform duration-200`}
      />
      <span className="text-[13px] font-mono font-medium">
        {count > 0 ? count : ''}
      </span>
    </button>
  );
};

export default LikeButton;
