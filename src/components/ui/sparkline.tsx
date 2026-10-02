import { cn } from "@/lib/cn";

/**
 * Tiny SVG area sparkline (account rows, KPI tiles). Pure SVG so it can render
 * in server components without a charting runtime.
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  stroke = "var(--color-chart-sage)",
  fill = "var(--color-chart-sage-fill)",
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((value, index) => [index * step, height - 2 - ((value - min) / range) * (height - 4)]);
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const id = `spark-${data.join("-").slice(0, 24)}-${width}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.9" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}
