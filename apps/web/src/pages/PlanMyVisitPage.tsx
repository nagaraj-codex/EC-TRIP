import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExploreStore } from "../store/slices/exploreStore";
import { useAuthStore } from "../store/slices/authStore";
import { apiClient } from "../services/apiClient";
import { usePlannerStore } from "../store/slices/plannerStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, MapPin, Calendar,
  CheckCircle2, Loader2, AlertCircle
} from "lucide-react";
import type { RecommendationResponse } from "../types/api";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: "Park"       },
  { num: 2, label: "Date"       },
  { num: 3, label: "Review"     },
  { num: 4, label: "Your Plan"  },
];

const GENERIC_IMAGE = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80";

export default function PlanMyVisitPage() {
  const navigate = useNavigate();
  const { destinations, loadDestinations, isLoading: parksLoading } = useExploreStore();
  const { sessionType } = useAuthStore();
  const { setRecommendation } = usePlannerStore();

  const [step, setStep]             = useState<Step>(1);
  const [selectedParkId, setSelectedParkId] = useState<string>("");
  const [selectedDate, setSelectedDate]     = useState<string>("");
  const [isLoadingRec, setIsLoadingRec]     = useState(false);
  const [recError, setRecError]             = useState("");
  const [recommendation, setLocalRecommendation] = useState<RecommendationResponse | null>(null);
  const [tripSaved, setTripSaved]           = useState(false);
  const [saveError, setSaveError]           = useState("");

  // Load parks on mount
  useState(() => { void loadDestinations(); });

  const selectedPark = destinations.find((p) => p.park_id === selectedParkId);

  // Min date = today
  const minDate = new Date().toISOString().split("T")[0];
  // Max date = 3 months from now
  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  })();

  const handleGetRecommendation = async () => {
    if (!selectedParkId || !selectedDate) return;
    setIsLoadingRec(true);
    setRecError("");
    try {
      // Build candidate dates: selected date + 2 surrounding dates
      const base = new Date(selectedDate);
      const candidates = [-1, 0, 1, 2].map((offset) => {
        const d = new Date(base);
        d.setDate(d.getDate() + offset);
        return d.toISOString().split("T")[0];
      }).filter((d) => d >= minDate);

      const result = await apiClient.recommend({
        park_id: selectedParkId,
        candidate_dates: candidates,
        priority: "Best Balanced",
      });
      setLocalRecommendation(result);
      setRecommendation(result);
      setStep(4);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : "Unable to generate recommendation.");
    } finally {
      setIsLoadingRec(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!selectedParkId || !selectedDate || !selectedPark) return;
    setSaveError("");
    try {
      const recEval = recommendation?.evaluations.find((e) => e.date === selectedDate)
        ?? recommendation?.evaluations[0];
      await apiClient.saveTrip({
        park_id: selectedParkId,
        visit_date: selectedDate,
        payload: {
          ticketPrice:      recEval?.ticket_price,
          crowdLevel:       recEval?.crowd_level,
          predictedWait:    recEval?.predicted_wait_top_ride_minutes,
          fastTrackVerdict: recEval?.fasttrack_verdict,
        },
      });
      setTripSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save trip.");
    }
  };

  const recEval = recommendation
    ? recommendation.evaluations.find((e) => e.date === recommendation.recommended_date)
      ?? recommendation.evaluations[0]
    : null;

  return (
    <div className="qc-page">
      {/* Back */}
      <button
        onClick={() => step === 1 ? navigate(-1) : setStep((s) => (s - 1) as Step)}
        className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-slate-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {step === 1 ? "Back" : "Previous step"}
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-900">Plan your visit</h1>
        <p className="text-slate-500 text-base mt-1">Let&apos;s build your park visit step by step.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10 max-w-lg">
        {STEPS.map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.num
                  ? "bg-qc-blue-600 text-white"
                  : step === s.num
                    ? "bg-qc-blue-600 text-white ring-4 ring-qc-blue-100"
                    : "bg-slate-100 text-slate-400"
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-medium mt-1 hidden sm:block ${
                step >= s.num ? "text-qc-blue-600" : "text-slate-400"
              }`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-all ${
                step > s.num ? "bg-qc-blue-600" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Choose Park ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Where are you going?</h2>

            {parksLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : destinations.length === 0 ? (
              <div className="qc-card-white rounded-2xl p-8 text-center">
                <p className="text-slate-500">No parks available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destinations.map((park) => (
                  <button
                    key={park.park_id}
                    onClick={() => setSelectedParkId(park.park_id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      selectedParkId === park.park_id
                        ? "border-qc-blue-600 bg-qc-blue-50"
                        : "border-slate-200 bg-white hover:border-qc-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={park.image ?? GENERIC_IMAGE}
                        alt={park.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${
                        selectedParkId === park.park_id ? "text-qc-blue-700" : "text-slate-900"
                      }`}>{park.name}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {park.city}
                      </p>
                    </div>
                    {selectedParkId === park.park_id && (
                      <CheckCircle2 className="w-5 h-5 text-qc-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedParkId}
                className="btn-blue-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Choose Date ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-2">When are you thinking of going?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Choose a date to see conditions for your visit to {selectedPark?.name}.
            </p>

            <div className="qc-card-white rounded-2xl p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 text-qc-blue-600" />
                Visit date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:border-qc-blue-500 focus:ring-2 focus:ring-qc-blue-500/20 outline-none transition-all"
              />
              <p className="text-slate-400 text-xs mt-2">You can plan up to 3 months ahead.</p>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-blue-secondary">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate}
                className="btn-blue-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Review your visit plan</h2>

            <div className="qc-card-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={selectedPark?.image ?? GENERIC_IMAGE}
                    alt={selectedPark?.name ?? ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{selectedPark?.name}</p>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedPark?.city}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Visit date</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short", day: "numeric", month: "long", year: "numeric"
                    }) : "—"}
                  </span>
                </div>
                {selectedPark?.operating_hours && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-500 text-sm">Operating hours</span>
                    <span className="font-semibold text-slate-900 text-sm">{selectedPark.operating_hours}</span>
                  </div>
                )}
                {selectedPark?.weekday_price && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-500 text-sm">From</span>
                    <span className="font-semibold text-qc-blue-600 text-sm">₹{selectedPark.weekday_price}</span>
                  </div>
                )}
              </div>
            </div>

            {recError && (
              <div className="mt-4 flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {recError}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn-blue-secondary">
                Back
              </button>
              <button
                onClick={() => void handleGetRecommendation()}
                disabled={isLoadingRec}
                className="btn-blue-primary disabled:opacity-50"
              >
                {isLoadingRec ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Getting conditions...</>
                ) : (
                  <>Create Visit Plan <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Result ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your visit plan</h2>
            <p className="text-slate-500 text-sm mb-6">
              Here&apos;s what we know about {selectedPark?.name} on your chosen date.
            </p>

            {recommendation && recEval ? (
              <div className="space-y-4">
                {/* Summary card */}
                <div className="qc-card-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={selectedPark?.image ?? GENERIC_IMAGE} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedPark?.name}</p>
                      <p className="text-slate-500 text-xs">
                        {new Date(recommendation.recommended_date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short", day: "numeric", month: "long"
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{recommendation.summary}</p>
                </div>

                {/* Conditions */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="qc-card-white rounded-2xl p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Crowd level</p>
                    <p className="font-bold text-slate-900 capitalize">{recEval.crowd_level.replace("_", " ")}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Confidence: {recEval.confidence}</p>
                  </div>
                  <div className="qc-card-white rounded-2xl p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Est. wait</p>
                    <p className="font-bold text-slate-900">{recEval.predicted_wait_top_ride_minutes} min</p>
                    <p className="text-slate-500 text-xs mt-0.5">Top ride</p>
                  </div>
                  <div className="qc-card-white rounded-2xl p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Ticket from</p>
                    <p className="font-bold text-slate-900">₹{recEval.ticket_price}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Per person</p>
                  </div>
                  <div className="qc-card-white rounded-2xl p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">FastTrack</p>
                    <p className="font-bold text-slate-900 capitalize">{recEval.fasttrack_verdict}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Verdict</p>
                  </div>
                </div>

                {/* Reasoning */}
                {recEval.reasoning && (
                  <div className="qc-card-white rounded-2xl p-5">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Why this recommendation</p>
                    <p className="text-slate-700 text-sm leading-relaxed">{recEval.reasoning}</p>
                  </div>
                )}

                {/* Save Trip */}
                {sessionType === "authenticated" && (
                  <div>
                    {tripSaved ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5" /> Trip saved to My Trips
                      </div>
                    ) : (
                      <>
                        <button onClick={() => void handleSaveTrip()} className="btn-blue-primary w-full">
                          Save Trip
                        </button>
                        {saveError && <p className="text-red-500 text-xs mt-2">{saveError}</p>}
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate("/app/trips")}
                  className="btn-blue-secondary w-full"
                >
                  View My Trips
                </button>
              </div>
            ) : (
              <div className="qc-card-white rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">
                  Not enough information to generate a recommendation yet.
                </p>
                <button onClick={() => setStep(3)} className="btn-blue-secondary mt-4">
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
