import api from './api';

const normalizeImageUrls = (imageUrls) => {
  if (Array.isArray(imageUrls)) {
    return imageUrls.map((u) => (u == null ? '' : String(u).trim())).filter(Boolean);
  }
  if (typeof imageUrls === 'string') {
    return imageUrls
      .split(',')
      .map((u) => (u == null ? '' : String(u).trim()))
      .filter(Boolean);
  }
  return [];
};

const normalizeImages = (p) => {
  const urls = normalizeImageUrls(p?.imageUrls);
  if (urls.length > 0) {
    return urls.map((url) => ({ url }));
  }

  if (Array.isArray(p?.images)) {
    return p.images
      .map((img) => {
        if (!img) return null;
        if (typeof img === 'string') return { url: img };
        if (typeof img === 'object' && img.url) return { url: img.url };
        return null;
      })
      .filter(Boolean);
  }

  return [];
};

const itemService = {
  // Get items with filters
  getItems: async (params) => {
    const products = await api.get('/api/products/getAllProducts');

    const rawItems = Array.isArray(products) ? products : [];

    // Map Java ProductDto -> shape expected by existing React UI / ItemCard
    const items = rawItems.map((p) => {
      const images = normalizeImages(p);
      return {
        ...p,
        // React side expects Mongo-style _id
        _id: p.productId ?? p._id,
        // Main image field used by ItemCard / Home
        mainImage: images.length > 0 ? images[0].url : p.mainImage,
        images,
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
      };
    });

    return {
      items,
      pagination: {
        total: items.length,
        pages: 1,
        page: 1,
      },
    };
  },

  // Get items for a specific category (Java products API)
  getItemsByCategory: async (categoryId) => {
    const products = await api.get('/api/products/get-products-by-category', {
      params: { categoryId },
    });

    const rawItems = Array.isArray(products) ? products : [];

    const items = rawItems.map((p) => {
      const images = normalizeImages(p);
      return {
        ...p,
        _id: p.productId ?? p._id,
        mainImage: images.length > 0 ? images[0].url : p.mainImage,
        images,
        pricePerDay: p.rentBasedOnType ?? p.pricePerDay,
        location: p.address
          ? {
              city: p.address,
            }
          : p.location,
        isAvailable: typeof p.isAvailable === 'boolean' ? p.isAvailable : true,
      };
    });

    return { items };
  },

  // Get single item (Java products API)
  getItem: async (id) => {
    const p = await api.get(`/api/products/get-by-id?productId=${id}`);

    const images = normalizeImages(p);

    // Map Java ProductDto -> shape expected by existing React UI / ItemDetails
    const mapped = {
      ...p,
      // Normalize id
      _id: p.productId ?? p._id ?? id,
      // Normalize main image + images array (UI often expects images[].url)
      mainImage: images.length > 0 ? images[0].url : p.mainImage,
      images,
      // Normalize price field name
      pricePerDay: p.rentBasedOnType ?? p.pricePerDay,
      // Basic location mapping from address string
      location: p.address
        ? {
            ...(p.location || {}),
            address: p.address,
            city: p.city || p.address,
            state: p.state || p.location?.state,
          }
        : p.location,
    };

    return mapped;
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

  // Add to favorites
  addToFavorites: (id) => {
    return api.post(`/api/favorites/${id}`);
  },

  // Remove from favorites
  removeFromFavorites: (id) => {
    return api.delete(`/api/favorites/remove-from-favorites/${id}`);
  },

  // Toggle favorite
  toggleFavorite: (id, isCurrentlyFavorited = false) => {
    return isCurrentlyFavorited
      ? itemService.removeFromFavorites(id)
      : itemService.addToFavorites(id);
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