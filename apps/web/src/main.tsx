import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./styles/index.css";
import { useAuthStore } from "./store/slices/authStore";

const isDev = import.meta.env.DEV;

window.onerror = function (message, source, lineno, colno, error) {
  if (isDev) {
    console.error("Global Error:", { message, source, lineno, colno, error });
  } else {
    useAuthStore.getState().addToast({
      title: "Something went off-track",
      message: "An unexpected error occurred. Please try again.",
      type: "system"
    });
  }
};

window.addEventListener("unhandledrejection", (event) => {
  if (isDev) {
    console.error("Unhandled Promise Rejection:", event.reason);
  } else {
    useAuthStore.getState().addToast({
      title: "Something went off-track",
      message: "An unexpected error occurred. Please try again.",
      type: "system"
    });
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
