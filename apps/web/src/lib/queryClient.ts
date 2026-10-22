import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/slices/authStore";
import { getFriendlyErrorMessage } from "./errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const message = getFriendlyErrorMessage(error);
        useAuthStore.getState().addToast({
          title: "Action failed",
          message,
          type: "system",
        });
      },
    },
  },
});
