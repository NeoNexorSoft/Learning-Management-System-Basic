"use client";

import { Bell } from "lucide-react";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function NotificationBell({ onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="relative p-2 rounded-full hover:bg-gray-100"
    >
      <Bell className="w-5 h-5" />
      {/* notification badge */}
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
  );
}