import { useState } from "react";
import { ChevronDown, Minus, Plus, Users } from "lucide-react";
import { MAX_TRAVELLERS, type TravellerCounts } from "../../types/booking";
import { useDismissablePopover } from "../../hooks/useDismissablePopover";

interface TravellerSelectorProps {
  counts: TravellerCounts;
  onChange: (counts: TravellerCounts) => void;
}

const ROWS: Array<{ key: keyof TravellerCounts; label: string; singular: string; detail: string; minimum: number }> = [
  { key: "adults", label: "Adults", singular: "adult", detail: "Ages 13 and over", minimum: 1 },
  { key: "children", label: "Children", singular: "child", detail: "Ages 0–12", minimum: 0 },
  { key: "seniors", label: "Seniors", singular: "senior", detail: "Senior visitors", minimum: 0 },
];

export default function TravellerSelector({ counts, onChange }: TravellerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useDismissablePopover<HTMLDivElement>(isOpen, setIsOpen);
  const total = counts.adults + counts.children + counts.seniors;
  const summary = [
    counts.adults > 0 ? `${counts.adults} ${counts.adults === 1 ? "adult" : "adults"}` : "",
    counts.children > 0 ? `${counts.children} ${counts.children === 1 ? "child" : "children"}` : "",
    counts.seniors > 0 ? `${counts.seniors} ${counts.seniors === 1 ? "senior" : "seniors"}` : "",
  ].filter(Boolean).join(", ");

  const updateCount = (key: keyof TravellerCounts, delta: number, minimum: number) => {
    const nextCount = counts[key] + delta;
    const nextTotal = total + delta;
    if (nextCount < minimum || nextTotal < 1 || nextTotal > MAX_TRAVELLERS) return;
    onChange({ ...counts, [key]: nextCount });
  };

  return (
    <div ref={containerRef} className="relative min-w-0 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
        <Users className="h-3.5 w-3.5" aria-hidden="true" /> Travellers
      </p>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Travellers: ${total} ${total === 1 ? "ticket" : "tickets"}, ${summary}. Adjust travellers.`}
        onClick={() => setIsOpen((open) => !open)}
        className="mt-2 flex min-h-6 w-full items-center justify-between gap-2 text-left text-[15px] font-bold text-slate-900 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span>{total} {total === 1 ? "ticket" : "tickets"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
      <p className="mt-1 truncate text-[11px] text-slate-500">{summary}</p>

      {isOpen && (
        <div role="dialog" aria-label="Choose travellers" className="absolute left-0 top-full z-30 mt-2 w-[min(340px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,.18)]">
          {ROWS.map(({ key, label, singular, detail, minimum }) => (
            <div key={key} className="flex min-h-[68px] items-center justify-between gap-3 border-b border-slate-100 last:border-b-0">
              <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-[11px] text-slate-500">{detail}</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label={`Remove one ${singular}`} disabled={counts[key] <= minimum || total <= 1} onClick={() => updateCount(key, -1, minimum)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold tabular-nums text-slate-900" aria-live="polite">{counts[key]}</span>
                <button type="button" aria-label={`Add one ${singular}`} disabled={total >= MAX_TRAVELLERS} onClick={() => updateCount(key, 1, minimum)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 text-xs">
            <span className="font-semibold text-slate-900">Total tickets</span>
            <span className="font-bold text-blue-700">{total} / {MAX_TRAVELLERS}</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Group size is saved as planning context; the current crowd recommendation evaluates park and dates.</p>
        </div>
      )}
    </div>
  );
}
