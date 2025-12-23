import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Person, Lock, Notifications } from "@mui/icons-material";
import { Link } from "react-router-dom";
import categoryService from "../services/categoryService";
import userService from "../services/userService";
import { useCity } from "../hooks/useCity";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const { city, setCity } = useCity();
  const [profileImage, setProfileImage] = useState(
    user?.profileImage?.url || ""
  );
  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [preferences, setPreferences] = useState(
    user?.preferences || {
      notifications: { email: true, sms: true, push: true },
      language: "en",
    }
  );
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState("");
  const [prefError, setPrefError] = useState("");

  React.useEffect(() => {
    categoryService.getCities().then((res) => {
      const next = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setCities(next);
    });
  }, []);

  const SideNavItem = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition ${
        activeTab === tabName
          ? "bg-gray-800 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };
  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await userService.updateProfile({ name, address: { city } });
      setSuccessMsg("Profile updated successfully!");
    } catch {
      setErrorMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };
  const handlePrefChange = (type, value) => {
    setPreferences((prev) => ({ ...prev, [type]: value }));
  };
  const handleNotifChange = (notif, value) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [notif]: value },
    }));
  };
  const handleSavePreferences = async () => {
    setPrefSaving(true);
    setPrefSuccess("");
    setPrefError("");
    try {
      await userService.updateProfile({ preferences });
      setPrefSuccess("Preferences updated successfully!");
    } catch {
      setPrefError("Failed to update preferences.");
    } finally {
      setPrefSaving(false);
    }
  };

  const ProfileSettings = () => (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Profile Settings
      </h2>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            autoCapitalize="words"
            value={name}
            onChange={(e) => {
              const next = e.target.value;
              setName((prev) => {
                if (!prev && next) {
                  return next.charAt(0).toUpperCase() + next.slice(1);
                }
                return next;
              });
            }}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-700"
          >
            Profile Image
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1"
          />
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile Preview"
              className="object-cover w-24 h-24 mt-2 rounded-full"
            />
          )}
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="">Select City</option>
            {(Array.isArray(cities) ? cities : []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {successMsg && (
          <div className="text-sm text-green-600">{successMsg}</div>
        )}
        {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );

  const PasswordSettings = () => (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Change Password</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="current-password">Current Password</label>
          <input
            type="password"
            id="current-password"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            type="password"
            id="confirm-password"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button className="px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900">
          Update Password
        </button>
        <div className="mt-4">
          <Link
            to="/reset-password"
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot your password? Reset here
          </Link>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Notifications</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Email notifications for new messages</span>
          <input type="checkbox" className="toggle-checkbox" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span>Email notifications for booking requests</span>
          <input type="checkbox" className="toggle-checkbox" defaultChecked />
        </div>
      </div>
    </div>
  );

  const PreferencesSettings = () => (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Preferences</h2>
      <div className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Notifications
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) => handleNotifChange("email", e.target.checked)}
              />{" "}
              Email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.sms}
                onChange={(e) => handleNotifChange("sms", e.target.checked)}
              />{" "}
              SMS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.push}
                onChange={(e) => handleNotifChange("push", e.target.checked)}
              />{" "}
              Push
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => handlePrefChange("language", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
        </div>
        {prefSuccess && (
          <div className="text-sm text-green-600">{prefSuccess}</div>
        )}
        {prefError && <div className="text-sm text-red-600">{prefError}</div>}
        <button
          onClick={handleSavePreferences}
          disabled={prefSaving}
          className="px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900"
        >
          {prefSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Settings</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <aside className="md:col-span-1">
            <div className="p-4 space-y-2 bg-white shadow-lg rounded-2xl">
              <SideNavItem
                tabName="profile"
                label="Profile"
                icon={<Person />}
              />
              <SideNavItem
                tabName="password"
                label="Password"
                icon={<Lock />}
              />
              <SideNavItem
                tabName="notifications"
                label="Notifications"
                icon={<Notifications />}
              />
              <SideNavItem
                tabName="preferences"
                label="Preferences"
                icon={<Notifications />}
              />
            </div>
          </aside>
          <main className="md:col-span-3">
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "password" && <PasswordSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
              {activeTab === "preferences" && <PreferencesSettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
