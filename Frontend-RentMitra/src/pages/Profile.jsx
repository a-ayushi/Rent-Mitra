import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import ReviewList from '../components/reviews/ReviewList';
import {
  Edit as EditIcon,
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
  const [tab, setTab] = useState('listings');
  const [profileViews, setProfileViews] = useState(0);
  
  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  const { data: profileData, isLoading: profileLoading } = useQuery(
    ['profile', userId],
    () => userService.getProfile(userId),
    { enabled: !!userId }
  );

  const { data: userItems, isLoading: itemsLoading } = useQuery(
    ['userItems', userId],
    () => itemService.getUserItems(userId, { status: 'active' }),
    { enabled: !!userId && tab === 'listings' }
  );

  const { data: reviews, isLoading: reviewsLoading } = useQuery(
    ['userReviews', userId],
    () => userService.getReviews(userId),
    { enabled: !!userId && tab === 'reviews' }
  );

  React.useEffect(() => {
    if (!isOwnProfile && userId) {
      userService.incrementProfileViews(userId).then(res => {
        if (res.data && typeof res.data.profileViews === 'number') {
          setProfileViews(res.data.profileViews);
        }
      });
    } else if (profileData?.user?.profileViews) {
      setProfileViews(profileData.user.profileViews);
    }
  }, [isOwnProfile, userId, profileData]);

  if (profileLoading) return <div>Loading...</div>;
  if (!profileData?.user) return <div>User not found</div>;

  const { user, stats } = profileData;

  const StatItem = ({ value, label }) => (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );

  const TabButton = ({ currentTab, tabName, children }) => (
    <button
      onClick={() => setTab(tabName)}
      className={`px-4 py-2 font-semibold rounded-lg transition ${
        currentTab === tabName
          ? 'bg-gray-800 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        {/* Profile Header */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-2xl">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <img src={user.profileImage?.url || `https://i.pravatar.cc/150?u=${user._id}`} alt={user.name} className="object-cover w-32 h-32 rounded-full ring-4 ring-gray-200"/>
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center mb-2 md:justify-start">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                {user.verification.identity && <VerifiedIcon className="ml-2 text-gray-500" />}
              </div>
              <div className="flex flex-wrap justify-center mb-4 text-gray-600 gap-x-4 gap-y-2 md:justify-start">
                <span className="flex items-center"><LocationIcon fontSize="small" className="mr-1"/> {user.address?.city || 'Earth'}</span>
                <span className="flex items-center"><CalendarIcon fontSize="small" className="mr-1"/> Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                <span className="flex items-center"><Person fontSize="small" className="mr-1"/> {profileViews} profile views</span>
              </div>
              <div className="flex justify-center gap-2 md:justify-start">
                {user.verification.email && <div className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">Email Verified</div>}
                {user.verification.phone && <div className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">Phone Verified</div>}
              </div>
            </div>
            <div className="flex-shrink-0">
              {isOwnProfile ? (
                <button onClick={() => navigate('/settings')} className="px-6 py-2 font-semibold text-white transition bg-gray-800 rounded-lg shadow-md hover:bg-gray-900">
                  <EditIcon fontSize="small" className="mr-2"/>Edit Profile
                </button>
              ) : (
                <button className="px-6 py-2 font-semibold text-white transition bg-gray-800 rounded-lg shadow-md hover:bg-gray-900">
                  <PhoneIcon fontSize="small" className="mr-2"/>Contact
                </button>
              )}
            </div>
          </div>
          <hr className="my-8" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatItem value={stats.activeItems || 0} label="Active Listings" />
            <StatItem value={stats.totalTransactions || 0} label="Total Rentals" />
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Star className="mr-1 text-yellow-400"/>
                <p className="text-2xl font-bold text-gray-800">{user.rating.asOwner.average.toFixed(1)}</p>
              </div>
              <p className="text-sm text-gray-500">Owner Rating ({user.rating.asOwner.count})</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Star className="mr-1 text-yellow-400"/>
                <p className="text-2xl font-bold text-gray-800">{user.rating.asRenter.average.toFixed(1)}</p>
              </div>
              <p className="text-sm text-gray-500">Renter Rating ({user.rating.asRenter.count})</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex p-2 space-x-2 bg-white shadow-md rounded-xl">
            <TabButton currentTab={tab} tabName="listings">Listings</TabButton>
            <TabButton currentTab={tab} tabName="reviews">Reviews</TabButton>
            {isOwnProfile && <TabButton currentTab={tab} tabName="about">About</TabButton>}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {tab === 'listings' && (
            itemsLoading ? <div>Loading listings...</div> :
            userItems?.items?.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userItems.items.map(item => <ItemCard item={item} key={item._id} />)}
              </div>
            ) : (
              <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
                <p className="mb-4 text-gray-600">No active listings found.</p>
                {isOwnProfile && <button onClick={() => navigate('/add-item')} className="px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg">List an Item</button>}
              </div>
            )
          )}
          {tab === 'reviews' && (
            reviewsLoading ? <div>Loading reviews...</div> :
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <ReviewList reviews={reviews?.reviews} />
            </div>
          )}
          {tab === 'about' && isOwnProfile && (
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <h2 className="mb-6 text-2xl font-bold">About Me</h2>
              <div className="space-y-4">
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Phone:</strong> {user.phone}</div>
                <div><strong>Address:</strong> {user.address?.street ? `${user.address.street}, ${user.address.city}` : 'Not provided'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
