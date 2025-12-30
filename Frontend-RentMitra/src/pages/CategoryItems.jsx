// src/pages/CategoryItems.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  Heart,
  HeartFill,
  Star,
  StarFill,
  GeoAlt,
  ShieldCheck,
  XLg,
  ChevronDown,
  ChevronUp,
  Grid3x3GapFill,
  CheckCircleFill,
  Tags,
  CashStack,
  Lightning,
  Clock,
  Award,
} from "react-bootstrap-icons";
import userService from "../services/userService";
import itemService from "../services/itemService";
import categoryService from "../services/categoryService";

import { useQueryClient } from 'react-query';

const CategoryItems = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: [],
  });

  const queryClient = useQueryClient();
  const subcategoryCountCacheRef = useRef(new Map());

  const selectedType = searchParams.get("type") || "category";
  const selectedSubcategoryName = searchParams.get("name") || "";

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const list = await userService.getFavorites();
        if (Array.isArray(list)) {
          const ids = list
            .map((f) => f?.product?.productId ?? f?.productId ?? f?.id)
            .filter(Boolean);
          setFavorites(ids);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    }
    fetchFavorites();
  }, []);

  const fetchCategoryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        selectedType === "subcategory" && selectedSubcategoryName
          ? await itemService.getItemsBySubcategoryName(selectedSubcategoryName)
          : await itemService.getItemsByCategory(id);

      if (data && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        console.error("Malformed response from getItemsByCategory:", data);
        setItems([]);
      }
    } catch (err) {
      console.error("Error fetching category items:", err);
      setError("Failed to load category items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, selectedType, selectedSubcategoryName]);

  const fetchSubcategories = useCallback(async () => {
    try {
      const categories = await categoryService.getCategories();
      const arr = Array.isArray(categories)
        ? categories
        : Array.isArray(categories?.data)
          ? categories.data
          : [];
      const cat = arr.find((c) => String(c?.categoryId) === String(id));
      setCategory(cat || null);

      const categoryName = cat?.name;
      if (!categoryName) {
        setSubcategories([]);
        return;
      }

      const subRes = await categoryService.getSubcategories(categoryName);
      const subs = Array.isArray(subRes)
        ? subRes
        : Array.isArray(subRes?.data)
          ? subRes.data
          : [];

      const withCounts = await Promise.all(
        subs.map(async (subcat) => {
          const name = subcat?.name == null ? "" : String(subcat.name).trim();
          if (!name) {
            return { ...subcat, itemCount: 0 };
          }

          const cached = subcategoryCountCacheRef.current.get(name);
          if (typeof cached === "number") {
            return { ...subcat, itemCount: cached };
          }

          try {
            const data = await itemService.getItemsBySubcategoryName(name);
            const count = Array.isArray(data?.items) ? data.items.length : 0;
            subcategoryCountCacheRef.current.set(name, count);
            return { ...subcat, itemCount: count };
          } catch {
            subcategoryCountCacheRef.current.set(name, 0);
            return { ...subcat, itemCount: 0 };
          }
        })
      );

      setSubcategories(withCounts);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCategoryItems();
      fetchSubcategories();
    }
  }, [id, selectedType, selectedSubcategoryName, fetchCategoryItems, fetchSubcategories]);

  const toggleFavorite = async (itemId) => {
    try {
      const isCurrentlyFavorited = favorites.includes(itemId);
      await itemService.toggleFavorite(itemId, isCurrentlyFavorited);
      setFavorites(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
      queryClient.invalidateQueries('favorites');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setShowSortDropdown(false);
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilters((prev) => {
      if (type === "checkbox") {
        return {
          ...prev,
          condition: checked
            ? [...prev.condition, value]
            : prev.condition.filter((c) => c !== value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      condition: [],
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
  };

  const getItemPricePerDay = (item) => {
    const direct = item?.pricePerDay;
    if (typeof direct === "number" && Number.isFinite(direct)) return direct;
    const rp = item?.rentPrices;
    if (rp && typeof rp === "object") {
      const values = Object.values(rp)
        .map((v) => (typeof v === "number" ? v : Number(v)))
        .filter((v) => Number.isFinite(v));
      if (values.length > 0) return Math.min(...values);
    }
    return null;
  };

  const minPrice = filters.minPrice === "" || filters.minPrice == null ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" || filters.maxPrice == null ? null : Number(filters.maxPrice);
  const selectedConditions = Array.isArray(filters.condition)
    ? filters.condition.map((c) => String(c).trim().toLowerCase()).filter(Boolean)
    : [];

  const filteredItems = (Array.isArray(items) ? items : []).filter((it) => {
    const price = getItemPricePerDay(it);
    if (minPrice != null && Number.isFinite(minPrice)) {
      if (price == null || price < minPrice) return false;
    }
    if (maxPrice != null && Number.isFinite(maxPrice)) {
      if (price == null || price > maxPrice) return false;
    }

    if (selectedConditions.length > 0) {
      const itCondRaw = it?.condition ?? it?.dynamicAttributes?.condition;
      const itCond = itCondRaw == null ? "" : String(itCondRaw).trim().toLowerCase();
      if (!itCond || !selectedConditions.includes(itCond)) return false;
    }

    return true;
  });

  const sortedItems = filteredItems.slice().sort((a, b) => {
    if (sortBy === "pricePerDay") {
      const ap = getItemPricePerDay(a);
      const bp = getItemPricePerDay(b);
      const aVal = ap == null ? Number.POSITIVE_INFINITY : ap;
      const bVal = bp == null ? Number.POSITIVE_INFINITY : bp;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aTime = new Date(a?.createdAt ?? a?.createdOn ?? a?.createdDate ?? 0).getTime() || 0;
    const bTime = new Date(b?.createdAt ?? b?.createdOn ?? b?.createdDate ?? 0).getTime() || 0;
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  const computedTotalItems = sortedItems.length;

  const activeFiltersCount =
    filters.condition.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  const hasPriceFilter = Boolean(filters.minPrice) || Boolean(filters.maxPrice);
  const priceChipLabel = hasPriceFilter
    ? (filters.minPrice && filters.maxPrice
        ? `₹${filters.minPrice} - ₹${filters.maxPrice}/day`
        : filters.minPrice
          ? `From ₹${filters.minPrice}/day`
          : `Up to ₹${filters.maxPrice}/day`)
    : "";

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-48 bg-gradient-to-r from-gray-600 to-indigo-600"></div>
          <div className="container px-4 py-8 mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 bg-white shadow-sm rounded-xl">
                  <div className="h-48 mb-4 bg-gray-200 rounded-lg"></div>
                  <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 mx-auto text-center">
          <div className="mb-4 text-6xl">😔</div>
          <h3 className="mb-2 text-2xl font-bold text-gray-800">
            Oops! Something went wrong
          </h3>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={fetchCategoryItems}
            className="px-8 py-3 text-white transition-all transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-900 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container relative z-10 px-4 py-8 mx-auto">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center mb-4 transition-all text-white/80 hover:text-white group"
          >
            <ArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" size={20} />
            Back to Categories
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 text-5xl bg-white/20 backdrop-blur-sm rounded-2xl">
              {category?.icon || "📦"}
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="max-w-2xl text-base text-white/90">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="btn btn-glass btn-sm">
                  <Tags className="inline mr-2" size={16} />
                  {computedTotalItems} items available
                </span>
                <span className="btn btn-glass btn-sm">
                  <StarFill className="inline mr-2" size={16} />
                  4.5 avg rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 pt-4 pb-8 mx-auto">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6">
              {subcategories.map((subcat) => (
                <div
                  key={subcat.subcategoryId || subcat._id || subcat.id}
                  onClick={() => {
                    const name = subcat?.name || "";
                    const encoded = encodeURIComponent(name);
                    navigate(`/category/${id}?type=subcategory&name=${encoded}`);
                  }}
                  className="w-full p-3 text-center transition-all bg-white border border-gray-100 cursor-pointer rounded-xl hover:shadow-lg hover:-translate-y-1 group"
                >
                  <div className="mb-1.5 text-3xl transition-transform group-hover:scale-110">
                    {subcat.icon || "📁"}
                  </div>
                  <h6 className="mb-0.5 text-sm font-semibold text-gray-800">{subcat.name}</h6>
                  <span className="text-xs text-gray-500">
                    {subcat.itemCount || 0} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700"
              >
                <span className="text-sm">Sort by:</span>
                <span className="font-semibold text-gray-600">
                  {sortBy === "pricePerDay" ? "Price" : "Newest"}
                </span>
                {showSortDropdown ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {showSortDropdown && (
                <div className="absolute left-0 z-10 w-56 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl rounded-xl">
                  <button
                    onClick={() => handleSort("createdAt", "desc")}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-3 transition-all ${
                      sortBy === "createdAt" ? "bg-gray-50 text-gray-600" : ""
                    }`}
                  >
                    <Clock size={18} />
                    Newest First
                  </button>
                  <button
                    onClick={() => handleSort("pricePerDay", "asc")}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-3 transition-all ${
                      sortBy === "pricePerDay" && sortOrder === "asc"
                        ? "bg-gray-50 text-gray-600"
                        : ""
                    }`}
                  >
                    <CashStack size={18} />
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => handleSort("pricePerDay", "desc")}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-3 transition-all ${
                      sortBy === "pricePerDay" && sortOrder === "desc"
                        ? "bg-gray-50 text-gray-600"
                        : ""
                    }`}
                  >
                    <CashStack size={18} />
                    Price: High to Low
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700 ${
                showFilters ? "ring-2 ring-gray-900" : ""
              }`}
            >
              <Filter size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-900 text-white rounded-full text-xs font-bold leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {hasPriceFilter && (
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                {priceChipLabel}
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
                  }}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                >
                  <XLg size={12} />
                </button>
              </span>
            )}

            {(Array.isArray(filters.condition) ? filters.condition : []).map((cond) => {
              const label = cond ? String(cond).charAt(0).toUpperCase() + String(cond).slice(1) : "";
              return (
                <span
                  key={cond}
                  className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        condition: (Array.isArray(prev.condition) ? prev.condition : []).filter((c) => c !== cond),
                      }));
                    }}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <XLg size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="sticky p-6 bg-white shadow-lg w-80 rounded-xl h-fit top-4">
              <div className="flex items-center justify-between mb-6">
                <h4 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <Filter size={22} className="text-gray-600" />
                  Filters
                </h4>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                >
                  <XLg size={20} />
                </button>
              </div>

              <form onSubmit={handleApplyFilters}>
                {/* Price Range */}
                <div className="mb-6">
                  <label className="flex items-center block gap-2 mb-3 text-sm font-semibold text-gray-700">
                    <CashStack size={16} className="text-gray-600" />
                    Price Range (₹/day)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex items-center text-gray-400">
                      <span>—</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-6">
                  <label className="flex items-center block gap-2 mb-3 text-sm font-semibold text-gray-700">
                    <CheckCircleFill size={16} className="text-gray-600" />
                    Condition
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "excellent", label: "Excellent", color: "green" },
                      { value: "good", label: "Good", color: "gray" },
                      { value: "fair", label: "Fair", color: "yellow" }
                    ].map((cond) => (
                      <label
                        key={cond.value}
                        className="flex items-center p-3.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          value={cond.value}
                          checked={filters.condition.includes(cond.value)}
                          onChange={handleFilterChange}
                          name="condition"
                          className="w-5 h-5 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <span className="flex-1 ml-3 font-medium text-gray-700">
                          {cond.label}
                        </span>
                        <span
                          className={`w-3 h-3 rounded-full ${
                            cond.color === "green"
                              ? "bg-green-500"
                              : cond.color === "yellow"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                          }`}
                        ></span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Items Grid/List */}
          <div className="flex-1">
            {sortedItems.length === 0 ? (
              <div className="py-20 text-center bg-white shadow-sm rounded-xl">
                <div className="mb-6 text-7xl">🔍</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  No items found
                </h3>
                <p className="max-w-md mx-auto mb-6 text-gray-600">
                  Try adjusting your filters to find what you're looking for
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 text-white transition-all transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-900 hover:shadow-xl hover:scale-105"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {sortedItems.map((item) => (
                    <ItemCard
                      key={item._id}
                      item={item}
                      isFavorite={favorites.includes(item._id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Item Card Component
const ItemCard = ({ item, isFavorite, onToggleFavorite }) => {
  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFill key={`full-${i}`} className="text-yellow-400" size={14} />);
    }
    if (hasHalfStar) {
      stars.push(<StarFill key="half" className="text-yellow-400 opacity-50" size={14} />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={14} />);
    }
    return stars;
  };

  return (
    <div className="overflow-hidden transition-all duration-300 bg-white shadow-sm rounded-xl hover:shadow-lg group">
      <div className="relative flex items-center justify-center p-2 overflow-hidden bg-gray-100 h-44 md:h-48">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.name}
            className="object-contain max-w-full max-h-full transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-100">
            <Grid3x3GapFill size={48} />
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(item._id);
          }}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          {isFavorite ? (
            <HeartFill className="text-red-500" size={20} />
          ) : (
            <Heart className="text-gray-600" size={20} />
          )}
        </button>

        {item.instantBooking && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Lightning size={14} />
            Instant Book
          </div>
        )}

        {item.featured && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-xs font-semibold text-white">Featured</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <h3 className="mb-1 text-base font-semibold text-gray-800 transition-colors line-clamp-2 group-hover:text-gray-900">
          {item.name}
        </h3>
        <p className="mb-3 text-xs text-gray-600 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          {item.location?.city && (
            <div className="flex items-center gap-1.5">
              <GeoAlt size={14} className="text-gray-500" />
              <span className="font-medium">{item.location.city}</span>
            </div>
          )}
          {item.averageRating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {getRatingStars(item.averageRating)}
                </div>
              <span className="ml-1 font-medium">
                {item.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-800">
              ₹{item.pricePerDay}
            </span>
            <span className="ml-1 text-xs text-gray-500">/day</span>
          </div>
          <Link
            to={`/items/${item._id}`}
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryItems;
