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

const parseJsonMaybe = (val, fallback) => {
  if (val == null) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val !== 'string') return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const parseAttributesMaybe = (val) => {
  const first = parseJsonMaybe(val, null);
  if (typeof first === 'string') {
    return parseJsonMaybe(first, null);
  }
  return first;
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

const mapProductToItem = (p, fallbackId) => {
  const images = normalizeImages(p);
  const rentPrices = parseJsonMaybe(p?.rentPrices, null);
  const daily = rentPrices?.daily ?? p?.pricePerDay ?? p?.rentBasedOnType;
  const weekly = rentPrices?.weekly ?? p?.pricePerWeek;
  const monthly = rentPrices?.monthly ?? p?.pricePerMonth;

  const attrsObj = parseAttributesMaybe(p?.attributes);
  const detailsFromDto = {
    condition: p?.condition,
    brand: p?.brand,
    rentTypes: p?.rentTypes,
    securityDeposit: p?.securityDeposit,
    minRentalDays: p?.minRentalDays,
    maxRentalDays: p?.maxRentalDays,
  };

  const dynamicAttributes = {
    ...(p?.dynamicAttributes || {}),
    ...(attrsObj && typeof attrsObj === 'object' && !Array.isArray(attrsObj) ? attrsObj : {}),
    ...Object.fromEntries(Object.entries(detailsFromDto).filter(([, v]) => v != null && v !== '')),
    rentPrices: rentPrices ?? p?.dynamicAttributes?.rentPrices,
  };

  const location = {
    ...(p?.location || {}),
    address: p?.streetAddress ?? p?.address ?? p?.location?.address,
    city: p?.city ?? p?.location?.city,
    state: p?.state ?? p?.location?.state,
    zipcode: p?.zipcode ?? p?.location?.zipcode,
    navigation: p?.navigation ?? p?.location?.navigation,
  };

  const owner = p?.owner ?? (p?.userId != null ? { _id: p.userId } : p?.owner);

  return {
    ...p,
    _id: p?.productId ?? p?._id ?? fallbackId,
    title: p?.title ?? p?.name,
    name: p?.name ?? p?.title,
    address: p?.streetAddress ?? p?.address,
    streetAddress: p?.streetAddress ?? p?.street_address,
    city: p?.city,
    state: p?.state,
    zipcode: p?.zipcode ?? p?.zipCode ?? p?.zip_code,
    zipCode: p?.zipCode ?? p?.zipcode ?? p?.zip_code,
    navigation: p?.navigation,
    mobileNumber: p?.mobileNumber,
    securityDeposit: p?.securityDeposit,
    minRentalDays: p?.minRentalDays,
    maxRentalDays: p?.maxRentalDays,
    mainImage: images.length > 0 ? images[0].url : p?.mainImage,
    images,
    rentTypes: p?.rentTypes,
    rentPrices: rentPrices ?? p?.rentPrices,
    pricePerDay: typeof daily === 'number' ? daily : (daily == null ? undefined : Number(daily)),
    pricePerWeek: typeof weekly === 'number' ? weekly : (weekly == null ? undefined : Number(weekly)),
    pricePerMonth: typeof monthly === 'number' ? monthly : (monthly == null ? undefined : Number(monthly)),
    location,
    dynamicAttributes,
    owner,
    isAvailable: typeof p?.isAvailable === 'boolean' ? p.isAvailable : true,
  };
};

const itemService = {
  // Get items with filters
  getItems: async (params) => {
    const products = await api.get('/api/products/getAllProducts');

    const rawItems = Array.isArray(products) ? products : [];

    // Map Java ProductDto -> shape expected by existing React UI / ItemCard
    const items = rawItems.map((p) => mapProductToItem(p));

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

    const items = rawItems.map((p) => mapProductToItem(p));

    return { items };
  },

  // Get items for a specific subcategory name (Java products API)
  getItemsBySubcategoryName: async (subcategoryName) => {
    const res = await api.get(
      `/api/products/productsbysubcategory/${encodeURIComponent(subcategoryName)}`
    );

    const rawItems = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? res.data
        : [];

    const items = rawItems.map((p) => mapProductToItem(p));

    return { items };
  },

  // Get single item (Java products API)
  getItem: async (id) => {
    const p = await api.get(`/api/products/get-by-id?productId=${id}`);

    return mapProductToItem(p, id);
  },

  // Create item
  createItem: async (itemData) => {
    const formData = new FormData();

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