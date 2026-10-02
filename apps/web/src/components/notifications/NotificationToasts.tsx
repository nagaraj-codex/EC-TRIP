import React, { useCallback, memo } from "react";
import { X, Zap, CloudRain, Tag, Sparkles, Gift, Map, ChevronRight } from "lucide-react";
import { useAuthStore, NotificationItem } from "../../store/slices/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ToastTheme {
  icon: React.ComponentType<{ className?: string }>;
  accentBorder: string;
  iconBg: string;
  iconColor: string;
  badgeStyle: string;
}

const TOAST_THEMES: Record<NotificationItem["type"], ToastTheme> = {
  crowd: {
    icon: Zap,
    accentBorder: "hover:border-teal-500/40",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400",
    badgeStyle: "bg-teal-500/10 text-teal-300 border-teal-500/30",
  },
  weather: {
    icon: CloudRain,
    accentBorder: "hover:border-sky-500/40",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
    badgeStyle: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  },
  price: {
    icon: Tag,
    accentBorder: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badgeStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  offer: {
    icon: Gift,
    accentBorder: "hover:border-amber-500/40",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    badgeStyle: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  trip: {
    icon: Map,
    accentBorder: "hover:border-brand-500/40",
    iconBg: "bg-brand-500/10",
    iconColor: "text-brand-400",
    badgeStyle: "bg-brand-500/10 text-brand-300 border-brand-500/30",
  },
  system: {
    icon: Sparkles,
    accentBorder: "hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    badgeStyle: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  },
};

interface ToastCardProps {
  toast: NotificationItem;
  onDismiss: (id: string) => void;
  onAction?: (url: string, id: string) => void;
}

const ToastCard = memo(function ToastCard({ toast, onDismiss, onAction }: ToastCardProps) {
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.system;
  const Icon = theme.icon;
  const isClickable = Boolean(toast.actionUrl);

  const handleClick = () => {
    if (toast.actionUrl && onAction) {
      onAction(toast.actionUrl, toast.id);
    }
  };

  return (
    <motion.div
      key={toast.id}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
          onDismiss(toast.id);
        }
      }}
      onClick={handleClick}
      role={isClickable ? "button" : "status"}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`pointer-events-auto w-full max-w-sm bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-3.5 flex items-start gap-3 transition-colors ${
        theme.accentBorder
      } ${isClickable ? "cursor-pointer active:scale-98" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-xl ${theme.iconBg} border border-white/6 flex items-center justify-center shrink-0 mt-0.5`}
      >
        <Icon className={`w-4 h-4 ${theme.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-white truncate">{toast.title}</span>
            {toast.badge && (
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${theme.badgeStyle} shrink-0`}
              >
                {toast.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 shrink-0">{toast.time}</span>
        </div>

        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
          {toast.message}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isClickable && (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/80 rounded-lg transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
});

export default function NotificationToasts() {
  const { toasts, dismissToast } = useAuthStore();
  const navigate = useNavigate();

  const handleDismiss = useCallback(
    (id: string) => {
      dismissToast(id);
    },
    [dismissToast]
  );

  const handleAction = useCallback(
    (url: string, id: string) => {
      dismissToast(id);
      navigate(url);
    },
    [dismissToast, navigate]
  );

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4"
      role="region"
      aria-live="polite"
      aria-label="Live notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={handleDismiss}
            onAction={handleAction}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
