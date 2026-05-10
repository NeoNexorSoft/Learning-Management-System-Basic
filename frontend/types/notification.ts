// ─────────────────────────────────────────────
//  Shared Notification types
//  Used by: useNotifications hook, TopBar, Sidebar badge
// ─────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  sender?: string;
  senderRole?: string;
}

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isLoaded: boolean;
}
