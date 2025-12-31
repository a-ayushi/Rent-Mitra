import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import itemService from "../services/itemService";
import { useAuth } from "../hooks/useAuth";
import ChatModal from '../components/ChatModal';
import LoadingScreen from "../components/common/LoadingScreen";
import axios from 'axios';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Close,
  Visibility,
} from "@mui/icons-material";

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const dragStartXRef = useRef(null);

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
        setPreviewIndex(0);
        setViews(product.views || 0);
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

    const urls = Array.isArray(item?.images)
      ? item.images
          .map((img) => (img?.url == null ? "" : String(img.url).trim()))
          .filter(Boolean)
      : [];
    const canNavigate = urls.length > 1;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsImagePreviewOpen(false);
        return;
      }

      if (!canNavigate) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = (previewIndex - 1 + urls.length) % urls.length;
        setPreviewIndex(next);
        setSelectedImageUrl(urls[next]);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (previewIndex + 1) % urls.length;
        setPreviewIndex(next);
        setSelectedImageUrl(urls[next]);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isImagePreviewOpen, item?.images, previewIndex]);

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

  const formatDetailLabel = (key) => {
    const raw = key == null ? "" : String(key);
    const cleaned = raw
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return raw;

    return cleaned
      .split(" ")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
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

  const createdAtText = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : null;

  const primaryRent = getPrimaryRent(item);
  const rentPrices = getRentPrices(item);

  const isMaskedPhone =
    typeof item?.mobileNumber === "string" && item.mobileNumber.includes("*");
  const shouldShowPhoneLoginHint = isMaskedPhone && !user;

  const imageUrls = Array.isArray(item?.images)
    ? item.images
        .map((img) => (img?.url == null ? "" : String(img.url).trim()))
        .filter(Boolean)
    : [];
  const safeImageUrls = imageUrls.length
    ? imageUrls
    : selectedImageUrl
      ? [selectedImageUrl]
      : [];
  const selectedIndex = Math.max(
    0,
    safeImageUrls.findIndex((u) => u === selectedImageUrl)
  );

  const goToIndex = (idx) => {
    const len = safeImageUrls.length;
    if (!len) return;
    const next = ((idx % len) + len) % len;
    setPreviewIndex(next);
    setSelectedImageUrl(safeImageUrls[next]);
  };
  const goPrev = () => goToIndex(previewIndex - 1);
  const goNext = () => goToIndex(previewIndex + 1);

  const handlePreviewPointerDown = (e) => {
    if (safeImageUrls.length <= 1) return;
    dragStartXRef.current = e.clientX;
  };
  const handlePreviewPointerUp = (e) => {
    if (safeImageUrls.length <= 1) return;
    const startX = dragStartXRef.current;
    dragStartXRef.current = null;
    if (startX == null) return;
    const dx = e.clientX - startX;
    const threshold = 50;
    if (dx > threshold) goPrev();
    if (dx < -threshold) goNext();
  };

  const rentOptions = [
    { key: "daily", label: "Daily", unit: "day", value: rentPrices?.daily },
    { key: "weekly", label: "Weekly", unit: "week", value: rentPrices?.weekly },
    { key: "monthly", label: "Monthly", unit: "month", value: rentPrices?.monthly },
  ].filter((o) => o.value != null);

  if (loading) return <LoadingScreen message="Loading item" />;
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
            className="relative w-full max-w-4xl h-[70vh] sm:h-[75vh] max-h-[85vh] overflow-hidden rounded-2xl bg-gray-100 shadow-2xl"
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
            {safeImageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="text-gray-900" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow"
                  aria-label="Next image"
                >
                  <ChevronRight className="text-gray-900" />
                </button>
              </>
            )}

            <div
              className="w-full h-full bg-gray-200 flex items-center justify-center"
              onPointerDown={handlePreviewPointerDown}
              onPointerUp={handlePreviewPointerUp}
              onPointerCancel={() => {
                dragStartXRef.current = null;
              }}
              onPointerLeave={() => {
                dragStartXRef.current = null;
              }}
            >
              <img
                src={safeImageUrls[previewIndex] || selectedImageUrl}
                alt={item.name}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>

            {safeImageUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow">
                {safeImageUrls.map((_, idx) => {
                  const active = idx === previewIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToIndex(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        active
                          ? "w-6 bg-gray-900"
                          : "w-2.5 bg-gray-400 hover:bg-gray-500"
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container px-4 py-12 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
          type="button"
        >
          <ArrowBack className="w-5 h-5" />
          Back
        </button>

        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-shrink-0 w-full md:w-1/2">
              <div className="relative w-full h-80 overflow-hidden bg-gray-100 rounded-2xl md:h-96">
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={item.name}
                    onClick={() => {
                      setPreviewIndex(selectedIndex);
                      setIsImagePreviewOpen(true);
                    }}
                    className="object-contain w-full h-full cursor-zoom-in"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {Array.isArray(item?.images) && item.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto">
                  {item.images
                    .map((img) => (img?.url == null ? '' : String(img.url).trim()))
                    .filter(Boolean)
                    .map((url, idx) => (
                      <button
                        key={url || idx}
                        type="button"
                        onClick={() => {
                          setSelectedImageUrl(url);
                          setPreviewIndex(idx);
                        }}
                        className={`w-20 h-20 overflow-hidden bg-white border rounded-xl transition-colors ${
                          url === selectedImageUrl
                            ? "border-gray-800"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={url}
                          alt="thumb"
                          className="object-contain w-full h-full"
                        />
                      </button>
                    ))}
                </div>
              )}
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
                    <div
                      className={
                        shouldShowPhoneLoginHint
                          ? "relative inline-block cursor-pointer select-none group"
                          : ""
                      }
                    >
                      <span
                        className={
                          shouldShowPhoneLoginHint
                            ? "font-semibold text-gray-800"
                            : ""
                        }
                        tabIndex={shouldShowPhoneLoginHint ? 0 : undefined}
                        aria-label={
                          shouldShowPhoneLoginHint
                            ? "Login to view full phone number"
                            : "Contact number"
                        }
                      >
                        {item.mobileNumber}
                      </span>
                      {shouldShowPhoneLoginHint && (
                        <div className="absolute left-0 z-20 pt-3 top-full pointer-events-none opacity-0 translate-y-1 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100">
                          <div className="relative w-[240px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg pointer-events-auto">
                            <div className="absolute w-3 h-3 rotate-45 bg-white border border-gray-200 -top-1.5 left-6" />
                            <div className="text-xs font-semibold text-gray-900">
                              Login required
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                              Login to view the contact number.
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate("/login")}
                              className="inline-flex items-center justify-center px-3 py-2 mt-3 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Login
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
                        <span className="font-medium text-gray-700">
                          {formatDetailLabel(key)}
                        </span>
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
                  {chatLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 rounded-full border-white/60 border-t-white animate-spin" />
                      Please wait
                    </span>
                  ) : (
                    'Chat with Owner'
                  )}
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
