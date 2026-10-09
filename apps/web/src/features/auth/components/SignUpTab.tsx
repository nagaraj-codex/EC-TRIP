import React, { useState } from "react";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import { useAuthStore } from "../../../store/slices/authStore";
import { apiClient } from "../../../services/apiClient";

interface SignUpTabProps {
  onSwitchToSignin: () => void;
  setError: (msg: string) => void;
}

export const SignUpTab: React.FC<SignUpTabProps> = ({ onSwitchToSignin, setError }) => {
  const { setAuthenticatedUser, closeAuthModal } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dobDay, setDobDay] = useState("15");
  const [dobMonth, setDobMonth] = useState("Aug");
  const [dobYear, setDobYear] = useState("2000");
  const [contactInfo, setContactInfo] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullName = `${firstName.trim()} ${surname.trim()}`.trim();
    if (!fullName) {
      setError("Please enter your first name and surname.");
      return;
    }
    if (!contactInfo.trim() || !contactInfo.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!signupPassword || signupPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);
    apiClient.register({
      name: fullName,
      email: contactInfo.trim(),
      password: signupPassword,
    })
      .then(({ user }) => {
        setAuthenticatedUser(user);
        closeAuthModal();
      })
      .catch((err: Error) => {
        setError(err.message || "An account with that email already exists or registration failed.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="p-6 space-y-3.5 max-h-[72vh] overflow-y-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Get started on QueueCut
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Create an account to connect with theme park wait telemetry, crowd forecasts, and discount alerts.
        </p>
      </div>

      <form onSubmit={handleSignupSubmit} className="space-y-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#3897f0]"
              required
            />
            <input
              type="text"
              placeholder="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#3897f0]"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 mb-1">
            <span>Date of birth</span>
            <HelpCircle className="w-3 h-3 text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={dobDay}
              onChange={(e) => setDobDay(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#3897f0]"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-[#0b1326] text-white">
                  {d}
                </option>
              ))}
            </select>

            <select
              value={dobMonth}
              onChange={(e) => setDobMonth(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#3897f0]"
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (m) => (
                  <option key={m} value={m} className="bg-[#0b1326] text-white">
                    {m}
                  </option>
                )
              )}
            </select>

            <select
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#3897f0]"
            >
              {Array.from({ length: 65 }, (_, i) => 2018 - i).map((y) => (
                <option key={y} value={y} className="bg-[#0b1326] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Mobile number or email address
          </label>
          <input
            type="text"
            placeholder="Mobile number or email address"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#3897f0]"
            required
          />
          <p className="text-[10px] text-slate-400 mt-1 leading-tight">
            You may receive notifications from us. This information is used only for account access and trip delivery.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <div className="relative">
            <input
              type={showSignupPassword ? "text" : "password"}
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 bg-[#070e1d] border border-[#202f50] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#3897f0]"
              required
            />
            <button
              type="button"
              onClick={() => setShowSignupPassword(!showSignupPassword)}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
            >
              {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 space-y-1.5 pt-1 leading-relaxed bg-[#081022] p-3 rounded-xl border border-[#162340]">
          <p>
            QueueCut stores only the profile data needed for your account, trip history, and local notification preferences.
          </p>
          <p>
            By tapping Submit, you agree to create an account and to the app&apos;s current account, privacy, and cookie terms available in the product documentation.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-md transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Submit"}
        </button>

        <button
          type="button"
          onClick={onSwitchToSignin}
          className="w-full py-2.5 rounded-xl bg-[#15223d] hover:bg-[#1b2b4d] text-slate-200 font-semibold text-xs border border-[#233559] transition-colors"
        >
          I already have an account
        </button>
      </form>
    </div>
  );
};
