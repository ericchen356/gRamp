import { cn } from "@/lib/cn";

const palettes = [
  ["#e9dcc9", "#6b4f2a"],
  ["#d9e4dc", "#2f5a3e"],
  ["#dfe1ef", "#3a4380"],
  ["#efdcdc", "#7a3434"],
  ["#e6def0", "#57407a"],
  ["#dbe8ec", "#2b5a68"],
  ["#efe6cf", "#6e5a1d"],
];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Person avatar: soft tinted circle with initials, color derived from the name. */
export function Avatar({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  const [bg, fg] = palettes[hash(name) % palettes.length];
  return (
    <span
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.38) }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none", className)}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, size = 24, max = 3 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((name, index) => (
        <Avatar key={name} name={name} size={size} className={cn("ring-2 ring-canvas", index > 0 && "-ml-1.5")} />
      ))}
      {rest > 0 && (
        <span
          style={{ width: size, height: size }}
          className="-ml-1.5 inline-flex items-center justify-center rounded-full bg-chip text-[10px] text-ink-2 ring-2 ring-canvas"
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
