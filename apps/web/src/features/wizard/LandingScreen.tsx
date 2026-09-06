import { usePlannerStore } from "../../store/slices/plannerStore";
import { useAuthStore } from "../../store/slices/authStore";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Zap } from "lucide-react";

export default function LandingScreen() {
  const { setScreen } = usePlannerStore();
  const { user, isGuest, loginWithGoogle, loginWithFacebook, openAuthModal } = useAuthStore();

  return (
    <div className="text-center pt-2 sm:pt-4 space-y-5">
      {/* Animated Coaster Brand Icon */}
      <div className="relative inline-block">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-500 text-white text-3xl sm:text-4xl flex items-center justify-center mx-auto shadow-glow-brand animate-float">
          🎢
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
        </span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight gradient-heading">
          QueueCut Intelligence
        </h1>
        <p className="text-xs sm:text-sm font-bold gradient-brand-text mt-1">
          Theme Park Crowd & Dynamic Pricing Engine
        </p>
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          Go on the right day. Spend less money. Wait fewer minutes. Ride more coasters.
        </p>
      </div>

      {/* Logged in vs Guest Badge */}
      {user && !isGuest ? (
        <div className="p-3.5 bg-brand-950/60 border border-brand-500/40 rounded-2xl text-left flex items-center gap-3">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-brand-500/40"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              Signed in as {user.name}
            </div>
            <div className="text-[11px] text-brand-300 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Full Access & Itinerary Sync</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Guest browsing active • No sign-in required to explore</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          className="btn btn-primary text-xs sm:text-sm font-bold py-3.5 shadow-glow-brand"
          onClick={() => setScreen("step1")}
        >
          <span>{user && !isGuest ? "Plan a New Visit" : "Explore Crowd Engine as Guest"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {(!user || isGuest) && (
          <div className="space-y-2 pt-1">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={loginWithGoogle}
              className="btn btn-secondary text-xs sm:text-sm py-3"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Facebook Sign In */}
            <button
              type="button"
              onClick={loginWithFacebook}
              className="btn !bg-[#1877F2] !text-white hover:!bg-[#166fe5] text-xs py-2.5"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>

            {/* Email Modal Trigger */}
            <button
              className="btn btn-secondary text-xs"
              onClick={() => openAuthModal("Sign in to access saved trips and personalized crowd predictions", "signin")}
            >
              Sign In with Email / Password
            </button>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium">
        <span>🔒 256-Bit SSL</span>
        <span>•</span>
        <span>⚡ Open-Meteo Synced</span>
        <span>•</span>
        <span>🎯 TTL Cache Active</span>
      </div>
    </div>
  );
}
