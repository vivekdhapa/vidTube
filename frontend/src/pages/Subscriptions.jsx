import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import api from '../api/axios';
import SubscribeButton from '../components/SubscribeButton';

function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/subscription/my-subscriptions');
        // The backend returns { totalSubscribedChannels, channels: [ { channel: { _id, username, fullname, avatar } } ] }
        setChannels(res.data.data.channels || []);
      } catch (err) {
        setError('Failed to fetch subscriptions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-[#F87171] text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[rgba(99,102,241,0.1)] rounded-[16px] border border-[rgba(99,102,241,0.2)]">
          <Users className="w-6 h-6 text-[#6366F1]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#F4F4F5] font-['Outfit']">Subscriptions</h1>
          <p className="text-[#A1A1AA] text-sm">Channels you have subscribed to</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.08)] rounded-[24px]">
          <Users size={48} className="text-[#52525B] mb-4" />
          <p className="text-[#F4F4F5] text-lg font-medium">No subscriptions yet</p>
          <p className="text-[#A1A1AA] mt-1 mb-8 text-center max-w-sm">
            Subscribe to channels to stay updated with their latest videos.
          </p>
          <Link to="/" className="px-6 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full transition-all">
            Browse Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels.map(({ channel }) => (
            <div 
              key={channel._id}
              className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 flex flex-col items-center text-center backdrop-blur-sm hover:bg-[rgba(255,255,255,0.06)] transition-all group"
            >
              <Link to={`/channel/${channel.username}`} className="relative mb-4">
                {channel.avatar ? (
                  <img 
                    src={channel.avatar} 
                    alt={channel.fullname} 
                    className="w-[80px] h-[80px] rounded-full object-cover border-2 border-[rgba(255,255,255,0.1)] group-hover:border-[#6366F1] transition-all"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl font-semibold text-white group-hover:bg-[rgba(99,102,241,0.2)] transition-all">
                    {channel.fullname?.[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
              
              <Link to={`/channel/${channel.username}`} className="mb-1">
                <h3 className="text-[#F4F4F5] font-semibold text-[16px] group-hover:text-[#6366F1] transition-colors">
                  {channel.fullname}
                </h3>
              </Link>
              <p className="text-[#A1A1AA] text-sm mb-6">@{channel.username}</p>
              
              <SubscribeButton 
                channelId={channel._id} 
                initialSubscribed={true} 
                onToggle={(status) => {
                  if (!status) {
                    setChannels(prev => prev.filter(c => c.channel._id !== channel._id));
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
