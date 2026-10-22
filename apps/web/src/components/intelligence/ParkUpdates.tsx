import { useEffect, useState } from "react";
import { ExternalLink, Newspaper } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";

interface ParkUpdate {
  id: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  url?: string;
}

interface NewsResponse {
  status: string;
  source: string;
  fetched_at: string;
  error?: string;
  data: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function normalizeUpdates(items: unknown[]): ParkUpdate[] {
  return items.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const titleValue = item.title ?? item.headline;
    if (typeof titleValue !== "string" || !titleValue.trim()) return [];
    const summaryValue = item.summary ?? item.description;
    const dateValue = item.published_at ?? item.publishedAt ?? item.date;
    return [{
      id: typeof item.id === "string" ? item.id : `update-${index}`,
      title: titleValue,
      summary: typeof summaryValue === "string" ? summaryValue : undefined,
      publishedAt: typeof dateValue === "string" ? dateValue : undefined,
      url: safeHttpUrl(item.url ?? item.link),
    }];
  });
}

export default function ParkUpdates({ parkId }: { parkId: string }) {
  const [response, setResponse] = useState<NewsResponse | null>(null);
  const [updates, setUpdates] = useState<ParkUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError("");
    setResponse(null);
    setUpdates([]);
    apiClient.getNews(parkId)
      .then((result) => {
        if (!isCurrentRequest) return;
        const newsResult = result as NewsResponse;
        setResponse(newsResult);
        setUpdates(normalizeUpdates(newsResult.data ?? []));
      })
      .catch(() => { if (isCurrentRequest) setError("Park updates are temporarily unavailable."); })
      .finally(() => { if (isCurrentRequest) setIsLoading(false); });
    return () => { isCurrentRequest = false; };
  }, [parkId, retry]);

  return (
    <section aria-labelledby="park-updates-heading" className="qc-card rounded-2xl p-5">
      <h2 id="park-updates-heading" className="flex items-center gap-2 font-display text-sm font-bold text-white">
        <Newspaper className="h-4 w-4 text-blue-300" aria-hidden="true" /> Official park updates
      </h2>
      {isLoading ? (
        <div role="status" className="mt-3 space-y-2"><div className="h-4 w-3/4 animate-pulse rounded-sm bg-slate-800" /><div className="h-3 w-1/2 animate-pulse rounded-sm bg-slate-800" /></div>
      ) : error ? (
        <div className="mt-3"><ErrorState title="Park updates could not be loaded." description={error} tone="dark" onRetry={() => setRetry((count) => count + 1)} /></div>
      ) : updates.length > 0 ? (
        <div className="mt-3 divide-y divide-white/10">
          {updates.map((update) => (
            <article key={update.id} className="py-3 first:pt-0 last:pb-0">
              <h3 className="text-sm font-semibold text-white">{update.title}</h3>
              {update.summary && <p className="mt-1 text-xs leading-relaxed text-slate-300">{update.summary}</p>}
              <div className="mt-2 flex items-center justify-between gap-3">
                {update.publishedAt && <time className="text-[10px] text-slate-500">{update.publishedAt}</time>}
                {update.url && <a href={update.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-300 underline">Source <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={Newspaper}
            tone="dark"
            title="No official park updates are available."
            description={response?.error ?? "The configured provider returned no updates."}
          />
        </div>
      )}
      {response && <p className="mt-3 border-t border-white/10 pt-2 text-[10px] text-slate-500">Source: {response.source} · {response.status.toLowerCase()}</p>}
    </section>
  );
}
