import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import itemService from "../services/itemService";
import { useAuth } from "../hooks/useAuth";
import ChatModal from '../components/ChatModal';
import axios from 'axios';
import {
  ArrowBack,
  Visibility,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  // Chat modal state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const product = await itemService.getItem(id);
        setItem(product);
        setViews(product.views || 0);
        setIsFavorited(product.favoritedBy?.includes(user?.id));
        setLoading(false);
      } catch {
        setError("Failed to load item.");
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    try {
      const res = await itemService.toggleFavorite(id);
      setIsFavorited(res.data.data.isFavorited);
    } catch {
      // handle error
    }
  };

  const createdAtText = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : null;

  if (loading) return <div className="p-12 text-center">Loading item...</div>;
  if (error || !item)
    return (
      <div className="p-12 text-center text-red-600">
        {error || "Item not found."}
      </div>
    );

  // Handler for chat button
  const handleChatWithOwner = async () => {
    setChatLoading(true);
    try {
      const token = localStorage.getItem('token');
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8086';
      const res = await axios.post(`${backendBase}/api/chats/start`, {
        productId: item._id,
        otherUserId: item.owner._id
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setChatId(res.data._id);
      setChatModalOpen(true);
    } catch {
      // handle error
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowBack /> Back
        </button>
        <div className="max-w-4xl p-8 mx-auto bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-shrink-0 w-full md:w-1/2">
              <div className="w-full h-80 overflow-hidden bg-gray-100 rounded-2xl md:h-96">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0].url}
                    alt={item.name}
                    className="object-contain w-full h-full"
                  />
                ) : null}
              </div>
              <div className="flex gap-2 mt-3">
                {item.images &&
                  item.images
                    .slice(1)
                    .map((img, idx) => (
                      <div
                        key={idx}
                        className="w-20 h-20 overflow-hidden bg-white border border-gray-200 rounded-xl"
                      >
                        <img
                          src={img.url}
                          alt="thumb"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ))}
              </div>
            </div>
            <div className="flex-grow">
              <h1 className="mb-2 text-3xl font-bold">{item.name}</h1>

              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Visibility className="mr-1" /> {views} views
                </span>
                {createdAtText && (
                  <span className="text-xs text-gray-500">
                    Added on {createdAtText}
                  </span>
                )}
                {item.rentType && (
                  <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                    Rent type: {item.rentType}
                  </span>
                )}
                {typeof item.rentBasedOnType === 'number' && (
                  <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                    ₹{item.rentBasedOnType} / {item.rentType || 'duration'}
                  </span>
                )}
                {user && item.owner && user.id !== item.owner?._id && (
                  <button
                    onClick={handleToggleFavorite}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    {isFavorited ? <Favorite /> : <FavoriteBorder />}
                  </button>
                )}
              </div>

              {item.message && (
                <p className="mb-4 text-gray-700">{item.message}</p>
              )}

              <div className="grid gap-4 mb-6 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <strong className="block mb-1 text-gray-900">Address</strong>
                  <div>
                    {item.address || item.location?.address}
                    {item.location?.city && `, ${item.location.city}`}
                    {item.location?.state && `, ${item.location.state}`}
                  </div>
                </div>

                {item.navigation && (
                  <div>
                    <strong className="block mb-1 text-gray-900">Navigation</strong>
                    <div>{item.navigation}</div>
                  </div>
                )}

                {item.mobileNumber && (
                  <div>
                    <strong className="block mb-1 text-gray-900">Contact Number</strong>
                    <div>{item.mobileNumber}</div>
                  </div>
                )}

                {item.hasOwnerInfo && item.owner && (
                  <div>
                    <strong className="block mb-1 text-gray-900">Owner</strong>
                    <div>{item.owner.name}</div>
                  </div>
                )}
              </div>

              {item.dynamicAttributes && Object.keys(item.dynamicAttributes).length > 0 && (
                <div className="mb-6">
                  <strong className="block mb-2 text-gray-900">Details</strong>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    {Object.entries(item.dynamicAttributes).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">{key}</span>
                        <span className="text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="px-6 py-2 mt-2 font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900">
                Book Now
              </button>
              {user && item.owner && user.id !== item.owner?._id && (
                <button
                  className="px-6 py-2 mt-2 ml-4 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
                  onClick={handleChatWithOwner}
                  disabled={chatLoading}
                >
                  {chatLoading ? 'Loading...' : 'Chat with Owner'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        chatId={chatId}
        currentUser={user}
        otherUser={item?.owner}
        product={item}
      />
    </div>
  );
};

export default ItemDetails;
