"use client";

/** Composite pieces used on more than one page. */

import { CircleAlert, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { InlineArrow, Select } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { MODELS, STAGES } from "@/lib/grantha/data";
import type { Check, CheckStatus, FlowStage, Insight } from "@/lib/grantha/types";
import type { MarkId } from "@/lib/marks";

import { Btn, GMark, LABEL_CLASS, LinkBtn, Meter, SELECT_CLASS } from "./ui";

// --- verdict ---------------------------------------------------------------

export function VerdictBanner({ action, compact = false }: { action?: ReactNode; compact?: boolean }) {
  const { verdict } = useGrantha();
  const tone =
    verdict.tone === "success"
      ? "border-success-stroke bg-success-surface"
      : verdict.tone === "info"
        ? "border-info-stroke bg-info-surface"
        : "border-error-stroke bg-error-surface";
  const text = verdict.tone === "success" ? "text-success" : verdict.tone === "info" ? "text-info" : "text-error";
  const Icon = verdict.tone === "success" ? CircleCheck : verdict.tone === "info" ? LoaderCircle : CircleX;
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 ${compact ? "py-2.5" : "py-3"} ${tone}`}>
      {verdict.tone === "success" ? (
        <GMark id="mark-verdict-ready" size={compact ? 28 : 36} />
      ) : (
        <Icon size={compact ? 18 : 22} strokeWidth={1.75} aria-hidden className={`shrink-0 ${text} ${verdict.running ? "animate-spin" : ""}`} />
      )}
      <div className="min-w-[11rem] flex-1">
        <p className={`${compact ? "text-body-md" : "text-body-lg"} font-medium ${text}`}>{verdict.label}</p>
        <p className="text-body-sm text-secondary">{verdict.detail}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

// --- checks ----------------------------------------------------------------

const CHECK_ICON: Record<CheckStatus, { icon: typeof CircleCheck; className: string }> = {
  pass: { icon: CircleCheck, className: "text-success" },
  warn: { icon: CircleAlert, className: "text-warning" },
  fail: { icon: CircleX, className: "text-error" },
  running: { icon: LoaderCircle, className: "animate-spin text-info" },
};

const STAGE_TITLE: Record<number, string> = {
  1: "1 · Inputs",
  2: "2 · Extraction",
  3: "3 · Output",
};

/** The rule checks in their three stages. Passing checks fold away unless asked for. */
export function CheckList({ checks, defaultOpen = false }: { checks: Check[]; defaultOpen?: boolean }) {
  const { openInspector } = useGrantha();
  const [showPassing, setShowPassing] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((stage) => {
        const list = checks.filter((c) => c.stage === stage);
        if (!list.length) return null;
        const passing = list.filter((c) => c.status === "pass").length;
        const shown = showPassing ? list : list.filter((c) => c.status !== "pass");
        return (
          <div key={stage}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className={LABEL_CLASS}>{STAGE_TITLE[stage]}</p>
              <p className="text-caption tabular text-quaternary">
                {passing} of {list.length} pass
              </p>
            </div>
            <ul className="flex flex-col">
              {shown.map((check) => {
                const { icon: Icon, className } = CHECK_ICON[check.status];
                return (
                  <li key={check.id} className="flex gap-2.5 border-b border-muted py-2 last:border-b-0">
                    <Icon size={15} strokeWidth={1.75} aria-hidden className={`mt-0.5 shrink-0 ${className}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm text-primary">{check.label}</p>
                      <p className="mt-0.5 text-caption text-tertiary">{check.findingIds.length ? check.ruleIds.join(" · ") : check.detail}</p>
                      {check.findingIds.length ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {check.findingIds.map((id) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => openInspector({ type: "finding", id })}
                              className="rounded-full border border-muted bg-action px-2 py-0.5 text-caption tabular text-secondary transition-colors duration-[150ms] hover:border-default hover:text-primary"
                            >
                              {id}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-caption tabular text-quaternary">{check.id}</span>
                  </li>
                );
              })}
              {!shown.length ? <li className="py-1.5 text-caption text-quaternary">All {list.length} pass.</li> : null}
            </ul>
          </div>
        );
      })}
      <button type="button" onClick={() => setShowPassing((v) => !v)} className="self-start text-caption text-tertiary underline underline-offset-2 transition-colors duration-[150ms] hover:text-primary">
        {showPassing ? "Hide passing checks" : "Show passing checks"}
      </button>
    </div>
  );
}

// --- flow canvas -----------------------------------------------------------

export const STAGE_MARK: Record<FlowStage, MarkId> = {
  "records-in": "mark-flow-records",
  extracted: "mark-flow-extracted",
  drafted: "mark-flow-drafted",
  verified: "mark-flow-verified",
  "in-review": "mark-flow-review",
  "signed-off": "mark-flow-signed",
  published: "mark-flow-published",
  translated: "mark-flow-translated",
};

