import { ArrowRight, Database, MapPin, Ruler, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ParkSummary } from "../../types/api";

interface ParkIntelligencePreviewProps {
  park: ParkSummary | undefined;
}

function formatVerifiedDate(value?: string | null): string {
  if (!value) return "Verification date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Verification date unavailable";
  return `Catalog checked ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

function statusLabel(status?: string): string {
  switch (status) {
    case "FRESH": return "Recently checked";
    case "STALE": return "Needs re-verification";
    case "EXPIRED": return "Out of date";
    default: return "Verification unavailable";
  }
}

export default function ParkIntelligencePreview({ park }: ParkIntelligencePreviewProps) {
  const navigate = useNavigate();

  if (!park) {
    return (
      <section aria-labelledby="park-intelligence-heading" className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <h2 id="park-intelligence-heading" className="text-xl font-extrabold text-slate-900">Park intelligence</h2>
        <p className="mt-3 text-sm text-slate-600">Choose a catalog park above to view verified details.</p>
      </section>
    );
  }

  const provenance = park.provenance;
  const verifiedDate = formatVerifiedDate(provenance?.last_verified_at);

  return (
    <section aria-labelledby="park-intelligence-heading" className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-bold uppercase text-blue-700">Catalog data</p>
          <h2 id="park-intelligence-heading" className="mt-1 text-xl font-extrabold text-slate-900">Park intelligence</h2>
        </div>
        <button type="button" onClick={() => navigate(`/app/explore/${park.park_id}`)} className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500">
          Full park details <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-3 py-4 sm:px-4 sm:first:pl-0">
          <MapPin className="h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-slate-500">Location</p>
            <p className="truncate text-sm font-semibold text-slate-900">{park.city}{park.state ? `, ${park.state}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 py-4 sm:px-4">
          <Ruler className="h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Catalogued attractions</p>
            <p className="text-sm font-semibold text-slate-900">{park.total_rides > 0 ? `${park.total_rides} listed` : "Not listed"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 py-4 sm:px-4 sm:last:pr-0">
          {provenance?.confidence === "HIGH" ? <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" /> : <Database className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-slate-500">{statusLabel(provenance?.data_status)}</p>
            <p className="truncate text-sm font-semibold text-slate-900" title={verifiedDate}>{verifiedDate}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Source: {provenance?.source ?? "QueueCut catalog"}{provenance?.confidence !== "HIGH" ? " · limited verification" : ""}
      </p>
    </section>
  );
}
