import React, { useEffect, useState } from "react";
import categoryService from "../../services/categoryService";

const PRIME_CATEGORIES = ["Car", "Dresses", "Jewellery"];

const CategoryFilter = ({
  onCategorySelect,
  onSubcategorySelect,
  selectedCategory,
  selectedSubcategory,
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategoryId = (cat) => cat?._id ?? cat?.id ?? cat?.categoryId;
  const getSubcategoryId = (sub) => sub?._id ?? sub?.id ?? sub?.subcategoryId;

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      let raw = res;
      // Handle axios response interceptors or backend returning { data: [...] } or { categories: [...] }
      let arr = Array.isArray(raw) ? raw :
                Array.isArray(raw?.data) ? raw.data :
                Array.isArray(raw?.categories) ? raw.categories : [];
      if (!Array.isArray(arr)) {
        console.warn('CategoryFilter: categories response is not an array', raw);
        arr = [];
      }
      setCategories(arr);
      setLoading(false);
    }).catch(err => {
      setCategories([]);
      setLoading(false);
      console.error('CategoryFilter: failed to fetch categories', err);
    });
  }, []);

  if (loading) return <div>Loading categories...</div>;

  // Defensive: ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Separate prime and regular categories
  const prime = safeCategories.filter((cat) => PRIME_CATEGORIES.includes(cat.name));
  const regular = safeCategories.filter(
    (cat) => !PRIME_CATEGORIES.includes(cat.name)
  );

  return (
    <div>
      <div className="mb-4">
        <h4 className="mb-2 font-bold">Prime Categories</h4>
        <div className="flex flex-wrap gap-2">
          {prime.map((cat, index) => (
            <button
              key={getCategoryId(cat) || `${cat.name || 'prime-cat'}-${index}`}
              className={`px-4 py-2 rounded-full border ${
                String(selectedCategory) === String(getCategoryId(cat))
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-800 border-gray-800"
              } font-semibold`}
              onClick={() => onCategorySelect(cat)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-bold">All Categories</h4>
        <div className="flex flex-wrap gap-2">
          {regular.map((cat, index) => (
            <button
              key={getCategoryId(cat) || `${cat.name || 'cat'}-${index}`}
              className={`px-4 py-2 rounded-full border ${
                String(selectedCategory) === String(getCategoryId(cat))
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-800 border-gray-800"
              } font-semibold`}
              onClick={() => onCategorySelect(cat)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>
      {selectedCategory && (
        <div className="mt-4">
          <h5 className="mb-2 font-bold">Subcategories</h5>
          <div className="flex flex-wrap gap-2">
            {(
              (Array.isArray(categories)
                ? categories.find((cat) => String(getCategoryId(cat)) === String(selectedCategory))
                : undefined)?.subcategories || []
            ).map((sub, index) => (
              <button
                key={getSubcategoryId(sub) || `${sub.name || 'sub'}-${index}`}
                className={`px-3 py-1 rounded-full border ${
                  String(selectedSubcategory) === String(getSubcategoryId(sub))
                    ? "bg-purple-600 text-white"
                    : "bg-white text-purple-600 border-purple-600"
                } font-medium`}
                onClick={() => onSubcategorySelect(sub)}
              >
                {sub.icon} {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
