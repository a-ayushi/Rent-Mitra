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
  ListUl,
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
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: [],
  });

  const queryClient = useQueryClient();
  const subcategoryCountCacheRef = useRef(new Map());

  const limit = 12;

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
      setPage(1);
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
    setPage(1);
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
  const computedTotalPages = Math.max(1, Math.ceil(computedTotalItems / limit));

  useEffect(() => {
    if (page > computedTotalPages) {
      setPage(computedTotalPages);
    }
  }, [page, computedTotalPages]);

  const clampedPage = Math.min(page, computedTotalPages);
  const startIndex = (clampedPage - 1) * limit;
  const pagedItems = sortedItems.slice(startIndex, startIndex + limit);

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
      <div className="relative overflow-hidden text-white bg-gradient-to-br from-gray-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container relative z-10 px-4 py-12 mx-auto">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center mb-6 transition-all text-white/80 hover:text-white group"
          >
            <ArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" size={20} />
            Back to Categories
          </button>
          <div className="flex items-center gap-6">
            <div className="p-4 text-6xl bg-white/20 backdrop-blur-sm rounded-2xl">
              {category?.icon || "📦"}
            </div>
            <div>
              <h1 className="mb-3 text-4xl font-bold md:text-5xl">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="max-w-2xl text-lg text-white/90">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/20 backdrop-blur-sm">
                  <Tags className="inline mr-2" size={16} />
                  {computedTotalItems} items available
                </span>
                <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/20 backdrop-blur-sm">
                  <StarFill className="inline mr-2" size={16} />
                  4.5 avg rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-10">
            <h3 className="flex items-center mb-6 text-2xl font-bold text-gray-800">
              <Grid3x3GapFill className="mr-3 text-gray-600" size={24} />
              Explore Subcategories
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {subcategories.map((subcat) => (
                <div
                  key={subcat.subcategoryId || subcat._id || subcat.id}
                  onClick={() => {
                    const name = subcat?.name || "";
                    const encoded = encodeURIComponent(name);
                    navigate(`/category/${id}?type=subcategory&name=${encoded}`);
                  }}
                  className="p-5 text-center transition-all bg-white border border-gray-100 cursor-pointer rounded-xl hover:shadow-lg hover:-translate-y-1 group"
                >
                  <div className="mb-3 text-4xl transition-transform group-hover:scale-110">
                    {subcat.icon || "📁"}
                  </div>
                  <h6 className="mb-1 font-semibold text-gray-800">{subcat.name}</h6>
                  <span className="text-sm text-gray-500">
                    {subcat.itemCount || 0} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 mb-8 bg-white shadow-sm rounded-xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                showFilters
                  ? "bg-gray-800 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
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
                    setPage(1);
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
                      setPage(1);
                    }}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <XLg size={12} />
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-gray-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid3x3GapFill size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-gray-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ListUl size={20} />
              </button>
            </div>

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
                <div className="absolute right-0 z-10 w-56 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl rounded-xl">
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
          </div>
        </div>

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
            {pagedItems.length === 0 ? (
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
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "space-y-4"
                  }
                >
                  {pagedItems.map((item) =>
                    viewMode === "grid" ? (
                      <ItemCard
                        key={item._id}
                        item={item}
                        isFavorite={favorites.includes(item._id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ) : (
                      <ItemListCard
                        key={item._id}
                        item={item}
                        isFavorite={favorites.includes(item._id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    )
                  )}
                </div>

                {/* Pagination */}
                {computedTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, computedTotalPages) }, (_, i) => {
                        let pageNum;
                        if (computedTotalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= computedTotalPages - 2) {
                          pageNum = computedTotalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-11 h-11 rounded-lg font-semibold transition-all ${
                              page === pageNum
                                ? "bg-gray-800 text-white shadow-lg"
                                : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(computedTotalPages, p + 1))}
                      disabled={page === computedTotalPages}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
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
      <div className="relative bg-gray-100">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.name}
            className="object-cover w-full h-44 md:h-48 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-44 md:h-48 text-gray-300 bg-gray-100">
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
            className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-indigo-600 text-white rounded-lg hover:from-gray-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// Enhanced Item List Card Component
const ItemListCard = ({ item, isFavorite, onToggleFavorite }) => {
  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFill key={`full-${i}`} className="text-yellow-400" size={16} />);
    }
    if (hasHalfStar) {
      stars.push(<StarFill key="half" className="text-yellow-400 opacity-50" size={16} />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={16} />);
    }
    return stars;
  };

  const getConditionBadge = (condition) => {
    const styles = {
      excellent: "bg-green-100 text-green-700 border-green-200",
      good: "bg-gray-100 text-gray-700 border-gray-200",
      fair: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return styles[condition] || styles.good;
  };

  return (
    <div className="flex overflow-hidden transition-all duration-300 bg-white shadow-sm rounded-xl hover:shadow-xl group">
      <div className="relative flex-shrink-0 w-64 h-56 bg-gray-100">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300">
            <Grid3x3GapFill size={48} />
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(item._id);
          }}
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          {isFavorite ? (
            <HeartFill className="text-red-500" size={20} />
          ) : (
            <Heart className="text-gray-600" size={20} />
          )}
        </button>

        {item.instantBooking && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Lightning size={14} />
            Instant
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 p-6">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="mb-1 text-xl font-bold text-gray-800 transition-colors group-hover:text-gray-900">
                {item.name}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConditionBadge(item.condition)}`}>
                  {item.condition}
                </span>
                {item.featured && (
                  <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 border border-purple-200 rounded-full">
                    Featured
                  </span>
                )}
                {item.verified && (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                    <ShieldCheck size={12} />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mb-4 text-gray-600 line-clamp-2">{item.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            {item.location?.city && (
              <div className="flex items-center gap-1.5">
                <GeoAlt size={16} className="text-gray-500" />
                <span className="font-medium text-gray-700">{item.location.city}</span>
              </div>
            )}
            {item.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {getRatingStars(item.averageRating)}
                </div>
                <span className="font-semibold text-gray-700">
                  {item.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500">({item.totalReviews} reviews)</span>
              </div>
            )}
            {item.rentedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircleFill size={16} className="text-green-500" />
                <span className="text-gray-600">Rented {item.rentedCount} times</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">
                ₹{item.pricePerDay}
              </span>
              <span className="text-gray-500">/day</span>
            </div>
            {item.pricePerWeek && (
              <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">₹{item.pricePerWeek}</span>
                <span className="text-gray-500">/week</span>
                <span className="ml-2 font-semibold text-green-600">
                  Save {Math.round((1 - (item.pricePerWeek / (item.pricePerDay * 7))) * 100)}%
                </span>
              </div>
            )}
          </div>
          <Link
            to={`/items/${item._id}`}
            className="px-6 py-3 font-semibold text-white transition-all transform rounded-lg shadow-md bg-gradient-to-r from-gray-600 to-indigo-600 hover:from-gray-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryItems;
