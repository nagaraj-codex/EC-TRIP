import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../../store/slices/authStore";

interface SignInTabProps {
  onSwitchToSignup: () => void;
  setError: (msg: string) => void;
}

export const SignInTab: React.FC<SignInTabProps> = ({ onSwitchToSignup, setError }) => {
  const { loginWithGoogle, loginWithEmail } = useAuthStore();
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginIdentifier.trim()) {
      setError("Please enter your mobile number, username, or email.");
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setError("Please enter your password (minimum 6 characters).");
      return;
    }

    loginWithEmail(loginIdentifier);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setForgotSent(true);
  };

  return (
    <div className="p-6 space-y-4 animate-in fade-in duration-150">
      {isForgotPass ? (
        <div className="space-y-3">
          <h3 className="font-extrabold text-base text-white">Reset your password</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your email address and we'll send you a recovery link to access your QueueCut account.
          </p>

          {forgotSent ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Recovery link sent to {forgotEmail}. Check your inbox!</span>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-3 pt-1">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3897f0] focus:ring-1 focus:ring-[#3897f0]"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-xs shadow-md transition-colors"
              >
                Send Login Link
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => setIsForgotPass(false)}
            className="w-full text-center text-xs text-[#3897f0] font-semibold hover:underline pt-2 block"
          >
            Back to Log in
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-bold text-white text-left tracking-tight">
            Log into QueueCut
          </h2>

          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Mobile number, username or email"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3897f0] focus:ring-1 focus:ring-[#3897f0] transition-colors"
              />
            </div>

            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3897f0] focus:ring-1 focus:ring-[#3897f0] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-xs shadow-md transition-all active:scale-98 mt-1"
            >
              Log in
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsForgotPass(true)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#192644]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-500">
              <span className="bg-[#0b1326] px-2">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101b33] hover:bg-[#152342] border border-[#213357] text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm"
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

          <button
            type="button"
            onClick={onSwitchToSignup}
            className="w-full py-2.5 px-4 rounded-xl border border-[#2d4066] hover:bg-[#131f38] text-[#3897f0] font-bold text-xs transition-colors text-center block"
          >
            Create new account
          </button>

          <div className="pt-2 text-center">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider">
              ∞ QueueCut Meta Intelligence
            </span>
          </div>
        </>
      )}
    </div>
  );
};
