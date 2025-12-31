import React from 'react';
import { Favorite } from '@mui/icons-material';
import api from '../services/api';
import ItemCard from '../components/items/ItemCard';
import { useFavorites } from '../contexts/FavoritesContext';

const Favorites = () => {
  const didFetchRef = React.useRef(false);
  const { favoriteIds } = useFavorites();
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [hasToken, setHasToken] = React.useState(false);

  const normalizeImageUrls = (imageUrls) => {
    if (Array.isArray(imageUrls)) {
      return imageUrls
        .map((u) => (u == null ? '' : String(u).trim()))
        .filter(Boolean);
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

  const mapFavoriteToItem = (fav) => {
    const p = fav?.product || {};
    const id = p?.productId ?? p?._id;
    const urls = normalizeImageUrls(p?.imageUrls);
    const images = urls.map((url) => ({ url }));

    const rentPrices = parseJsonMaybe(p?.rentPrices, null);
    const dailyRaw = rentPrices?.daily ?? p?.pricePerDay ?? p?.rentBasedOnType;
    const daily = typeof dailyRaw === 'number' ? dailyRaw : (dailyRaw == null ? undefined : Number(dailyRaw));

    const location = {
      ...(p?.location || {}),
      city: p?.city ?? p?.location?.city,
      state: p?.state ?? p?.location?.state,
      country: p?.location?.country,
    };

    return {
      ...p,
      _id: id,
      productId: p?.productId,
      title: p?.title ?? p?.name,
      name: p?.name ?? p?.title,
      images,
      mainImage: images.length > 0 ? images[0].url : p?.mainImage,
      pricePerDay: Number.isFinite(daily) ? daily : undefined,
      location,
      createdAt: fav?.createdAt ?? p?.createdAt,
    };
  };

  React.useEffect(() => {
    console.log('Favorites page mounted');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('Favorites token present:', !!token);
    setHasToken(!!token);
    if (!token) {
      console.log('Favorites: no token found, skipping /api/favorites/get-favorite call');
      return;
    }

    // In dev, React StrictMode mounts components twice to detect side effects.
    // Avoid hitting the API twice.
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const path = '/api/favorites/get-favorite';
    const baseURL = api?.defaults?.baseURL ?? '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const normalizedBaseURL = typeof baseURL === 'string' ? baseURL.replace(/\/$/, '') : baseURL;
    const callingUrl =
      normalizedBaseURL === '' || normalizedBaseURL === '/'
        ? `${origin}${path}`
        : `${normalizedBaseURL}${path}`;
    console.log('Favorites: api baseURL:', baseURL);
    console.log('Favorites: calling', callingUrl);
    console.time('Favorites get-favorite');

    const warnTimer = setTimeout(() => {
      console.warn('Favorites: get-favorite is taking longer than 10s (still pending)');
    }, 10000);

    setIsLoading(true);
    setError(null);

    api
      .get(path, { timeout: 180000 })
      .then((res) => {
        console.warn('Favorites: get-favorite succeeded');
        console.log('Favorites API response:', res);
        const isArray = Array.isArray(res);
        console.log('Favorites API response meta:', {
          type: typeof res,
          isArray,
          length: isArray ? res.length : undefined,
        });

        const list = isArray ? res : [];
        const mapped = list
          .map(mapFavoriteToItem)
          .filter((it) => it?._id != null);
        setItems(mapped);
      })
      .catch((err) => {
        console.error('Favorites API error:', err);
        console.error('Favorites API error details:', {
          message: err?.message,
          code: err?.code,
          status: err?.response?.status,
          data: err?.response?.data,
        });

        setError(err?.response?.data?.message || err?.message || 'Failed to load favorites');
        setItems([]);
      })
      .finally(() => {
        clearTimeout(warnTimer);
        setIsLoading(false);
        console.timeEnd('Favorites get-favorite');
        console.log('Favorites: get-favorite finished');
      });
  }, []);

  React.useEffect(() => {
    const allowed = new Set((favoriteIds || []).map((v) => Number(v)));
    setItems((prev) => prev.filter((it) => allowed.has(Number(it?._id))));
  }, [favoriteIds]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Favorite className="text-3xl text-red-500" />
          <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
        </div>

        {!hasToken ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Login required</h2>
            <p className="mb-0 text-gray-600">Please login to view your favorites.</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Loading favorites...</h2>
            <p className="mb-0 text-gray-600">Please wait.</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Could not load favorites</h2>
            <p className="mb-0 text-gray-600">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">No favorites yet</h2>
            <p className="mb-0 text-gray-600">Add items to favorites to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard item={item} key={item._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
