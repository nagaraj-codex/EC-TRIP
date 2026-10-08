import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/apiClient";
import type { ParkSummary, ParkTariffResponse } from "../../types/api";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import TabButton from "../common/TabButton";

type OfferFilter = "all" | "bank" | "early" | "vip";
type CatalogItemKind = "promotion" | "package";

interface CatalogOffer {
  id: string;
  parkId: string;
  parkName: string;
  name: string;
  detail: string;
  kind: CatalogItemKind;
  officialUrl?: string;
  dataStatus: string;
  verifiedAt?: string | null;
}

const FILTERS: Array<{ id: OfferFilter; label: string }> = [
  { id: "all", label: "All catalog items" },
  { id: "bank", label: "Bank offers" },
  { id: "early", label: "Early bird" },
  { id: "vip", label: "VIP & priority" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractCatalogItems(park: ParkSummary, tariff: ParkTariffResponse): CatalogOffer[] {
  const pricing = tariff.pricing;
  if (!pricing) return [];
  const items: CatalogOffer[] = [];
  const common = {
    parkId: park.park_id,
    parkName: park.name,
    officialUrl: park.official_website,
    dataStatus: tariff.provenance?.data_status ?? "UNAVAILABLE",
    verifiedAt: tariff.provenance?.last_verified_at,
  };
  const promotionData = pricing.discounts_and_promotions ?? pricing.promotions_and_discounts;

  if (Array.isArray(promotionData)) {
    for (const [index, entry] of promotionData.entries()) {
      if (!isRecord(entry) || typeof entry.name !== "string") continue;
      const detail = [entry.discount, entry.description, entry.eligibility]
        .filter((part): part is string => typeof part === "string" && part.length > 0)
        .join(" ");
      if (!detail) continue;
      items.push({ ...common, id: `${park.park_id}-promotion-${index}`, name: entry.name, detail, kind: "promotion" });
    }
  }

  if (Array.isArray(pricing.packages)) {
    for (const [index, entry] of pricing.packages.entries()) {
      if (!isRecord(entry) || typeof entry.name !== "string") continue;
      const priceDetails = [
        typeof entry.adult_price === "number" ? `Adult ₹${entry.adult_price.toLocaleString("en-IN")}` : null,
        typeof entry.child_price === "number" ? `Child ₹${entry.child_price.toLocaleString("en-IN")}` : null,
      ].filter((part): part is string => part !== null);
      const inclusions = typeof entry.inclusions === "string" ? entry.inclusions : "Package details listed in park tariff catalog.";
      items.push({
        ...common,
        id: `${park.park_id}-package-${index}`,
        name: entry.name,
        detail: [...priceDetails, inclusions].join(" · "),
        kind: "package",
      });
    }
  }

  return items;
}

function matchesFilter(item: CatalogOffer, filter: OfferFilter): boolean {
  if (filter === "all") return true;
  const searchable = `${item.name} ${item.detail}`.toLocaleLowerCase();
  if (filter === "bank") return /bank|credit card|debit card|card offer/.test(searchable);
  if (filter === "early") return /early bird|advance booking|book.{0,8}advance/.test(searchable);
  return /vip|priority|fast ?track|express pass/.test(searchable);
}

function sourceLabel(status: string, verifiedAt?: string | null): string {
  const updatedDate = verifiedAt ? new Date(verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
  if (status === "FRESH") return updatedDate ? `Catalog verified ${updatedDate}` : "Catalog verified";
  if (status === "STALE" || status === "EXPIRED") return updatedDate ? `Older catalog entry · ${updatedDate}` : "Older catalog entry";
  return "Verification date unavailable";
}

export default function OffersSection({ parks }: { parks: ParkSummary[] }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogOffer[]>([]);
  const [failedParkNames, setFailedParkNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OfferFilter>("all");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    if (parks.length === 0) {
      setItems([]);
      setFailedParkNames([]);
      setIsLoading(false);
      return () => { isCurrentRequest = false; };
    }

    setIsLoading(true);
    Promise.allSettled(parks.map(async (park) => ({
      park,
      tariff: await apiClient.getParkTariff(park.park_id),
    }))).then((results) => {
      if (!isCurrentRequest) return;
      const nextItems: CatalogOffer[] = [];
      const failed: string[] = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          nextItems.push(...extractCatalogItems(result.value.park, result.value.tariff));
        } else {
          failed.push("A park");
        }
      }
      setItems(nextItems);
      setFailedParkNames(failed);
    }).finally(() => {
      if (isCurrentRequest) setIsLoading(false);
    });

    return () => { isCurrentRequest = false; };
  }, [parks, retry]);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilter(item, activeFilter)),
    [activeFilter, items],
  );
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map(({ id }) => [id, items.filter((item) => matchesFilter(item, id)).length])) as Record<OfferFilter, number>,
    [items],
  );

  return (
    <section aria-labelledby="catalog-offers-heading" className="mx-auto max-w-[1280px] px-4 pb-12 pt-7 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-bold uppercase text-blue-700">Tariff catalog</p>
          <h2 id="catalog-offers-heading" className="mt-1 text-xl font-extrabold text-slate-900">Park offers &amp; packages</h2>
        </div>
        <div role="tablist" aria-label="Filter catalog offers" className="flex max-w-full gap-1 overflow-x-auto">
          {FILTERS.map(({ id, label }) => (
            <TabButton key={id} label={label} count={counts[id]} active={activeFilter === id} onSelect={() => setActiveFilter(id)} />
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton variant="offer" count={3} />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article key={item.id} className="flex min-h-36 flex-col bg-white p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-700">
                  <Tag className="h-3.5 w-3.5" /> {item.kind === "package" ? "Park package" : "Catalog promotion"}
                </span>
                <span className="text-[10px] text-slate-500">{item.parkName}</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900">{item.name}</h3>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">{item.detail}</p>
              <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                <span className="text-[10px] text-slate-500">{sourceLabel(item.dataStatus, item.verifiedAt)}</span>
                <button type="button" onClick={() => navigate(`/app/explore/${item.parkId}`)} className="inline-flex min-h-8 shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500">
                  Park details <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              {item.officialUrl && <a href={item.officialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex w-fit items-center gap-1 text-[10px] text-slate-500 underline hover:text-slate-800">Confirm with park <ExternalLink className="h-3 w-3" /></a>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title={items.length === 0 ? "No catalog offer data is available." : "No catalog items match this filter."}
          description="Offers and availability must be confirmed with the park."
          actionLabel={items.length === 0 ? "Browse parks" : "Show all catalog items"}
          onAction={items.length === 0 ? () => navigate("/app/explore") : () => setActiveFilter("all")}
        />
      )}

      {failedParkNames.length > 0 && <div className="mt-3"><ErrorState title="Some park tariffs could not be loaded." description="Available catalog items remain visible; retry to refresh missing parks." onRetry={() => setRetry((count) => count + 1)} /></div>}
      <p className="mt-3 text-[11px] text-slate-500">Catalog-listed promotions are not live inventory. Check the park&apos;s official site for current validity, terms, and booking availability.</p>
    </section>
  );
}
