// HomePage.tsx — complete rebuild
// NO fake data, NO PEACE_SCORES, NO per-park HERO_IMAGES
// White+blue design, real API data only

import { useEffect, useMemo, useState } from "react";
import { useParksQuery } from "../lib/apiHooks";
import { useNavigate } from "react-router-dom";
import { useExploreStore } from "../store/slices/exploreStore";
import { usePlannerStore } from "../store/slices/plannerStore";
import { useUIStore } from "../store/slices/uiStore";
import { apiClient } from "../services/apiClient";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CircleHelp,
  Compass,
  Crown,
  Gamepad2,
  LoaderCircle,
  MapPin,
  PawPrint,
  PartyPopper,
  Sparkles,
  Waves,
} from "lucide-react";
import type { RecommendationRequest } from "../types/api";
import CategoryTab from "../components/booking/CategoryTab";
import DateSelector from "../components/booking/DateSelector";
import LocationSelector from "../components/booking/LocationSelector";
import ParkSelector from "../components/booking/ParkSelector";
import PassSelector, { type PassOption } from "../components/booking/PassSelector";
import TravellerSelector from "../components/booking/TravellerSelector";
import OffersSection from "../components/offers/OffersSection";
import ParkIntelligencePreview from "../components/intelligence/ParkIntelligencePreview";
import Skeleton from "../components/common/Skeleton";
import ChoiceChip from "../components/common/ChoiceChip";
import { POPULAR_ORIGIN_CITIES } from "../data/bookingOptions";
import { queueCutAssets } from "../data/assetConfig";
import type { TravellerCounts } from "../types/booking";

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const dateCandidates = (selectedDate: string) => {
  const date = new Date(`${selectedDate}T12:00:00`);
  return [0, 1, 2, 3].map((offset) => {
    const candidate = new Date(date);
    candidate.setDate(candidate.getDate() + offset);
    return candidate.toISOString().slice(0, 10);
  });
};

const recommendationPriorities: RecommendationRequest["priority"][] = [
  "Best Balanced",
  "Least Crowded",
  "Cheapest",
  "Maximum Rides",
];

