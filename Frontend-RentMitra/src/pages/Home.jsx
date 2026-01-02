import React, { useRef, useState, useEffect } from "react";
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
  ChevronLeft,
  Star,
} from "@mui/icons-material";
import api from "../services/api";
import itemService from "../services/itemService";
import { useCity } from '../hooks/useCity';

const BeautifulRentalHome = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    renters: 0,
    items: 0,
    rating: null,
    verified: 0,
  });

  const statsBarRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false)
      : false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion) {
      setStatsVisible(true);
      return;
    }

    const el = statsBarRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.01,
        // Start as soon as it enters viewport (a tiny bit early so user sees counting immediately)
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const useCountUp = (target, { durationMs = 900, decimals = 0 } = {}) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
      if (!statsVisible) return;
      if (prefersReducedMotion) {
        setValue(Number(target) || 0);
        return;
      }

      const end = Number(target) || 0;
      const start = 0;
      const startAt = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      let raf = 0;
      const tick = (now) => {
        const t = Math.min(1, (now - startAt) / durationMs);
        const eased = easeOutCubic(t);
        const next = start + (end - start) * eased;
        const pow = Math.pow(10, decimals);
        setValue(Math.round(next * pow) / pow);
        if (t < 1) raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target, durationMs, decimals, statsVisible, prefersReducedMotion]);

    return value;
  };

  const formatCompact = (n) => {
    const num = Number(n) || 0;
    if (num >= 1000000) {
      const v = Math.round((num / 1000000) * 10) / 10;
      return `${v}M+`;
    }
    if (num >= 1000) {
      const v = Math.round((num / 1000) * 10) / 10;
      const out = String(v).endsWith(".0") ? String(Math.round(v)) : String(v);
      return `${out}K+`;
    }
    return num.toLocaleString();
  };

  useEffect(() => {
    fetchData();
  }, [city]);

  const sectionElsRef = useRef([]);
  const rafRef = useRef(0);

  const setSectionRef = (idx) => (el) => {
    sectionElsRef.current[idx] = el;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReducedMotion) return;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const update = () => {
      const vh = window.innerHeight || 1;

      sectionElsRef.current.forEach((el, idx) => {
        if (!el) return;

        // Ensure a deterministic stacking order. Transforms create stacking contexts,
        // so without explicit z-index, earlier sections can paint over later sections.
        el.style.position = "relative";
        el.style.zIndex = String(idx);

        // The 3D transform effect can visually stack sections on top of each other because
        // transforms do not affect layout. Keep the effect for top sections only.
        // For lower sections, render normally to avoid overlap artifacts.
        if (idx >= 2) {
          el.style.transformStyle = "flat";
          el.style.willChange = "auto";
          el.style.backfaceVisibility = "hidden";
          el.style.webkitBackfaceVisibility = "hidden";
          el.style.transform = "none";
          el.style.opacity = "1";
          el.style.filter = "none";
          el.style.pointerEvents = "auto";
          return;
        }

        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2 - vh / 2;
        const d = clamp(mid / (vh * 0.85), -1, 1);

        const abs = Math.abs(d);
        const below = clamp(d, 0, 1);
        const above = clamp(-d, 0, 1);

        const enterT = easeOutCubic(1 - abs);

        const isHero = idx === 0;

        // Keep the hero pinned in place (no translate/rotate). Transforms do not affect layout,
        // so moving the hero creates a visible "gap" above it.
        const zBase = -480;
        const z = isHero ? 0 : (lerp(zBase, 0, enterT) - lerp(0, 180, above));
        const rotateX = isHero ? 0 : (lerp(10, 0, enterT) - above * 7);
        const y = isHero ? 0 : (lerp(32, 0, enterT) - above * 9);

        const minOpacity = isHero ? 1 : 0.5;
        const opacity = isHero ? 1 : clamp(minOpacity + enterT * (1 - minOpacity), minOpacity, 1);

        const maxBlur = 2.2;
        const blurPx = isHero ? 0 : lerp(maxBlur, 0, enterT);

        el.style.transformStyle = "preserve-3d";
        el.style.willChange = "transform, opacity, filter";
        el.style.backfaceVisibility = "hidden";
        el.style.webkitBackfaceVisibility = "hidden";
        el.style.transform = `translate3d(0px, ${y}px, ${z}px) rotateX(${rotateX}deg)`;
        el.style.opacity = String(opacity);
        el.style.filter = blurPx > 0.12 ? `blur(${blurPx}px)` : "none";

        if (below > 0.9) {
          el.style.pointerEvents = "none";
        } else {
          el.style.pointerEvents = "auto";
        }
      });
    };

    let scheduled = false;
    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      rafRef.current = window.requestAnimationFrame(() => {
        scheduled = false;
        update();
      });
    };

    update();

    const onResize = () => scheduleUpdate();
    const onScroll = () => scheduleUpdate();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesData = await api.get("/api/products/categories");

      const categoriesItemsCount = Array.isArray(categoriesData)
        ? categoriesData.reduce((sum, cat) => {
          const subCount = Array.isArray(cat?.subcategories) ? cat.subcategories.length : 0;
          return sum + subCount;
        }, 0)
        : 0;

      // Fetch featured items
      const itemsData = await itemService.getItems({
        featured: true,
        limit: 10,
        city: city === "India" ? "" : city,
      });
      const featured = Array.isArray(itemsData?.items) ? itemsData.items : [];
      setFeaturedItems(featured);

      const extractRating = (item) => {
        const candidates = [
          item?.averageRating,
          item?.avgRating,
          item?.rating?.average,
          item?.rating,
          item?.stars,
          item?.starRating,
        ];
        for (const c of candidates) {
          const n = Number(c);
          if (Number.isFinite(n) && n >= 0 && n <= 5) return n;
        }
        return null;
      };

      const ratings = featured
        .map(extractRating)
        .filter((n) => Number.isFinite(n));
      const avgRating = ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

      // You can fetch real stats from API if available
      // For now using placeholder logic
      setStats({
        renters: 50000,
        items: categoriesItemsCount || 0,
        rating: avgRating,
        verified: 98,
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

  const handleItemClick = (itemId) => {
    navigate(`/items/${itemId}`);
  };

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
    const primary = normalizePrice(item?.rentBasedOnType ?? item?.pricePerDay ?? item?.rentalPrice ?? item?.price);

    if (primary != null) {
      if (rentType === "daily") daily = daily ?? primary;
      else if (rentType === "weekly") weekly = weekly ?? primary;
      else if (rentType === "monthly") monthly = monthly ?? primary;
      else daily = daily ?? primary;
    }

    if (daily != null) return { value: daily, unit: "day" };
    if (weekly != null) return { value: weekly, unit: "week" };
    if (monthly != null) return { value: monthly, unit: "month" };
    return null;
  };

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [featuredItems]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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
    <div className="bg-white" style={{ perspective: "1200px", perspectiveOrigin: "center center" }}>

      {/* Featured Rentals */}
      <section ref={setSectionRef(1)} className="pt-2 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-2xl font-bold text-gray-900">
                🔥 Trending
              </h2>
            </div>
            {/* <button
              onClick={() => navigate('/search')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-900 border-2 border-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </button> */}
          </div>

          <div className="relative group/section">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 hidden md:group-hover/section:flex transition-all items-center justify-center ${!canScrollLeft
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 cursor-pointer"
                }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className={`w-6 h-6 text-gray-900 ${!canScrollLeft ? "text-opacity-50" : ""}`} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 hidden md:group-hover/section:flex transition-all items-center justify-center ${!canScrollRight
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 cursor-pointer"
                }`}
              aria-label="Scroll right"
            >
              <ChevronRight className={`w-6 h-6 text-gray-900 ${!canScrollRight ? "text-opacity-50" : ""}`} />
            </button>

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {loading
                ? [...Array(5)].map((_, idx) => (
                  <div key={idx} className="min-w-[200px] md:min-w-[240px]">
                    <SkeletonCard />
                  </div>
                ))
                : featuredItems.map((item) => {
                  const imageUrl = item?.mainImage || item?.images?.[0]?.url;
                  const displayPrice = getDisplayPrice(item);

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleItemClick(item._id)}
                      className="min-w-[200px] md:min-w-[240px] bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-gray-900 hover:shadow-xl transition-all group/card cursor-pointer"
                    >
                      <div className="relative mb-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-6xl">
                            📦
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-gray-900 mb-1 group-hover/card:text-blue-600 transition-colors line-clamp-2">
                        {item.name}
                      </h3>

                      {item.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                            <span className="font-semibold text-xs">{item.rating}</span>
                          </div>
                          {item.reviewCount && (
                            <span className="text-gray-400 text-xs">
                              ({item.reviewCount})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                        <div>
                          <div className="text-xl font-bold text-gray-900">
                            {displayPrice
                              ? `₹${displayPrice.value}`
                              : "Contact for price"}
                          </div>
                          {displayPrice && (
                            <div className="text-[11px] text-gray-500">
                              per {displayPrice.unit}
                            </div>
                          )}
                        </div>
                        <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all">
                          Rent Now
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={setSectionRef(2)} className="pt-14 pb-14 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
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

      <div className="h-16 bg-gradient-to-br from-gray-900 to-black"></div>

      {/* How It Works */}
      <section ref={setSectionRef(3)} className="pt-24 pb-16 bg-white">
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

    </div>
  );
};

export default BeautifulRentalHome;