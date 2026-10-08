interface SkeletonProps {
  variant: "park" | "offer" | "weather" | "crowd" | "tariff";
  count?: number;
  dark?: boolean;
}

const lightBlock = "animate-pulse rounded bg-slate-100";
const darkBlock = "animate-pulse rounded bg-slate-800/70";

function SkeletonItem({ variant, dark }: { variant: SkeletonProps["variant"]; dark: boolean }) {
  const block = dark ? darkBlock : lightBlock;

  if (variant === "park") {
    return (
      <div aria-hidden="true" className="overflow-hidden bg-white">
        <div className={`${block} h-40 rounded-none`} />
        <div className="space-y-3 p-4">
          <div className={`${block} h-4 w-3/4`} />
          <div className={`${block} h-3 w-1/2`} />
          <div className={`${block} h-8 w-2/5`} />
        </div>
      </div>
    );
  }

  if (variant === "offer") {
    return (
      <div aria-hidden="true" className="min-h-36 bg-white p-4">
        <div className={`${block} h-3 w-24`} />
        <div className={`${block} mt-3 h-4 w-2/3`} />
        <div className={`${block} mt-3 h-3 w-full`} />
        <div className={`${block} mt-2 h-3 w-3/4`} />
      </div>
    );
  }

  if (variant === "weather") {
    return (
      <div aria-hidden="true" className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => <div key={item} className={`${block} h-14`} />)}
      </div>
    );
  }

  if (variant === "tariff") {
    return (
      <div aria-hidden="true" className="grid grid-cols-2 gap-3">
        {[0, 1].map((item) => <div key={item} className={`${block} h-16`} />)}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="flex items-center gap-5">
      <div className={`${block} h-22.5 w-22.5 shrink-0 rounded-full`} />
      <div className="flex-1 space-y-2">
        <div className={`${block} h-6 w-32 rounded-full`} />
        <div className={`${block} h-4 w-48 max-w-full`} />
        <div className={`${block} h-4 w-40 max-w-full`} />
      </div>
    </div>
  );
}

export default function Skeleton({ variant, count = 1, dark = false }: SkeletonProps) {
  const content = Array.from({ length: count }, (_, index) => (
    <SkeletonItem key={`${variant}-${index}`} variant={variant} dark={dark} />
  ));

  if (variant === "park") {
    return <div role="status" aria-label="Loading parks" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{content}</div>;
  }
  if (variant === "offer") {
    return <div role="status" aria-label="Loading park offers" className="grid grid-cols-1 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">{content}</div>;
  }
  const label = variant === "weather" ? "Loading weather" : variant === "tariff" ? "Loading ticket prices" : "Loading crowd forecast";
  return <div role="status" aria-label={label}>{content}</div>;
}