const bookingCategories = [
  { label: "Theme parks", icon: Compass, active: true },
  { label: "Water parks", icon: Waves },
  { label: "Zoos & safaris", icon: PawPrint },
  { label: "Arcades", icon: Gamepad2 },
  { label: "Carnivals", icon: PartyPopper },
  { label: "VIP experiences", icon: Crown },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { data: destinations = [], isLoading, error, refetch } = useParksQuery();
  const {  } = useExploreStore();
  const setRecommendation = usePlannerStore((state) => state.setRecommendation);
  const setAdvisorOpen = useUIStore((state) => state.setAdvisorOpen);
  const [origin, setOrigin] = useState("Chennai");
  const [parkId, setParkId] = useState("");
  const [visitDate, setVisitDate] = useState(today);
  const [ticketOption, setTicketOption] = useState<PassOption | null>(null);
  const [travellerCounts, setTravellerCounts] = useState<TravellerCounts>({ adults: 2, children: 0, seniors: 0 });
  const [tripType, setTripType] = useState<"day" | "multi">("day");
  const [priority, setPriority] = useState<RecommendationRequest["priority"]>("Best Balanced");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  

  useEffect(() => {
    if (!parkId && destinations.length > 0) setParkId(destinations[0].park_id);
  }, [destinations, parkId]);

  const originOptions = useMemo(
    () => Array.from(new Set([...POPULAR_ORIGIN_CITIES, ...destinations.map((park) => park.city)])),
    [destinations],
  );

  const selectedPark = destinations.find((park) => park.park_id === parkId);
  const totalTravellers = travellerCounts.adults + travellerCounts.children + travellerCounts.seniors;

  const handlePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!parkId || !visitDate) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const recommendation = await apiClient.recommend({
        park_id: parkId,
        candidate_dates: dateCandidates(visitDate),
        priority,
      });
      setRecommendation(recommendation);
      navigate("/app/plan", {
        state: {
          parkId,
          date: visitDate,
          ticketOption,
          origin,
          travellers: totalTravellers,
          travellerCounts,
          tripType,
          priority,
          recommendation,
        },
      });
    } catch (requestError) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't check park conditions. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <section
        aria-labelledby="home-title"
        className="relative flex min-h-[780px] flex-col overflow-hidden bg-slate-950 px-4 pb-20 pt-28 sm:px-6 lg:min-h-[780px] lg:px-8 lg:pb-24 lg:pt-32"
      >
        <img src={queueCutAssets.hero} alt="" aria-hidden="true" width={2400} height={1350} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,29,.28)_0%,rgba(8,16,29,.16)_32%,rgba(8,16,29,.70)_100%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-7 text-center text-white"
          >
            <p className="mb-2 text-xs font-bold uppercase text-blue-100">A better day starts before the gates</p>
            <h1 id="home-title" className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Make the most of your park day.
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/85 sm:text-base">
              Choose a park and date. QueueCut checks the forecast and helps you plan around it.
            </p>
          </motion.div>

          <motion.form
            onSubmit={(event) => void handlePlan(event)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="ota-booking-console relative ring-1 ring-black/5"
          >
            <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0 disabled:cursor-wait">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3 sm:px-6" aria-label="Park categories">
              {bookingCategories.map(({ label, icon, active }) => (
                <CategoryTab
                  key={label}
                  label={label}
                  icon={icon}
                  active={active}
                  disabled={!active}
                  disabledReason={!active ? "The verified QueueCut catalog does not currently classify parks in this category." : undefined}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 text-xs text-slate-600 sm:px-7">
              <label className="inline-flex cursor-pointer items-center gap-2 font-semibold">
                <input type="radio" name="trip-type" checked={tripType === "day"} onChange={() => setTripType("day")} className="h-4 w-4 accent-blue-600" />
                Single-day visit
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 font-semibold">
                <input type="radio" name="trip-type" checked={tripType === "multi"} onChange={() => setTripType("multi")} className="h-4 w-4 accent-blue-600" />
                Multi-day visit
              </label>
              <span className="ml-auto hidden items-center gap-1 text-slate-500 sm:inline-flex">
                <CircleHelp className="h-3.5 w-3.5" /> Crowd forecast is generated for your selected date
              </span>
            </div>

            <div className="mx-4 grid overflow-hidden rounded-lg border border-slate-200 sm:mx-6 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr_1fr]">
              <LocationSelector cities={originOptions} value={origin} onChange={setOrigin} />

              <ParkSelector
                parks={destinations}
                value={parkId}
                onChange={setParkId}
                disabled={isLoading || destinations.length === 0}
              />

              <DateSelector value={visitDate} minDate={today()} onChange={setVisitDate} />

              <TravellerSelector counts={travellerCounts} onChange={setTravellerCounts} />
            </div>

            <div className="mx-4 mt-3 rounded-lg border border-slate-200 sm:mx-6">
              <PassSelector parkId={parkId} value={ticketOption?.id ?? ""} onChange={setTicketOption} />
            </div>

            <div className="flex flex-col gap-3 px-5 pb-7 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <fieldset>
                <legend className="mb-2 text-[10px] font-bold uppercase text-slate-500">Planning priority</legend>
                <div className="flex flex-wrap gap-2">
                  {recommendationPriorities.map((option) => (
                    <ChoiceChip key={option} inputType="radio" name="priority" value={option} checked={priority === option} onChange={() => setPriority(option)} label={option} />
                  ))}
                </div>
              </fieldset>
              <p className="max-w-xs text-[11px] leading-relaxed text-slate-500">
                Ticket count and trip type are planning details; the current forecast API evaluates park and dates.
              </p>
            </div>

            {submitError && (
              <div role="alert" className="mx-5 mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-7">
                {submitError}
              </div>
            )}
            </fieldset>

            <div className="absolute bottom-0 left-1/2 z-10 w-[min(340px,calc(100%-32px))] -translate-x-1/2 translate-y-1/2">
              <button type="submit" disabled={isSubmitting || isLoading || destinations.length === 0} className="ota-booking-cta flex min-h-14 w-full items-center justify-center gap-2 px-6 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:text-base">
                {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> CHECKING...</> : <>CHECK CROWD &amp; PLAN <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </motion.form>
          {error && destinations.length === 0 && !isLoading && (
            <div role="status" className="mx-auto mt-12 flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-700 shadow-lg">
              Park catalog unavailable.
              <button type="button" onClick={() => void refetch()} className="font-semibold text-blue-700 underline">Retry</button>
            </div>
          )}
        </div>

        <div className="relative z-0 mx-auto mt-24 flex w-full max-w-[900px] flex-wrap justify-center gap-2 sm:mt-20">
          {[
            { label: "Explore parks", path: "/app/explore", icon: Compass },
            { label: "My trips", path: "/app/trips", icon: CalendarDays },
          ].map(({ label, path, icon: Icon }) => (
            <button key={label} type="button" onClick={() => navigate(path)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/35 bg-black/20 px-4 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/15 focus-visible:outline-white">
              <Icon className="h-4 w-4" /> {label} <ArrowRight className="h-3 w-3" />
            </button>
          ))}
          <button type="button" onClick={() => setAdvisorOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/35 bg-black/20 px-4 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/15 focus-visible:outline-white">
            <Sparkles className="h-4 w-4" /> Ask QueueCut <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-9 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase text-blue-700">QueueCut intelligence</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">Parks in QueueCut&apos;s catalog</h2>
          </div>
          <button type="button" onClick={() => navigate("/app/explore")} className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900">
            Browse all parks <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {isLoading ? (
          <div className="mt-5"><Skeleton variant="park" count={3} /></div>
        ) : destinations.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((park) => (
              <button key={park.park_id} type="button" onClick={() => navigate(`/app/explore/${park.park_id}`)} className="group flex min-h-24 items-center justify-between gap-4 bg-white px-5 py-4 text-left transition hover:bg-blue-50 focus-visible:z-10">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">{park.name}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {park.city}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </button>
            ))}
          </div>
        ) : (
          <p className="py-8 text-sm text-slate-600">Park information is temporarily unavailable.</p>
        )}
        <p className="mt-3 text-[11px] text-slate-500">Park list sourced from QueueCut&apos;s catalog. Offers and live operating status are not shown unless verified.</p>
      </section>
      <OffersSection parks={destinations} />
      <ParkIntelligencePreview park={selectedPark} />
    </div>
  );
}
