import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import ReviewList from '../components/reviews/ReviewList';
import LoadingScreen from '../components/common/LoadingScreen';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  PhotoLibrary as PhotoLibraryIcon,
  PhotoCamera as PhotoCameraIcon,
  DeleteOutline as DeleteOutlineIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  Star,
  Person
} from '@mui/icons-material';
import { format } from 'date-fns';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('about');
  const [profileViews, setProfileViews] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cropAreaRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 50, cropY: 50 });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarStep, setAvatarStep] = useState('menu');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cropZoom, setCropZoom] = useState(1.2);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  
  const normalizePhone10 = (value) => {
    if (value == null) return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length > 10) return digits.slice(-10);
    return digits;
  };

  const decodeJwtPayload = (token) => {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const getPhoneFromToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const payload = decodeJwtPayload(token);
    const raw = payload?.sub ?? payload?.subject ?? payload?.phone ?? payload?.phoneNo ?? payload?.mobilenumber;
    const str = raw == null ? '' : String(raw);
    if (str.includes('@')) return '';
    return normalizePhone10(str);
  };

  const currentPhone =
    currentUser?.phone ||
    currentUser?.mobilenumber ||
    currentUser?.mobileNumber ||
    currentUser?.phoneNo ||
    '';

  const tokenPhone = React.useMemo(() => getPhoneFromToken(), []);
  const requestedPhone = React.useMemo(
    () => normalizePhone10(id || currentPhone || tokenPhone),
    [id, currentPhone, tokenPhone]
  );
  const isOwnProfile = !id || normalizePhone10(id) === normalizePhone10(currentPhone);

  const shouldFetchProfile =
    !requestedPhone ||
    !isOwnProfile ||
    !currentUser ||
    normalizePhone10(currentPhone) !== requestedPhone ||
    (!currentUser?.name && !currentUser?.email);

  const {
    data: profileData,
    isLoading: profileLoading,
    isFetching: profileFetching,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useQuery(
    ['profileByPhone', requestedPhone],
    () => userService.getByPhoneNumber(requestedPhone),
    { enabled: !!requestedPhone && shouldFetchProfile, retry: 0 }
  );

  const effectiveProfileData = profileData ?? (isOwnProfile ? { data: currentUser } : null);
  const userDto = effectiveProfileData?.data ?? effectiveProfileData?.user ?? effectiveProfileData;

  const normalizedAddress = (() => {
    const a = userDto?.address;
    if (typeof a === 'string') {
      return { street: a, city: '' };
    }
    if (a && typeof a === 'object') {
      return a;
    }
    return { street: '', city: '' };
  })();

  const user = {
    ...userDto,
    _id: userDto?.user_id ?? userDto?._id,
    name: userDto?.name || 'User',
    email: userDto?.email || '',
    phone: userDto?.mobilenumber || userDto?.phone || requestedPhone,
    mobilenumber: userDto?.mobilenumber || userDto?.phone || requestedPhone,
    createdAt: userDto?.createdAt || userDto?.created_on || userDto?.createdDate || new Date().toISOString(),
    profileImage: userDto?.imageUrls ? { url: userDto.imageUrls } : userDto?.profileImage,
    address: normalizedAddress,
    verification: userDto?.verification || {
      identity: false,
      email: !!userDto?.email,
      phone: !!(userDto?.mobilenumber || requestedPhone),
    },
    rating: userDto?.rating || {
      asOwner: { average: 0, count: 0 },
      asRenter: { average: 0, count: 0 },
    },
  };

  const memberSinceText = (() => {
    const d = new Date(user?.createdAt);
    if (!Number.isFinite(d.getTime())) return '';
    try {
      return format(d, 'MMMM yyyy');
    } catch {
      return '';
    }
  })();

  const avatarText = (() => {
    const n = (user?.name || '').trim();
    if (n) {
      const parts = n.split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0] || '';
      const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
      const txt = `${first}${second}`.toUpperCase();
      return txt || 'U';
    }
    const p = (user?.phone || user?.mobilenumber || '').trim();
    if (p) return p.slice(-2);
    return 'U';
  })();

  const stats = profileData?.stats || {
    activeItems: 0,
    totalTransactions: 0,
  };

  const { data: userItems, isLoading: itemsLoading, isFetching: itemsFetching } = useQuery(
    ['userItemsByPhone', requestedPhone],
    () => itemService.getProductsByMobileNumber(requestedPhone),
    { enabled: !!requestedPhone, staleTime: 5 * 60 * 1000 }
  );

  const activeListingsCount = Array.isArray(userItems?.items) ? userItems.items.length : 0;
  const listingsLoading = tab === 'listings' && (itemsLoading || itemsFetching);

  const reviews = [];
  const reviewsLoading = false;

  React.useEffect(() => {
    setProfileViews(0);
  }, []);

  if (profileLoading && !profileData) return <LoadingScreen message="Loading profile" />;
  if (profileError) {
    return (
      <div>
        Failed to load profile
        {profileErrorObj?.message ? `: ${profileErrorObj.message}` : ''}
      </div>
    );
  }
  if (!requestedPhone) return <div>User not found</div>;
  if (effectiveProfileData == null || (typeof effectiveProfileData === 'string' && effectiveProfileData.trim() === '')) {
    return <div>Empty response from backend</div>;
  }
  if (!userDto) {
    return (
      <div>
        Could not parse user details from backend response
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(effectiveProfileData, null, 2)}</pre>
      </div>
    );
  }

  const StatItem = ({ value, label }) => (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );

  const getUpsertPayload = () => {
    const mobile = normalizePhone10(user?.mobilenumber || user?.phone || requestedPhone);
    return {
      name: user?.name || '',
      email: user?.email || '',
      mobile_number: mobile,
      facebook_id: user?.facebook_id ?? null,
    };
  };

  const stopCamera = () => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const resetAvatarFlow = () => {
    stopCamera();
    setAvatarModalOpen(false);
    setAvatarStep('menu');
    setSelectedAvatarFile(null);
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    setSelectedAvatarUrl('');
    setCameraError('');
    setCropZoom(1.2);
    setCropX(50);
    setCropY(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const openAvatarModal = () => {
    if (!isOwnProfile) return;
    setAvatarModalOpen(true);
    setAvatarStep('menu');
  };

  const chooseAvatarFromComputer = () => {
    fileInputRef.current?.click();
  };

  const captureAvatarPhoto = () => {
    if (!isOwnProfile) return;
    setCameraError('');
    const hasMedia = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    if (!hasMedia) {
      cameraInputRef.current?.click();
      return;
    }
    setAvatarStep('camera');
    (async () => {
      try {
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setCameraError(e?.message || 'Failed to access camera');
      }
    })();
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.videoWidth || !video.videoHeight) return;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const s = Math.min(vw, vh);
    const sx = Math.max(0, (vw - s) / 2);
    const sy = Math.max(0, (vh - s) / 2);
    ctx.drawImage(video, sx, sy, s, s, 0, 0, size, size);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return;

    const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: blob.type });
    const objectUrl = URL.createObjectURL(file);
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    setSelectedAvatarFile(file);
    setSelectedAvatarUrl(objectUrl);
    stopCamera();
    setAvatarStep('preview');
  };

  const retakeCameraPhoto = () => {
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    setSelectedAvatarFile(null);
    setSelectedAvatarUrl('');
    captureAvatarPhoto();
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (selectedAvatarUrl) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    setSelectedAvatarFile(file);
    setSelectedAvatarUrl(objectUrl);
    setAvatarStep('preview');
  };

  const createCroppedSquareBlob = async (imageUrl, zoom, posX, posY) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    const coverScale = Math.max(size / img.width, size / img.height);
    const scale = coverScale * zoom;
    const dispW = img.width * scale;
    const dispH = img.height * scale;

    const offsetX = (size - dispW) * (posX / 100);
    const offsetY = (size - dispH) * (posY / 100);

    const sx = Math.max(0, Math.min(img.width - size / scale, (-offsetX) / scale));
    const sy = Math.max(0, Math.min(img.height - size / scale, (-offsetY) / scale));
    const sSize = size / scale;

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) throw new Error('Failed to create image');
    return blob;
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const onCropPointerDown = (e) => {
    if (!selectedAvatarUrl) return;
    setIsDraggingCrop(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, cropX, cropY };
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onCropPointerMove = (e) => {
    if (!isDraggingCrop) return;
    const el = cropAreaRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const dxPct = (dx / rect.width) * (100 / cropZoom);
    const dyPct = (dy / rect.height) * (100 / cropZoom);

    setCropX(clamp(dragStartRef.current.cropX + dxPct, 0, 100));
    setCropY(clamp(dragStartRef.current.cropY + dyPct, 0, 100));
  };

  const onCropPointerUp = (e) => {
    setIsDraggingCrop(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const saveAvatar = async () => {
    if (!selectedAvatarFile || !selectedAvatarUrl) return;
    setUploadingAvatar(true);
    try {
      const blob = await createCroppedSquareBlob(selectedAvatarUrl, cropZoom, cropX, cropY);
      const croppedFile = new File([blob], selectedAvatarFile.name || 'avatar.jpg', { type: blob.type });
      await userService.upsertUserWithImage(getUpsertPayload(), croppedFile);
      await refetchProfile();
      resetAvatarFlow();
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await userService.upsertUserWithImage({ ...getUpsertPayload(), remove_image: true }, null);
      await refetchProfile();
      resetAvatarFlow();
    } finally {
      setUploadingAvatar(false);
    }
  };

  const TabButton = ({ currentTab, tabName, children }) => (
    <button
      onClick={() => setTab(tabName)}
      className={`px-4 py-2 font-semibold transition border-b-2 ${
        currentTab === tabName
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  const SideNavButton = ({ tabName, title }) => {
    const active = tab === tabName;
    return (
      <button
        type="button"
        onClick={() => setTab(tabName)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition ${
          active
            ? 'bg-gray-900 text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{title}</span>
        <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-400'}`}>›</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-10 mx-auto">
        {/* Profile Header */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl lg:sticky lg:top-24">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      style={{ display: 'none' }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleAvatarFileChange}
                      style={{ display: 'none' }}
                    />

                    {user?.profileImage?.url ? (
                      <div className="relative inline-block">
                        <img
                          src={user.profileImage.url}
                          alt={user.name}
                          className="object-cover w-16 h-16 rounded-2xl ring-2 ring-gray-100"
                        />
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={openAvatarModal}
                            disabled={uploadingAvatar}
                            className="absolute -bottom-2 -right-2 flex items-center justify-center w-8 h-8 text-white bg-gray-900 border-2 border-white rounded-full shadow hover:bg-black disabled:opacity-60"
                            aria-label="Edit profile picture"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <div className="flex items-center justify-center w-16 h-16 text-lg font-bold text-gray-700 bg-gray-200 rounded-2xl ring-2 ring-gray-100">
                          {avatarText}
                        </div>
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={openAvatarModal}
                            disabled={uploadingAvatar}
                            className="absolute -bottom-2 -right-2 flex items-center justify-center w-8 h-8 text-white bg-gray-900 border-2 border-white rounded-full shadow hover:bg-black disabled:opacity-60"
                            aria-label="Add profile picture"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-bold text-gray-900 truncate">{user.name}</div>
                      {user.verification.identity && <VerifiedIcon className="text-gray-400" />}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      {user.email || user.phone || ''}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!!user.address?.city && (
                        <div className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                          <LocationIcon fontSize="inherit" className="mr-1" />
                          {user.address.city}
                        </div>
                      )}
                      <div className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                        <CalendarIcon fontSize="inherit" className="mr-1" />
                        Member since {memberSinceText || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  {isOwnProfile ? (
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full px-5 py-2.5 text-sm font-semibold text-white transition bg-gray-900 rounded-xl shadow-sm hover:bg-black"
                    >
                      <EditIcon fontSize="small" className="mr-2" />Edit Profile
                    </button>
                  ) : (
                    <button className="w-full px-5 py-2.5 text-sm font-semibold text-white transition bg-gray-900 rounded-xl shadow-sm hover:bg-black">
                      <PhoneIcon fontSize="small" className="mr-2" />Contact
                    </button>
                  )}
                </div>

                {(user.verification.email || user.verification.phone) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.verification.email && (
                      <div className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                        Email Verified
                      </div>
                    )}
                    {user.verification.phone && (
                      <div className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                        Phone Verified
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/40">
                    <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Listings</div>
                    <div className="mt-1 text-xl font-bold text-gray-900">{activeListingsCount}</div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/40">
                    <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Rentals</div>
                    <div className="mt-1 text-xl font-bold text-gray-900">{stats.totalTransactions || 0}</div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/40">
                    <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Owner</div>
                    <div className="mt-1 text-xl font-bold text-gray-900">
                      {(user?.rating?.asOwner?.count || 0) > 0
                        ? Number(user?.rating?.asOwner?.average || 0).toFixed(1)
                        : '—'}
                    </div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/40">
                    <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Renter</div>
                    <div className="mt-1 text-xl font-bold text-gray-900">
                      {(user?.rating?.asRenter?.count || 0) > 0
                        ? Number(user?.rating?.asRenter?.average || 0).toFixed(1)
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-4 pb-6 border-t border-gray-100">
                <div className="pt-5 space-y-2">
                  {isOwnProfile && <SideNavButton tabName="about" title="Personal Information" />}
                  <SideNavButton tabName="listings" title="My Listings" />
                  <SideNavButton tabName="reviews" title="Reviews" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            {/* Tab Content */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
              {tab === 'listings' && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-gray-900">My Listings</div>
                      <div className="mt-1 text-sm text-gray-600">Manage your active listings</div>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('/add-item')}
                        className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-black"
                      >
                        List an Item
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    {listingsLoading ? (
                      <LoadingScreen message="Loading listings" />
                    ) : userItems?.items?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {userItems.items.map(item => <ItemCard item={item} key={item._id} />)}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-gray-50 border border-gray-100 rounded-2xl">
                        <p className="mb-4 text-gray-600">No active listings found.</p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate('/add-item')}
                            className="px-6 py-2 font-semibold text-white bg-gray-900 rounded-xl hover:bg-black"
                          >
                            List an Item
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'reviews' && (
                <>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Reviews</div>
                    <div className="mt-1 text-sm text-gray-600">What others say about you</div>
                  </div>
                  <div className="mt-6">
                    {reviewsLoading ? (
                      <LoadingScreen message="Loading reviews" />
                    ) : (
                      <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                        <ReviewList reviews={reviews} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'about' && isOwnProfile && (
                <>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Personal Information</div>
                    <div className="mt-1 text-sm text-gray-600">Your profile details</div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40">
                      <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Full name</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">{user.name || '—'}</div>
                    </div>

                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Email</div>
                        {user.verification.email && (
                          <div className="px-2 py-0.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-full">
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900 break-words">{user.email || '—'}</div>
                    </div>

                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Phone</div>
                        {user.verification.phone && (
                          <div className="px-2 py-0.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-full">
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">{user.phone || '—'}</div>
                    </div>

                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40">
                      <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Address</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900 break-words">
                        {user.address?.street
                          ? `${user.address.street}${user.address?.city ? `, ${user.address.city}` : ''}`
                          : (user.address?.city ? user.address.city : '—')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => navigate('/settings')}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-black"
                    >
                      Edit in Settings
                    </button>
                  </div>
                </>
              )}

              {!isOwnProfile && tab === 'about' && (
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div className="text-lg font-bold text-gray-900">Profile</div>
                  <div className="mt-1 text-sm text-gray-600">This profile is read-only.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {avatarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          onClick={resetAvatarFlow}
          role="presentation"
        >
          <div
            className="w-full max-w-sm overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Profile photo"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50">
              <div>
                <div className="text-sm font-bold text-gray-900">Profile photo</div>
                <div className="mt-0.5 text-xs text-gray-600">Update your photo so people recognize you.</div>
              </div>
              <button
                type="button"
                onClick={resetAvatarFlow}
                className="inline-flex items-center justify-center w-8 h-8 text-gray-600 transition bg-white border border-gray-200 rounded-xl hover:text-gray-900 hover:bg-gray-50"
                disabled={uploadingAvatar}
                aria-label="Close"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {user?.profileImage?.url ? (
                  <img
                    src={user.profileImage.url}
                    alt={user.name}
                    className="object-cover w-12 h-12 border border-gray-200 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 text-base font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                    {avatarText}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-600 truncate">{user.phone}</div>
                </div>
              </div>
            </div>

            {avatarStep === 'menu' && (
              <div className="p-4 space-y-3">
                <button
                  type="button"
                  onClick={chooseAvatarFromComputer}
                  className="flex items-center justify-between w-full px-4 py-3 transition border border-gray-200 group rounded-2xl hover:bg-gray-50"
                  disabled={uploadingAvatar}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 text-gray-700 bg-gray-100 border border-gray-200 rounded-xl">
                      <PhotoLibraryIcon fontSize="small" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">Choose from computer</div>
                      <div className="text-xs text-gray-600">Upload a JPG/PNG image</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-500">›</div>
                </button>

                <button
                  type="button"
                  onClick={captureAvatarPhoto}
                  className="flex items-center justify-between w-full px-4 py-3 transition border border-gray-200 group rounded-2xl hover:bg-gray-50"
                  disabled={uploadingAvatar}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 text-gray-700 bg-gray-100 border border-gray-200 rounded-xl">
                      <PhotoCameraIcon fontSize="small" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">Capture photo</div>
                      <div className="text-xs text-gray-600">Use your camera</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-500">›</div>
                </button>

                <button
                  type="button"
                  onClick={removeAvatar}
                  className="flex items-center justify-between w-full px-4 py-3 transition border border-red-200 group rounded-2xl hover:bg-red-50"
                  disabled={uploadingAvatar}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 text-red-700 bg-red-100 border border-red-200 rounded-xl">
                      <DeleteOutlineIcon fontSize="small" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-red-700">Remove photo</div>
                      <div className="text-xs text-red-600">Use initials instead</div>
                    </div>
                  </div>
                  <div className="text-sm text-red-400 group-hover:text-red-500">›</div>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetAvatarFlow}
                    className="w-full px-4 py-2 font-semibold text-gray-700 transition bg-white border border-gray-200 rounded-2xl hover:bg-gray-50"
                    disabled={uploadingAvatar}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {avatarStep === 'camera' && (
              <div className="p-5">
                {cameraError ? (
                  <div className="p-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
                    {cameraError}
                  </div>
                ) : (
                  <div className="overflow-hidden bg-black rounded-2xl">
                    <video ref={videoRef} className="w-full h-48 object-cover" playsInline />
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setAvatarStep('menu');
                    }}
                    className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                    disabled={uploadingAvatar}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    className="px-4 py-2.5 font-semibold text-white bg-gray-900 rounded-xl hover:bg-black disabled:opacity-60"
                    disabled={uploadingAvatar || !!cameraError}
                  >
                    Capture
                  </button>
                </div>
              </div>
            )}

            {avatarStep === 'preview' && (
              <div className="p-5">
                <div className="flex items-center justify-center">
                  <div
                    ref={cropAreaRef}
                    role="button"
                    tabIndex={0}
                    onPointerDown={onCropPointerDown}
                    onPointerMove={onCropPointerMove}
                    onPointerUp={onCropPointerUp}
                    onPointerCancel={onCropPointerUp}
                    className={`relative w-56 h-56 overflow-hidden bg-gray-100 rounded-2xl select-none touch-none ${isDraggingCrop ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{
                      backgroundImage: `url(${selectedAvatarUrl})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: `${cropX}% ${cropY}%`,
                      backgroundSize: `${cropZoom * 100}%`,
                    }}
                  >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <mask id="rm_avatar_mask">
                          <rect x="0" y="0" width="100" height="100" fill="white" />
                          <circle cx="50" cy="50" r="34" fill="black" />
                        </mask>
                      </defs>
                      <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.45)" mask="url(#rm_avatar_mask)" />
                      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="0.8" />
                    </svg>
                    <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-sm pointer-events-none" />
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                      <span>Zoom</span>
                      <span>{cropZoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={cropZoom}
                      onChange={(e) => setCropZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="text-xs text-gray-600">Drag the photo to reposition inside the frame.</div>
                </div>

                <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setAvatarStep('menu')}
                    className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                    disabled={uploadingAvatar}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={retakeCameraPhoto}
                    className="px-4 py-2.5 font-semibold text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50"
                    disabled={uploadingAvatar}
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="px-4 py-2.5 font-semibold text-red-700 border border-red-200 rounded-xl hover:bg-red-50"
                    disabled={uploadingAvatar}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={saveAvatar}
                    className="px-4 py-2.5 font-semibold text-white bg-gray-900 rounded-xl hover:bg-black disabled:opacity-60"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
