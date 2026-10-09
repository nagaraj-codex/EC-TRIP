import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useDismissablePopover } from "../../hooks/useDismissablePopover";

interface DateSelectorProps {
  value: string;
  minDate: string;
  onChange: (date: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  if (!value) return "Select a date";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DateSelector({ value, minDate, onChange }: DateSelectorProps) {
  const initialDate = value ? new Date(`${value}T12:00:00`) : new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const containerRef = useDismissablePopover<HTMLDivElement>(isOpen, setIsOpen);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusDay = (date: Date) => {
    const key = dateKey(date);
    const target = dayRefs.current[key];
    if (target) target.focus();
  };

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);

  const earliestMonth = new Date(new Date(`${minDate}T00:00:00`).getFullYear(), new Date(`${minDate}T00:00:00`).getMonth(), 1);
  const canGoPrevious = visibleMonth.getTime() > earliestMonth.getTime();

  const selectDay = (day: number) => {
    const selected = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    onChange(dateKey(selected));
    setIsOpen(false);
  };

  const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, day: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDay(day);
      return;
    }

    const currentDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const stepMap: Record<string, Date> = {
      ArrowLeft: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),
      ArrowRight: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      ArrowUp: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      ArrowDown: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    const nextDate = stepMap[event.key];
    if (!nextDate) return;

    const nextKey = dateKey(nextDate);
    if (!dayRefs.current[nextKey]) {
      setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    }

    requestAnimationFrame(() => focusDay(nextDate));
    event.preventDefault();
  };

  return (
    <div ref={containerRef} className="relative min-w-0 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Date of visit
      </p>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Date of visit: ${formatDate(value)}. Choose a date.`}
        onClick={() => setIsOpen((open) => !open)}
        className="mt-2 flex min-h-6 w-full items-center justify-between gap-2 text-left text-[15px] font-bold text-slate-900 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span>{formatDate(value)}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
      <p className="mt-1 text-[11px] text-slate-500">Crowd forecast checked after planning</p>

      {isOpen && (
        <div role="dialog" aria-label="Choose visit date" className="absolute left-0 top-full z-30 mt-2 w-[min(320px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,.18)]">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Previous month" disabled={!canGoPrevious} onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold text-slate-900">
              {visibleMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </h3>
            <button type="button" aria-label="Next month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((weekday) => <span key={weekday} className="py-2 text-[10px] font-bold text-slate-500">{weekday}</span>)}
            {calendarDays.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} aria-hidden="true" />;
              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const key = dateKey(date);
              const selected = key === value;
              const isToday = key === dateKey(new Date());
              const disabled = key < minDate;
              return (
                <button
                  key={key}
                  ref={(element) => {
                    dayRefs.current[key] = element;
                  }}
                  type="button"
                  disabled={disabled}
                  aria-label={date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  aria-pressed={selected}
                  onKeyDown={(event) => handleDayKeyDown(event, day)}
                  onClick={() => selectDay(day)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${selected ? "bg-blue-600 font-bold text-white" : isToday ? "border border-blue-500 font-semibold text-blue-700" : "text-slate-700 hover:bg-slate-100"} disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">Crowd and weather details are returned after the forecast request.</p>
        </div>
      )}
    </div>
  );
}
