import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { subscribeToNotifications } from "../services/notificationService";
import { useNotificationStore } from "../store/notificationStore";
import { useAuth } from "./useAuth";
import { onForegroundMessage } from "../firebase/messaging";

export function useNotifications() {
  const { user, isApproved } = useAuth();
  const { setNotifications } = useNotificationStore();
  const knownIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);
  const foregroundMessagingEnabledRef = useRef(false);

  useEffect(() => {
    if (!user?.id) {
      knownIdsRef.current = new Set();
      isInitialLoadRef.current = true;
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeToNotifications(user.id, (notifs) => {
      if (!isInitialLoadRef.current && !foregroundMessagingEnabledRef.current) {
        notifs.forEach((n) => {
          if (!knownIdsRef.current.has(n.id) && !n.read) {
            toast(`${n.title}\n${n.message}`, {
              icon: "🔔",
              duration: 6000,
            });
          }
        });
      }

      knownIdsRef.current = new Set(notifs.map((n) => n.id));
      isInitialLoadRef.current = false;
      setNotifications(notifs);
    });

    return unsubscribe;
  }, [user?.id, setNotifications]);

  useEffect(() => {
    if (!isApproved || !import.meta.env.VITE_FIREBASE_VAPID_KEY) return;

    let cleanup = null;

    onForegroundMessage((payload) => {
      foregroundMessagingEnabledRef.current = true;

      const title = payload.notification?.title || "إشعار جديد";
      const message = payload.notification?.body || "";
      toast(`${title}${message ? `\n${message}` : ""}`, {
        icon: "🔔",
        duration: 6000,
      });
    }).then((unsub) => {
      cleanup = unsub;
    });

    return () => cleanup?.();
  }, [isApproved]);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount };
}
