import api from './api';

const itemService = {
  // Get items with filters
  getItems: async (params) => {
    const products = await api.get('/api/products/getAllProducts');

    const rawItems = Array.isArray(products) ? products : [];

    // Map Java ProductDto -> shape expected by existing React UI / ItemCard
    const items = rawItems.map((p) => ({
      ...p,
      // React side expects Mongo-style _id
      _id: p.productId ?? p._id,
      // Main image field used by ItemCard
      mainImage: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls[0] : undefined,
      // Normalize price field name
      pricePerDay: p.rentBasedOnType ?? p.pricePerDay,
      // Very simple location mapping from address
      location: p.address
        ? {
            city: p.address,
          }
        : p.location,
      // Availability fallback (you can adjust when backend supports it)
      isAvailable: typeof p.isAvailable === 'boolean' ? p.isAvailable : true,
    }));

    return {
      items,
      pagination: {
        total: items.length,
        pages: 1,
        page: 1,
      },
    };
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