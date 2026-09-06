import React, { useState } from "react";
import { Save } from "lucide-react";
import { useAuthStore } from "../../../store/slices/authStore";

interface ProfileSettingsTabProps {
  onSaved: () => void;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({ onSaved }) => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || "Rahul Sharma");
  const [email, setEmail] = useState(user?.email || "rahul.sharma@gmail.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [homeCity, setHomeCity] = useState(user?.homeCity || "Chennai");
  const [preferredPark] = useState(user?.preferredPark || "wonderla-chennai");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      homeCity,
      preferredPark,
    });
    onSaved();
  };

  return (
    <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
        <div className="relative">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`
            }
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
        </div>
        <div>
          <div className="font-extrabold text-base text-white">{name}</div>
          <div className="text-xs text-slate-400">{user?.email || "Guest Explorer"}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {user ? `Provider: ${user.provider}` : "Status: Guest Mode"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Phone (for WhatsApp Alerts)</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Home City</label>
          <input
            type="text"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          className="btn btn-primary sm:w-auto px-6 py-2.5 text-xs font-bold"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
};
