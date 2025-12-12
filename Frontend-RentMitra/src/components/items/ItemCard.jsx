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

  let createdAtText = null;
  const rawCreatedAt = item.createdAt || item.created_at;
  if (rawCreatedAt) {
    const d = new Date(rawCreatedAt);
    if (!isNaN(d.getTime())) {
      createdAtText = d.toLocaleDateString();
    }
  }

  return (
    <div
      onClick={handleCardClick}
      role="button"
      className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-xl shadow-sm cursor-pointer group hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative w-full h-48 overflow-hidden bg-gray-100 md:h-56 rounded-t-xl">
        <img
          src={item.mainImage || item.images?.[0]?.url || '/placeholder.jpg'}
          alt={item.title || item.name || 'Product'}
          className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
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

      <div className="flex flex-col flex-grow px-3.5 pt-2.5 pb-3.5">
        {/* Price on top */}
        <div className="mb-1 text-lg font-bold text-gray-900">
          {typeof item.pricePerDay === 'number' ? (
            <span>
              ₹{item.pricePerDay}
              <span className="text-sm font-normal text-gray-500">/day</span>
            </span>
          ) : (
            'Contact for price'
          )}
        </div>

        {/* Product name under price */}
        <h3 className="mb-1.5 text-[13px] font-medium text-gray-800 line-clamp-2">
          {item.title || item.name || 'Untitled'}
        </h3>

        {/* Location + date row at the bottom, subtle like OLX */}
        <div className="mt-auto pt-2 border-t border-gray-100 text-[11px] text-gray-500">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center truncate">
              <LocationIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
            {createdAtText && (
              <span className="whitespace-nowrap text-[11px] uppercase tracking-wide">
                {createdAtText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ItemCard;
