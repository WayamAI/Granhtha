"use client";

/**
 * The drafted document, laid out like a printed manual.
 *
 * Every traced figure is a button that opens its fact and record line. A
 * span carrying an open finding is underlined; once the fix is applied the
 * revised text is shown tinted, so the author can see exactly what changed.
 */

import { Check, TriangleAlert } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { useGrantha } from "@/lib/grantha/context";
import { findingById } from "@/lib/grantha/document";
import { isBlocking } from "@/lib/grantha/rules";
import type { FindingStatus, RBlock, RSection, Seg, SignalWord } from "@/lib/grantha/types";

import { GMark } from "./ui";

const PANEL: Record<SignalWord, { head: string; border: string }> = {
  DANGER: { head: "bg-error-badge text-badge", border: "border-error-stroke" },
  WARNING: { head: "bg-warning-badge text-badge", border: "border-warning-stroke" },
  CAUTION: { head: "bg-warning-surface text-warning", border: "border-warning-stroke" },
  NOTICE: { head: "bg-info-badge text-badge", border: "border-info-stroke" },
};

function Segs({ segs }: { segs: Seg[] }) {
  const { openInspector } = useGrantha();
  return (
    <>
      {segs.map((seg, i) => {
        if (seg.kind === "plain") return <span key={i}>{seg.text}</span>;
        if (seg.kind === "fact" && seg.factId) {
          return (
            <button
              key={i}
              type="button"
              title={`${seg.factId}: open source`}
              data-finding={seg.findingId}
              onClick={() => openInspector({ type: "fact", id: seg.factId! })}
              className={[
                "rounded-[3px] px-0.5 text-left tabular underline decoration-dotted underline-offset-2 outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active",
                seg.findingId ? "bg-success-surface text-success hover:bg-success-surface" : "text-info hover:bg-info-surface",
              ].join(" ")}
            >
              {seg.text}
            </button>
          );
        }
        if (seg.kind === "fixed") {
          return (
            <span key={i} data-finding={seg.findingId} className="rounded-[3px] bg-success-surface px-0.5 text-success">
              {seg.text}
            </span>
          );
        }
        const finding = seg.findingId ? findingById(seg.findingId) : undefined;
        const blocking = finding ? isBlocking(finding.severity) : false;
        return (
          <button
            key={i}
            type="button"
            title={finding ? `${finding.id}: ${finding.title}` : undefined}
            data-finding={seg.findingId}
            onClick={() => seg.findingId && openInspector({ type: "finding", id: seg.findingId })}
            className={[
              "rounded-[3px] px-0.5 text-left underline underline-offset-[3px] outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active",
              seg.kind === "dismissed"
                ? "text-tertiary decoration-dotted decoration-1 hover:bg-raised"
                : blocking
                  ? "bg-error-surface text-error decoration-wavy decoration-error hover:bg-error-surface"
                  : "bg-warning-surface text-warning decoration-wavy decoration-warning hover:bg-warning-surface",
            ].join(" ")}
          >
            {seg.text}
          </button>
        );
      })}
    </>
  );
}

/** Margin chip that names the finding attached to a whole block. */
function BlockFlag({ id, state }: { id: string; state?: FindingStatus }) {
  const { openInspector } = useGrantha();
  const finding = findingById(id);
  if (!finding) return null;
  const applied = state === "applied";
  const quiet = state === "dismissed";
  return (
    <button
      type="button"
      data-finding={id}
      onClick={() => openInspector({ type: "finding", id })}
      className={[
        "mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active",
        applied ? "bg-success-surface text-success" : quiet ? "bg-raised-2 text-tertiary" : isBlocking(finding.severity) ? "bg-error-surface text-error" : "bg-warning-surface text-warning",
      ].join(" ")}
    >
      {applied ? <Check size={11} strokeWidth={2} aria-hidden /> : null}
      <span className="tabular">{id}</span>
      <span>{applied ? "revised" : quiet ? "dismissed" : state === "applying" ? "re-running check" : finding.ruleId}</span>
    </button>
  );
}

