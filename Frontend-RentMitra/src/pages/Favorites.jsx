import React from 'react';
import { Favorite } from '@mui/icons-material';
import api from '../services/api';

const Favorites = () => {
  const didFetchRef = React.useRef(false);

  React.useEffect(() => {
    console.log('Favorites page mounted');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('Favorites token present:', !!token);
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

    api
      .get(path, { timeout: 180000 })
      .then((res) => {
        console.log('Favorites API response:', res);
      })
      .catch((err) => {
        console.error('Favorites API error:', err);
      })
      .finally(() => {
        clearTimeout(warnTimer);
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
        <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Favorites</h2>
          <p className="mb-0 text-gray-600">Open the console to see the API response.</p>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
