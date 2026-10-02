import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/slices/authStore";
import { apiClient } from "../services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Users, UserPlus, LogIn, ChevronLeft } from "lucide-react";

type AuthView = "choice" | "signin" | "signup";

export default function LoginPage() {
  const navigate = useNavigate();
  const { continueAsGuest, setAuthenticatedUser } = useAuthStore();

  const [view, setView] = useState<AuthView>("choice");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.assign("/api/v1/auth/google/login");
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setIsLoading(true);
    apiClient.login({ email: email.trim(), password })
      .then(({ user }) => {
        setAuthenticatedUser(user);
        navigate("/app/home", { replace: true });
      })
      .catch((authError: Error) => setError(authError.message))
      .finally(() => setIsLoading(false));
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@") || password.length < 8) {
      setError("Use a valid email and a password with at least 8 characters.");
      return;
    }
    setIsLoading(true);
    apiClient.register({ name: name.trim(), email: email.trim(), password })
      .then(({ user }) => {
        setAuthenticatedUser(user);
        navigate("/app/home", { replace: true });
      })
      .catch((authError: Error) => setError(authError.message))
      .finally(() => setIsLoading(false));
  };

  const handleGuestBrowse = () => {
    continueAsGuest();
    navigate("/app/home", { replace: true });
  };

  const resetView = () => {
    setView("choice");
    setEmail("");
    setName("");
    setPassword("");
    setError("");
    setIsLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-auto">
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ── AUTH CHOICE SCREEN ── */}
          {view === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              {/* Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 w-full">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-qc-blue-500 to-qc-blue-700 flex items-center justify-center shadow-sm">
                    <span className="text-white text-2xl font-display font-extrabold">Q</span>
                  </div>
                </div>

                <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-1 text-center">
                  Welcome to Queue<span className="text-qc-blue-600">Cut</span>
                </h1>
                <p className="text-slate-500 text-sm mb-8 text-center">
                  Plan your next adventure.
                </p>

                {/* Primary CTA buttons */}
                <div className="space-y-3 mb-6">
                  {/* Google */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 border border-slate-200 shadow-sm active:scale-[0.98] transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Sign In */}
                  <button
                    onClick={() => setView("signin")}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4 text-qc-blue-600" />
                    Sign In
                  </button>

                  {/* Create Account */}
                  <button
                    onClick={() => setView("signup")}
                    className="btn-blue-primary w-full"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-slate-400 text-xs font-medium">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Guest Browse */}
                <div className="flex justify-center">
                  <button
                    onClick={handleGuestBrowse}
                    className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-700 transition-colors py-2 px-4 rounded-lg hover:bg-slate-100"
                  >
                    <Users className="w-4 h-4" />
                    Continue as Guest
                  </button>
                </div>
              </div>

              {/* Social proof */}
              <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-50 flex items-center justify-center">
                      <span className="text-[8px] text-slate-500">👤</span>
                    </div>
                  ))}
                </div>
                <span>10,000+ travelers use QueueCut</span>
              </div>
            </motion.div>
          )}

          {/* ── SIGN IN FORM ── */}
          {view === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm"
            >
              <button onClick={resetView} className="flex items-center gap-1 text-slate-500 text-sm mb-6 hover:text-slate-700 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                <h2 className="font-display font-extrabold text-xl text-slate-900 mb-1">Sign In</h2>
                <p className="text-slate-500 text-sm mb-6">Welcome back, park explorer!</p>

                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && <p className="text-red-500 text-xs">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-blue-primary w-full"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                  No account?{" "}
                  <button onClick={() => setView("signup")} className="text-qc-blue-600 hover:text-qc-blue-700 font-medium">
                    Create one
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── SIGN UP FORM ── */}
          {view === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm"
            >
              <button onClick={resetView} className="flex items-center gap-1 text-slate-500 text-sm mb-6 hover:text-slate-700 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                <h2 className="font-display font-extrabold text-xl text-slate-900 mb-1">Create Account</h2>
                <p className="text-slate-500 text-sm mb-6">Start planning smarter park visits.</p>

                <form onSubmit={handleEmailSignUp} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && <p className="text-red-500 text-xs">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-blue-primary w-full"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                  Already have an account?{" "}
                  <button onClick={() => setView("signin")} className="text-qc-blue-600 hover:text-qc-blue-700 font-medium">
                    Sign In
                  </button>
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
