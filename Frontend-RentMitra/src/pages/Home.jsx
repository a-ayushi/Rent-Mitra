import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  SportsEsports,
  DirectionsCar,
  Home,
  Chair,
  ChildCare,
  MedicalServices,
  LocationOn,
  Search,
  TrendingUp,
  Verified,
  LocalShipping,
  Security,
  AttachMoney,
  Category,
  Star,
} from "@mui/icons-material";
import itemService from "../services/itemService";
import { useCity } from "../hooks/useCity";

const BeautifulRentalHome = () => {
  const navigate = useNavigate();
  const { city } = useCity();

  const [featuredItems, setFeaturedItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState({});
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 1, name: "Gamming", icon: <SportsEsports className="w-5 h-5" /> },
    { id: 2, name: "Vehicle", icon: <DirectionsCar className="w-5 h-5" /> },
    { id: 3, name: "Home Appliance", icon: <Home className="w-5 h-5" /> },
    { id: 4, name: "Furniture & Home", icon: <Chair className="w-5 h-5" /> },
    { id: 5, name: "kids and baby items", icon: <ChildCare className="w-5 h-5" /> },
    {
      id: 6,
      name: "Medical & Health Equipment",
      icon: <MedicalServices className="w-5 h-5" />,
    },
  ];

  const benefits = [
    {
      icon: <AttachMoney className="w-8 h-8" />,
      title: "Save 70% vs Buying",
      description: "Rent high-quality items at a fraction of the purchase cost",
    },
    {
      icon: <Verified className="w-8 h-8" />,
      title: "Verified Owners",
      description: "All item owners are identity-verified for your safety",
    },
    {
      icon: <LocalShipping className="w-8 h-8" />,
      title: "Free Delivery",
      description: "Get items delivered to your doorstep at no extra cost",
    },
    {
      icon: <Security className="w-8 h-8" />,
      title: "Damage Protection",
      description: "Every rental includes insurance coverage",
    },
  ];

  const rowRefs = useRef([]);
  const rafRef = useRef(0);

  /* ---------------- RENT PRICE LOGIC (FROM OLD CODE) ---------------- */

  const parseJsonMaybe = (val, fallback) => {
    if (val == null) return fallback;
    if (typeof val === "object") return val;
    if (typeof val !== "string") return fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const normalizePrice = (val) => {
    if (val == null || val === "") return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };

  const getDisplayPrice = (item) => {
    const dyn = item?.dynamicAttributes || {};
    const rentPrices = parseJsonMaybe(dyn?.rentPrices, null);

    let daily = normalizePrice(rentPrices?.daily);
    let weekly = normalizePrice(rentPrices?.weekly);
    let monthly = normalizePrice(rentPrices?.monthly);

    const rentType = String(item?.rentType || "").toLowerCase();
    const primary = normalizePrice(
      item?.rentBasedOnType ??
        item?.pricePerDay ??
        item?.rentalPrice ??
        item?.price
    );

    if (primary != null) {
      if (rentType === "daily") daily ??= primary;
      else if (rentType === "weekly") weekly ??= primary;
      else if (rentType === "monthly") monthly ??= primary;
      else daily ??= primary;
    }

    if (daily != null) return { value: daily, unit: "day" };
    if (weekly != null) return { value: weekly, unit: "week" };
    if (monthly != null) return { value: monthly, unit: "month" };

    return null;
  };

  /* ---------------- DATA FETCH ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const itemsData = await itemService.getItems({
          limit: 60,
          city: city === "India" ? "" : city,
        });

        const allItems = Array.isArray(itemsData?.items)
          ? itemsData.items
          : [];

        setFeaturedItems(allItems.slice(0, 5));

        const categoryData = {};
        categories.forEach((cat) => {
          categoryData[cat.name] = allItems
            .filter((item) => item?.categoryId === cat.id)
            .slice(0, 5);
        });

        setCategoryItems(categoryData);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  /* ---------------- SCROLL 3D EFFECT ---------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const headerHeight = 80;

      rowRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();

        const isExitingTop = rect.top < headerHeight;
        const exitProgress = isExitingTop
          ? Math.min(
              1,
              Math.abs(rect.top - headerHeight) / (rect.height || 1)
            )
          : 0;

        const scale = 1 - exitProgress * 0.1;
        const opacity = 1 - exitProgress * 0.5;
        const translateZ = -exitProgress * 100;

        el.style.transformOrigin = "center top";
        el.style.transform = `perspective(1200px) translate3d(0,0,${translateZ}px) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = 50 - idx;
        el.style.position = "relative";
      });
    };

    const onScroll = () => {
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, [loading, categoryItems]);

  /* ---------------- RENT CARD ---------------- */

  const RentalCard = ({ item }) => {
    const imageUrl =
      item?.mainImage || item?.imageUrls?.[0] || item?.images?.[0]?.url;

    const displayPrice = getDisplayPrice(item);

    const displayDate = item?.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "N/A";

    return (
      <div
        onClick={() => navigate(`/items/${item.productId || item._id}`)}
        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
      >
        <div className="aspect-video w-full mb-3 overflow-hidden rounded-xl bg-gray-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No Image
            </div>
          )}
        </div>

        <div className="flex-grow">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">
            {item.name || "Untitled Item"}
          </h3>

          <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
            {item.description || "Item available for rent"}
          </p>

          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-3">
            <LocationOn className="w-3 h-3 text-red-500" />
            <span>{item.city || city || "Location"}</span>
            <span className="mx-1">•</span>
            <span>{displayDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-lg font-black text-gray-900">
              {displayPrice ? `₹${displayPrice.value}` : "No price"}
            </p>
            {displayPrice && (
              <p className="text-[10px] text-gray-400 uppercase">
                per {displayPrice.unit}
              </p>
            )}
          </div>

          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-black transition-all">
            Rent Now
          </button>
        </div>
      </div>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100">
      <main
        className="container mx-auto px-4 pt-10"
        style={{
          clipPath: "inset(80px 0 0 0)",
          marginTop: "-80px",
          paddingTop: "100px",
        }}
      >
        {/* Trending */}
        <div ref={(el) => (rowRefs.current[0] = el)} className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">⚡ Trending</h2>
            <button
              onClick={() => navigate("/search")}
              className="text-xs font-bold border px-5 py-2 rounded-xl hover:bg-gray-900 hover:text-white"
            >
              View All <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))
              : featuredItems.map((item) => (
                  <RentalCard key={item._id} item={item} />
                ))}
          </div>
        </div>

        {/* Categories */}
        {categories.map((cat, index) => {
          const items = categoryItems[cat.name] || [];
          if (!loading && items.length === 0) return null;

          return (
            <div
              key={cat.name}
              ref={(el) => (rowRefs.current[index + 1] = el)}
              className="mb-20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <span className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    {cat.icon}
                  </span>
                  {cat.name}
                </h2>
                <button
                  onClick={() => navigate(`/search?category=${cat.id}`)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-900"
                >
                  View All <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"
                      />
                    ))
                  : items.map((item) => (
                      <RentalCard
                        key={item._id || item.productId}
                        item={item}
                      />
                    ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* ================= WHY RENT WITH US ================= */}
      <section className="pt-20 pb-20 bg-gradient-to-b from-gray-900 via-black to-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3">
              Why Rent with Us?
            </h2>
            <p className="text-gray-400 text-lg">
              The smarter way to access what you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-3xl p-7
                           hover:bg-white/10 transition-all duration-300
                           backdrop-blur-md shadow-lg"
              >
                <div className="w-14 h-14 bg-white/10 rounded-xl
                                flex items-center justify-center
                                text-blue-400 mb-5">
                  {benefit.icon}
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {benefit.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="pt-24 pb-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Rent in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Search & Browse",
                desc: "Find the perfect item from thousands of listings in your city",
              },
              {
                step: "2",
                title: "Book Instantly",
                desc: "Choose your dates, confirm your rental and pay securely online",
              },
              {
                step: "3",
                title: "Rent & Enjoy",
                desc: "Get it delivered or pick it up, use it and return when done",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div
                  className="w-16 h-16 mx-auto mb-5
                             bg-gray-900 text-white
                             rounded-2xl flex items-center
                             justify-center text-2xl font-bold
                             shadow-lg"
                >
                  {item.step}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-600 max-w-xs mx-auto">
                  {item.desc}
                </p>

                {idx < 2 && (
                  <ChevronRight
                    className="hidden md:block absolute
                               top-7 -right-10
                               text-gray-300 w-8 h-8"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BeautifulRentalHome;