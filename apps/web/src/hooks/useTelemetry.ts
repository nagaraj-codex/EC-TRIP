import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/slices/authStore";

export interface TelemetryAlert {
  type: string;
  title: string;
  message: string;
  level?: "info" | "warning" | "surge" | "deal";
  park_id?: string;
  badge?: string;
}

export function useTelemetry() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestAlert, setLatestAlert] = useState<TelemetryAlert | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const { addNotification } = useAuthStore();

  const connect = useCallback(() => {
    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Connect directly to backend port 8000 when developing locally, or via proxy host
      const host =
        window.location.port === "5173"
          ? "localhost:8000"
          : window.location.host;
      const wsUrl = `${proto}//${host}/api/v1/telemetry/ws`;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log("[QueueCut Telemetry] WebSocket connected to", wsUrl);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "telemetry_alert") {
            setLatestAlert(data);
            const lower = `${data.title || ""} ${data.message || ""}`.toLowerCase();
            const notifType: "crowd" | "weather" | "price" | "system" = 
              lower.includes("rain") || lower.includes("weather") ? "weather" :
              lower.includes("price") || lower.includes("tariff") ? "price" :
              lower.includes("crowd") || lower.includes("queue") ? "crowd" : "system";

            addNotification({
              title: data.title || "Live Telemetry Alert",
              message: data.message || "",
              badge: data.badge || "PUSH",
              type: notifType,
            });
          }
        } catch {
          // Plain text alert
          const alertData: TelemetryAlert = {
            type: "telemetry_alert",
            title: "Live Push Alert",
            message: event.data,
            badge: "LIVE",
          };
          setLatestAlert(alertData);
          const lower = event.data.toLowerCase();
          const notifType: "crowd" | "weather" | "price" | "system" = 
            lower.includes("rain") || lower.includes("weather") ? "weather" :
            lower.includes("price") || lower.includes("tariff") ? "price" :
            lower.includes("crowd") || lower.includes("queue") ? "crowd" : "system";

          addNotification({
            title: alertData.title,
            message: alertData.message,
            badge: "LIVE",
            type: notifType,
          });
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 4s
        reconnectTimeoutRef.current = setTimeout(connect, 4000);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.error("[QueueCut Telemetry] Connection error:", err);
    }
  }, [addNotification]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const triggerTestAlert = async (customMessage?: string) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
      await fetch(`${BASE_URL}/telemetry/trigger-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "⚡ Sudden Crowd Surge Detected",
          message: customMessage || "Recoil Roller Coaster queue surged past 45m. Diverting itinerary to Wave Pool!",
          level: "warning",
          badge: "RADAR ACTIVE",
        }),
      });
    } catch (err) {
      console.error("Failed to trigger alert:", err);
    }
  };

  return {
    isConnected,
    latestAlert,
    triggerTestAlert,
    clearAlert: () => setLatestAlert(null),
  };
}
