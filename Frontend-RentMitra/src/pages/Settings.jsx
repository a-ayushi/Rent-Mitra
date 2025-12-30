import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Person, Lock, Notifications, PhotoLibrary, PhotoCamera, DeleteOutline } from "@mui/icons-material";
import { Link } from "react-router-dom";
import userService from "../services/userService";

const SideNavItem = ({ activeTab, setActiveTab, tabName, label, icon }) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition border ${
      activeTab === tabName
        ? "bg-gray-900 text-white border-gray-900"
        : "text-gray-700 hover:bg-gray-50 border-transparent"
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const ProfileSettings = ({
  name,
  setName,
  phone,
  setPhone,
  address,
  setAddress,
  handleSave,
  saving,
  successMsg,
  errorMsg,
}) => (
  <div>
    <h2 className="mb-6 text-2xl font-bold text-gray-800">Profile Settings</h2>
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
      </div>

      <div className="w-full sm:w-[calc(50%-0.75rem)]">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
        />
      </div>

      {successMsg && <div className="text-sm text-green-600">{successMsg}</div>}
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
          className="block w-full sm:max-w-xs px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="new-password">New Password</label>
        <input
          type="password"
          id="new-password"
          className="block w-full sm:max-w-xs px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="confirm-password">Confirm New Password</label>
        <input
          type="password"
          id="confirm-password"
          className="block w-full sm:max-w-xs px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button className="px-6 py-2 font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900">
        Update Password
      </button>
      <div className="mt-4">
        <Link to="/reset-password" className="text-sm text-gray-600 hover:underline">
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

const PreferencesSettings = ({
  preferences,
  handlePrefChange,
  handleNotifChange,
  handleSavePreferences,
  prefSaving,
  prefSuccess,
  prefError,
}) => (
  <div>
    <h2 className="mb-6 text-2xl font-bold text-gray-800">Preferences</h2>
    <div className="space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Notifications</label>
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
        <label className="block mb-2 text-sm font-medium text-gray-700">Language</label>
        <select
          value={preferences.language}
          onChange={(e) => handlePrefChange("language", e.target.value)}
          className="block w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="bn">Bengali</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
        </select>
      </div>
      {prefSuccess && <div className="text-sm text-green-600">{prefSuccess}</div>}
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

const Settings = () => {
  const { user, refreshUserFromDb, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const avatarSrc = (() => {
    const direct = user?.avatarUrl || user?.profileImage?.url;
    if (direct) return direct;
    const raw = user?.imageUrls;
    if (typeof raw === 'string') {
      const first = raw.split(',')[0]?.trim();
      return first || undefined;
    }
    if (Array.isArray(raw)) {
      const first = raw[0] == null ? '' : String(raw[0]).trim();
      return first || undefined;
    }
    return undefined;
  })();

  const getPhoneFromUser = (u) =>
    u?.phone || u?.mobilenumber || u?.mobileNumber || u?.phoneNo || "";

  const getAddressFromUser = (u) => {
    const a = u?.address;
    if (typeof a === "string") return a;
    if (a && typeof a === "object") {
      return a.street || a.address || a.line1 || a.fullAddress || a.city || "";
    }
    return "";
  };

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(
    getPhoneFromUser(user)
  );
  const [address, setAddress] = useState(getAddressFromUser(user));
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

  const [hydrated, setHydrated] = useState(false);

  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [avatarActionsOpen, setAvatarActionsOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);

  React.useEffect(() => {
    if (hydrated) return;
    if (!user) return;
    setName((v) => (v ? v : (user?.name || "")));
    setPhone((v) => (v ? v : getPhoneFromUser(user)));
    setAddress((v) => (v ? v : getAddressFromUser(user)));
    setPreferences((prev) => {
      if (prev && prev !== user?.preferences) return prev;
      return (
        user?.preferences || {
          notifications: { email: true, sms: true, push: true },
          language: "en",
        }
      );
    });
    setHydrated(true);
  }, [hydrated, user]);

  const normalizePhone10 = (value) => {
    if (value == null) return "";
    const digits = String(value).replace(/\D/g, "");
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length > 10) return digits.slice(-10);
    return digits;
  };

  const getUpsertPayload = (extra = {}) => {
    const phone10 = normalizePhone10(phone || getPhoneFromUser(user));

    const currentUserId =
      user?.user_id ??
      user?._id ??
      user?.data?.user_id ??
      user?.data?._id ??
      null;

    return {
      user_id: currentUserId,
      name: name || user?.name || "",
      email: user?.email || "",
      mobile_number: phone10,
      facebook_id: user?.facebook_id ?? null,
      ...extra,
    };
  };

  const refreshUser = async () => {
    const nextPhone = normalizePhone10(phone || getPhoneFromUser(user));
    try {
      if (typeof refreshUserFromDb === 'function') {
        await refreshUserFromDb(nextPhone);
      }
    } catch {
      // ignore
    }
  };

  const onUploadNewClick = () => {
    setAvatarError("");
    fileInputRef.current?.click();
  };

  const openAvatarActions = () => {
    setAvatarError('');
    setAvatarActionsOpen(true);
  };

  const chooseAvatarFromComputer = () => {
    setAvatarActionsOpen(false);
    onUploadNewClick();
  };

  const captureAvatarPhoto = () => {
    setAvatarError('');
    setAvatarActionsOpen(false);
    cameraInputRef.current?.click();
  };

  const removeAvatarFromModal = async () => {
    setAvatarActionsOpen(false);
    await onDeleteAvatar();
  };

  const onAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    setAvatarError("");
    try {
      await userService.upsertUserWithImage(getUpsertPayload(), file);
      await refreshUser();
    } catch {
      setAvatarError("Failed to upload avatar");
    } finally {
      setAvatarBusy(false);
      try {
        e.target.value = '';
      } catch {
        // ignore
      }
    }
  };

  const onDeleteAvatar = async () => {
    setAvatarBusy(true);
    setAvatarError("");
    try {
      await userService.upsertUserWithImage(getUpsertPayload({ remove_image: true }), null);
      await refreshUser();
    } catch {
      setAvatarError("Failed to delete avatar");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const prevPhone10 = normalizePhone10(getPhoneFromUser(user));
      const nextPhone10 = normalizePhone10(phone || getPhoneFromUser(user));
      await userService.upsertUserWithImage(
        getUpsertPayload({ address: address || "" }),
        null
      );
      await refreshUser();
      setSuccessMsg("Profile updated successfully!");

      if (prevPhone10 && nextPhone10 && prevPhone10 !== nextPhone10) {
        try {
          await logout?.();
        } catch {
          // ignore
        }
        window.location.href = '/login';
      }
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-4 mx-auto">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden w-full max-w-4xl mx-auto">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Settings</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">Account settings</div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Internal Settings Menu */}
            <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-100 p-4">
              <div className="space-y-2">
                <SideNavItem
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabName="profile"
                  label="Profile Settings"
                  icon={<Person />}
                />
                <SideNavItem
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabName="password"
                  label="Password"
                  icon={<Lock />}
                />
                <SideNavItem
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabName="notifications"
                  label="Notifications"
                  icon={<Notifications />}
                />
                <SideNavItem
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabName="preferences"
                  label="Preferences"
                  icon={<Notifications />}
                />
              </div>
            </div>

            {/* Content Panel */}
            <div className="flex-1 p-6">
              {activeTab === "profile" && (
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center"
                      onClick={() => {
                        if (avatarSrc) setAvatarPreviewOpen(true);
                      }}
                      aria-label="View profile picture"
                    >
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-lg font-bold text-gray-700">
                          {(user?.name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-gray-900 truncate">{user?.name || 'User'}</div>
                      <div className="mt-0.5 text-sm text-gray-600 truncate">{user?.email || user?.phone || ''}</div>
                    </div>

                    <div className="ml-auto flex flex-col sm:flex-row gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onAvatarFileSelected}
                        style={{ display: 'none' }}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={onAvatarFileSelected}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={openAvatarActions}
                        disabled={avatarBusy}
                        className="btn btn-primary"
                      >
                        {avatarBusy ? 'Please wait' : 'Edit photo'}
                      </button>
                    </div>
                  </div>

                  {avatarError && (
                    <div className="mb-4 text-sm text-red-600">{avatarError}</div>
                  )}

                  <ProfileSettings
                    name={name}
                    setName={setName}
                    phone={phone}
                    setPhone={setPhone}
                    address={address}
                    setAddress={setAddress}
                    handleSave={handleSave}
                    saving={saving}
                    successMsg={successMsg}
                    errorMsg={errorMsg}
                  />
                </div>
              )}

              {activeTab === "password" && (
                <div className="max-w-2xl">
                  <PasswordSettings />
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="max-w-2xl">
                  <NotificationSettings />
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="max-w-2xl">
                  <PreferencesSettings
                    preferences={preferences}
                    handlePrefChange={handlePrefChange}
                    handleNotifChange={handleNotifChange}
                    handleSavePreferences={handleSavePreferences}
                    prefSaving={prefSaving}
                    prefSuccess={prefSuccess}
                    prefError={prefError}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {avatarPreviewOpen && avatarSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setAvatarPreviewOpen(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-lg overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Profile picture preview"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-bold text-gray-900">Profile picture</div>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => setAvatarPreviewOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
                <img src={avatarSrc} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}

      {avatarActionsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setAvatarActionsOpen(false)}
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
                onClick={() => setAvatarActionsOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 text-gray-600 transition bg-white border border-gray-200 rounded-xl hover:text-gray-900 hover:bg-gray-50"
                disabled={avatarBusy}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-sm font-bold text-gray-700">{(user?.name?.[0] || 'U').toUpperCase()}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-600 truncate">{user?.email || user?.phone || ''}</div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={chooseAvatarFromComputer}
                disabled={avatarBusy}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                    <PhotoLibrary fontSize="small" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Choose from computer</div>
                    <div className="text-xs text-gray-600">Upload a JPG/PNG image</div>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </button>

              <button
                type="button"
                onClick={captureAvatarPhoto}
                disabled={avatarBusy}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                    <PhotoCamera fontSize="small" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Capture photo</div>
                    <div className="text-xs text-gray-600">Use your camera</div>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </button>

              <button
                type="button"
                onClick={removeAvatarFromModal}
                disabled={avatarBusy}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-2xl border border-red-200 hover:bg-red-50 disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                    <DeleteOutline fontSize="small" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-red-700">Remove photo</div>
                    <div className="text-xs text-red-600">Use initials instead</div>
                  </div>
                </div>
                <div className="text-red-300">›</div>
              </button>

              <button
                type="button"
                onClick={() => setAvatarActionsOpen(false)}
                disabled={avatarBusy}
                className="w-full px-4 py-2.5 text-sm font-semibold text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl hover:bg-gray-200 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
