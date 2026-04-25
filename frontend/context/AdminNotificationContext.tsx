"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import api from "@/lib/axios";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type AdminNotificationContextValue = {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const AdminNotificationContext =
  createContext<AdminNotificationContextValue | null>(null);

export function AdminNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshNotifications() {
    try {
      setLoading(true);

      const response = await api.get("/api/notifications/my");
      const payload = response.data?.data;

      const items: AdminNotification[] = Array.isArray(payload)
        ? payload
        : (payload?.notifications ?? []);

      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );

    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch {
      await refreshNotifications();
    }
  }

  async function markAllAsRead() {
    setNotifications((items) =>
      items.map((item) => ({ ...item, is_read: true })),
    );

    try {
      await api.patch("/api/notifications/read-all");
    } catch {
      await refreshNotifications();
    }
  }

  useEffect(() => {
    refreshNotifications();

    const interval = window.setInterval(refreshNotifications, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);

  if (!context) {
    throw new Error(
      "useAdminNotifications must be used inside AdminNotificationProvider",
    );
  }

  return context;
}
