import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import itemService from '../../services/itemService';

const ItemCard = ({ item, isFavorited: initialIsFavorited = false, loading = false, onToggleFavorite }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const { mutate: toggleFavorite, isLoading: isTogglingFavorite } = useMutation(
    () => itemService.toggleFavorite(item._id),
    {
      onSuccess: (data) => {
        const isFavorited = data?.data?.isFavorited;
        setIsFavorited(isFavorited);
        queryClient.invalidateQueries('favorites');
        toast.success(isFavorited ? 'Added to favorites' : 'Removed from favorites');
      },
      onError: () => {
        toast.error('Failed to update favorites.');
      }
    }
  );

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to favorites.');
      navigate('/login');
      return;
    }
    // If a custom toggle handler is provided (e.g. from Favorites page), use it
    if (onToggleFavorite) {
      onToggleFavorite(item._id);
      return;
    }
    // Fallback to internal mutation for general item lists
    toggleFavorite();
  };

  const handleCardClick = () => {
    navigate(`/items/${item._id}`);
  };

  const locationText = item.location?.city && item.location?.state
    ? `${item.location.city}, ${item.location.state}`
    : item.location?.city || item.location?.state || item.location?.country || 'Unknown';

  return (
    <div
      onClick={handleCardClick}
      role="button"
      className="flex flex-col overflow-hidden transition-shadow duration-300 bg-white shadow-md cursor-pointer rounded-xl hover:shadow-xl group"
    >
      <div className="relative">
        <img
          src={item.mainImage || item.images?.[0]?.url || '/placeholder.jpg'}
          alt={item.title || item.name || 'Product'}
          className="object-cover w-full h-56 transition-transform duration-300 group-hover:scale-105"
        />

        {item.featured?.isFeatured && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-3 left-3">
            FEATURED
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite || loading}
          className="absolute p-2 transition bg-white rounded-full shadow-md top-3 right-3 hover:bg-gray-100"
        >
          {isTogglingFavorite || loading ? (
            <CircularProgress size={20} />
          ) : isFavorited ? (
            <FavoriteIcon className="text-red-500" />
          ) : (
            <FavoriteBorderIcon className="text-gray-600" />
          )}
        </button>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 truncate">
          {item.title || item.name || 'Untitled'}
        </h3>

        <div className="flex items-center mb-2 text-sm text-gray-500">
          <LocationIcon className="w-4 h-4 mr-1" />
          {locationText}
        </div>

        <div className="flex items-center mb-3">
          <StarIcon className="w-5 h-5 mr-1 text-yellow-400" />
          <span className="font-bold text-gray-800">
            {typeof item.averageRating === 'number' ? item.averageRating.toFixed(1) : 'New'}
          </span>
          <span className="ml-1 text-sm text-gray-500">
            ({typeof item.totalReviews === 'number' ? item.totalReviews : 0} reviews)
          </span>
        </div>

        <div className="mt-auto">
          <div className="mb-3 text-xl font-bold text-gray-900">
            {typeof item.pricePerDay === 'number' ? (
              <span>
                ₹{item.pricePerDay}
                <span className="text-sm font-normal text-gray-500">/day</span>
              </span>
            ) : (
              'Contact for price'
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <img
                src={item.owner?.profileImage?.url || '/placeholder.jpg'}
                alt={item.owner?.name || 'Owner'}
                className="object-cover w-8 h-8 mr-2 rounded-full"
              />
              <span className="text-sm text-gray-700">
                {item.owner?.name || 'Owner'}
              </span>
              {item.owner?.verification?.identity && (
                <VerifiedIcon className="w-4 h-4 ml-1 text-gray-500" titleAccess="Verified User" />
              )}
            </div>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                item.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
