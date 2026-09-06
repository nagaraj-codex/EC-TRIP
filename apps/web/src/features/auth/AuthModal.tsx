import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../../store/slices/authStore";
import { SignInTab } from "./components/SignInTab";
import { SignUpTab } from "./components/SignUpTab";
import { GuestTab } from "./components/GuestTab";

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "guest">("signin");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authModalOpen) {
      setActiveTab(authModalMode === "signup" ? "signup" : "signin");
      setError("");
    }
  }, [authModalOpen, authModalMode]);

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-[460px] my-auto bg-[#0b1326] border border-[#1d2a48] rounded-[28px] shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#16223d]/80 hover:bg-[#1e2e50] text-slate-300 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pt-7 pb-4 px-6 text-center border-b border-[#141f38] bg-gradient-to-b from-[#0f1a36] to-[#0b1326]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 shadow-lg shadow-brand-500/25 mb-2.5 text-2xl">
            🎢
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-black text-xl tracking-tight text-white">QueueCut</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
              AI Auth
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Theme park crowd forecasting, dynamic pricing & wait intelligence
          </p>

          <div className="grid grid-cols-3 gap-1 p-1 bg-[#060b17] border border-[#162340] rounded-2xl mt-4">
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "signin"
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0c1428]"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("signup"); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "signup"
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0c1428]"
              }`}
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("guest"); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "guest"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0c1428]"
              }`}
            >
              Guest
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {activeTab === "signin" && (
          <SignInTab
            onSwitchToSignup={() => { setActiveTab("signup"); setError(""); }}
            setError={setError}
          />
        )}

        {activeTab === "signup" && (
          <SignUpTab
            onSwitchToSignin={() => { setActiveTab("signin"); setError(""); }}
            setError={setError}
          />
        )}

        {activeTab === "guest" && <GuestTab />}
      </div>
    </div>
  );
}
