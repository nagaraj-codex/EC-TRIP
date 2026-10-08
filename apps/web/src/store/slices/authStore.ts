import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../../services/apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email" | "guest";
  homeCity?: string;
  preferredPark?: string;
  phone?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "crowd" | "weather" | "price" | "system" | "offer" | "trip";
  time: string;
  read: boolean;
  parkId?: string;
  badge?: string;
  actionUrl?: string;
}

export interface SavedTrip {
  id: string;
  ownerId?: string;
  parkId: string;
  parkName: string;
  date: string;
  ticketPrice: number;
  crowdLevel: string;
  predictedWait: number;
  fastTrackVerdict: string;
  savedAt: string;
  notes?: string;
}

// Session type: "none" = not chosen yet, "authenticated" = logged in, "guest" = explicitly chose guest
export type SessionType = "none" | "authenticated" | "guest";

interface AuthState {
  user: User | null;
  isGuest: boolean;
  sessionType: SessionType;
  authModalOpen: boolean;
  authModalMode: "signin" | "signup";
  authModalReason: string;
  notifications: NotificationItem[];
  toasts: NotificationItem[];
  savedTrips: SavedTrip[];
  guestSavedTrips: SavedTrip[];
  accountSavedTrips: Record<string, SavedTrip[]>;
  savedParkIds: string[];

