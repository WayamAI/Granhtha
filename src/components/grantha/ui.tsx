"use client";

/** Small shared pieces: registry-bound mark, buttons, severity, drawer, query helper. */

import { X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { Mark } from "@/components/ui/mark";
import { StatusBadge, type StatusTone } from "@/components/ui/primitives";
import { MARKS, type MarkId } from "@/lib/marks";
import type { CheckStatus, Severity } from "@/lib/grantha/types";

export function GMark({ id, size = 28, className }: { id: MarkId; size?: number; className?: string }) {
  return <Mark id={id} icon={MARKS[id].icon} size={size} className={className} />;
}

const BTN_BASE =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-label-sm whitespace-nowrap outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-active disabled:pointer-events-none disabled:opacity-40";

const BTN_VARIANT = {
  primary: "bg-action-primary text-on-color hover:bg-action-primary-hover",
  secondary: "border border-muted bg-action text-secondary hover:border-default hover:bg-raised-2 hover:text-primary",
  ghost: "text-tertiary hover:bg-action-tertiary-hover hover:text-primary",
};

export function Btn({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: keyof typeof BTN_VARIANT }) {
  return (
    <button type="button" {...props} className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function LinkBtn({
  href,
  variant = "secondary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof BTN_VARIANT;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/** Pill-shaped select styling to pair with the shared Select primitive. */
export const SELECT_CLASS =
  "h-8 min-w-0 rounded-full border border-muted bg-action text-label-sm text-secondary outline-none transition-colors duration-[150ms] hover:border-default focus-visible:ring-2 focus-visible:ring-active";

export const LABEL_CLASS = "text-caption tracking-[0.08em] text-quaternary uppercase";

const SEVERITY_TONE: Record<Severity, StatusTone> = {
  DANGER: "error",
  WARNING: "warning",
  CAUTION: "warning",
  NOTICE: "info",
};

/** Signal word as a finding severity. CAUTION is outlined so it reads below WARNING. */
export function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === "CAUTION") {
    return (
      <span className="inline-flex items-center rounded-full border border-warning-stroke bg-warning-surface px-2.5 py-0.5 text-caption font-medium text-warning">
        CAUTION
      </span>
    );
  }
  return <StatusBadge tone={SEVERITY_TONE[severity]}>{severity}</StatusBadge>;
}

export const CHECK_TONE: Record<CheckStatus, StatusTone> = { pass: "success", warn: "warning", fail: "error", running: "info" };

/** Horizontal share meter. */
export function Meter({ value, tone = "neutral", className = "" }: { value: number; tone?: "neutral" | "success" | "warning" | "error" | "info"; className?: string }) {
  const bg = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "error" ? "bg-error" : tone === "info" ? "bg-info" : "bg-quaternary";
  return (
    <span className={`block h-1.5 w-full overflow-hidden rounded-full bg-raised-2 ${className}`}>
      <span className={`block h-full rounded-full ${bg}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}

/** Stacked share bar with a legend-free reading: segments carry their own tone. */
export function StackBar({ parts }: { parts: { value: number; className: string; label: string }[] }) {
  const total = parts.reduce((n, p) => n + p.value, 0) || 1;
  return (
    <span className="flex h-2 w-full overflow-hidden rounded-full bg-raised-2">
      {parts.map((p) => (
        <span key={p.label} title={`${p.label}: ${p.value.toLocaleString("en-US")}`} className={`block h-full ${p.className}`} style={{ width: `${(p.value / total) * 100}%` }} />
      ))}
    </span>
  );
}

export function Drawer({
  title,
  eyebrow,
  onClose,
  children,
  footer,
  width = "w-[min(30rem,100vw)]",
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-page opacity-60" />
      <aside role="dialog" aria-label={title} className={`relative flex h-full ${width} flex-col border-l border-muted bg-container shadow-lg`}>
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-muted px-4 py-3">
          <div className="min-w-0">
            {eyebrow ? <p className={LABEL_CLASS}>{eyebrow}</p> : null}
            <h3 className="mt-0.5 text-body-lg text-primary">{title}</h3>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="shrink-0 rounded-full p-1.5 text-quaternary transition-colors duration-[150ms] hover:bg-raised hover:text-primary">
            <X size={15} strokeWidth={1.75} aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-muted px-4 py-3">{footer}</footer> : null}
      </aside>
    </div>
  );
}

/** Label and value pair for drawers and detail headers. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className={LABEL_CLASS}>{label}</p>
      <div className="mt-0.5 min-w-0 text-body-md text-secondary">{children}</div>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="flex min-w-0 gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={[
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-label-sm outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active",
              active ? "bg-action-primary text-on-color" : "text-tertiary hover:bg-action-tertiary-hover hover:text-primary",
            ].join(" ")}
          >
            {tab.label}
            {tab.count !== undefined ? <span className={`tabular ${active ? "opacity-70" : "text-quaternary"}`}>{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Read one query parameter. The calling page must sit inside a Suspense boundary. */
export function useQueryParam(name: string): string | null {
  return useSearchParams().get(name);
}

/**
 * Selection that starts from a query parameter (so search and cross-links can
 * deep-link a record) and then follows clicks. A new link value wins again.
 */
export function useLinkedSelection(name: string, fallback: string | null = null): [string | null, (id: string | null) => void] {
  const linked = useSearchParams().get(name);
  const [picked, setPicked] = useState<{ from: string | null; id: string | null } | null>(null);
  const selected = picked && picked.from === linked ? picked.id : (linked ?? fallback);
  return [selected, (id) => setPicked({ from: linked, id })];
}

/** Content-height card for side panes, where the shared Panel's full-height stretch is wrong. */
export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 shrink-0 overflow-hidden rounded-lg border border-muted bg-container ${className}`}>
      {title || action ? (
        <header className="flex min-h-10 items-center justify-between gap-3 border-b border-muted px-3.5 py-2">
          {title ? <h3 className={`min-w-0 truncate ${LABEL_CLASS}`}>{title}</h3> : <span />}
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className="min-w-0 p-3.5">{children}</div>
    </section>
  );
}
