import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../store/slices/uiStore";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashPage() {
  const navigate = useNavigate();
  const { hasSeenOnboarding, setSplashSeen } = useUIStore();
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTagline(true), 800);
    const t2 = setTimeout(() => {
      setSplashSeen();
      navigate(hasSeenOnboarding ? "/app/home" : "/onboarding", { replace: true });
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate, hasSeenOnboarding, setSplashSeen]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Subtle background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(37,99,235,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-qc-blue-500 to-qc-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-display font-extrabold">Q</span>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-extrabold text-3xl tracking-tight text-slate-900"
        >
          Queue<span className="text-qc-blue-600">Cut</span>
        </motion.h1>

        {/* Tagline */}
        <AnimatePresence>
          {showTagline && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-slate-500 text-sm font-medium tracking-wide"
            >
              Plan smarter. Queue less.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Loading dots */}
        <AnimatePresence>
          {showTagline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 mt-2"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-qc-blue-400 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
