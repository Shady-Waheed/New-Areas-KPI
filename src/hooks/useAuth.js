import { useEffect } from "react";
import toast from "react-hot-toast";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { requestFCMToken } from "../firebase/messaging";
import { saveFCMToken, subscribeToUserProfile } from "../services/userService";

export function useAuthInit() {
  const { setUser, setLoading, setInitialized, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            clearUser();
            return;
          }
          if (profile.disabled) {
            await signOut(auth);
            clearUser();
            return;
          }
          setUser(profile);

          if (profile.approved && import.meta.env.VITE_FIREBASE_VAPID_KEY) {
            const token = await requestFCMToken();
            if (token) {
              await saveFCMToken(firebaseUser.uid, token).catch(() => {});
            }
          }
        } catch {
          clearUser();
        }
      } else {
        clearUser();
      }
      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, [setUser, setLoading, setInitialized, clearUser]);

  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserProfile(userId, (profile) => {
      if (!profile) return;

      const previous = useAuthStore.getState().user;

      if (profile.disabled) {
        signOut(auth);
        clearUser();
        return;
      }

      if (previous && !previous.approved && profile.approved) {
        toast.success("تم قبول حسابك! يمكنك الآن استخدام التطبيق.", {
          duration: 5000,
        });
      }

      setUser(profile);
    });

    return unsubscribe;
  }, [userId, setUser, clearUser]);
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);

  const isAdmin = user?.role === "admin";
  const isHost = user?.role === "host";
  const isReadOnlyAdmin = user?.role === "admin_readonly";
  const isEditor = isAdmin || isHost;
  const isPrivileged = isEditor || isReadOnlyAdmin;
  const isAdminApproved = user?.adminApproved === true;
  const isHostApproved = user?.hostApproved === true;
  const isApproved = user?.approved === true;

  return {
    user,
    loading,
    initialized,
    isAdmin,
    isHost,
    isReadOnlyAdmin,
    isEditor,
    isPrivileged,
    isAdminApproved,
    isHostApproved,
    isApproved,
  };
}
