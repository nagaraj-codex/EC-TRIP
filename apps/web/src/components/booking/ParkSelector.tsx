import { useMemo, useState } from "react";
import { ChevronDown, Compass, MapPin, Search } from "lucide-react";
import type { ParkSummary } from "../../types/api";
import { useDismissablePopover } from "../../hooks/useDismissablePopover";

interface ParkSelectorProps {
  parks: ParkSummary[];
  value: string;
  onChange: (parkId: string) => void;
  disabled?: boolean;
}

export default function ParkSelector({ parks, value, onChange, disabled = false }: ParkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useDismissablePopover<HTMLDivElement>(isOpen, setIsOpen);
  const selectedPark = parks.find((park) => park.park_id === value);

  const visibleParks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return parks;
    return parks.filter((park) =>
      [park.name, park.city, park.state].some((field) =>
        field?.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [parks, query]);

  const choosePark = (park: ParkSummary) => {
    onChange(park.park_id);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
        <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Destination park
      </p>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Destination park: ${selectedPark?.name ?? "Choose a park"}. Select a park.`}
        disabled={disabled || parks.length === 0}
        onClick={() => setIsOpen((open) => !open)}
        className="mt-2 flex min-h-6 w-full items-center justify-between gap-2 text-left text-[15px] font-bold text-slate-900 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        <span className="truncate">{selectedPark?.name ?? (disabled ? "Loading parks..." : "No parks available")}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
      <p className="mt-1 truncate text-[11px] text-slate-500">
        {selectedPark ? [selectedPark.city, selectedPark.state].filter(Boolean).join(", ") : "Choose a catalog park"}
      </p>

      {isOpen && (
        <div role="dialog" aria-label="Choose a destination park" className="absolute left-0 top-full z-30 mt-2 w-[min(380px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,.18)]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by park, city, or state"
              aria-label="Search parks by name, city, or state"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-hidden placeholder:text-slate-400"
            />
          </label>
          <div className="mt-2 max-h-64 overflow-y-auto" role="listbox" aria-label="Park search results">
            {visibleParks.length > 0 ? visibleParks.map((park) => (
              <button
                key={park.park_id}
                type="button"
                role="option"
                onClick={() => choosePark(park)}
                onKeyDown={(event) => {
                  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const options = Array.from(
                    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[role='option']") ?? [],
                  );
                  const currentIndex = options.indexOf(event.currentTarget);
                  const nextIndex = event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? options.length - 1
                      : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
                  options[nextIndex]?.focus();
                }}
                aria-selected={park.park_id === value}
                className="flex min-h-12 w-full items-center gap-3 rounded-md px-2 text-left hover:bg-slate-50 focus-visible:bg-slate-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{park.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {[park.city, park.state].filter(Boolean).join(", ")}
                  </span>
                </span>
                {park.park_id === value && <span className="text-xs font-semibold text-blue-700">Selected</span>}
              </button>
            )) : (
              <p className="px-2 py-4 text-sm text-slate-500">No parks match that search. Try a park name, city, or state.</p>
            )}
          </div>
          <p className="border-t border-slate-100 px-2 pt-2 text-[10px] text-slate-500">Results are from QueueCut&apos;s verified park catalog.</p>
        </div>
      )}
    </div>
  );
}