  // Auth actions
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, name?: string) => void;
  setAuthenticatedUser: (user: Pick<User, "id" | "name" | "email" | "provider">) => void;
  continueAsGuest: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Modal actions
  openAuthModal: (reason?: string, mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;

  // Trip actions
  saveTrip: (trip: Omit<SavedTrip, "id" | "savedAt">) => void;
  removeSavedTrip: (id: string) => void;
  isTripSaved: (date: string, parkId: string) => boolean;
  toggleSavedPark: (parkId: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, "id" | "read" | "time"> & { time?: string }) => void;
  addToast: (toast: Omit<NotificationItem, "id" | "read" | "time">) => void;
  dismissToast: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // CRITICAL: isGuest MUST default to false. Users have NOT chosen guest mode yet.
      // They must explicitly click "Continue as Guest" to activate guest mode.
      isGuest: false,
      sessionType: "none" as SessionType,
      authModalOpen: false,
      authModalMode: "signin",
      authModalReason: "",
      notifications: [],
      toasts: [],
      savedTrips: [],
      guestSavedTrips: [],
      accountSavedTrips: {},
      savedParkIds: [],

      loginWithGoogle: () => {
        apiClient.getGoogleAuthStatus()
          .then((status) => {
            if (status.configured) {
              window.location.assign("/api/v1/auth/google/login");
            } else {
              get().addToast({
                title: "Google Sign-In Unavailable",
                message: "Google OAuth is not configured. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or use email sign-in.",
                type: "system",
              });
            }
          })
          .catch(() => {
            get().addToast({
              title: "Network Error",
              message: "Could not reach the server to start Google Sign-In.",
              type: "system",
            });
          });
      },

      loginWithEmail: (email: string, name?: string) => {
        const displayName = name?.trim() || email.split("@")[0] || "Theme Park Explorer";
        const newUser: User = {
          id: "usr-email-" + Date.now().toString(36),
          name: displayName,
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0284c7&color=fff&bold=true`,
          provider: "email",
          homeCity: "Chennai",
          preferredPark: "wonderla-chennai",
          createdAt: new Date().toISOString()
        };
        set({
          user: newUser,
          isGuest: false,
          sessionType: "authenticated",
          authModalOpen: false
        });
        get().addToast({
          title: "🎉 Welcome to QueueCut!",
          message: `Logged in as ${displayName}. Ready to plan your next adventure!`,
          type: "system"
        });
      },

      setAuthenticatedUser: (authenticatedUser) => {
        const userWithProfile = {
          ...authenticatedUser,
          createdAt: new Date().toISOString(),
        } as User;
        set((state) => ({
          user: userWithProfile,
          isGuest: false,
          sessionType: "authenticated",
          authModalOpen: false,
          savedTrips: state.accountSavedTrips[userWithProfile.id] ?? [],
        }));
      },

      continueAsGuest: () => {
        // EXPLICIT guest selection — user consciously chose guest mode
        set((state) => ({
          user: null,
          isGuest: true,
          sessionType: "guest",
          authModalOpen: false,
          savedTrips: state.guestSavedTrips,
        }));
        get().addToast({
          title: "👋 Browsing as Guest",
          message: "Explore parks, crowd data, and forecasts freely. Sign in anytime to save trips.",
          type: "system"
        });
      },

      logout: () => {
        // Terminate backend session and cookie
        void apiClient.logout();
        // After logout, go to "none" state — redirect to login, NOT back to guest
        set({
          user: null,
          isGuest: false,
          sessionType: "none",
          savedTrips: [],
        });
      },

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
        get().addToast({
          title: "Profile Updated",
          message: "Your preferences were saved successfully.",
          type: "system"
        });
      },

      openAuthModal: (reason = "Sign in to continue", mode = "signin") => {
        set({
          authModalOpen: true,
          authModalMode: mode,
          authModalReason: reason
        });
      },

      closeAuthModal: () => {
        set({ authModalOpen: false });
      },

      saveTrip: (tripData) => {
        const ownerId = get().user?.id ?? (get().isGuest ? "guest" : "anonymous");
        const trip: SavedTrip = {
          ...tripData,
          id: "trip-" + Date.now().toString(36),
          ownerId,
          savedAt: new Date().toISOString()
        };
        set((state) => {
          const activeTrips = ownerId === "guest" ? state.guestSavedTrips : (state.user?.id ? state.accountSavedTrips[state.user.id] ?? [] : state.savedTrips);
          const nextTrips = [trip, ...activeTrips.filter((t) => !(t.date === trip.date && t.parkId === trip.parkId))];

          return {
            savedTrips: nextTrips,
            guestSavedTrips: ownerId === "guest" ? nextTrips : state.guestSavedTrips,
            accountSavedTrips: state.user?.id
              ? { ...state.accountSavedTrips, [state.user.id]: ownerId === state.user.id ? nextTrips : state.accountSavedTrips[state.user.id] ?? [] }
              : state.accountSavedTrips,
          };
        });
        get().addToast({
          title: "Trip Saved!",
          message: `${trip.parkName} on ${trip.date} added to your saved itineraries.`,
          type: "system"
        });
      },

      removeSavedTrip: (id: string) => {
        set((state) => {
          const nextSavedTrips = state.savedTrips.filter((t) => t.id !== id);
          if (state.isGuest) {
            return {
              savedTrips: nextSavedTrips,
              guestSavedTrips: nextSavedTrips,
            };
          }
          if (state.user?.id) {
            return {
              savedTrips: nextSavedTrips,
              accountSavedTrips: {
                ...state.accountSavedTrips,
                [state.user.id]: nextSavedTrips,
              },
            };
          }
          return {
            savedTrips: nextSavedTrips,
          };
        });
        get().addToast({
          title: "Trip Removed",
          message: "The trip was removed from your saved list.",
          type: "system"
        });
      },

      isTripSaved: (date: string, parkId: string) => {
        return get().savedTrips.some((t) => t.date === date && t.parkId === parkId);
      },

      toggleSavedPark: (parkId) => {
        set((state) => ({
          savedParkIds: state.savedParkIds.includes(parkId)
            ? state.savedParkIds.filter((savedId) => savedId !== parkId)
            : [...state.savedParkIds, parkId],
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      addNotification: (notif) => {
        const id = "notif-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        const newNotif: NotificationItem = {
          ...notif,
          id,
          time: notif.time || "Just now",
          read: false
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          toasts: [newNotif, ...state.toasts.slice(0, 3)]
        }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 5500);
      },

      addToast: (toast) => {
        const id = "toast-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        const newToast: NotificationItem = {
          ...toast,
          id,
          time: "Just now",
          read: false
        };
        set((state) => ({
          toasts: [newToast, ...state.toasts.slice(0, 3)]
        }));

        // Auto dismiss after 5.5 seconds
        setTimeout(() => {
          get().dismissToast(id);
        }, 5500);
      },

      dismissToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }
    }),
    {
      name: "queuecut-auth-store",
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
        sessionType: state.sessionType,
        savedTrips: state.savedTrips,
        guestSavedTrips: state.guestSavedTrips,
        accountSavedTrips: state.accountSavedTrips,
        savedParkIds: state.savedParkIds,
        notifications: state.notifications,
      })
    }
  )
);
