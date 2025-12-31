// src/components/Categories.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8086';
      const response = await fetch(`${baseUrl}/api/products/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure we have an array
      if (data && Array.isArray(data)) {
        setCategories(data);
      } else if (data && data.categories && Array.isArray(data.categories)) {
        // Handle case where categories might be nested in response
        setCategories(data.categories);
      } else {
        console.error('Unexpected data format:', data);
        setCategories([]);
      }

      try {
        const productsResponse = await fetch(`${baseUrl}/api/products/getAllProducts`);
        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();
        const list = Array.isArray(products)
          ? products
          : (Array.isArray(products?.data) ? products.data : []);
        const counts = {};
        list.forEach((p) => {
          const cid = p?.categoryId;
          if (cid == null) return;
          const key = String(cid);
          counts[key] = (counts[key] || 0) + 1;
        });
        setCategoryCounts(counts);
      } catch (e) {
        console.error('Error fetching product counts:', e);
        setCategoryCounts({});
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      setCategories([]);
      setCategoryCounts({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-container">
        <LoadingScreen message="Loading categories" minHeight="60vh" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container">
        <div className="error-message">
          Error loading categories: {error}
        </div>
      </div>
    );
  }

  // Default categories in case the API doesn't return any
  const defaultCategories = [
    {
      _id: '1',
      name: 'Electronics',
      icon: '📱',
      description: 'Phones, laptops, cameras, and more',
      itemCount: 0
    },
    {
      _id: '2',
      name: 'Vehicles',
      icon: '🚗',
      description: 'Cars, bikes, scooters for rent',
      itemCount: 0
    },
    {
      _id: '3',
      name: 'Real Estate',
      icon: '🏠',
      description: 'Houses, apartments, office spaces',
      itemCount: 0
    },
    {
      _id: '4',
      name: 'Furniture',
      icon: '🪑',
      description: 'Tables, chairs, sofas, and more',
      itemCount: 0
    },
    {
      _id: '5',
      name: 'Sports & Fitness',
      icon: '⚽',
      description: 'Sports equipment and gym gear',
      itemCount: 0
    },
    {
      _id: '6',
      name: 'Tools & Equipment',
      icon: '🔧',
      description: 'Professional and DIY tools',
      itemCount: 0
    }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="categories-container">
      <h2>Browse by Category</h2>
      <div className="categories-grid">
        {displayCategories.map((category) => (
          (() => {
            const categoryKey = category?.categoryId ?? category?._id ?? category?.id;
            return (
              <Link
                key={categoryKey}
                to={`/category/${categoryKey}`}
                className="category-card"
              >
                <div className="category-icon">{category.icon || '📦'}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="item-count">
                  {categoryCounts[String(category.categoryId ?? category._id ?? category.id)] ?? (category.itemCount || 0)} items available
                </span>
              </Link>
            );
          })()
        ))}
      </div>
    </div>
  );
};

export default Categories;