import { Bell } from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const unreadCount = useNotificationStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
  const { panelOpen, togglePanel } = useNotificationStore();

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {panelOpen && <NotificationPanel />}
    </div>
  );
}
