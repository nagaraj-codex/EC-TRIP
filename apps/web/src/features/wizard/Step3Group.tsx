import { usePlannerStore } from "../../store/slices/plannerStore";
import { Users, ArrowRight, ArrowLeft } from "lucide-react";

export default function Step3Group() {
  const {
    adults,
    children612,
    children05,
    groupType,
    updateCounter,
    setGroupType,
    setScreen,
  } = usePlannerStore();

  const Counter = ({
    label,
    value,
    type,
    sublabel
  }: {
    label: string;
    value: number;
    type: any;
    sublabel: string;
  }) => (
    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
      <div>
        <div className="font-bold text-xs text-white">{label}</div>
        <div className="text-[10px] text-slate-400">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-base transition-all"
          onClick={() => updateCounter(type, -1)}
        >
          &minus;
        </button>
        <span className="w-6 text-center font-extrabold text-base text-white">
          {value}
        </span>
        <button
          type="button"
          className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-base transition-all"
          onClick={() => updateCounter(type, 1)}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30">
          Step 3 of 4
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
          Who is in your group?
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          We tune ride eligibility, FastTrack pack math, and dining recommendations.
        </p>
      </div>

      <div className="space-y-2.5">
        <Counter label="Adults (12+ yrs)" value={adults} type="adults" sublabel="Full adult ticket tariff" />
        <Counter label="Children (6–12 yrs)" value={children612} type="children612" sublabel="Child discount eligible" />
        <Counter label="Toddlers (0–5 yrs)" value={children05} type="children05" sublabel="Complimentary gate entry" />
      </div>

      <div>
        <label className="form-label mt-2">Group Dynamic</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[
            { id: "family", icon: "👨‍👩‍👧‍👦", label: "Family" },
            { id: "couple", icon: "👫", label: "Couple" },
            { id: "friends", icon: "👥", label: "Friends" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroupType(g.id)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                groupType === g.id
                  ? "bg-brand-950/60 border-brand-500 shadow-glow-brand ring-2 ring-brand-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <span className="text-xl">{g.icon}</span>
              <span className="text-xs font-bold text-white">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={() => setScreen("step2")}
          className="btn btn-secondary flex-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => setScreen("step4")}
          className="btn btn-primary flex-2 text-xs"
        >
          <span>Continue to Budget</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
