"use client";

/**
 * Facts: everything the extractor took from the records for NTL-6157. A
 * sentence may only state what is in this table.
 */

import { Suspense, useEffect, useMemo, useState } from "react";

import { GMark, LABEL_CLASS, LinkBtn, useQueryParam } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { CONSTRAINTS, FACTS, liveRecord } from "@/lib/grantha/records";
import { brokenFacts } from "@/lib/grantha/selectors";
import type { Fact } from "@/lib/grantha/types";

function FactsInner() {
  const { st, trace, findings, openInspector } = useGrantha();
  const linked = useQueryParam("fact");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (linked) openInspector({ type: "fact", id: linked });
  }, [linked, openInspector]);

  const uses = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of trace.rows) m.set(r.factId, (m.get(r.factId) ?? 0) + 1);
    return m;
  }, [trace.rows]);
  const broken = useMemo(() => new Set(brokenFacts(st).map((f) => f.id)), [st]);

  const tests: Record<string, (f: Fact) => boolean> = {
    all: () => true,
    measured: (f) => f.kind === "measured",
    descriptive: (f) => f.kind === "descriptive",
    used: (f) => uses.has(f.id),
    unused: (f) => !uses.has(f.id),
    required: (f) => Boolean(f.required),
  };
  const rows = FACTS.filter(tests[filter]);

  const columns: Column<Fact>[] = [
    { key: "id", header: "Fact", card: "title", value: (f) => f.id, render: (f) => <span className="tabular whitespace-nowrap text-primary">{f.id}</span> },
    { key: "label", header: "Attribute", value: (f) => f.label, render: (f) => f.label },
    { key: "value", header: "Value", align: "right", card: "metric", value: (f) => f.value, render: (f) => <span className="tabular text-primary">{f.value}</span> },
    { key: "unit", header: "Unit", value: (f) => f.unit, render: (f) => <span className="text-tertiary">{f.unit || "—"}</span> },
    { key: "category", header: "Category", hide: "md", value: (f) => f.category, render: (f) => <span className="text-tertiary">{f.category}</span> },
    {
      key: "source",
      header: "Source line",
      value: (f) => `${liveRecord(f.recordKind).ref} ${String(f.line).padStart(3, "0")}`,
      render: (f) =>
        broken.has(f.id) ? (
          <StatusBadge tone="error">Line no longer matches</StatusBadge>
        ) : (
          <span className="tabular whitespace-nowrap">
            {liveRecord(f.recordKind).ref} · line {f.line}
          </span>
        ),
    },
    { key: "kind", header: "Kind", hide: "lg", value: (f) => f.kind, render: (f) => <span className="text-tertiary">{f.kind}</span> },
    { key: "required", header: "Required", hide: "lg", value: (f) => (f.required ? "yes" : "no"), render: (f) => (f.required ? <StatusBadge tone="info">Required</StatusBadge> : <span className="text-quaternary">—</span>) },
    { key: "used", header: "Used in", align: "right", value: (f) => uses.get(f.id) ?? 0, render: (f) => <span className={`tabular ${uses.get(f.id) ? "text-primary" : "text-quaternary"}`}>{uses.get(f.id) ?? 0}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Facts"
        description="The fact base for NTL-6157: 51 facts from 5 records, each with its source line. The author writes from these and nothing else."
        mark={<GMark id="mark-facts" size={44} />}
        actions={
          <>
            <LinkBtn href="/records">Source records</LinkBtn>
            <LinkBtn href="/traceability">Traceability</LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Facts extracted" value={String(FACTS.length)} hint={`${FACTS.filter((f) => f.kind === "measured").length} measured, ${FACTS.filter((f) => f.kind === "descriptive").length} descriptive`} />
            <KpiTile label="Match their source line" value={`${FACTS.length - broken.size} / ${FACTS.length}`} hint="value found in the cited record line" tone={broken.size ? "error" : "success"} delta={broken.size ? "record edited" : "all match"} />
            <KpiTile label="Used in the draft" value={String(trace.used.size)} hint={`${trace.rows.length} places in the Use & Care Guide`} tone="info" />
            <KpiTile label="Prohibitions · required" value={`${CONSTRAINTS.filter((c) => c.kind === "prohibition").length} · ${CONSTRAINTS.filter((c) => c.kind === "required").length}`} hint="claims barred, statements owed" tone="warning" />
          </div>

          <Panel title="What the records forbid and require">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {CONSTRAINTS.map((c) => {
                const hit = findings.find((f) => f.evidence.includes(c.id) && f.active);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openInspector({ type: "constraint", id: c.id })}
                    className="flex min-w-0 flex-col gap-1 rounded-lg border border-muted bg-page px-3 py-2.5 text-left outline-none transition-colors duration-[150ms] hover:border-default focus-visible:ring-2 focus-visible:ring-active"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={LABEL_CLASS}>
                        <span className="tabular">{c.id}</span> · {c.kind === "prohibition" ? "Prohibition" : "Required statement"}
                      </span>
                      {hit ? <StatusBadge tone="error">{hit.id} open</StatusBadge> : <StatusBadge tone="success">Respected</StatusBadge>}
                    </span>
                    <span className="text-body-md text-primary">{c.title}</span>
                    <span className="text-body-sm text-tertiary">{c.detail}</span>
                    <span className="text-caption tabular text-quaternary">
                      {liveRecord(c.recordKind).ref} · line {c.line}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title={`Fact base · ${rows.length}`} padded={false} className="max-h-[640px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-muted p-3">
                <FilterChips
                  options={[
                    { id: "all", label: "All" },
                    { id: "measured", label: "Measured" },
                    { id: "descriptive", label: "Descriptive" },
                    { id: "used", label: "Used in draft" },
                    { id: "unused", label: "Not used" },
                    { id: "required", label: "Required" },
                  ].map((o) => ({ ...o, count: FACTS.filter(tests[o.id]).length }))}
                  value={filter}
                  onChange={setFilter}
                />
              </div>
              <div className="min-h-0 flex-1">
                <DataTable rows={rows} columns={columns} rowKey={(f) => f.id} onRowClick={(f) => openInspector({ type: "fact", id: f.id })} searchPlaceholder="Search fact, attribute, record" exportName="fact-base" pageSize={60} defaultSort={{ key: "id", dir: "asc" }} emptyTitle="No fact in this view" />
              </div>
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}

export default function FactsPage() {
  return (
    <Suspense>
      <FactsInner />
    </Suspense>
  );
}
