const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** $6,238.04 */
export function formatMoney(value: number) {
  return usd.format(value);
}

/** $6,238 */
export function formatMoneyWhole(value: number) {
  return usdWhole.format(value);
}

/** $1.2m / $750k (chart axes) */
export function formatMoneyCompact(value: number) {
  return `$${compact.format(value).toLowerCase()}`;
}

/** Splits $350,385.56 into ["$350,385", ".56"] for the large-number style. */
export function splitMoney(value: number): [string, string] {
  const [whole, cents] = usd.format(value).split(".");
  return [whole, `.${cents}`];
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** Parses "2026-10-02" as a local calendar date (no UTC day shift). */
function parseDate(iso: string) {
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
}

/** Oct 2 */
export function formatDate(iso: string) {
  return shortDate.format(parseDate(iso));
}

/** Oct 2, 2026 */
export function formatDateLong(iso: string) {
  return longDate.format(parseDate(iso));
}

/** Parses user-typed amounts: "1,250.50" → 1250.5 (non-numeric → 0). */
export function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Live-formats a typed amount: keeps one decimal point (2 places) and groups thousands. */
export function formatAmountInput(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  const decimals = rest.join("").slice(0, 2);
  const grouped = whole ? Number(whole).toLocaleString("en-US") : "";
  return rest.length ? `${grouped || "0"}.${decimals}` : grouped;
}
