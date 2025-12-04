import api from './api';

const itemService = {
  // Get items with filters
  getItems: (params) => {
    // TODO: map filters to Java product filter endpoints; for now, fetch all products
    return api.get('/api/products/getAllProducts');
  },

  // Get single item
  getItem: (id) => {
    return api.get(`/items/${id}`);
  },

  // Create item
  createItem: async (itemData) => {
    const formData = new FormData();

    // Append text fields
    Object.keys(itemData).forEach(key => {
      if (key !== 'images') {
        if (typeof itemData[key] === 'object') {
          formData.append(key, JSON.stringify(itemData[key]));
        } else {
          formData.append(key, itemData[key]);
        }
      }
    });

    // Append images
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    return api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update item
  updateItem: async (id, itemData) => {
    const formData = new FormData();

    Object.keys(itemData).forEach(key => {
      if (key !== 'images' && key !== 'existingImages') {
        if (typeof itemData[key] === 'object') {
          formData.append(key, JSON.stringify(itemData[key]));
        } else {
          formData.append(key, itemData[key]);
        }
      }
    });

    // Append new images
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    return api.put(`/items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete item
  deleteItem: (id) => {
    return api.delete(`/items/${id}`);
  },

  // Toggle favorite
  toggleFavorite: (id) => {
    return api.post(`/items/${id}/favorite`);
  },

  // Toggle availability
  toggleAvailability: (id, isAvailable) => {
    return api.put(`/items/${id}`, { isAvailable });
  },

  // Check availability
  checkAvailability: (id, from, to) => {
    return api.get(`/items/${id}/availability`, {
      params: { from, to }
    });
  },

  // Get user's items
  getUserItems: (userId, params) => {
    return api.get(`/items/user/${userId || ''}`, { params });
  },

  // Get similar items
  getSimilarItems: (id) => {
    return api.get(`/items/${id}/similar`);
  },

  incrementItemViews: (id) => {
    return api.post(`/items/${id}/view`);
  }
};

export default itemService;