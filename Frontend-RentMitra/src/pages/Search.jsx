import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useDebounce } from "../hooks/useDebounce";
import itemService from "../services/itemService";
import ItemCard from "../components/items/ItemCard";
import MapView from "../components/common/MapView";
import CategoryFilter from "../components/items/CategoryFilter";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Map as MapIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import { useCity } from "../hooks/useCity";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { city } = useCity();

  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || city || "",
    minPrice: searchParams.get("minPrice") || 0,
    maxPrice: searchParams.get("maxPrice") || 10000,
    sortBy: searchParams.get("sortBy") || "newest",
  });

  // Sync city context to filters.city
  useEffect(() => {
    if (city && filters.city !== city) {
      setFilters((prev) => ({ ...prev, city }));
      setPage(1);
    }
    // If city context is cleared, also clear filters.city
    if (!city && filters.city) {
      setFilters((prev) => ({ ...prev, city: "" }));
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapView, setMapView] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 500);
  const [selectedCategory, setSelectedCategory] = useState(filters.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    filters.subcategory || ""
  );

  const { data, isLoading, error } = useQuery(
    ["items", { ...filters, search: debouncedSearch, page }],
    () =>
      itemService.getItems({
        ...filters,
        search: debouncedSearch,
        page,
        limit: 12,
      }),
    { keepPreviousData: true }
  );

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      city: "",
      minPrice: 0,
      maxPrice: 10000,
      sortBy: "newest",
    });
    setPage(1);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat._id);
    setFilters((prev) => ({ ...prev, category: cat._id, subcategory: "" }));
    setSelectedSubcategory("");
  };
  const handleSubcategorySelect = (sub) => {
    setSelectedSubcategory(sub._id);
    setFilters((prev) => ({ ...prev, subcategory: sub._id }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const FilterPanel = () => (
    <div className="p-6 bg-white shadow-lg rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <CategoryFilter
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            City
          </label>
          <div className="relative">
            <LocationIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Price Range
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹0</span>
            <span>₹{filters.maxPrice}</span>
          </div>
        </div>
        <div>
          <label
            htmlFor="sortBy"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = [...Array(totalPages).keys()].map((i) => i + 1);
    return (
      <nav className="flex justify-center mt-12">
        <ul className="flex items-center h-10 -space-x-px text-base">
          {pages.map((p) => (
            <li key={p}>
              <button
                onClick={() => onPageChange(p)}
                className={`flex items-center justify-center px-4 h-10 leading-tight ${
                  currentPage === p
                    ? "text-gray-600 bg-gray-50 border-gray-300"
                    : "text-gray-500 bg-white border-gray-300"
                } hover:bg-gray-100 hover:text-gray-700`}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="p-4 mb-8 bg-white shadow-lg rounded-2xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-grow">
              <SearchIcon className="absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-3 font-semibold text-gray-800 bg-gray-200 rounded-lg md:hidden"
              >
                <FilterIcon /> Filters
              </button>
              <button
                onClick={() => setMapView(!mapView)}
                className="flex items-center gap-2 px-4 py-3 font-semibold text-gray-800 bg-gray-200 rounded-lg"
              >
                {mapView ? (
                  <>
                    <ViewListIcon /> List View
                  </>
                ) : (
                  <>
                    <MapIcon /> Map View
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <FilterPanel />
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="p-12 text-center">
                <span className="text-lg">Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                Error loading items.
              </div>
            ) : data?.items?.length === 0 ? (
              <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
                <h3 className="mb-2 text-2xl font-bold">No items found</h3>
                <p className="mb-4 text-gray-600">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 font-bold text-white bg-gray-800 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* <p className="mb-4 text-sm text-gray-600">
                  Found {data?.pagination?.total || 0} items
                </p> */}
                {mapView ? (
                  <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg">
                    <MapView
                      items={data?.items || []}
                      onItemClick={(item) => navigate(`/items/${item._id}`)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {data?.items?.map((item) => (
                      <ItemCard item={item} key={item._id} />
                    ))}
                  </div>
                )}
                <Pagination
                  currentPage={page}
                  totalPages={data?.pagination?.pages || 1}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}
      <div
        className={`fixed top-0 right-0 h-full bg-white w-80 shadow-2xl transform transition-transform duration-300 z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={() => setDrawerOpen(false)}
            className="absolute text-gray-500 top-4 right-4"
          >
            <ClearIcon />
          </button>
          <FilterPanel />
        </div>
      </div>
    </div>
  );
};

export default Search;
