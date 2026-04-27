"use client";

/**
 * useNotifications – shared notification hook
 *
 * Provides a single source of truth for unread notification counts and
 * notification data. Designed to be consumed by both the TopBar bell
 * dropdown and the Sidebar nav badge so they stay in sync without
 * redundant API calls.
 *
 * Usage:
 *   const { notifications, unreadCount, isLoaded, markAllRead, markOneRead } =
 *     useNotifications()
 *
 * Re-usability note:
 *   The same hook is used identically in both the student panel and the
 *   teacher panel. The TopBar already works for both roles. Admins use
 *   AdminTopBar which has its own lightweight mock — connect it to this
 *   hook when a real admin notifications API is available.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import api from "@/lib/axios";
import type { NotificationItem } from "@/types/notification";

// ─── Context shape ──────────────────────────────────────────────────────────

interface NotificationContextValue {
  /** Full list of notifications for the current user */
  notifications: NotificationItem[];
  /** Derived: count of unread items */
  unreadCount: number;
  /** True once the first API call completes (success or failure) */
  isLoaded: boolean;
  /** True while the initial fetch is in-flight */
  isLoading: boolean;
  /** Mark every notification as read (optimistic + API) */
  markAllRead: () => void;
  /** Mark a single notification as read (optimistic + API) */
  markOneRead: (id: string) => void;
  /** Manually refresh from the API */
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

// ─── Provider ───────────────────────────────────────────────────────────────

interface NotificationProviderProps {
  children: ReactNode;
  /**
   * How often (ms) to poll the API for new notifications.
   * Pass 0 or omit to disable polling.
   * Recommended: 60_000 (1 min) for student / teacher panels.
   */
  pollInterval?: number;
}

export function NotificationProvider({
  children,
  pollInterval = 60_000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/api/notifications/my");
      const items: NotificationItem[] =
        data.data?.notifications ?? data.data ?? [];
      setNotifications(items);
    } catch {
      // Silently swallow — TopBar shows empty state gracefully
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling for real-time-ish updates
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return;

    pollRef.current = setInterval(fetchNotifications, pollInterval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchNotifications, pollInterval]);

  const markAllRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Fire-and-forget API call
    api.patch("/api/notifications/read-all").catch(() => {
      // Re-fetch on failure to restore true server state
      fetchNotifications();
    });
  }, [fetchNotifications]);

  const markOneRead = useCallback(
    (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      api.patch(`/api/notifications/${id}/read`).catch(() => {
        fetchNotifications();
      });
    },
    [fetchNotifications],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isLoaded,
        markAllRead,
        markOneRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * useNotifications – consume the shared notification state.
 *
 * Must be used inside <NotificationProvider>.
 * Throw a clear error if someone forgets to add the provider.
 */
export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside <NotificationProvider>. " +
        "Wrap your panel layout (student/layout.tsx or teacher/layout.tsx) with it.",
    );
  }
  return ctx;
}
