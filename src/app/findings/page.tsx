"use client";

/**
 * Findings: work the open findings against the live document. Applying a fix
 * rewrites the span on the right, re-runs the rule and moves the verdict.
 */

import { Suspense, useState } from "react";

import { FindingActions, FindingStateBadge } from "@/components/grantha/finding-actions";
import { DocumentLegend, ManualDocument } from "@/components/grantha/manual-document";
import { Btn, GMark, LABEL_CLASS, LinkBtn, SeverityBadge, useLinkedSelection } from "@/components/grantha/ui";
import { VerdictBanner } from "@/components/grantha/widgets";
import { PageHeader } from "@/components/layout/page-header";
import { FilterChips } from "@/components/ui/data-table";
import { InfoPopover } from "@/components/ui/info-popover";
import { StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { isBlocking, ruleById } from "@/lib/grantha/rules";
import type { LiveFinding } from "@/lib/grantha/selectors";

const FILTERS: { id: string; label: string; test: (f: LiveFinding) => boolean }[] = [
  { id: "open", label: "Open", test: (f) => f.active },
  { id: "blocking", label: "Blocking", test: (f) => f.active && isBlocking(f.severity) },
  { id: "drafted", label: "Drafted", test: (f) => f.active && f.origin === "drafted" },
  { id: "inherited", label: "Inherited", test: (f) => f.active && f.origin === "inherited" },
  { id: "closed", label: "Fixed or dismissed", test: (f) => !f.active },
  { id: "all", label: "All", test: () => true },
];

function FindingsInner() {
  const { findings, sections, verdict, applyAllSafe, openInspector } = useGrantha();
  const [selected, setSelected] = useLinkedSelection("f");
  const [filter, setFilter] = useState("open");

  const test = FILTERS.find((f) => f.id === filter)?.test ?? (() => true);
  const linked = selected ? findings.find((f) => f.id === selected) : undefined;
  // A deep-linked finding stays visible even after it leaves the current filter.
  const rows = findings.filter((f) => test(f) || f.id === linked?.id);
  const open = findings.filter((f) => f.active);
  const safe = open.filter((f) => f.state.status === "open" && f.confidence >= 0.97).length;

  return (
    <>
      <PageHeader
        title="Findings"
        description="Each finding is one rule failing on one place in the draft. Apply the proposed fix, dismiss it with a reason, or assign it. The document on the right changes as you work."
        mark={<GMark id="mark-findings" size={44} />}
        info={
          <InfoPopover label="How findings are decided">
            <p className="text-body-sm text-secondary">
              Severity uses the safety signal words. DANGER and WARNING block sign-off. CAUTION and NOTICE are advisories. A finding marked inherited came across in a carry-over topic from NTL-8127. A fix is a
              proposal: the rule is re-run on the revised text, and only a pass closes the finding.
            </p>
          </InfoPopover>
        }
        actions={
          <>
            <Btn onClick={applyAllSafe} disabled={!safe}>
              Apply {safe} fix{safe === 1 ? "" : "es"} at 97% or above
            </Btn>
            <LinkBtn href="/traceability">Traceability</LinkBtn>
          </>
        }
      />
      <div className="shrink-0 border-b border-muted px-4 py-3 sm:px-5">
        <VerdictBanner
          compact
          action={
            verdict.ready ? (
              <LinkBtn href="/signoff" variant="primary">
                {verdict.signed ? "View sign-off" : "Open sign-off queue"}
              </LinkBtn>
            ) : (
              <span className="text-body-sm tabular text-secondary">
                {open.filter((f) => f.severity === "DANGER").length} DANGER · {open.filter((f) => f.severity === "WARNING").length} WARNING · {open.filter((f) => !isBlocking(f.severity)).length} advisory
              </span>
            )
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <section className="flex min-w-0 shrink-0 flex-col gap-3 border-b border-muted p-4 lg:w-[26rem] lg:overflow-y-auto lg:border-r lg:border-b-0 xl:w-[30rem]">
          <FilterChips options={FILTERS.map((f) => ({ id: f.id, label: f.label, count: findings.filter(f.test).length }))} value={filter} onChange={setFilter} />
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-muted bg-container px-6 py-10 text-center">
              <GMark id="mark-empty" size={56} />
              <p className="text-body-md text-tertiary">No finding in this view</p>
              <p className="text-body-sm text-quaternary">{filter === "open" ? "Every finding is fixed or dismissed. The document is with sign-off." : "Pick another filter."}</p>
            </div>
          ) : null}
          {rows.map((f) => {
            const active = f.id === selected;
            const rule = ruleById(f.ruleId);
            return (
              <article
                key={f.id}
                className={`rounded-lg border bg-container transition-colors duration-[150ms] ${active ? "border-active" : "border-muted hover:border-default"} ${f.active ? "" : "opacity-80"}`}
              >
                <button type="button" onClick={() => setSelected(active ? null : f.id)} aria-expanded={active} className="flex w-full flex-col gap-1.5 rounded-lg px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-active">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-body-md tabular font-medium text-primary">{f.id}</span>
                    <SeverityBadge severity={f.severity} />
                    <FindingStateBadge finding={f} />
                    <span className="ml-auto text-caption text-quaternary">{f.origin}</span>
                  </span>
                  <span className="text-body-md text-primary">{f.title}</span>
                  <span className="text-caption tabular text-tertiary">
                    {f.ruleId} · {rule?.clause}
                  </span>
                </button>
                {active ? (
                  <div className="flex flex-col gap-3 border-t border-muted px-3.5 py-3">
                    <p className="text-body-sm text-secondary">{f.detail}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <p className={LABEL_CLASS}>Evidence</p>
                        <p className="mt-0.5 text-body-sm text-secondary">{f.evidence}</p>
                      </div>
                      <div className="min-w-0">
                        <p className={LABEL_CLASS}>Topic</p>
                        <button type="button" onClick={() => openInspector({ type: "topic", id: f.topicId })} className="mt-0.5 text-body-sm tabular text-secondary underline underline-offset-2 hover:text-primary">
                          {f.topicId}
                        </button>
                      </div>
                    </div>
                    <div className="rounded-md border border-muted bg-raised px-3 py-2">
                      <p className={LABEL_CLASS}>Proposed fix · {Math.round(f.confidence * 100)}% confidence</p>
                      <p className="mt-1 text-body-sm text-secondary">{f.proposedFix}</p>
                    </div>
                    {f.ruleOff ? (
                      <p className="flex flex-wrap items-center gap-2 text-body-sm text-tertiary">
                        <StatusBadge tone="neutral">Rule off</StatusBadge>
                        {f.ruleId} is switched off in the rule library, so this finding does not count.
                        <LinkBtn href={`/rules?rule=${f.ruleId}`}>Open rule</LinkBtn>
                      </p>
                    ) : (
                      <FindingActions finding={f} />
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
          <p className="rounded-lg border border-muted bg-raised px-3.5 py-3 text-body-sm text-tertiary">
            A model reviewing its own draft catches a minority of its errors. That is why every check here is a deterministic rule with a clause behind it, and why sign-off stays with a named technical author.
          </p>
        </section>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 bg-raised p-4 max-lg:flex-none lg:overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[46rem] flex-wrap items-center justify-between gap-2">
            <DocumentLegend />
            {linked ? <span className="text-caption text-quaternary">Showing {linked.id} in the document</span> : null}
          </div>
          <ManualDocument
            sections={sections}
            focusFinding={selected}
            focusSection={linked?.sectionId}
            title={{ product: "Northfield 5.3 cu ft Top Load Washer", docName: "Use & Care Guide", model: "NTL-6157", docNumber: "N11789021 Rev. A", language: "en-US", issued: "12 Oct 2026" }}
          />
        </section>
      </div>
    </>
  );
}

export default function FindingsPage() {
  return (
    <Suspense>
      <FindingsInner />
    </Suspense>
  );
}
