import React from 'react';
import { Favorite } from '@mui/icons-material';
import api from '../services/api';

const Favorites = () => {
  const didFetchRef = React.useRef(false);
  const [favorites, setFavorites] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [hasToken, setHasToken] = React.useState(false);

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

        setFavorites(isArray ? res : []);
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
        setFavorites([]);
      })
      .finally(() => {
        clearTimeout(warnTimer);
        setIsLoading(false);
        console.timeEnd('Favorites get-favorite');
        console.log('Favorites: get-favorite finished');
      });
  }, []);

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
        ) : favorites.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">No favorites yet</h2>
            <p className="mb-0 text-gray-600">Add items to favorites to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => {
              const p = fav?.product || {};
              const firstImage = typeof p.imageUrls === 'string' ? p.imageUrls.split(',')[0] : '';
              const rentPrices = p?.rentPrices && typeof p.rentPrices === 'object' ? p.rentPrices : {};
              const rentTypes = Array.isArray(p?.rentTypes) ? p.rentTypes : [];
              const key = fav?.id ?? `${fav?.phoneNumber || 'fav'}-${p?.productId || 'product'}`;

              return (
                <div key={key} className="overflow-hidden bg-white shadow-lg rounded-2xl">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={p?.name || 'Favorite item'}
                      className="object-cover w-full h-48"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200" />
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900">{p?.name || 'Unnamed product'}</h3>
                    <p className="mt-1 text-sm text-gray-600">{p?.brand || '—'}</p>

                    <div className="mt-4 text-sm text-gray-700">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Location</span>
                        <span className="text-right">
                          {[p?.city, p?.state].filter(Boolean).join(', ') || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 mt-2">
                        <span className="text-gray-500">Security deposit</span>
                        <span>{p?.securityDeposit != null ? `₹${p.securityDeposit}` : '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4 mt-2">
                        <span className="text-gray-500">Rent</span>
                        <span className="text-right">
                          {rentTypes.length > 0
                            ? rentTypes
                                .map((t) => (rentPrices?.[t] != null ? `${t}: ₹${rentPrices[t]}` : t))
                                .join(' | ')
                            : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Added on: {fav?.createdAt || '—'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
