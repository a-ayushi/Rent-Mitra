import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useAuth } from "../hooks/useAuth";
import userService from "../services/userService";
import itemService from "../services/itemService";
import {
  ShoppingBag as ShoppingBagIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const StatCard = ({ title, value, icon, color, link }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(link)}
      className="flex items-center gap-4 p-6 transition-shadow duration-300 bg-white shadow-lg cursor-pointer rounded-2xl hover:shadow-xl"
    >
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const mobileNumber = user?.phone || user?.mobilenumber || user?.mobileNumber || "";

  const { data: ownedProductsData } = useQuery(
    ["ownedProducts", mobileNumber],
    () =>
      mobileNumber
        ? itemService.getProductsByMobileNumber(mobileNumber)
        : itemService.getMyOwnedProducts()
  );

  const ownedProductsCount = Array.isArray(ownedProductsData?.items)
    ? ownedProductsData.items.length
    : 0;

  const { data: dashboardData, isLoading } = useQuery("dashboard", () =>
    userService.getDashboard()
  );

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }

  const stats = [
    { title: "Active Listings", value: dashboardData?.stats?.activeListings || 0, icon: <ShoppingBagIcon className="text-white"/>, color: "bg-gray-500", link: "/my-listings" },
    { title: "Pending Requests", value: dashboardData?.stats?.pendingRequests || 0, icon: <NotificationsIcon className="text-white"/>, color: "bg-yellow-500", link: "/my-rentals" },
    { title: "Active Rentals", value: ownedProductsCount, icon: <PeopleIcon className="text-white"/>, color: "bg-green-500", link: "/my-rentals" },
    { title: "Recent Earnings", value: `₹${dashboardData?.stats?.recentEarnings || 0}`, icon: <MoneyIcon className="text-white"/>, color: "bg-purple-500", link: "/earnings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-gray-600">Here's your rental dashboard overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Earnings Chart */}
          <div className="p-6 bg-white shadow-lg lg:col-span-2 rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">Earnings Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.earningsTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.month" tickFormatter={(val) => format(new Date(2024, val - 1), "MMM")} />
                  <YAxis />
                  <Tooltip formatter={(val) => `₹${val}`} />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 bg-white shadow-lg rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate("/add-item")} className="w-full p-3 text-left text-white transition bg-gray-500 rounded-lg hover:bg-gray-600">List New Item</button>
              <button onClick={() => navigate("/my-listings")} className="w-full p-3 text-left text-gray-800 transition bg-gray-200 rounded-lg hover:bg-gray-300">Manage Listings</button>
              <button onClick={() => navigate("/my-rentals")} className="w-full p-3 text-left text-gray-800 transition bg-gray-200 rounded-lg hover:bg-gray-300">View Rentals</button>
              <button onClick={() => navigate("/profile")} className="w-full p-3 text-left text-gray-800 transition bg-gray-200 rounded-lg hover:bg-gray-300">Edit Profile</button>
            </div>
          </div>
        </div>

        {/* Upcoming Rentals */}
        <div className="p-6 mt-8 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Rentals</h2>
            <button onClick={() => navigate("/my-rentals")} className="text-sm font-medium text-gray-600 hover:text-gray-800">View All</button>
          </div>
          {dashboardData?.upcomingRentals?.length > 0 ? (
            <ul className="space-y-4">
              {dashboardData.upcomingRentals.map((rental) => (
                <li key={rental._id} onClick={() => navigate(`/rentals/${rental._id}`)} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <img src={rental.item.images[0]?.url} alt={rental.item.title} className="object-cover w-20 h-20 rounded-lg"/>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{rental.item.title}</p>
                    <p className="text-sm text-gray-500">{format(new Date(rental.rentalPeriod.from), "MMM dd")} - {format(new Date(rental.rentalPeriod.to), "MMM dd, yyyy")}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{rental.status}</span>
                    <p className="text-lg font-bold">₹{rental.pricing.total}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-gray-500">No upcoming rentals.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
