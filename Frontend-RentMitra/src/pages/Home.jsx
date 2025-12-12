import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import {
  Search as SearchIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import itemService from "../services/itemService";
import api from "../services/api";
import ItemCard from "../components/items/ItemCard";
import CategoryFilter from "../components/items/CategoryFilter";
import { useCity } from '../hooks/useCity';

// Reusable component for section titles
const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-12 text-center">
    <h2 className="text-4xl font-bold text-gray-800 md:text-5xl">{title}</h2>
    {subtitle && <p className="mt-6 text-lg text-gray-600">{subtitle}</p>}
  </div>
);

// Skeleton for loading states
const SkeletonCard = () => (
  <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
    <div className="w-full h-48 bg-gray-300 rounded-md"></div>
    <div className="w-3/4 h-6 mt-6 bg-gray-300 rounded"></div>
    <div className="w-1/2 h-4 mt-3 bg-gray-300 rounded"></div>
  </div>
);

const CategorySkeleton = () => (
  <div className="p-6 text-center bg-white rounded-lg shadow-md animate-pulse">
    <div className="w-20 h-20 mx-auto bg-gray-300 rounded-full"></div>
    <div className="w-3/4 h-6 mx-auto mt-6 bg-gray-300 rounded"></div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { city } = useCity();

  const [categoryGrid, setCategoryGrid] = React.useState([]);

  React.useEffect(() => {
    // Fetch categories for the grid from Java backend ProductController
    const fetchCategories = async () => {
      // Java controller is mapped at /api/products, with /categories endpoint
      const data = await api.get("/api/products/categories");
      const categories = Array.isArray(data) ? data : [];

      // Map backend CategoryDTO -> shape expected by the Home grid
      const mapped = categories.map((cat) => ({
        _id: cat.categoryId,
        name: cat.name,
        // Use a default icon for now; can be extended later
        icon: "📦",
        // Use number of subcategories as a simple itemCount approximation
        itemCount: Array.isArray(cat.subcategories) ? cat.subcategories.length : 0,
        // Simple slug from name (used in navigation if needed)
        slug: cat.name ? cat.name.toLowerCase().replace(/\s+/g, "-") : cat.categoryId,
      }));

      setCategoryGrid(mapped);
    };

    fetchCategories();
  }, [city]);

  const { data: featuredItems, isLoading: featuredItemsLoading } = useQuery(
    ["featuredItems", city],
    () =>
      itemService.getItems({
        featured: true,
        limit: 8,
        city: city === "India" ? "" : city,
      })
  );

  const handleCategoryClick = (categoryId) => {
    // Always navigate with numeric backend categoryId so CategoryItems can call get-products-by-category correctly
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="py-24 text-white bg-gradient-to-r from-purple-600 to-gray-600">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold md:text-6xl">
            Rent and Earn with Ease
          </h1>
          <p className="mt-8 text-lg md:text-xl">
            Discover a wide range of items available for rent in your area.
          </p>
          <button
            onClick={() => navigate("/search")}
            className="px-10 py-4 mt-12 font-bold text-gray-800 transition duration-300 bg-white rounded-full hover:bg-gray-100"
          >
            Start Renting Today
          </button>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="px-8 py-24 bg-white">
        <div className="container mx-auto">
          <SectionTitle title="Browse Categories" />
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 justify-items-center">
            {categoryGrid.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className="flex flex-col items-center w-full p-8 shadow bg-gray-50 hover:bg-gray-100 rounded-xl group"
              >
                <span className="mb-4 text-5xl transition-transform transform group-hover:scale-110">
                  {cat.icon || "📦"}
                </span>
                <span className="text-lg font-semibold text-center text-gray-700 group-hover:text-gray-900">
                  {cat.name}
                </span>
                <span className="mt-2 text-sm text-gray-400">
                  {cat.itemCount || 0} items
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="container px-8 py-24 mx-auto">
        <SectionTitle
          title="Featured Items"
          subtitle="Discover popular items available for rent"
        />
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {featuredItemsLoading
            ? [...Array(4)].map((_, index) => <SkeletonCard key={index} />)
            : Array.isArray(featuredItems?.items)
                ? featuredItems.items.map((item) => (
                    <ItemCard item={item} key={item._id} />
                  ))
                : null
          }
        </div>
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/search")}
            className="px-10 py-4 font-bold text-gray-800 transition duration-300 bg-transparent border-2 border-gray-800 rounded-full hover:bg-gray-800 hover:text-white"
          >
            View All Items
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 mt-24 bg-white shadow-lg rounded-2xl">
        <SectionTitle title="How It Works" />
        <div className="grid gap-16 px-16 py-8 text-center md:grid-cols-3">
          {[
            {
              number: "1",
              title: "Search & Find",
              description:
                "Browse through thousands of items available for rent in your area.",
            },
            {
              number: "2",
              title: "Book & Pay",
              description:
                "Select your rental period and make secure payment through our platform.",
            },
            {
              number: "3",
              title: "Use & Return",
              description:
                "Enjoy your rental and return it when done. Leave a review to help others.",
            },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 text-4xl font-bold text-white bg-gray-800 rounded-full shadow-lg">
                {step.number}
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800">
                {step.title}
              </h3>
              <p className="text-lg text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-8 py-24 mx-auto">
        <div className="px-12 py-16 text-center text-white shadow-2xl bg-gradient-to-r from-purple-600 to-gray-600 rounded-2xl">
          <h2 className="mb-8 text-4xl font-bold md:text-5xl">
            Start Earning from Your Unused Items
          </h2>
          <p className="mb-12 text-lg text-purple-100 md:text-xl">
            Turn your idle assets into income by renting them out.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-12 py-4 font-bold text-purple-600 transition duration-300 transform bg-white rounded-full hover:bg-purple-100 hover:scale-105"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
