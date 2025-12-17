import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import itemService from "../services/itemService";
import { useAuth } from "../hooks/useAuth";
import ChatModal from '../components/ChatModal';
import axios from 'axios';
import {
  ArrowBack,
  Close,
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
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

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
        const firstUrl =
          (Array.isArray(product?.images) && product.images.length > 0
            ? product.images[0]?.url
            : null) ||
          product?.mainImage ||
          "";
        setSelectedImageUrl(firstUrl);
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

  useEffect(() => {
    if (!isImagePreviewOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsImagePreviewOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isImagePreviewOpen]);

  const parseJsonMaybe = (val, fallback) => {
    if (val == null) return fallback;
    if (typeof val === "object") return val;
    if (typeof val !== "string") return fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const normalizePrice = (val) => {
    if (val == null || val === "") return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };

  const getPrimaryRent = (it) => {
    const rp = parseJsonMaybe(
      it?.rentPrices ?? it?.dynamicAttributes?.rentPrices,
      null
    );

    const daily = normalizePrice(rp?.daily ?? it?.pricePerDay ?? it?.rentBasedOnType);
    const weekly = normalizePrice(rp?.weekly ?? it?.pricePerWeek);
    const monthly = normalizePrice(rp?.monthly ?? it?.pricePerMonth);

    if (daily != null) return { type: "daily", unit: "day", value: daily };
    if (weekly != null) return { type: "weekly", unit: "week", value: weekly };
    if (monthly != null) return { type: "monthly", unit: "month", value: monthly };
    return null;
  };

  const getRentPrices = (it) => {
    const rp = parseJsonMaybe(
      it?.rentPrices ?? it?.dynamicAttributes?.rentPrices,
      null
    );
    return {
      daily: normalizePrice(rp?.daily ?? it?.pricePerDay ?? it?.rentBasedOnType),
      weekly: normalizePrice(rp?.weekly ?? it?.pricePerWeek),
      monthly: normalizePrice(rp?.monthly ?? it?.pricePerMonth),
    };
  };

  const addressParts = (() => {
    const rawParts = [
      item?.address || item?.location?.address,
      item?.location?.city,
      item?.location?.state,
    ]
      .map((v) => (v == null ? "" : String(v).trim()))
      .filter(Boolean);

    const seen = new Set();
    const unique = [];
    rawParts.forEach((p) => {
      const key = p.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    });
    return unique;
  })();

  const pincodeText = (() => {
    const v =
      item?.zipcode ||
      item?.zipCode ||
      item?.location?.zipcode ||
      item?.location?.zipCode;
    const s = v == null ? "" : String(v).trim();
    return s;
  })();

  const detailEntries = (() => {
    const dyn = item?.dynamicAttributes || {};
    const entries = [];

    const hiddenKeys = new Set([
      "productId",
      "userId",
      "categoryId",
      "subcategoryId",
      "address",
      "streetAddress",
      "city",
      "state",
      "zipcode",
      "zipCode",
      "navigation",
      "mobileNumber",
      "brand",
      "rentTypes",
      "minRentalDays",
      "maxRentalDays",
      "securityDeposit",
    ]);

    Object.entries(dyn)
      .filter(
        ([key]) =>
          key !== "rentPrices" &&
          key !== "attributes" &&
          !hiddenKeys.has(String(key))
      )
      .forEach(([key, value]) => {
        entries.push([key, value]);
      });

    const attrs = parseJsonMaybe(dyn?.attributes, []);
    if (Array.isArray(attrs)) {
      attrs.forEach((a) => {
        const trimmed = String(a || "").trim();
        if (!trimmed) return;
        entries.push(["attribute", trimmed]);
      });
    }

    return entries;
  })();

  const handleToggleFavorite = async () => {
    try {
      await itemService.toggleFavorite(id, isFavorited);
      setIsFavorited((v) => !v);
    } catch {
      // handle error
    }
  };

  const createdAtText = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : null;

  const primaryRent = getPrimaryRent(item);
  const rentPrices = getRentPrices(item);

  const rentOptions = [
    { key: "daily", label: "Daily", unit: "day", value: rentPrices?.daily },
    { key: "weekly", label: "Weekly", unit: "week", value: rentPrices?.weekly },
    { key: "monthly", label: "Monthly", unit: "month", value: rentPrices?.monthly },
  ].filter((o) => o.value != null);

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
      {isImagePreviewOpen && selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsImagePreviewOpen(false)}
          role="button"
          tabIndex={-1}
        >
          <div
            className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute right-3 top-3 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow"
            >
              <Close className="text-gray-800" />
            </button>
            <img
              src={selectedImageUrl}
              alt={item.name}
              className="w-full h-full max-h-[85vh] object-contain bg-black"
            />
          </div>
        </div>
      )}

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
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={item.name}
                    onClick={() => setIsImagePreviewOpen(true)}
                    className="object-contain w-full h-full cursor-zoom-in"
                  />
                ) : null}
              </div>
              <div className="flex gap-2 mt-3">
                {Array.isArray(item.images) &&
                  item.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageUrl(img.url)}
                      className={`w-20 h-20 overflow-hidden bg-white border rounded-xl transition-colors ${
                        img.url === selectedImageUrl
                          ? "border-gray-800"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt="thumb"
                        className="object-contain w-full h-full"
                      />
                    </button>
                  ))}
              </div>
            </div>
            <div className="flex-grow">
              <h1 className="mb-2 text-3xl font-bold">{item.name}</h1>

              {item.brand && (
                <div className="mb-2 text-sm font-semibold text-gray-600">
                  {item.brand}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Visibility className="mr-1" /> {views} views
                </span>
                {createdAtText && (
                  <span className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>Added on {createdAtText}</span>
                    {rentOptions.length > 0 && (
                      <span className="flex flex-wrap items-center gap-2">
                        {rentOptions.map((opt) => {
                          const isPrimary = primaryRent?.type === opt.key;
                          return (
                            <span
                              key={opt.key}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-xl shadow-sm ${
                                isPrimary
                                  ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <span className="text-[10px] font-semibold tracking-wide text-gray-600 uppercase">
                                {opt.label}
                              </span>
                              <span className={`text-sm font-bold ${isPrimary ? "text-green-700" : "text-gray-800"}`}>
                                ₹{opt.value}
                                <span className="ml-1 text-[10px] font-semibold text-gray-500">/{opt.unit}</span>
                              </span>
                              {isPrimary && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-green-600 rounded-full">
                                  Best
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </span>
                    )}
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
                    {addressParts.join(", ")}
                    {pincodeText ? ` - ${pincodeText}` : ""}
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

                {(item.minRentalDays != null || item.maxRentalDays != null) && (
                  <div>
                    <strong className="block mb-1 text-gray-900">Rental Days</strong>
                    <div>
                      {item.minRentalDays != null ? `Min ${item.minRentalDays}` : null}
                      {item.minRentalDays != null && item.maxRentalDays != null ? " • " : null}
                      {item.maxRentalDays != null ? `Max ${item.maxRentalDays}` : null}
                    </div>
                  </div>
                )}

                {item.hasOwnerInfo && item.owner && (
                  <div>
                    <strong className="block mb-1 text-gray-900">Owner</strong>
                    <div>{item.owner.name}</div>
                  </div>
                )}
              </div>

              {detailEntries.length > 0 && (
                <div className="mb-6">
                  <strong className="block mb-2 text-gray-900">Details</strong>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    {detailEntries.map(([key, value], idx) => (
                      <div
                        key={`${key}-${idx}`}
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
