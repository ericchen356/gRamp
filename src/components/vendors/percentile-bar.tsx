import { cn } from "@/lib/cn";
import { formatMoneyWhole } from "@/lib/format";

/**
 * Market price range: the 25th–75th percentile band in sand, a median tick
 * and an ink marker for what you pay.
 */
export function PercentileBar({
  p25,
  median,
  p75,
  value,
  labels = true,
  className,
}: {
  p25: number;
  median: number;
  p75: number;
  value: number | null;
  /** Show the p25 / median / p75 values under the track. */
  labels?: boolean;
  className?: string;
}) {
  const lo = Math.min(p25, value ?? p25) * 0.85;
  const hi = Math.max(p75, value ?? p75) * 1.08;
  const pos = (n: number) => `${((n - lo) / (hi - lo)) * 100}%`;
  const above = value !== null && value > median;
  // Hide labels that would collide on narrow ranges (percent of track width).
  const gap = (a: number, b: number) => (Math.abs(a - b) / (hi - lo)) * 100;
  const showMedian = gap(median, p25) >= 18 && gap(p75, median) >= 18;
  const showP75 = gap(p75, p25) >= 18;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-chart-sand"
          style={{ left: pos(p25), width: `calc(${pos(p75)} - ${pos(p25)})` }}
        />
        <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink-3" style={{ left: pos(median) }} />
        {value !== null && (
          <div
            className={cn(
              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-canvas",
              above ? "bg-ink" : "bg-money",
            )}
            style={{ left: pos(value) }}
            title={`You pay ${formatMoneyWhole(value)}`}
          />
        )}
      </div>
      {labels && (
        <div className="relative mt-1 h-4 text-[11px] text-ink-3 tabular">
          <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pos(p25) }}>
            {formatMoneyWhole(p25)}
          </span>
          {showMedian && (
            <span className="absolute -translate-x-1/2 whitespace-nowrap text-ink-2" style={{ left: pos(median) }}>
              {formatMoneyWhole(median)}
            </span>
          )}
          {showP75 && (
            <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pos(p75) }}>
              {formatMoneyWhole(p75)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
