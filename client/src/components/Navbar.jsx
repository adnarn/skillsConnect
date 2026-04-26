import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { User, LogOut, Map as MapIcon, LayoutDashboard, ChevronDown, Menu, X, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAvatarDropdownOpen(false);
      }
    };

    if (avatarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [avatarDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Poll unread message count every 30 seconds
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/chat/unread-count');
        setUnreadCount(res.data.totalUnread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/explore" className={navLinkClass('/explore')}>Explore</Link>
            <Link to="/pricing" className={navLinkClass('/pricing')}>Pricing</Link>
            <Link to="/map" className={navLinkClass('/map')}>Map</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
            
            {user ? (
              <>
                {user.role === 'worker' ? (
                  <Link to="/worker-dashboard" className={navLinkClass('/worker-dashboard')}>
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/client-dashboard" className={navLinkClass('/client-dashboard')}>
                    Dashboard
                  </Link>
                )}
                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: user.avatarColor || '#1D9E75' }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {avatarDropdownOpen && (
                    <>
                      {/* Mobile backdrop */}
                      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setAvatarDropdownOpen(false)} />
                      
                      {/* Desktop dropdown */}
                      <div className="hidden md:block absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setAvatarDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <Link
                          to={user.role === 'worker' ? '/worker-dashboard' : '/client-dashboard'}
                          onClick={() => setAvatarDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                        <Link
                          to="/map"
                          onClick={() => setAvatarDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <MapIcon className="w-4 h-4 mr-3" />
                          Live Map
                        </Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              handleLogout();
                              setAvatarDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>

                      {/* Mobile bottom sheet */}
                      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl border-t border-gray-200 z-50 transform transition-transform duration-300">
                        <div className="p-4">
                          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                          <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-100 mb-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                              style={{ backgroundColor: user.avatarColor || '#1D9E75' }}
                            >
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Link
                              to="/profile"
                              onClick={() => setAvatarDropdownOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                              <User className="w-5 h-5 mr-3" />
                              My Profile
                            </Link>
                            <Link
                              to={user.role === 'worker' ? '/worker-dashboard' : '/client-dashboard'}
                              onClick={() => setAvatarDropdownOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                              <LayoutDashboard className="w-5 h-5 mr-3" />
                              Dashboard
                            </Link>
                            <Link
                              to="/map"
                              onClick={() => setAvatarDropdownOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                              <MapIcon className="w-5 h-5 mr-3" />
                              Live Map
                            </Link>
                            <div className="border-t border-gray-100 mt-2 pt-2">
                              <button
                                onClick={() => {
                                  handleLogout();
                                  setAvatarDropdownOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <button
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: user.avatarColor || '#1D9E75' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200" ref={mobileMenuRef}>
            {user && (
              <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-100 mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: user.avatarColor || '#1D9E75' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <Link to="/" className={navLinkClass('/')} onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/explore" className={navLinkClass('/explore')} onClick={() => setMobileMenuOpen(false)}>Explore</Link>
              <Link to="/pricing" className={navLinkClass('/pricing')} onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link to="/map" className={navLinkClass('/map')} onClick={() => setMobileMenuOpen(false)}>Map</Link>
              <Link to="/contact" className={navLinkClass('/contact')} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              
              {user ? (
                <>
                  <Link to="/profile" className={navLinkClass('/profile')} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                  {user.role === 'worker' ? (
                    <Link to="/worker-dashboard" className={navLinkClass('/worker-dashboard')} onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  ) : (
                    <Link to="/client-dashboard" className={navLinkClass('/client-dashboard')} onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={navLinkClass('/login')} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className={navLinkClass('/register')} onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
