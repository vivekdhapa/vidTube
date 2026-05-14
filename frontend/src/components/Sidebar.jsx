import { NavLink } from 'react-router-dom';
import { House, Clock, Heart, Video, Upload, Settings, Feather, Globe, Users } from 'lucide-react';

const navItems = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/liked-videos', icon: Heart, label: 'Liked Videos' },
  { to: '/my-videos', icon: Video, label: 'My Videos' },
  { to: '/subscriptions', icon: Users, label: 'Subscriptions' },
  { to: '/tweets', icon: Feather, label: 'My Tweets' },
  { to: '/community', icon: Globe, label: 'Community' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40 w-[220px] 
          bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border-r border-[rgba(255,255,255,0.05)]
          pt-[80px] pb-6 flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <nav className="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-[10px] mx-2 transition-all duration-200 group ${
                  isActive
                    ? 'bg-[rgba(99,102,241,0.12)] text-[#6366F1] shadow-[inset_2px_0_0_#6366F1]'
                    : 'text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F4F4F5]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={20} 
                    className={`transition-colors ${isActive ? 'text-[#6366F1]' : 'text-[#A1A1AA] group-hover:text-[#F4F4F5]'}`} 
                  />
                  <span className="text-sm font-['Inter'] font-medium">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
