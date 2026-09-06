import { X, Sparkles, CloudRain, AlertTriangle, Tag, CheckCircle } from "lucide-react";
import { useAuthStore, NotificationItem } from "../../store/slices/authStore";

export default function NotificationToasts() {
  const { toasts, dismissToast } = useAuthStore();

  if (toasts.length === 0) return null;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "crowd":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "weather":
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case "price":
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case "system":
      default:
        return <Sparkles className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-3.5 flex items-start gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-900 truncate">
                {toast.title}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0">{toast.time}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
