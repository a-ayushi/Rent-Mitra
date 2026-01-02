import React, { useState, useEffect } from "react";
import ChatModal from '../ChatModal';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import categoryService from "../../services/categoryService";
import { APP_LOGO, APP_NAME } from "../../constants/app";
import {
  Favorite,
  FavoriteBorder,
  Search,
  LocationOnOutlined,
  ExpandMore,
  Language,
  Person,
  Add,
  ChatBubbleOutline,
  NotificationsNone,
  Menu,
  Close
} from "@mui/icons-material";
import { Avatar } from '@mui/material';
import ProfileSidebar from './ProfileSidebar';
import { useCity } from '../../hooks/useCity';
import LoadingScreen from './LoadingScreen';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const avatarSrc = (() => {
    const direct = user?.avatarUrl || user?.profileImage?.url;
    if (direct) return direct;
    const raw = user?.imageUrls;
    if (typeof raw === 'string') {
      const first = raw.split(',')[0]?.trim();
      return first || undefined;
    }
    if (Array.isArray(raw)) {
      const first = raw[0] == null ? '' : String(raw[0]).trim();
      return first || undefined;
    }
    return undefined;
  })();

  const isForgotPasswordRoute = location.pathname === "/forgot-password";
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    isForgotPasswordRoute;

  const isActiveRoute = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const glowClass = (active, tone = "blue") => {
    if (!active) return "";
    if (tone === "red") return "bg-red-50 text-red-600 ring-1 ring-red-200 shadow-[0_0_18px_rgba(239,68,68,0.25)]";
    if (tone === "purple") return "bg-purple-50 text-purple-700 ring-1 ring-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.22)]";
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.22)]";
  };

  // Chat modal state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [userChats, setUserChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (chatModalOpen && isAuthenticated) {
      setChatLoading(true);
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8086';
      axios.get(`${backendBase}/api/chats`).then(res => {
        setUserChats(res.data);
        setChatLoading(false);
      }).catch(() => setChatLoading(false));
    }
  }, [chatModalOpen, isAuthenticated]);

  const openChat = (chat) => {
    setSelectedChat(chat);
    setChatModalOpen(true);
  };

  const handleGlobalChatClick = () => {
    setSelectedChat(null);
    setChatModalOpen(true);
  };


  const [categories, setCategories] = useState([]);
  
  const [search, setSearch] = useState("");
  const { city, setCity } = useCity();
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  const [allCities, setAllCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityFetchError, setCityFetchError] = useState(null);

  const popularLocations = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ];

  const searchPlaceholders = [
    'Search "Bikes"',
    'Search "Cars"',
    'Search "Camera"',
    'Search "Laptop"',
    'Search "Mobile"',
    'Search "Furniture"',
    'Search "Books"',
    'Search "Clothes"',
    'Search "Electronics"',
    'Search "Apartments"',
    'Search "Tools"',
    'Search "Sports Equipment"'
  ];

  useEffect(() => {
    categoryService.getCategories().then((data) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (locationDropdownOpen && allCities.length === 0 && !loadingCities) {
      setLoadingCities(true);
      import('../../services/cityService').then(({ default: cityService }) => {
        cityService.getAllIndianCities()
          .then((data) => {
            setAllCities(data);
            setCityFetchError(null);
          })
          .catch(() => {
            setCityFetchError('Failed to fetch cities');
          })
          .finally(() => setLoadingCities(false));
      });
    }
  }, [locationDropdownOpen, allCities.length, loadingCities]);

  const fetchLiveLocation = () => {
    if (navigator.geolocation) {
      setCurrentLocation('Detecting...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          import('../../services/cityService').then(({ default: cityService }) => {
            cityService.reverseGeocode(latitude, longitude)
              .then((loc) => setCurrentLocation(loc || 'Unknown Location'));
          });
        },
        () => {
          setCurrentLocation('Location access denied');
        }
      );
    } else {
      setCurrentLocation('Geolocation not supported');
    }
  };

  useEffect(() => {
    if (locationDropdownOpen && !currentLocation) {
      fetchLiveLocation();
    }
  }, [locationDropdownOpen, currentLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prevIndex) =>
        (prevIndex + 1) % searchPlaceholders.length
      );
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [searchPlaceholders.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}&city=${encodeURIComponent(city)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-dropdown')) {
        setLocationDropdownOpen(false);
      }
      if (!event.target.closest('.category-dropdown')) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        {/* Main Navbar */}
        <div
          className={`flex items-center gap-4 px-4 mx-auto lg:px-6 max-w-7xl md:justify-center ${
            isAuthRoute ? 'py-1' : 'py-1.5'
          }`}
        >
          {/* Logo - Larger Size */}
          <Link to="/" className="flex items-center">
            <img
              src={APP_LOGO}
              alt={APP_NAME}
              className="w-auto h-9 sm:h-10 lg:h-12 scale-110 origin-left"
            />
          </Link>

          {/* Location Selector - Desktop */}
          <div className="relative hidden location-dropdown md:block">
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-2 h-8 px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-md min-w-[120px] transition-colors"
            >
              <LocationOnOutlined className="w-4 h-4" />
              <span className="truncate max-w-[80px]">{city || "Punjab"}</span>
              <ExpandMore className={`w-4 h-4 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Location Dropdown */}
            {locationDropdownOpen && (
              <div className="absolute left-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-80">
                {/* Search Input */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center px-3 py-2 transition-all border border-gray-200 rounded-md bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="flex-1 text-sm bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Current Location */}
                {currentLocation && (
                  <div className="p-3 border-b border-gray-100">
                    <button
                      onClick={() => {
                        setCity(currentLocation);
                        setLocationDropdownOpen(false);
                        setLocationSearch('');
                      }}
                      className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md"
                    >
                      <div className="flex items-center justify-center w-6 h-6 mr-3 bg-blue-100 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">Use current location</div>
                        <div className="text-xs text-gray-500 truncate">{currentLocation}</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* All Indian Cities List */}
                <div className="p-3 overflow-y-auto max-h-64">
                  <div className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">All Locations</div>
                  {loadingCities ? (
                    <div className="px-3 py-2">
                      <LoadingScreen message="Loading cities" minHeight="auto" size={18} />
                    </div>
                  ) : cityFetchError ? (
                    <div className="px-3 py-2 text-sm text-red-500">{cityFetchError}</div>
                  ) : (
                    allCities
                      .filter(cityName =>
                        locationSearch === '' ||
                        cityName.toLowerCase().includes(locationSearch.toLowerCase())
                      )
                      .slice(0, 100)
                      .map((cityName) => (
                        <button
                          key={cityName}
                          onClick={() => {
                            setCity(cityName);
                            setLocationDropdownOpen(false);
                            setLocationSearch('');
                          }}
                          className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md"
                        >
                          <div className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{cityName}</span>
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search + Category shortcuts (Desktop) */}
          <div className="items-center hidden gap-3 md:flex">
            <form
              onSubmit={handleSearch}
              className="flex h-8 w-[240px] rounded-md border border-gray-300 focus-within:border-gray-700 transition-colors"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholders[currentPlaceholderIndex]}
                className="w-full h-full px-3 py-1 text-sm placeholder-gray-500 transition-all rounded-l-md focus:outline-none"
                style={{
                  animation: search === '' ? 'placeholder-fade 2s ease-in-out infinite' : 'none'
                }}
              />
              <button
                type="submit"
                className="flex items-center justify-center h-full px-2.5 py-2 text-gray-600 transition-colors bg-transparent rounded-r-md"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            <div
              className="relative category-dropdown"
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              onMouseLeave={() => setCategoryDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 h-8 px-4 text-sm font-semibold text-gray-700 transition-colors ">
                All Categories
                <ExpandMore className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoryDropdownOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[600px] lg:min-w-[800px]"
                >
                  <div className="p-3 lg:p-5">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
                      {categories.map((cat) => (
                        <div key={cat.categoryId || cat._id}>
                          <h3
                            className="mb-2 text-sm font-bold text-gray-800 transition-colors cursor-pointer"
                            onClick={() => {
                              setCategoryDropdownOpen(false);
                              navigate(`/category/${cat.categoryId}`);
                            }}
                          >
                            {cat.name}
                          </h3>
                          <ul className="space-y-1 max-h-64 overflow-auto pr-1">
                            {cat.subcategories?.map(sub => (
                              <li key={sub.subcategoryId || sub._id}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryDropdownOpen(false);
                                    const name = sub?.name || "";
                                    const encoded = encodeURIComponent(name);
                                    navigate(`/category/${cat.categoryId}?type=subcategory&name=${encoded}`);
                                  }}
                                  className="text-xs text-gray-600 transition-colors"
                                >
                                  {sub.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Mobile) */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 h-8 mx-2 rounded-md border border-gray-300 focus-within:border-gray-700 transition-colors md:hidden"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholders[currentPlaceholderIndex]}
              className="w-full h-full px-4 py-1 text-sm placeholder-gray-500 transition-all rounded-l-md focus:outline-none"
              style={{
                animation: search === '' ? 'placeholder-fade 2s ease-in-out infinite' : 'none'
              }}
            />
            <button
              type="submit"
              className="flex items-center justify-center h-full px-2.5 py-2 text-gray-600 transition-colors bg-transparent rounded-r-md"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Favourites (hidden on forgot-password) */}
            {/* {!isForgotPasswordRoute && (
              <button
                onClick={() => navigate("/favorites")}
                className={`btn-icon bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-700 ${glowClass(isActiveRoute("/favorites"), "red")}`}
                title="Favourites"
              >
                <FavoriteBorder style={{ fontSize: 18 }} />
              </button>
            )} */}
            {/* Chat (hidden on forgot-password) */}
            {/* {!isForgotPasswordRoute && (
              <button
                onClick={() => navigate("/messages")}
                className={`btn-icon bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-700 ${glowClass(isActiveRoute("/messages"), "blue")}`}
                title="Chat"
              >
                <ChatBubbleOutline className="w-5 h-5" />
              </button>
            )} */}  

            {/* Login/Profile Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Notifications - Desktop */}
                {/* <button 
                  onClick={() => navigate("/notifications")}
                  className={`hidden btn-icon bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-700 lg:inline-flex ${glowClass(isActiveRoute("/notifications"), "blue")}`}
                  title="Notifications"
                >
                  <NotificationsNone className="w-5 h-5" />
                </button> */}
                
                {/* Profile */}
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 h-8 px-2 py-1 transition-colors rounded-md lg:px-3"
                >
                  {avatarSrc ? (
                    <Avatar src={avatarSrc} alt={user?.name} sx={{ width: 28, height: 28 }} />
                  ) : (
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#6B7280', fontSize: '14px' }}>
                      {user?.name?.[0] || <Person />}
                    </Avatar>
                  )}
                  <span className="hidden text-sm font-medium lg:block">Profile</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className={`btn h-8 bg-gray-100 text-gray-800 border border-gray-200 ${glowClass(isActiveRoute("/login"), "blue")}`}
              >
                Login
              </button>
            )}

            {/* RENT Button (hidden on forgot-password) */}
            {!isForgotPasswordRoute && (
              <button
                onClick={() => navigate("/become-a-renter")}
                className={`h-8 px-4 inline-flex items-center bg-transparent text-gray-900 font-semibold transition-colors ${isActiveRoute("/become-a-renter") ? "text-gray-900" : ""}`}
              >
                <span className="hidden sm:block">Become a Renter</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon bg-transparent text-gray-700 md:hidden"
            >
              {mobileMenuOpen ? <Close className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 md:hidden">
            <div className="px-4 py-4 space-y-3">
              {/* Location Selector - Mobile */}
              <div className="location-dropdown">
                <button 
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <LocationOnOutlined className="w-4 h-4" />
                    <span>{city || "Select Location"}</span>
                  </div>
                  <ExpandMore className={`w-4 h-4 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {locationDropdownOpen && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-3 overflow-y-auto max-h-48">
                      {popularLocations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            setCity(location);
                            setLocationDropdownOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md"
                        >
                          <span className="text-sm font-medium text-gray-700">{location}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Favourites - Mobile */}
              <button
                onClick={() => {
                  navigate("/favorites");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md ${glowClass(isActiveRoute("/favorites"), "red")}`}
              >
                <FavoriteBorder style={{ fontSize: 18 }} />
                Favourites
              </button>
              {/* Chat - Mobile */}
              <button
                onClick={() => {
                  navigate("/messages");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md ${glowClass(isActiveRoute("/messages"), "blue")}`}
              >
                <ChatBubbleOutline className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={handleGlobalChatClick}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md"
              >
                <ChatBubbleOutline className="w-4 h-4" />
                Messages
              </button>

              {!isAuthRoute && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="mb-3 text-sm font-semibold text-gray-700">Categories</div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 8).map((cat) => (
                      <button
                        key={cat.categoryId || cat._id}
                        onClick={() => {
                          navigate(`/category/${cat.categoryId}`);
                          setMobileMenuOpen(false);
                        }}
                        className="px-3 py-2 text-sm text-left text-gray-600 transition-colors rounded-md"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Actions */}
              {isAuthenticated && (
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      navigate("/messages");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md ${glowClass(isActiveRoute("/messages"), "blue")}`}
                  >
                    <ChatBubbleOutline className="w-4 h-4" />
                    Messages
                  </button>
                  <button 
                    onClick={() => {
                      navigate("/notifications");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md ${glowClass(isActiveRoute("/notifications"), "blue")}`}
                  >
                    <NotificationsNone className="w-4 h-4" />
                    Notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Sidebar */}
      <ProfileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={async () => {
          setSidebarOpen(false);
          try {
            await logout();
          } catch (e) {
            // ignore backend logout errors, still redirect
          }
          if (typeof window !== 'undefined') window.location.href = '/login';
        }}
        onNavigate={(route) => {
          setSidebarOpen(false);
          switch(route) {
            case 'profile': navigate('/profile'); break;
            case 'my-ads': navigate('/my-ads'); break;
            case 'buy-packages': navigate('/buy-packages'); break;
            case 'cart': navigate('/cart'); break;
            case 'billing': navigate('/billing'); break;
            case 'help': navigate('/help'); break;
            case 'settings': navigate('/settings'); break;
            case 'install-app': window.open('https://play.google.com/store/apps/details?id=com.olx.lite', '_blank'); break;
            default: break;
          }
        }}
      />

      {/* Overlay for dropdowns */}
      {(locationDropdownOpen || categoryDropdownOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-20 md:hidden"
          onClick={() => {
            setLocationDropdownOpen(false);
            setCategoryDropdownOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}

      {/* Chat Modal for global conversations */}
      {/* Chat List Modal */}
      {chatModalOpen && !selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">Your Conversations</div>
              <button className="text-gray-500" onClick={() => setChatModalOpen(false)}>✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 350 }}>
              {chatLoading ? (
                <LoadingScreen message="Loading conversations" minHeight="auto" size={18} />
              ) : userChats.length === 0 ? (
                <div className="text-center text-gray-400">No conversations yet.</div>
              ) : (
                userChats.map(chat => {
                  const other = chat.participants.find(u => u._id !== user._id);
                  return (
                    <div key={chat._id} className="mb-3 cursor-pointer rounded p-2 flex items-center" onClick={() => openChat(chat)}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#6B7280', fontSize: '14px', marginRight: 1 }}>
                        {other?.name?.[0] || '?'}
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{other?.name || 'User'}</div>
                        {chat.product && <div className="text-xs text-gray-500">Regarding: {chat.product.name}</div>}
                        {chat.lastMessage && <div className="text-xs text-gray-400 truncate">{chat.lastMessage.content}</div>}
                      </div>
                      <div className="text-xs text-gray-400 ml-2">{chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString() : ''}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      <ChatModal
        open={!!selectedChat}
        onClose={() => setSelectedChat(null)}
        chatId={selectedChat?._id}
        currentUser={user}
        otherUser={selectedChat?.participants?.find(u => u._id !== user?._id)}
        product={selectedChat?.product}
      />
      {/* Add CSS for placeholder animation */}
      <style>{`
        @keyframes placeholder-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        input::placeholder {
          transition: opacity 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;
