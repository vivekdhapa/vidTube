import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Search, User, LogOut, Video, Settings, ChevronDown, Menu } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.post('/users/logout');
    } catch (_) {
      // silent
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-[rgba(8,8,8,0.85)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.06)]">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-4 min-w-[180px]">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 rounded-full hover:bg-[rgba(255,255,255,0.06)] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2 select-none group">
          <Play size={20} className="text-[#6366F1] fill-[#6366F1] transition-transform group-hover:scale-110 duration-300" />
          <span className="text-white font-['Outfit'] font-semibold text-xl tracking-tight">
            VidTube
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <form
        onSubmit={handleSearch}
        className="hidden sm:flex items-center flex-1 max-w-xl mx-4"
      >
        <div className="flex w-full rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] focus-within:border-[#6366F1] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200 group">
          <div className="pl-4 pr-2 py-2 text-[#A1A1AA] group-focus-within:text-[#6366F1] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-[#F4F4F5] placeholder-[#52525B] px-2 py-2 text-sm outline-none font-['Inter']"
          />
          <button
            type="submit"
            className="px-4 text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.04)] transition-colors border-l border-[rgba(255,255,255,0.04)]"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
      </form>

      {/* Right: Auth */}
      <div className="flex items-center gap-3 min-w-[180px] justify-end">
        {/* Mobile Search Icon */}
        <button className="sm:hidden p-2 text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors">
          <Search size={20} />
        </button>

        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full hover:bg-[rgba(255,255,255,0.04)] p-1 pr-3 transition-colors border border-transparent hover:border-[rgba(255,255,255,0.05)]"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullname}
                  className="w-9 h-9 rounded-full object-cover border border-[rgba(255,255,255,0.1)]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[rgba(99,102,241,0.1)] text-[#6366F1] border border-[rgba(99,102,241,0.2)] flex items-center justify-center text-sm font-semibold">
                  {user.fullname?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
              <span className="text-[13px] text-[#A1A1AA] font-medium hidden md:block max-w-[120px] truncate font-['Inter']">
                {user.username || user.fullname}
              </span>
              <ChevronDown size={14} className="text-[#52525B] hidden md:block" />
            </button>

            {/* Dropdown menu - Glassmorphism */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[rgba(255,255,255,0.04)] backdrop-blur-[12px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] overflow-hidden z-50 animate-dropdown">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                  <p className="text-sm font-medium text-[#F4F4F5] truncate font-['Outfit']">{user.fullname}</p>
                  <p className="text-[13px] text-[#A1A1AA] truncate font-['Inter'] mt-0.5">@{user.username}</p>
                </div>

                {/* Menu items */}
                <nav className="p-1.5 flex flex-col gap-0.5">
                  <Link
                    to={`/channel/${user.username}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.06)] transition-all font-['Inter']"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    My Channel
                  </Link>
                  <Link
                    to="/my-videos"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.06)] transition-all font-['Inter']"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Video size={16} />
                    My Videos
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.06)] transition-all font-['Inter']"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  
                  <div className="h-px bg-[rgba(255,255,255,0.06)] my-1 mx-2" />
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-all w-full text-left font-['Inter']"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 bg-transparent border border-[rgba(255,255,255,0.1)] text-[#F4F4F5] px-5 py-2 rounded-full text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-all font-['Inter']"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
