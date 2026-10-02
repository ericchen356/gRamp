import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Merchant marks. Logos are drawn as lightweight inline SVG / typographic
 * approximations so the app has no external image dependencies. Unknown
 * merchants fall back to a deterministic monogram.
 */
type Brand = {
  bg: string;
  /** Square tile (Zoom) instead of a circle. */
  shape?: "circle" | "rounded" | "none";
  border?: boolean;
  mark: ReactNode;
};

const GoogleG = (
  <svg viewBox="0 0 48 48" className="size-[62%]">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

const text = (value: string, className: string) => (
  <span className={cn("leading-none font-semibold select-none", className)}>{value}</span>
);

const brands: Record<string, Brand> = {
  sweetgreen: { bg: "#0b3d1c", mark: text("sg", "text-[#d7e37a] text-[15px] tracking-[-0.06em] font-bold") },
  amazon: {
    bg: "#232f3e",
    mark: (
      <svg viewBox="0 0 32 32" className="size-full">
        <path d="M8 19.5c4.8 3 11.4 3.3 16 .4" stroke="#ff9900" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M22.4 18.6l2.2 1.1-.5 2.3" stroke="#ff9900" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  "amazon web services": { bg: "#232f3e", mark: text("aws", "text-white text-[10px]") },
  zoom: {
    bg: "#0b5cff",
    shape: "rounded",
    mark: text("zoom", "text-white text-[7px] font-bold tracking-tight"),
  },
  delta: {
    bg: "#0a1f44",
    mark: (
      <svg viewBox="0 0 32 32" className="size-full">
        <path d="M16 7l9 16H7z" fill="#e01933" />
        <path d="M16 7l9 16-9-5z" fill="#a8102a" />
      </svg>
    ),
  },
  google: { bg: "#ffffff", border: false, shape: "none", mark: GoogleG },
  "google domains": { bg: "#ffffff", shape: "none", mark: GoogleG },
  "google store": { bg: "#ffffff", shape: "none", mark: GoogleG },
  "google workspace": { bg: "#ffffff", shape: "none", mark: GoogleG },
  "google cloud": { bg: "#ffffff", shape: "none", mark: GoogleG },
  "google ads": {
    bg: "#ffffff",
    shape: "none",
    mark: <span className="text-[6px] leading-none text-[#5f6368]">Google Ads</span>,
  },
  gelt: {
    bg: "#ffffff",
    shape: "none",
    mark: (
      <span className="rounded-full bg-[#5aa53b] px-1 py-0.5 text-[8px] leading-none font-bold text-white italic">Gelt</span>
    ),
  },
  "whole latte love": {
    bg: "#ffffff",
    shape: "none",
    mark: <span className="font-serif text-[5px] leading-none text-ink">Whole latte love</span>,
  },
  samsung: { bg: "#000000", mark: text("SAMSUNG", "text-white text-[5px] tracking-tight") },
  "aos poland": {
    bg: "#ffffff",
    shape: "none",
    mark: (
      <span className="flex items-center gap-[1px] text-[10px] leading-none font-bold text-[#1d4fa0]">
        <span className="inline-block size-2.5 rounded-full bg-[#2a6fd6]" />
        ION
      </span>
    ),
  },
  openalternative: {
    bg: "#f5f5f4",
    shape: "rounded",
    mark: <span className="h-2 w-5 rounded-[1px] border-t-2 border-b border-ink-5" />,
  },
  superhuman: {
    bg: "#2b2a2e",
    mark: (
      <svg viewBox="0 0 32 32" className="size-[70%]">
        <path d="M16 6l9 6.5-9 6.5-9-6.5z" fill="none" stroke="#fff" strokeWidth="1.4" />
        <path d="M7 17.5l9 6.5 9-6.5" fill="none" stroke="#fff" strokeWidth="1.4" />
      </svg>
    ),
  },
  "west elm": { bg: "#000000", mark: text("west elm", "text-white text-[6px] font-normal") },
  containiq: {
    bg: "#1b1f5e",
    mark: (
      <svg viewBox="0 0 32 32" className="size-[70%]">
        <path d="M16 7l7.8 4.5v9L16 25l-7.8-4.5v-9z" fill="none" stroke="#3ee0d0" strokeWidth="1.6" />
        <circle cx="16" cy="16" r="3" fill="none" stroke="#3ee0d0" strokeWidth="1.6" />
      </svg>
    ),
  },
  telcel: { bg: "#ffffff", shape: "none", mark: text("telcel", "text-[#1e3e8f] text-[10px] italic font-bold") },
  activecampaign: {
    bg: "#356ae6",
    mark: (
      <svg viewBox="0 0 32 32" className="size-full">
        <path d="M12.5 9.5L21 16l-8.5 6.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  dropbox: {
    bg: "#0d2481",
    mark: (
      <svg viewBox="0 0 32 32" className="size-[64%]">
        {[
          [11, 9],
          [21, 9],
          [11, 16],
          [21, 16],
          [16, 21.5],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 3.2}l4.4 3.2-4.4 3.2-4.4-3.2z`} fill={i < 2 ? "#ff8fb1" : "#ff6b98"} />
        ))}
      </svg>
    ),
  },
  "zendesk, inc.": {
    bg: "#03363d",
    mark: (
      <svg viewBox="0 0 32 32" className="size-full">
        <path d="M8 11h7.5L8 21.5z M16.5 21.5H24L16.5 11z" fill="#fff" />
        <path d="M8 10a3.75 3.75 0 0 0 7.5 0z M16.5 22a3.75 3.75 0 0 1 7.5 0z" fill="#fff" />
      </svg>
    ),
  },
  "microsoft office": {
    bg: "#eb3c00",
    mark: (
      <svg viewBox="0 0 32 32" className="size-full">
        <path d="M11 9.5l8-2.5v18l-8-2.5z" fill="#fff" />
        <path d="M13 11.5l4-1v11l-4-1z" fill="#eb3c00" />
      </svg>
    ),
  },
  notion: { bg: "#191919", border: false, mark: text("N", "text-white text-[14px] font-serif") },
  slack: {
    bg: "#4a154b",
    mark: (
      <svg viewBox="0 0 32 32" className="size-[60%]">
        <rect x="13" y="5" width="3.2" height="10" rx="1.6" fill="#36c5f0" />
        <rect x="17" y="13" width="10" height="3.2" rx="1.6" fill="#2eb67d" />
        <rect x="15.8" y="17" width="3.2" height="10" rx="1.6" fill="#ecb22e" />
        <rect x="5" y="15.8" width="10" height="3.2" rx="1.6" fill="#e01e5a" />
      </svg>
    ),
  },
  figma: {
    bg: "#1e1e1e",
    mark: (
      <svg viewBox="0 0 32 32" className="size-[62%]">
        <circle cx="19" cy="16" r="3" fill="#1abcfe" />
        <path d="M13 22h3v3a3 3 0 1 1-3-3z" fill="#0acf83" />
        <path d="M13 13h3v6h-3a3 3 0 0 1 0-6z" fill="#a259ff" />
        <path d="M13 7h3v6h-3a3 3 0 0 1 0-6z" fill="#f24e1e" />
        <path d="M16 7h3a3 3 0 0 1 0 6h-3z" fill="#ff7262" />
      </svg>
    ),
  },
  github: { bg: "#0d1117", mark: text("gh", "text-white text-[12px]") },
  uber: { bg: "#000000", mark: text("Uber", "text-white text-[9px]") },
  lyft: { bg: "#ff00bf", mark: text("lyft", "text-white text-[10px] font-bold") },
  airbnb: { bg: "#ff5a5f", mark: text("A", "text-white text-[14px]") },
  "united airlines": { bg: "#005daa", mark: text("U", "text-white text-[13px]") },
  starbucks: { bg: "#00704a", mark: text("★", "text-white text-[13px]") },
  wework: { bg: "#000000", mark: text("we", "text-white text-[11px] font-bold") },
  salesforce: { bg: "#00a1e0", mark: text("sf", "text-white text-[12px]") },
  adobe: { bg: "#fa0f00", mark: text("A", "text-white text-[14px] font-bold") },
  linear: { bg: "#5e6ad2", mark: text("◐", "text-white text-[13px]") },
  openai: { bg: "#000000", mark: text("◎", "text-white text-[13px]") },
  anthropic: { bg: "#d97757", mark: text("A\\", "text-[#191919] text-[11px] font-bold") },
  hubspot: { bg: "#ff7a59", mark: text("H", "text-white text-[13px] font-bold") },
  datadog: { bg: "#632ca6", mark: text("dd", "text-white text-[11px] font-bold") },
  atlassian: { bg: "#0052cc", mark: text("▲", "text-white text-[11px]") },
  docusign: { bg: "#ffcc22", mark: text("D", "text-ink text-[13px] font-bold") },
  gusto: { bg: "#f45d48", mark: text("g", "text-white text-[15px] font-bold") },
  marriott: { bg: "#8b1d2c", mark: text("M", "text-white text-[13px] font-serif") },
  hilton: { bg: "#104c97", mark: text("H", "text-white text-[13px] font-serif") },
  doordash: { bg: "#ff3008", mark: text("DD", "text-white text-[10px] font-bold") },
  fedex: { bg: "#4d148c", mark: text("FedEx", "text-white text-[7px] font-bold") },
  "home depot": { bg: "#f96302", shape: "rounded", mark: text("HD", "text-white text-[10px] font-bold") },
  costco: { bg: "#e31837", mark: text("C", "text-white text-[13px] font-bold") },
  verizon: { bg: "#000000", mark: text("✓", "text-[#ee0000] text-[13px] font-bold") },
  comcast: { bg: "#000000", mark: text("X", "text-white text-[12px]") },
  intercom: { bg: "#1f8ded", mark: text("ıIı", "text-white text-[10px]") },
  asana: { bg: "#f06a6a", mark: text("⁂", "text-white text-[13px]") },
  vercel: { bg: "#000000", mark: text("▲", "text-white text-[11px]") },
  rippling: { bg: "#502d3c", mark: text("R", "text-white text-[13px]") },
  carta: { bg: "#000000", mark: text("c", "text-white text-[15px]") },
  calendly: { bg: "#006bff", mark: text("C", "text-white text-[13px]") },
  loom: { bg: "#625df5", mark: text("✳", "text-white text-[13px]") },
  miro: { bg: "#ffd02f", mark: text("m", "text-ink text-[14px] font-bold") },
  "1password": { bg: "#0572ec", mark: text("1", "text-white text-[13px] font-bold") },
  wsj: { bg: "#ffffff", border: true, mark: text("WSJ", "text-ink text-[9px] font-serif") },
};

const monogramColors = ["#2f4b3a", "#3a3f63", "#6b3d2e", "#2c4d63", "#5a4a2a", "#4b2f52", "#1f5c56", "#63402a"];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function MerchantLogo({
  name,
  size = 30,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const brand = brands[name.toLowerCase()];
  const style = { width: size, height: size };

  if (!brand) {
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return (
      <span
        style={{ ...style, background: monogramColors[hash(name) % monogramColors.length], fontSize: size * 0.36 }}
        className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white", className)}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      style={{ ...style, background: brand.bg }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        brand.shape === "rounded" ? "rounded-[6px]" : "rounded-full",
        brand.border && "border border-line",
        className,
      )}
      aria-hidden
    >
      {brand.mark}
    </span>
  );
}
