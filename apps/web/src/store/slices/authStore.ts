import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "facebook" | "email" | "guest";
  homeCity?: string;
  preferredPark?: string;
  phone?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "crowd" | "weather" | "price" | "system";
  time: string;
  read: boolean;
  parkId?: string;
  badge?: string;
}

export interface SavedTrip {
  id: string;
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

interface AuthState {
  user: User | null;
  isGuest: boolean;
  authModalOpen: boolean;
  authModalMode: "signin" | "signup";
  authModalReason: string;
  notifications: NotificationItem[];
  toasts: NotificationItem[];
  savedTrips: SavedTrip[];

  // Auth actions
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  loginWithEmail: (email: string, name?: string) => void;
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

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, "id" | "read" | "time"> & { time?: string }) => void;
  addToast: (toast: Omit<NotificationItem, "id" | "read" | "time">) => void;
  dismissToast: (id: string) => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "⚡ Wonderla Live Wait Times",
    message: "Recaptcha-verified: Roller Coaster wait is currently 18m. Low crowd surge right now.",
    type: "crowd",
    time: "10m ago",
    read: false,
    parkId: "wonderla-chennai",
    badge: "Live"
  },
  {
    id: "notif-2",
    title: "🌧️ Open-Meteo Weather Advisory",
    message: "Wonderla Chennai: 0% rain forecasted through Sunday. Ideal for outdoor rides.",
    type: "weather",
    time: "1h ago",
    read: false,
    parkId: "wonderla-chennai",
    badge: "Forecast"
  },
  {
    id: "notif-3",
    title: "🏷️ ₹1,312 Weekday Pricing Active",
    message: "Tuesday & Wednesday offer maximum savings compared to ₹1,549 weekend rates.",
    type: "price",
    time: "3h ago",
    read: true,
    parkId: "wonderla-chennai",
    badge: "Savings"
  },
  {
    id: "notif-4",
    title: "🎢 MGM Dizzee World Added",
    message: "Multi-park intelligence now active for MGM Dizzee World Chennai with 2026 pricing.",
    type: "system",
    time: "1d ago",
    read: true,
    parkId: "mgm-dizzee-chennai",
    badge: "New Park"
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: true,
      authModalOpen: false,
      authModalMode: "signin",
      authModalReason: "",
      notifications: initialNotifications,
      toasts: [
        {
          id: "toast-welcome",
          title: "🎉 Welcome to QueueCut!",
          message: "Guest browsing is active. Explore all crowds, wait times & pricing freely.",
          type: "system",
          time: "Just now",
          read: false
        }
      ],
      savedTrips: [],

      loginWithGoogle: () => {
        const newUser: User = {
          id: "usr-google-" + Date.now().toString(36),
          name: "Rahul Sharma",
          email: "rahul.sharma@gmail.com",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          provider: "google",
          homeCity: "Chennai",
          preferredPark: "wonderla-chennai",
          createdAt: new Date().toISOString()
        };
        set({
          user: newUser,
          isGuest: false,
          authModalOpen: false
        });
        get().addToast({
          title: "Signed in with Google",
          message: `Welcome back, ${newUser.name}! Your trips and alerts are synced.`,
          type: "system"
        });
      },

      loginWithFacebook: () => {
        const newUser: User = {
          id: "usr-fb-" + Date.now().toString(36),
          name: "Rahul Sharma",
          email: "rahul.sharma@facebook.com",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          provider: "facebook",
          homeCity: "Chennai",
          preferredPark: "wonderla-chennai",
          createdAt: new Date().toISOString()
        };
        set({
          user: newUser,
          isGuest: false,
          authModalOpen: false
        });
        get().addToast({
          title: "Signed in with Facebook",
          message: `Welcome, ${newUser.name}!`,
          type: "system"
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
          authModalOpen: false
        });
        get().addToast({
          title: "Welcome to QueueCut",
          message: `Logged in as ${displayName}`,
          type: "system"
        });
      },

      continueAsGuest: () => {
        set({
          user: null,
          isGuest: true,
          authModalOpen: false
        });
        get().addToast({
          title: "Browsing as Guest",
          message: "You can view all parks and wait forecasts. Sign in anytime to save trips.",
          type: "system"
        });
      },

      logout: () => {
        set({
          user: null,
          isGuest: true
        });
        get().addToast({
          title: "Signed Out",
          message: "You are now in guest browsing mode.",
          type: "system"
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
        const trip: SavedTrip = {
          ...tripData,
          id: "trip-" + Date.now().toString(36),
          savedAt: new Date().toISOString()
        };
        set((state) => ({
          savedTrips: [trip, ...state.savedTrips.filter(t => !(t.date === trip.date && t.parkId === trip.parkId))]
        }));
        get().addToast({
          title: "Trip Saved!",
          message: `${trip.parkName} on ${trip.date} added to your saved itineraries.`,
          type: "system"
        });
      },

      removeSavedTrip: (id: string) => {
        set((state) => ({
          savedTrips: state.savedTrips.filter((t) => t.id !== id)
        }));
        get().addToast({
          title: "Trip Removed",
          message: "The trip was removed from your saved list.",
          type: "system"
        });
      },

      isTripSaved: (date: string, parkId: string) => {
        return get().savedTrips.some((t) => t.date === date && t.parkId === parkId);
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
          toasts: [newToast, ...state.toasts.slice(0, 3)] // Keep max 4 active toasts
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
        savedTrips: state.savedTrips,
        notifications: state.notifications
      })
    }
  )
);
