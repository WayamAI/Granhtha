/** Formatting helpers. No locale or clock reads that could differ between server and client. */

export function usd(value: number, opts?: { cents?: boolean }): string {
  const rounded = opts?.cents ? Math.round(value * 100) / 100 : Math.round(value);
  return `$${rounded.toLocaleString("en-US", opts?.cents ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined)}`;
}

export function usdCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 10_000) return `$${Math.round(value / 1000)}k`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

export const pct = (value: number, digits = 0) => `${value.toFixed(digits)}%`;

export const num = (value: number) => Math.round(value).toLocaleString("en-US");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-16" to "16 Oct". Passes through anything that is not an ISO date. */
export function shortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}`;
}

/** Whole days from the demo's fixed today, 12 October 2026. */
export function daysFromToday(iso: string): number {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return 0;
  return Math.round((Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) - Date.UTC(2026, 9, 12)) / 86_400_000);
}