export function FlowCanvas({
  counts,
  blocked,
  selected,
  onSelect,
}: {
  counts: Record<FlowStage, number>;
  blocked: Record<FlowStage, number>;
  selected: FlowStage | null;
  onSelect: (stage: FlowStage | null) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className={`inline-flex flex-wrap items-center gap-1 ${LABEL_CLASS}`}>
        Engineering record <InlineArrow /> Draft <InlineArrow /> Sign-off <InlineArrow /> Market
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 @7xl:grid-cols-8">
        {STAGES.map((stage) => {
          const active = selected === stage.id;
          const dimmed = selected !== null && !active;
          return (
            <button
              key={stage.id}
              type="button"
              aria-pressed={active}
              title={stage.hint}
              onClick={() => onSelect(active ? null : stage.id)}
              className={[
                "flex w-full min-w-0 items-start gap-2 rounded-lg border px-3 py-2.5 text-left outline-none",
                "transition-[background-color,border-color,opacity] duration-[180ms] focus-visible:ring-2 focus-visible:ring-active",
                active ? "border-default bg-raised" : "border-muted bg-page hover:border-default hover:bg-raised",
                dimmed ? "opacity-45" : "opacity-100",
              ].join(" ")}
            >
              <GMark id={STAGE_MARK[stage.id]} size={30} className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${LABEL_CLASS}`}>{stage.label}</span>
                <span className="block font-display text-display-lg tabular text-primary sm:text-display-xl">{counts[stage.id]}</span>
                <span className={`block truncate text-caption tabular ${blocked[stage.id] ? "text-error" : "text-quaternary"}`}>
                  {blocked[stage.id] ? `${blocked[stage.id]} blocked` : "none blocked"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- agent observation -----------------------------------------------------

export function InsightCard({ insight }: { insight: Insight }) {
  const { st, setInsight } = useGrantha();
  const status = st.insightStatus[insight.id];
  if (status === "dismissed") return null;
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-muted bg-container p-4">
      <div className="flex items-start gap-3">
        <GMark id="mark-insight" size={32} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className={LABEL_CLASS}>Observation</p>
          <p className="mt-1 text-body-md text-primary">{insight.observation}</p>
        </div>
      </div>
      <div>
        <p className={LABEL_CLASS}>Cause</p>
        <p className="mt-1 text-body-sm text-secondary">{insight.cause}</p>
      </div>
      <div>
        <p className={LABEL_CLASS}>Evidence</p>
        <ul className="mt-1 flex flex-col gap-1">
          {insight.evidence.map((item) => (
            <li key={item.label} className="text-body-sm">
              <span className="text-primary">{item.label}</span>
              <span className="text-quaternary"> · </span>
              <span className="text-tertiary">{item.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[130px] flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className={LABEL_CLASS}>Confidence</span>
            <span className="text-body-sm tabular text-primary">{Math.round(insight.confidence * 100)}%</span>
          </div>
          <Meter value={insight.confidence * 100} tone="info" className="mt-1" />
        </div>
        <p className="max-w-[55%] text-right text-body-sm text-warning">{insight.impact}</p>
      </div>
      <div className="rounded-md border border-muted bg-raised px-3 py-2">
        <p className={LABEL_CLASS}>Recommendation</p>
        <p className="mt-1 text-body-sm text-secondary">{insight.recommendation}</p>
        <p className="mt-1 text-caption text-quaternary">{insight.signer}. Nothing is changed until they act.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <LinkBtn href={insight.href} variant="primary">
          {insight.cta}
        </LinkBtn>
        <Btn onClick={() => setInsight(insight.id, "review task created")} disabled={status === "review task created"}>
          {status === "review task created" ? "Review task created" : "Create review task"}
        </Btn>
        <Btn variant="ghost" onClick={() => setInsight(insight.id, "dismissed")}>
          Dismiss
        </Btn>
      </div>
    </article>
  );
}

// --- product selector ------------------------------------------------------

export function ModelSelect() {
  const { st, setModel } = useGrantha();
  return (
    <Select aria-label="Product" value={st.modelId} onChange={(e) => setModel(e.target.value)} className={`${SELECT_CLASS} max-w-[15rem]`}>
      {MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.id} · {m.family}
        </option>
      ))}
    </Select>
  );
}

// --- charts ----------------------------------------------------------------

export const AXIS_TICK = { fill: "var(--text-quaternary)", fontSize: 11 };
export const GRID_STROKE = "var(--stroke-muted)";

export function ChartTip({
  active,
  payload,
  label,
  format = (v: number) => v.toLocaleString("en-US"),
}: {
  active?: boolean;
  payload?: readonly { name?: string | number; value?: number | string | readonly (number | string)[]; color?: string }[];
  label?: string | number;
  format?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-muted bg-container px-3 py-2 shadow-lg">
      {label !== undefined ? <p className="mb-1 text-caption text-quaternary">{label}</p> : null}
      {payload.map((p) => (
        <p key={String(p.name)} className="flex items-center justify-between gap-4 text-body-sm">
          <span className="flex items-center gap-1.5 text-tertiary">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="tabular text-primary">{format(Number(p.value ?? 0))}</span>
        </p>
      ))}
    </div>
  );
}

/** Small "explains this number" link under a tile or panel. */
export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-caption text-tertiary underline underline-offset-2 transition-colors duration-[150ms] hover:text-primary">
      {children}
    </Link>
  );
}
