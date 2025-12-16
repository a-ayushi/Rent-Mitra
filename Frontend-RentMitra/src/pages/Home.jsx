import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  Verified,
  LocalShipping,
  Security,
  AttachMoney,
  Category,
  ChevronRight,
  Star,
} from "@mui/icons-material";
import api from "../services/api";
import itemService from "../services/itemService";
import { useCity } from '../hooks/useCity';

const BeautifulRentalHome = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    renters: "0",
    items: "0",
    rating: "0",
    verified: "0",
  });

  const iconMap = {
    "Electronics": "💻",
    "Camera & Photo": "📷",
    "Camera": "📷",
    "Sports": "⚽",
    "Tools": "🔧",
    "Musical": "🎸",
    "Party": "🎉",
    "Outdoor": "⛺",
    "Gaming": "🎮",
    "Books": "📚",
    "Furniture": "🛋️",
    "Appliances": "🏠",
    "Vehicles": "🚗",
    "Fashion": "👗",
  };

  const colorMap = [
    "bg-blue-50 hover:bg-blue-100",
    "bg-purple-50 hover:bg-purple-100",
    "bg-green-50 hover:bg-green-100",
    "bg-orange-50 hover:bg-orange-100",
    "bg-pink-50 hover:bg-pink-100",
    "bg-yellow-50 hover:bg-yellow-100",
    "bg-teal-50 hover:bg-teal-100",
    "bg-indigo-50 hover:bg-indigo-100",
  ];

  useEffect(() => {
    fetchData();
  }, [city]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesData = await api.get("/api/products/categories");
      const mappedCategories = Array.isArray(categoriesData) 
        ? categoriesData.map((cat, idx) => ({
            id: cat.categoryId,
            name: cat.name,
            icon: iconMap[cat.name] || "📦",
            itemCount: Array.isArray(cat.subcategories) ? cat.subcategories.length : 0,
            color: colorMap[idx % colorMap.length],
          }))
        : [];
      setCategories(mappedCategories);

      // Fetch featured items
      const itemsData = await itemService.getItems({
        featured: true,
        limit: 8,
        city: city === "India" ? "" : city,
      });
      setFeaturedItems(Array.isArray(itemsData?.items) ? itemsData.items : []);

      // You can fetch real stats from API if available
      // For now using placeholder logic
      setStats({
        renters: "50K+",
        items: mappedCategories.reduce((sum, cat) => sum + cat.itemCount, 0).toString() || "10K+",
        rating: "4.8★",
        verified: "98%",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const handleItemClick = (itemId) => {
    navigate(`/items/${itemId}`);
  };

  const benefits = [
    { icon: <AttachMoney className="w-8 h-8" />, title: "Save 70% vs Buying", description: "Rent high-quality items at a fraction of the purchase cost" },
    { icon: <Verified className="w-8 h-8" />, title: "Verified Owners", description: "All item owners are identity-verified for your safety" },
    { icon: <LocalShipping className="w-8 h-8" />, title: "Free Delivery", description: "Get items delivered to your doorstep at no extra cost" },
    { icon: <Security className="w-8 h-8" />, title: "Damage Protection", description: "Every rental includes insurance coverage" },
  ];

  const SkeletonCard = () => (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Join {stats.renters} happy renters</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Why buy?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Rent and pay for what you use.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Access thousands of items from cameras to power tools. Why buy when you can rent?
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for cameras, tools, games, bikes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-32 py-5 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-all"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 justify-center">
                <div className="text-blue-400"><TrendingUp /></div>
                <div>
                  <div className="text-2xl font-bold">{stats.renters}</div>
                  <div className="text-sm text-gray-400">Active Renters</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="text-blue-400"><Category /></div>
                <div>
                  <div className="text-2xl font-bold">{stats.items}</div>
                  <div className="text-sm text-gray-400">Items Listed</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="text-blue-400"><Star /></div>
                <div>
                  <div className="text-2xl font-bold">{stats.rating}</div>
                  <div className="text-sm text-gray-400">Average Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="text-blue-400"><Verified /></div>
                <div>
                  <div className="text-2xl font-bold">{stats.verified}</div>
                  <div className="text-sm text-gray-400">Verified Owners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Find exactly what you need from our curated categories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`${cat.color} p-6 rounded-2xl border-2 ${
                    selectedCategory === cat.id ? "border-gray-900" : "border-transparent"
                  } transition-all transform hover:scale-105 hover:shadow-lg`}
                >
                  <div className="text-5xl mb-3">{cat.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{cat.name}</div>
                  <div className="text-sm text-gray-600">{cat.itemCount} items</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Rentals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                🔥 Trending Rentals
              </h2>
              <p className="text-gray-600">Most popular items this week</p>
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="hidden md:flex items-center gap-2 px-6 py-3 text-gray-900 border-2 border-gray-900 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition-all"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, idx) => <SkeletonCard key={idx} />)
            ) : (
              featuredItems.slice(0, 4).map((item) => {
                const imageUrl = item?.mainImage || item?.images?.[0]?.url;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item._id)}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-gray-900 hover:shadow-xl transition-all group cursor-pointer"
                  >
                    <div className="relative mb-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-7xl">
                          📦
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>

                    {item.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-sm">{item.rating}</span>
                        </div>
                        {item.reviewCount && (
                          <span className="text-gray-400 text-sm">({item.reviewCount})</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{item.rentalPrice || item.price}
                        </div>
                        <div className="text-xs text-gray-500">per day</div>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-all">
                        Rent Now
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Why Rent with Us?
            </h2>
            <p className="text-gray-400 text-lg">
              The smarter way to access what you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Rent in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Search & Browse", desc: "Find the perfect item from thousands of listings in your city" },
              { step: "2", title: "Book Instantly", desc: "Choose your dates, confirm your rental and pay securely online" },
              { step: "3", title: "Rent & Enjoy", desc: "Get it delivered or pick it up, use it and return when done" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 text-gray-300 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Have Items to Rent Out?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Turn your unused items into income. List for free and start earning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              List Your Items
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BeautifulRentalHome;