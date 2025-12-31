import React from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const FavoritesContext = React.createContext(null);

const STORAGE_KEY = 'favoriteProductIds';

const safeParseJson = (val, fallback) => {
  if (typeof val !== 'string' || !val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const toNumberId = (val) => {
  if (val == null) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [favoriteIds, setFavoriteIds] = React.useState(() => {
    const cached = safeParseJson(
      typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null,
      []
    );
    return Array.isArray(cached) ? cached.map(toNumberId).filter((n) => n != null) : [];
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [updatingIds, setUpdatingIds] = React.useState(() => new Set());

  const favoriteIdSet = React.useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const persist = React.useCallback((ids) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  const refreshFavorites = React.useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setFavoriteIds([]);
      persist([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get('/api/favorites/get-favorite', { timeout: 180000 });
      const list = Array.isArray(res) ? res : [];
      const ids = list
        .map((f) => toNumberId(f?.product?.productId ?? f?.productId))
        .filter((n) => n != null);
      setFavoriteIds(ids);
      persist(ids);
    } catch (e) {
      // Don't wipe the current UI state on transient errors.
      console.error('Favorites: refresh failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      persist([]);
      return;
    }

    refreshFavorites();
  }, [isAuthenticated, persist, refreshFavorites]);

  const isFavorite = React.useCallback(
    (productId) => {
      const id = toNumberId(productId);
      if (id == null) return false;
      return favoriteIdSet.has(id);
    },
    [favoriteIdSet]
  );

  const toggleFavorite = React.useCallback(
    async (productId) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Please login to add favorites');
        return;
      }

      const id = toNumberId(productId);
      if (id == null) return;

      if (updatingIds.has(id)) return;

      const currentlyFav = favoriteIdSet.has(id);

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      // Optimistic update
      setFavoriteIds((prev) => {
        const prevSet = new Set(prev);
        if (currentlyFav) prevSet.delete(id);
        else prevSet.add(id);
        const next = Array.from(prevSet);
        persist(next);
        return next;
      });

      try {
        if (currentlyFav) {
          await api.delete(`/api/favorites/remove-from-favorites/${id}`, { timeout: 180000 });
        } else {
          await api.post(`/api/favorites/${id}`, null, { timeout: 180000 });
        }
      } catch (e) {
        // Rollback on failure
        setFavoriteIds((prev) => {
          const prevSet = new Set(prev);
          if (currentlyFav) prevSet.add(id);
          else prevSet.delete(id);
          const next = Array.from(prevSet);
          persist(next);
          return next;
        });
        toast.error('Could not update favorites');
        console.error('Favorites: toggle failed', e);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [favoriteIdSet, persist, updatingIds]
  );

  const value = React.useMemo(
    () => ({
      favoriteIds,
      isLoading,
      isFavorite,
      toggleFavorite,
      refreshFavorites,
      isUpdating: (productId) => {
        const id = toNumberId(productId);
        if (id == null) return false;
        return updatingIds.has(id);
      },
    }),
    [favoriteIds, isLoading, isFavorite, toggleFavorite, refreshFavorites, updatingIds]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
};
