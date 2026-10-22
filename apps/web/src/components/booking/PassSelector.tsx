import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, TicketCheck } from "lucide-react";
import { apiClient } from "../../services/apiClient";

export interface PassOption {
  id: string;
  label: string;
  detail: string;
}

interface PassSelectorProps {
  parkId: string;
  value: string;
  onChange: (option: PassOption | null) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function extractPassOptions(pricing: Record<string, unknown> | null): PassOption[] {
  if (!pricing) return [];
  const options: PassOption[] = [];
  const regularRates = pricing.regular_rates;
  if (isRecord(regularRates)) {
    for (const [key, amount] of Object.entries(regularRates)) {
      if (typeof amount === "number") {
        options.push({ id: `regular-${key}`, label: `Standard entry · ${titleCase(key)}`, detail: formatValue(amount) });
      }
    }
  }

  const fastTrack = pricing.fastrack_pass;
  if (isRecord(fastTrack)) {
    const parts = [fastTrack.description, fastTrack.pricing_addon].filter((part): part is string => typeof part === "string");
    if (parts.length > 0) options.push({ id: "fasttrack", label: "FastTrack add-on", detail: parts.join(" ") });
  }

  if (Array.isArray(pricing.packages)) {
    for (const [index, entry] of pricing.packages.entries()) {
      if (!isRecord(entry) || typeof entry.name !== "string") continue;
      const prices = [
        typeof entry.adult_price === "number" ? `Adult ${formatValue(entry.adult_price)}` : null,
        typeof entry.child_price === "number" ? `Child ${formatValue(entry.child_price)}` : null,
      ].filter((price): price is string => price !== null);
      const inclusions = typeof entry.inclusions === "string" ? entry.inclusions : "Catalog package";
      options.push({ id: `package-${index}`, label: entry.name, detail: [...prices, inclusions].join(" · ") });
    }
  }

  const entryCharges = pricing.entry_charges;
  if (isRecord(entryCharges)) {
    for (const [key, amount] of Object.entries(entryCharges)) {
      if (typeof amount === "number") {
        options.push({ id: `entry-${key}`, label: `Entry · ${titleCase(key)}`, detail: formatValue(amount) });
      }
    }
  }

  const adventure = pricing.combos_and_adventure;
  if (isRecord(adventure)) {
    for (const [key, amount] of Object.entries(adventure)) {
      if (typeof amount === "number") {
        options.push({ id: `adventure-${key}`, label: titleCase(key), detail: formatValue(amount) });
      }
    }
  }

  return options;
}

export default function PassSelector({ parkId, value, onChange }: PassSelectorProps) {
  const [options, setOptions] = useState<PassOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const availableOptions = useMemo(() => options, [options]);

  useEffect(() => {
    let isCurrentRequest = true;
    setOptions([]);
    onChange(null);
    if (!parkId) {
      setIsLoading(false);
      return () => { isCurrentRequest = false; };
    }

    setIsLoading(true);
    setError("");
    apiClient.getParkTariff(parkId)
      .then((response) => {
        if (!isCurrentRequest) return;
        setOptions(extractPassOptions(response.pricing));
      })
      .catch((requestError: Error) => {
        if (isCurrentRequest) setError(requestError.message || "Ticket information is unavailable.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => { isCurrentRequest = false; };
  }, [parkId, onChange]);

  return (
    <fieldset className="min-w-0 px-4 py-3.5">
      <legend className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
        <TicketCheck className="h-3.5 w-3.5" aria-hidden="true" /> Tickets &amp; passes
      </legend>
      {isLoading ? (
        <p role="status" className="mt-2 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading verified tariff...</p>
      ) : error ? (
        <p role="status" className="mt-2 text-xs text-slate-600">Ticket information temporarily unavailable.</p>
      ) : availableOptions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {availableOptions.map((option) => (
            <label key={option.id} title={option.detail} className={`max-w-full cursor-pointer rounded-md border px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${value === option.id ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              <input type="radio" name="ticket-pass" value={option.id} checked={value === option.id} onChange={() => onChange(option)} className="sr-only" />
              <span className="block truncate text-xs font-semibold">{option.label}</span>
              <span className="mt-0.5 block max-w-64 truncate text-[10px] text-slate-500">{option.detail}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-600">No ticket options are listed in this park&apos;s catalog.</p>
      )}
      <p className="mt-2 text-[10px] text-slate-500">Options shown from the selected park&apos;s tariff catalog. Availability is not live booking inventory.</p>
    </fieldset>
  );
}
