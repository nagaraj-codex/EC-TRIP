import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // dedupe
    if (get().toasts.some((t) => t.message === toast.message && t.type === toast.type)) {
      return;
    }

    set((state) => {
      const newToasts = [...state.toasts, { ...toast, id }].slice(-3);
      return { toasts: newToasts };
    });

    const duration = toast.type === 'error' ? 8000 : 4000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
