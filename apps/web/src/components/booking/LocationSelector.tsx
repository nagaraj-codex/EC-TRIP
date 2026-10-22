import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { RECENT_ORIGIN_STORAGE_KEY } from "../../data/bookingOptions";
import { useDismissablePopover } from "../../hooks/useDismissablePopover";

interface LocationSelectorProps {
  cities: string[];
  value: string;
  onChange: (city: string) => void;
}

function readRecentCities(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(RECENT_ORIGIN_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((city): city is string => typeof city === "string").slice(0, 4) : [];
  } catch {
    return [];
  }
}

export default function LocationSelector({ cities, value, onChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentCities, setRecentCities] = useState(readRecentCities);
  const containerRef = useDismissablePopover<HTMLDivElement>(isOpen, setIsOpen);

  const filteredCities = useMemo(
    () => cities.filter((city) => city.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),
    [cities, query],
  );
  const visibleRecent = recentCities.filter((city) => filteredCities.includes(city));

  const chooseCity = (city: string) => {
    const nextRecent = [city, ...recentCities.filter((recent) => recent !== city)].slice(0, 4);
    setRecentCities(nextRecent);
    try {
      window.localStorage.setItem(RECENT_ORIGIN_STORAGE_KEY, JSON.stringify(nextRecent));
    } catch {
      // The current selection still works if browser storage is unavailable.
    }
    onChange(city);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Current city
      </p>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Current city: ${value}. Choose a different city.`}
        onClick={() => setIsOpen((open) => !open)}
        className="mt-2 flex min-h-6 w-full items-center justify-between gap-2 text-left text-[15px] font-bold text-slate-900 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
      <p className="mt-1 text-[11px] text-slate-500">Starting point</p>

      {isOpen && (
        <div role="dialog" aria-label="Choose your current city" className="absolute left-0 top-full z-30 mt-2 w-[min(340px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,.18)]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city"
              aria-label="Search origin city"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-hidden placeholder:text-slate-400"
            />
          </label>

          {visibleRecent.length > 0 && (
            <section className="mt-3">
              <h3 className="px-2 pb-1 text-[10px] font-bold uppercase text-slate-500">Recent locations</h3>
              {visibleRecent.map((city) => (
                <button key={`recent-${city}`} type="button" onClick={() => chooseCity(city)} className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> {city}
                </button>
              ))}
            </section>
          )}

          <section className="mt-3 max-h-56 overflow-y-auto">
            <h3 className="px-2 pb-1 text-[10px] font-bold uppercase text-slate-500">Popular cities</h3>
            {filteredCities.length > 0 ? filteredCities.map((city) => (
              <button key={city} type="button" onClick={() => chooseCity(city)} aria-current={city === value ? "true" : undefined} className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">
                <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span className="flex-1">{city}</span>
                {city === value && <span className="text-xs font-semibold text-blue-700">Selected</span>}
              </button>
            )) : (
              <p className="px-2 py-3 text-sm text-slate-500">No matching cities. Try another search.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
