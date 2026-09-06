import { usePlannerStore } from "../../store/slices/plannerStore";
import { Sparkles, MapPin, Ticket, ArrowRight } from "lucide-react";

export default function Step1Park() {
  const { parkId, setParkId, setScreen } = usePlannerStore();

  const handleSelect = (id: string) => {
    setParkId(id);
    setScreen("step2");
  };

  const parks = [
    {
      id: "wonderla-chennai",
      name: "Wonderla Amusement Park",
      location: "Chennai, Tamil Nadu",
      tagline: "45+ Thrill & Water Coasters • FastTrack Enabled",
      badge: "Flagship 2026 Facility",
      price: "₹1,312 / ₹1,549",
      icon: "🎢"
    },
    {
      id: "mgm-dizzee-chennai",
      name: "MGM Dizzee World",
      location: "East Coast Road, Chennai",
      tagline: "Classic Coastal Theme Park • Jurong Bird Show & Water World",
      badge: "Coastal Family Favorite",
      price: "₹699 / ₹849",
      icon: "🎡"
    },
    {
      id: "black-thunder-coimbatore",
      name: "Black Thunder Water Theme Park",
      location: "Mettupalayam, Coimbatore",
      tagline: "Premier Nilgiris Foothills Water Park • Mega Wave Pool",
      badge: "Foothills Resort Special",
      price: "₹1,090 Flat",
      icon: "🌊"
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30">
          Step 1 of 4
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
          Where are you visiting?
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select an attraction to forecast live wait times & dynamic rates.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {parks.map((p) => {
          const isSelected = parkId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative group ${
                isSelected
                  ? "bg-brand-950/60 border-brand-500 shadow-glow-brand ring-2 ring-brand-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-brand-500/50 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-sm text-white group-hover:text-brand-300 transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                      <span>{p.location}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0">
                  {p.badge}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Ticket className="w-3.5 h-3.5 text-brand-400" />
                  <span>2026: {p.price}</span>
                </div>
                <div className="flex items-center gap-1 text-brand-400 font-bold text-[11px] group-hover:translate-x-0.5 transition-transform">
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
