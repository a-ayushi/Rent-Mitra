// src/services/api.js
import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (typeof window !== 'undefined' && (envApiUrl === 'http://localhost:8086' || envApiUrl === 'https://localhost:8086'))
  ? '/'
  : (envApiUrl || '/');

const api = axios.create({
  baseURL: API_URL,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Do NOT send auth header for public product routes
    const url = config.url || '';
    const isPublicProductRoute =
      url.startsWith('/api/products/getAllProducts') ||
      url.startsWith('/api/products/get-products-by-category') ||
      url.startsWith('/api/products/productsbysubcategory') ||
      url.startsWith('/api/products/products/') ||
      url.startsWith('/api/products/addproduct') ||
      url.startsWith('/api/products/categories') ||
      url.startsWith('/api/products/subcategories') ||
      url.startsWith('/api/products/category-names');

    if (token && !isPublicProductRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Let callers (AuthContext, components) decide how to handle 401s.
    // We no longer clear the token or force a redirect globally here,
    // to avoid instantly logging the user out on any protected API error.
    return Promise.reject(error);
  }
);

export default api;