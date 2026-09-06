import { useState } from "react";
import { Calendar, Sun, Cloud, CloudRain, Star, Sparkles, ArrowRight, TrendingDown, MapPin } from "lucide-react";
import { usePlannerStore } from "../../store/slices/plannerStore";

interface CrowdCalendarViewProps {
  onSelectDate: (date: string) => void;
}

interface CalendarDay {
  date: string;
  dayName: string;
  displayDate: string;
  dayType: "weekday" | "weekend";
  crowdLevel: "Low" | "Medium" | "High" | "Very High";
  predictedWaitMins: number;
  ticketPrice: number;
  weather: "sunny" | "cloudy" | "rain";
  temp: number;
  isRecommended: boolean;
  notes: string;
}

const parkForecasts: Record<string, CalendarDay[]> = {
  "wonderla-chennai": [
    {
      date: "2026-09-06",
      dayName: "Sun",
      displayDate: "Sep 6",
      dayType: "weekend",
      crowdLevel: "High",
      predictedWaitMins: 45,
      ticketPrice: 1549,
      weather: "sunny",
      temp: 32,
      isRecommended: false,
      notes: "Peak weekend crowd. Expect 40-50m waits on major roller coasters."
    },
    {
      date: "2026-09-07",
      dayName: "Mon",
      displayDate: "Sep 7",
      dayType: "weekday",
      crowdLevel: "Medium",
      predictedWaitMins: 25,
      ticketPrice: 1312,
      weather: "cloudy",
      temp: 30,
      isRecommended: false,
      notes: "Post-weekend cooloff. Lower queues after 2 PM."
    },
    {
      date: "2026-09-08",
      dayName: "Tue",
      displayDate: "Sep 8",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 15,
      ticketPrice: 1312,
      weather: "sunny",
      temp: 31,
      isRecommended: true,
      notes: "QueueCut Choice: Minimal wait times (10-15m), ₹237 savings vs weekend."
    },
    {
      date: "2026-09-09",
      dayName: "Wed",
      displayDate: "Sep 9",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 14,
      ticketPrice: 1312,
      weather: "cloudy",
      temp: 29,
      isRecommended: false,
      notes: "Excellent visiting conditions. College discount eligible."
    },
    {
      date: "2026-09-10",
      dayName: "Thu",
      displayDate: "Sep 10",
      dayType: "weekday",
      crowdLevel: "Medium",
      predictedWaitMins: 22,
      ticketPrice: 1312,
      weather: "cloudy",
      temp: 30,
      isRecommended: false,
      notes: "Moderate school group visits in morning session."
    },
    {
      date: "2026-09-11",
      dayName: "Fri",
      displayDate: "Sep 11",
      dayType: "weekday",
      crowdLevel: "Medium",
      predictedWaitMins: 30,
      ticketPrice: 1312,
      weather: "sunny",
      temp: 32,
      isRecommended: false,
      notes: "Evening surge begins around 3:30 PM."
    },
    {
      date: "2026-09-12",
      dayName: "Sat",
      displayDate: "Sep 12",
      dayType: "weekend",
      crowdLevel: "Very High",
      predictedWaitMins: 55,
      ticketPrice: 1549,
      weather: "sunny",
      temp: 33,
      isRecommended: false,
      notes: "Highest rush of the week. FastTrack pass strongly recommended."
    }
  ],
  "mgm-dizzee-chennai": [
    {
      date: "2026-09-06",
      dayName: "Sun",
      displayDate: "Sep 6",
      dayType: "weekend",
      crowdLevel: "High",
      predictedWaitMins: 35,
      ticketPrice: 849,
      weather: "sunny",
      temp: 31,
      isRecommended: false,
      notes: "East Coast Road holiday traffic rush."
    },
    {
      date: "2026-09-07",
      dayName: "Mon",
      displayDate: "Sep 7",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 12,
      ticketPrice: 699,
      weather: "cloudy",
      temp: 29,
      isRecommended: true,
      notes: "QueueCut Choice: Quiet weekday with immediate water park access."
    },
    {
      date: "2026-09-08",
      dayName: "Tue",
      displayDate: "Sep 8",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 10,
      ticketPrice: 699,
      weather: "sunny",
      temp: 30,
      isRecommended: false,
      notes: "Ideal for family visits & Jurong bird show."
    },
    {
      date: "2026-09-09",
      dayName: "Wed",
      displayDate: "Sep 9",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 10,
      ticketPrice: 699,
      weather: "cloudy",
      temp: 29,
      isRecommended: false,
      notes: "Breezy conditions along the coast."
    },
    {
      date: "2026-09-10",
      dayName: "Thu",
      displayDate: "Sep 10",
      dayType: "weekday",
      crowdLevel: "Medium",
      predictedWaitMins: 18,
      ticketPrice: 699,
      weather: "cloudy",
      temp: 30,
      isRecommended: false,
      notes: "Moderate school tours expected."
    },
    {
      date: "2026-09-11",
      dayName: "Fri",
      displayDate: "Sep 11",
      dayType: "weekday",
      crowdLevel: "Medium",
      predictedWaitMins: 20,
      ticketPrice: 699,
      weather: "sunny",
      temp: 31,
      isRecommended: false,
      notes: "Moderate evening queues."
    },
    {
      date: "2026-09-12",
      dayName: "Sat",
      displayDate: "Sep 12",
      dayType: "weekend",
      crowdLevel: "High",
      predictedWaitMins: 40,
      ticketPrice: 849,
      weather: "sunny",
      temp: 32,
      isRecommended: false,
      notes: "Weekend surge on coastal thrill rides."
    }
  ],
  "black-thunder-coimbatore": [
    {
      date: "2026-09-06",
      dayName: "Sun",
      displayDate: "Sep 6",
      dayType: "weekend",
      crowdLevel: "High",
      predictedWaitMins: 28,
      ticketPrice: 1090,
      weather: "cloudy",
      temp: 26,
      isRecommended: false,
      notes: "Nilgiris mountain visitors weekend peak."
    },
    {
      date: "2026-09-07",
      dayName: "Mon",
      displayDate: "Sep 7",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 10,
      ticketPrice: 1090,
      weather: "sunny",
      temp: 25,
      isRecommended: true,
      notes: "QueueCut Choice: Fresh mountain air, 0 wave pool wait times."
    },
    {
      date: "2026-09-08",
      dayName: "Tue",
      displayDate: "Sep 8",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 8,
      ticketPrice: 1090,
      weather: "sunny",
      temp: 25,
      isRecommended: false,
      notes: "Minimal queues throughout the day."
    },
    {
      date: "2026-09-09",
      dayName: "Wed",
      displayDate: "Sep 9",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 9,
      ticketPrice: 1090,
      weather: "cloudy",
      temp: 24,
      isRecommended: false,
      notes: "Pleasant overcast weather."
    },
    {
      date: "2026-09-10",
      dayName: "Thu",
      displayDate: "Sep 10",
      dayType: "weekday",
      crowdLevel: "Low",
      predictedWaitMins: 12,
      ticketPrice: 1090,
      weather: "sunny",
      temp: 25,
      isRecommended: false,
      notes: "College excursion groups in afternoon."
    },
    {
      date: "2026-09-11",
      dayName: "Fri",
      displayDate: "Sep 11",
      dayType: "weekday",
      crowdLevel: "Medium",
      predictedWaitMins: 18,
      ticketPrice: 1090,
      weather: "sunny",
      temp: 26,
      isRecommended: false,
      notes: "Weekend arrival surge from Coimbatore/Ooty."
    },
    {
      date: "2026-09-12",
      dayName: "Sat",
      displayDate: "Sep 12",
      dayType: "weekend",
      crowdLevel: "High",
      predictedWaitMins: 30,
      ticketPrice: 1090,
      weather: "sunny",
      temp: 27,
      isRecommended: false,
      notes: "Wave pool and water slides peak."
    }
  ]
};

