import { useAuthStore } from "../store/slices/authStore";

export function useActionGuard() {
  const { user, isGuest, openAuthModal } = useAuthStore();

  const isAuthed = !!user && !isGuest;

  /**
   * Guards an action requiring authenticated status.
   * If logged in, runs the action callback.
   * If guest, opens the Auth Gate modal with a specific reason.
   */
  const executeGuarded = (actionCallback: () => void, reason: string) => {
    if (isAuthed) {
      actionCallback();
    } else {
      openAuthModal(reason, "signin");
    }
  };

  return {
    isAuthed,
    user,
    executeGuarded,
    promptLogin: (reason = "Sign in to access this feature") => openAuthModal(reason, "signin"),
    promptSignUp: (reason = "Create an account to continue") => openAuthModal(reason, "signup"),
  };
}
