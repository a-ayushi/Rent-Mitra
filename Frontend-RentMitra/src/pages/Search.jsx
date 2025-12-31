import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useDebounce } from "../hooks/useDebounce";
import itemService from "../services/itemService";
import ItemCard from "../components/items/ItemCard";
import CategoryFilter from "../components/items/CategoryFilter";
import LoadingScreen from "../components/common/LoadingScreen";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const Search = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
  });

  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false); // no longer used visually but kept for potential future use
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
      }),
    { keepPreviousData: true }
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      city: "",
      minPrice: "",
      maxPrice: "",
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
              value={filters.city}
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
            value={filters.maxPrice === "" ? 10000 : filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹0</span>
            <span>₹{filters.maxPrice === "" ? 10000 : filters.maxPrice}</span>
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
        <div className="flex flex-col gap-8">
          {/* Results */}
          <main>
            {isLoading ? (
              <LoadingScreen message="Loading results" />
            ) : error ? (
              <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                Error loading items.
              </div>
            ) : data?.items?.length === 0 ? (
              <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
                <h3 className="mb-2 text-2xl font-bold">No items found</h3>
                <p className="mb-2 text-gray-600">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <>
                {/* <p className="mb-4 text-sm text-gray-600">
                  Found {data?.pagination?.total || 0} items
                </p> */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {data?.items?.map((item) => (
                    <ItemCard item={item} key={item._id} />
                  ))}
                </div>
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
    </div>
  );
};

export default Search;
