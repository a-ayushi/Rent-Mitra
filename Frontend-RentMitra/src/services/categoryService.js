import api from './api';

const categoryService = {
  // Fetch all categories with subcategories from Java product service
  getCategories: () => {
    return api.get('/api/products/categories');
  },

  // Fetch subcategories by category name (matches Java controller signature)
  getSubcategories: (categoryName) => {
    return api.get('/api/products/subcategories', {
      params: { categoryName },
    });
  },

  // Example mapping for cities/categories names (adjust as needed)
  getCities: () => {
    return api.get('/api/products/category-names');
  },
};

export default categoryService;