function SafetyPanel({ block }: { block: Extract<RBlock, { t: "panel" }> }) {
  const tone = PANEL[block.word];
  const open = block.finding && block.state !== "applied" && block.state !== "dismissed";
  return (
    <div>
      {block.finding ? <BlockFlag id={block.finding} state={block.state} /> : null}
      <div className={`overflow-hidden rounded-md border ${tone.border} ${open ? "outline-1 outline-offset-2 outline-error outline-dashed" : ""}`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 ${tone.head}`}>
          {block.symbol ? <TriangleAlert size={16} strokeWidth={2} aria-label="Safety alert symbol" /> : null}
          <span className="text-label-md font-semibold tracking-[0.14em]">{block.word}</span>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-body-md font-medium text-primary">{block.hazard}</p>
          <p className="mt-1 text-body-md text-secondary">
            <Segs segs={block.segs} />
          </p>
        </div>
      </div>
    </div>
  );
}

function BlockView({ block }: { block: RBlock }) {
  const { openInspector } = useGrantha();
  switch (block.t) {
    case "p":
      return (
        <div>
          {block.finding ? <BlockFlag id={block.finding} state={block.state} /> : null}
          <p className="text-body-md leading-relaxed text-secondary">
            <Segs segs={block.segs} />
          </p>
        </div>
      );
    case "list":
      return (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body-md leading-relaxed text-secondary marker:text-quaternary">
          {block.items.map((segs, i) => (
            <li key={i}>
              <Segs segs={segs} />
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="flex flex-col gap-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-body-md leading-relaxed text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-default text-caption tabular text-primary">{i + 1}</span>
              <span className="min-w-0">
                {item.finding && (item.state !== "applied" || block.items.findIndex((x) => x.finding === item.finding) === i) ? (
                  <span className="mr-1.5 inline-block align-middle">
                    <BlockFlag id={item.finding} state={item.state} />
                  </span>
                ) : null}
                <Segs segs={item.segs} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "panel":
      return <SafetyPanel block={block} />;
    case "table":
      return (
        <div className="overflow-x-auto rounded-md border border-muted">
          <table className="w-full border-collapse text-left text-body-md">
            <thead>
              <tr className="bg-raised">
                {block.head.map((h) => (
                  <th key={h} className="border-b border-muted px-3 py-1.5 text-caption font-medium tracking-[0.08em] text-quaternary uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-muted last:border-b-0">
                  {row.map((cell, c) => (
                    <td key={c} className={`px-3 py-1.5 align-top ${c === 0 ? "text-primary" : "text-secondary"}`}>
                      <Segs segs={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "required":
      if (block.state === "applied") {
        return (
          <div>
            <BlockFlag id={block.finding} state="applied" />
            <p className="text-body-md leading-relaxed text-secondary">
              <Segs segs={block.segs} />
            </p>
          </div>
        );
      }
      return (
        <button
          type="button"
          data-finding={block.finding}
          onClick={() => openInspector({ type: "finding", id: block.finding })}
          className={[
            "flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-left text-body-sm outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active",
            block.state === "dismissed" ? "border-default text-tertiary hover:bg-raised" : "border-error-stroke bg-error-surface text-error",
          ].join(" ")}
        >
          <span className="tabular">{block.finding}</span>
          <span className="min-w-0">
            {block.state === "applying" ? "Inserting the required statement and re-running the check" : `Required statement missing here: ${block.label}`}
          </span>
        </button>
      );
  }
}

export interface TitleBlock {
  product: string;
  docName: string;
  model: string;
  docNumber: string;
  language: string;
  issued: string;
}

export function ManualDocument({
  sections,
  title,
  focusFinding,
  focusSection,
  showTopics = true,
  limit,
  footer,
}: {
  sections: RSection[];
  title: TitleBlock;
  /** Scroll the first span of this finding into view when it changes. */
  focusFinding?: string | null;
  /** Section to fall back to when the finding has no span of its own. */
  focusSection?: string | null;
  showTopics?: boolean;
  /** Show only the first n sections, for the pipeline while it writes. */
  limit?: number;
  footer?: ReactNode;
}) {
  const { openInspector } = useGrantha();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusFinding) return;
    const el = ref.current?.querySelector(`[data-finding="${focusFinding}"]`) ?? (focusSection ? ref.current?.querySelector(`#${focusSection}`) : null);
    el?.scrollIntoView({ block: el.tagName === "SECTION" ? "start" : "center", behavior: "smooth" });
  }, [focusFinding, focusSection]);

  const visible = limit === undefined ? sections : sections.slice(0, limit);

  return (
    <div ref={ref} className="mx-auto w-full max-w-[46rem] rounded-lg border border-muted bg-container">
      <header className="flex items-start justify-between gap-4 border-b border-default px-5 py-5 sm:px-9">
        <div className="min-w-0">
          <p className="text-caption tracking-[0.14em] text-quaternary uppercase">{title.docName}</p>
          <h3 className="mt-1 text-heading-md font-semibold text-primary">{title.product}</h3>
          <p className="mt-1 text-body-sm text-tertiary">
            Model <span className="tabular text-secondary">{title.model}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <GMark id="mark-doc-reading" size={32} />
          <p className="text-caption tabular text-tertiary">{title.docNumber}</p>
          <p className="text-caption text-quaternary">
            {title.language} · {title.issued}
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-7 px-5 py-6 sm:px-9">
        {visible.map((section, si) => {
          let lastTopic = "";
          return (
            <section key={section.id} id={section.id} className="flex flex-col gap-3">
              <h4 className="flex items-baseline gap-2 border-b border-muted pb-1.5 text-body-lg font-semibold text-primary">
                <span className="tabular text-quaternary">{String(si + 1).padStart(2, "0")}</span>
                <span className="min-w-0">{section.title}</span>
              </h4>
              {section.blocks.map((block, bi) => {
                const tag = showTopics && block.topic !== lastTopic ? block.topic : null;
                lastTopic = block.topic;
                return (
                  <div key={bi} className="min-w-0">
                    {tag ? (
                      <button
                        type="button"
                        onClick={() => openInspector({ type: "topic", id: tag })}
                        className="mb-1 block text-caption tabular text-quaternary outline-none transition-colors duration-[150ms] hover:text-secondary focus-visible:ring-2 focus-visible:ring-active"
                      >
                        {tag}
                      </button>
                    ) : null}
                    <BlockView block={block} />
                  </div>
                );
              })}
            </section>
          );
        })}
        {footer}
      </div>
    </div>
  );
}

/** How to read the marks in the document. */
export function DocumentLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-tertiary">
      <span className="inline-flex items-center gap-1.5">
        <span className="rounded-[3px] px-0.5 text-info underline decoration-dotted underline-offset-2">28 min</span> traced figure, click for the source
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="rounded-[3px] bg-error-surface px-0.5 text-error underline decoration-wavy decoration-error underline-offset-[3px]">40 loads</span> open finding
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="rounded-[3px] bg-success-surface px-0.5 text-success">850 RPM</span> revised by an applied fix
      </span>
    </div>
  );
}
