import React, { useState, useEffect } from "react";
import ChatModal from '../ChatModal';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import categoryService from "../../services/categoryService";
import logo from "../../assets/RENTMITRALOGO.png";
import {
  Favorite,
  FavoriteBorder,
  Search,
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

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isForgotPasswordRoute = location.pathname === "/forgot-password";
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    isForgotPasswordRoute;

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
          className={`flex items-center justify-between px-4 mx-auto lg:px-6 max-w-7xl ${
            isAuthRoute ? 'py-2' : 'py-3'
          }`}
        >
          {/* Logo - Larger Size */}
          <Link to="/" className="flex items-center mr-4 lg:mr-8">
            <img
              src={logo}
              alt="Rent Mitra"
              className="w-auto h-12 sm:h-14 lg:h-16"
            />
          </Link>

          {/* Location Selector - Desktop */}
          <div className="relative hidden location-dropdown md:block">
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 min-w-[120px] transition-colors"
            >
              <Search className="w-4 h-4" />
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
                      className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md hover:bg-gray-50"
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
                    <div className="px-3 py-2 text-sm text-gray-500">Loading cities...</div>
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
                          className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md hover:bg-gray-50"
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

          {/* Search Bar with Animated Placeholder */}
          <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-2 lg:mx-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholders[currentPlaceholderIndex]}
              className="w-full px-4 py-2 text-sm placeholder-gray-500 transition-all border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                animation: search === '' ? 'placeholder-fade 2s ease-in-out infinite' : 'none'
              }}
            />
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 text-white transition-colors bg-gray-900 lg:px-6 rounded-r-md hover:bg-gray-800"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Favourites (hidden on forgot-password) */}
            {!isForgotPasswordRoute && (
              <button
                onClick={() => navigate("/favorites")}
                className="p-2 text-gray-600 transition-colors rounded-md hover:text-red-500 hover:bg-red-50"
                title="Favourites"
              >
                <FavoriteBorder className="w-5 h-5" />
              </button>
            )}
            {/* Chat (hidden on forgot-password) */}
            {!isForgotPasswordRoute && (
              <button
                onClick={() => navigate("/messages")}
                className="p-2 text-gray-600 transition-colors rounded-md hover:text-blue-500 hover:bg-blue-50"
                title="Chat"
              >
                <ChatBubbleOutline className="w-5 h-5" />
              </button>
            )}

            {/* Login/Profile Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Dashboard link */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="hidden px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md lg:block hover:text-gray-900 hover:bg-gray-100"
                >
                  Dashboard
                </button>

                {/* Notifications - Desktop */}
                <button 
                  onClick={() => navigate("/notifications")}
                  className="hidden p-2 text-gray-600 transition-colors rounded-md lg:block hover:text-gray-800 hover:bg-gray-100"
                  title="Notifications"
                >
                  <NotificationsNone className="w-5 h-5" />
                </button>
                
                {/* Profile */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 px-2 py-2 transition-colors rounded-md lg:px-3 hover:bg-gray-100"
                >
                  {user?.avatarUrl ? (
                    <Avatar src={user.avatarUrl} alt={user?.name} sx={{ width: 28, height: 28 }} />
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
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md lg:px-4 hover:text-gray-900 hover:bg-gray-100"
              >
                Login
              </button>
            )}

            {/* RENT Button (hidden on forgot-password) */}
            {!isForgotPasswordRoute && (
              <button
                onClick={() => navigate("/add-item")}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white transition-colors bg-gray-900 rounded-full shadow-md lg:gap-2 lg:px-6 hover:bg-gray-800 hover:shadow-lg"
              >
                <Add className="w-4 h-4" />
                <span className="hidden sm:block">RENT</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 transition-colors rounded-md md:hidden hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <Close className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!isAuthRoute && (
          <div className="hidden bg-white border-t border-gray-200 md:block">
            <div className="flex items-center gap-6 px-4 py-3 mx-auto lg:px-6 max-w-7xl">
              <div 
                className="relative category-dropdown"
                onMouseEnter={() => setCategoryDropdownOpen(true)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900">
                  ALL CATEGORIES
                  <ExpandMore className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoryDropdownOpen && (
                  <div
                    className="absolute left-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[600px] lg:min-w-[800px]"
                    onMouseEnter={() => setCategoryDropdownOpen(true)}
                    onMouseLeave={() => setCategoryDropdownOpen(false)}
                  >
                    <div className="p-6 lg:p-8">
                      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                        {categories.map((cat) => (
                          <div key={cat.categoryId || cat._id}>
                            <h3 
                              className="mb-3 text-sm font-bold text-gray-800 transition-colors cursor-pointer hover:text-gray-900"
                              onClick={() => {
                                setCategoryDropdownOpen(false);
                                // Use Java categoryId for navigation so /category/:id is always a valid numeric id
                                navigate(`/category/${cat.categoryId}`);
                              }}
                            >
                              {cat.name}
                            </h3>
                            <ul className="space-y-2">
                              {cat.subcategories?.slice(0, 5).map(sub => (
                                <li key={sub.subcategoryId || sub._id}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCategoryDropdownOpen(false);
                                      const name = sub?.name || "";
                                      const encoded = encodeURIComponent(name);
                                      navigate(`/category/${cat.categoryId}?type=subcategory&name=${encoded}`);
                                    }}
                                    className="text-xs text-gray-600 transition-colors hover:text-gray-900 hover:underline"
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
              <div className="flex gap-4 overflow-x-auto lg:gap-6">
                {categories.slice(0, 6).map((cat, index) => (
                  <button
                    key={cat.categoryId || cat._id || cat.id || `${cat.name || 'cat'}-${index}`}
                    onClick={() => navigate(`/category/${cat.categoryId}`)}
                    className="py-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 whitespace-nowrap"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 md:hidden">
            <div className="px-4 py-4 space-y-3">
              {/* Location Selector - Mobile */}
              <div className="location-dropdown">
                <button 
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
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
                          className="flex items-center w-full px-3 py-2 text-left transition-colors rounded-md hover:bg-gray-50"
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
                className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md hover:text-red-500 hover:bg-red-50"
              >
                <FavoriteBorder className="w-4 h-4" />
                Favourites
              </button>
              {/* Chat - Mobile */}
              <button
                onClick={() => {
                  navigate("/messages");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md hover:text-blue-500 hover:bg-blue-50"
              >
                <ChatBubbleOutline className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={handleGlobalChatClick}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md hover:text-gray-900 hover:bg-gray-50"
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
                        className="px-3 py-2 text-sm text-left text-gray-600 transition-colors rounded-md hover:text-gray-900 hover:bg-gray-50"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md hover:text-gray-900 hover:bg-gray-50"
                  >
                    <ChatBubbleOutline className="w-4 h-4" />
                    Messages
                  </button>
                  <button 
                    onClick={() => {
                      navigate("/notifications");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-md hover:text-gray-900 hover:bg-gray-50"
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
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setChatModalOpen(false)}>✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 350 }}>
              {chatLoading ? (
                <div className="text-center text-gray-400">Loading...</div>
              ) : userChats.length === 0 ? (
                <div className="text-center text-gray-400">No conversations yet.</div>
              ) : (
                userChats.map(chat => {
                  const other = chat.participants.find(u => u._id !== user._id);
                  return (
                    <div key={chat._id} className="mb-3 cursor-pointer hover:bg-gray-50 rounded p-2 flex items-center" onClick={() => openChat(chat)}>
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