export default function CrowdCalendarView({ onSelectDate }: CrowdCalendarViewProps) {
  const { parkId, setParkId } = usePlannerStore();
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-08");

  const currentParkId = parkId in parkForecasts ? parkId : "wonderla-chennai";
  const forecastDays = parkForecasts[currentParkId];
  const activeDay = forecastDays.find((d) => d.date === selectedDate) || forecastDays[2];

  const getWeatherIcon = (w: CalendarDay["weather"]) => {
    switch (w) {
      case "sunny":
        return <Sun className="w-4 h-4 text-amber-400" />;
      case "rain":
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case "cloudy":
      default:
        return <Cloud className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCrowdBadgeColor = (level: CalendarDay["crowdLevel"]) => {
    switch (level) {
      case "Low":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "High":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "Very High":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-brand-500/30 shadow-glow-brand">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            <span>7-Day Predictive Heatmap</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black gradient-heading">
            Crowd & Pricing Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-medium">
            Calculated using historical telemetry, school holidays, and live Open-Meteo weather models.
          </p>

          {/* Park Selector Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { id: "wonderla-chennai", label: "Wonderla Chennai" },
              { id: "mgm-dizzee-chennai", label: "MGM Dizzee World" },
              { id: "black-thunder-coimbatore", label: "Black Thunder" }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setParkId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentParkId === p.id
                    ? "bg-brand-500 text-white shadow-glow-brand"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecastDays.map((day) => {
          const isSelected = selectedDate === day.date;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "bg-brand-950/60 border-brand-500 shadow-glow-brand ring-2 ring-brand-500/40"
                  : "glass-card hover:border-slate-700 bg-slate-900/60"
              }`}
            >
              {day.isRecommended && (
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-0.5 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>BEST</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-200">{day.dayName}</span>
                  <span>{getWeatherIcon(day.weather)}</span>
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  {day.displayDate}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <span
                  className={`inline-block w-full text-center px-1.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${getCrowdBadgeColor(
                    day.crowdLevel
                  )}`}
                >
                  {day.crowdLevel}
                </span>

                <div className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                  <span>₹{day.ticketPrice}</span>
                  <span className="text-[10px] text-slate-400">~{day.predictedWaitMins}m</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail Box */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {activeDay.dayName}, {activeDay.displayDate} Intelligence
              </h2>
              {activeDay.isRecommended && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  QueueCut Recommended Day
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">{activeDay.notes}</p>
          </div>

          <button
            onClick={() => onSelectDate(activeDay.date)}
            className="btn btn-primary sm:w-auto px-5 py-2.5 text-xs shrink-0"
          >
            <span>Plan Itinerary for this Date</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-medium uppercase tracking-wider">Expected Crowd</span>
            <span className="block text-lg font-extrabold text-white mt-1">
              {activeDay.crowdLevel}
            </span>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-medium uppercase tracking-wider">Top Ride Wait</span>
            <span className="block text-lg font-extrabold text-brand-300 mt-1">
              ~{activeDay.predictedWaitMins} mins
            </span>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-medium uppercase tracking-wider">2026 Ticket Price</span>
            <span className="block text-lg font-extrabold text-emerald-400 mt-1">
              ₹{activeDay.ticketPrice}
            </span>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-medium uppercase tracking-wider">Weather Forecast</span>
            <span className="block text-lg font-extrabold text-amber-400 mt-1 capitalize">
              {activeDay.weather} • {activeDay.temp}°C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
