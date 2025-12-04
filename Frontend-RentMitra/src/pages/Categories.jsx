// src/components/Categories.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8086/product';
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
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-container">
        <div className="loading">Loading categories...</div>
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
          <Link
            key={category._id || category.id}
            to={`/category/${category._id || category.id}`}
            className="category-card"
          >
            <div className="category-icon">{category.icon || '📦'}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="item-count">
              {category.itemCount || 0} items available
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;