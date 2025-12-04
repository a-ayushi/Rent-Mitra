import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import { Favorite } from '@mui/icons-material';

const Favorites = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: favorites, isLoading, error } = useQuery('favorites', () => userService.getFavorites());
  const [loadingIds, setLoadingIds] = React.useState([]);

  // Debug log to see what backend returns
  console.log('Favorites page backend data:', favorites);

  const handleToggleFavorite = async (itemId) => {
    setLoadingIds((ids) => [...ids, itemId]);
    try {
      await itemService.toggleFavorite(itemId);
      await queryClient.invalidateQueries('favorites');
      console.log('Invalidated favorites query after toggle');
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoadingIds((ids) => ids.filter(id => id !== itemId));
    }
  };

  const SkeletonCard = () => (
    <div className="p-4 bg-white rounded-lg shadow-md animate-pulse">
      <div className="w-full h-40 bg-gray-300 rounded-md"></div>
      <div className="w-3/4 h-6 mt-4 bg-gray-300 rounded"></div>
      <div className="w-1/2 h-4 mt-2 bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Favorite className="text-3xl text-red-500" />
          <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <p className="text-red-600">Could not load your favorites. Please try again later.</p>
          </div>
        ) : favorites && favorites.data && favorites.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.data.map(item => (
              <ItemCard
                item={item}
                key={item._id}
                isFavorited={true}
                onToggleFavorite={handleToggleFavorite}
                loading={loadingIds.includes(item._id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Your favorites list is empty</h2>
            <p className="mb-6 text-gray-600">Browse items and click the heart icon to save them for later.</p>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
