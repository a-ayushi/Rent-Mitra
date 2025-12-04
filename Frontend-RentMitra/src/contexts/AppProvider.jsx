import React, { useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import { useAuth } from "../hooks/useAuth";
import notificationService from "../services/notificationService";

export const AppProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      notificationService.connect(user.id);
    } else {
      notificationService.disconnect();
    }

    return () => {
      notificationService.disconnect();
    };
  }, [isAuthenticated, user]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
