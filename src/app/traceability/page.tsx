"use client";

/**
 * Traceability: fact, record line and sentence, side by side. Answers whether
 * every figure in the draft can be shown to an auditor with its source.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

import { FindingStateBadge } from "@/components/grantha/finding-actions";
import { Btn, GMark, LABEL_CLASS, LinkBtn } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { BarList, KpiTile, Panel, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { pct } from "@/lib/grantha/format";
import { FACTS, RECORD_SHORT, factById, liveRecord } from "@/lib/grantha/records";
import type { TraceRow } from "@/lib/grantha/selectors";
import type { SourceRecord } from "@/lib/grantha/types";

export default function TraceabilityPage() {
  const { trace, findings, openInspector, applyFix } = useGrantha();
  const [kind, setKind] = useState<string | undefined>();

  const byRecord = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of trace.rows) {
      const k = factById(row.factId)?.recordKind ?? "IAR";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return (Object.keys(RECORD_SHORT) as SourceRecord["kind"][]).map((k) => ({ id: k, label: `${RECORD_SHORT[k]} · ${liveRecord(k).ref}`, value: counts.get(k) ?? 0 }));
  }, [trace.rows]);

  const rows = kind ? trace.rows.filter((r) => factById(r.factId)?.recordKind === kind) : trace.rows;

  const columns: Column<TraceRow>[] = [
    { key: "fact", header: "Fact", card: "title", value: (r) => r.factId, render: (r) => <span className="tabular text-primary">{r.factId}</span> },
    { key: "label", header: "Attribute", hide: "md", value: (r) => factById(r.factId)?.label ?? "", render: (r) => <span className="whitespace-nowrap">{factById(r.factId)?.label}</span> },
    {
      key: "record",
      header: "Record line",
      value: (r) => {
        const f = factById(r.factId);
        return f ? `${liveRecord(f.recordKind).ref} line ${f.line}` : "";
      },
      render: (r) => {
        const f = factById(r.factId);
        return f ? (
          <span className="tabular whitespace-nowrap">
            {liveRecord(f.recordKind).ref} · line {f.line}
          </span>
        ) : null;
      },
    },
    { key: "shown", header: "As written", value: (r) => r.shown, render: (r) => <span className="tabular whitespace-nowrap text-info">{r.shown}</span> },
    { key: "section", header: "Section", hide: "lg", value: (r) => r.section, render: (r) => <span className="whitespace-nowrap">{r.section}</span> },
    { key: "sentence", header: "Sentence", value: (r) => r.sentence, render: (r) => <span className="block max-w-[26rem] truncate text-tertiary">{r.sentence}</span> },
    { key: "topic", header: "Topic", hide: "lg", value: (r) => r.topic, render: (r) => <span className="tabular">{r.topic}</span> },
  ];

  const orphanFindings = trace.orphans.map((o) => ({ orphan: o, finding: findings.find((f) => f.id === o.findingId)! })).filter((x) => x.finding);

  return (
    <>
      <PageHeader
        title="Traceability"
        description="Every figure in the Use & Care Guide for NTL-6157 against the record line it came from. A figure with no line, or a different value, is an orphan."
        mark={<GMark id="mark-traceability" size={44} />}
        actions={
          <>
            {kind ? <Btn onClick={() => setKind(undefined)}>Scoped to {RECORD_SHORT[kind as SourceRecord["kind"]]} · clear</Btn> : null}
            <LinkBtn href="/facts">Fact base</LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Coverage" value={pct(trace.coverage, 1)} hint="traced figures of all figures" tone={trace.orphans.length ? "warning" : "success"} delta={trace.orphans.length ? "below 100%" : "complete"} mark={<GMark id="mark-kpi-trace" />} />
            <KpiTile label="Traced figures" value={String(trace.rows.length)} hint={`${trace.used.size} distinct facts`} />
            <KpiTile label="Orphan figures" value={String(trace.orphans.length)} hint="no line, or a different value" tone={trace.orphans.length ? "error" : "success"} delta={trace.orphans.length ? "blocks sign-off" : "none"} />
            <KpiTile label="Required facts unused" value={String(trace.unusedRequired.length)} hint={`${FACTS.length - trace.used.size} of ${FACTS.length} facts not cited`} tone={trace.unusedRequired.length ? "warning" : "success"} />
          </div>

          <SplitRow ratio="1.4/1">
            <Panel title={`Orphan figures · ${trace.orphans.length}`} action={<span className="text-caption text-quaternary">figures the record does not support</span>}>
              {orphanFindings.length ? (
                <ul className="flex flex-col">
                  {orphanFindings.map(({ orphan, finding }) => (
                    <li key={orphan.findingId} className="flex flex-wrap items-center gap-3 border-b border-muted py-2.5 last:border-b-0">
                      <div className="min-w-0 flex-1 basis-64">
                        <p className="flex flex-wrap items-center gap-2 text-body-md">
                          <button type="button" onClick={() => openInspector({ type: "finding", id: finding.id })} className="tabular text-primary underline-offset-2 hover:underline">
                            {finding.id}
                          </button>
                          <span className="rounded-[3px] bg-error-surface px-1 text-error underline decoration-wavy decoration-error underline-offset-[3px]">{orphan.text}</span>
                          <StatusBadge tone="neutral">{orphan.why}</StatusBadge>
                        </p>
                        <p className="mt-0.5 text-body-sm text-tertiary">
                          {orphan.section} · {finding.evidence}
                        </p>
                      </div>
                      <FindingStateBadge finding={finding} />
                      <Btn variant="primary" onClick={() => applyFix(finding.id)} disabled={finding.state.status !== "open" && finding.state.status !== "waiver"}>
                        Apply fix
                      </Btn>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <GMark id="mark-verdict-ready" size={48} />
                  <p className="text-body-md text-tertiary">No orphan figures</p>
                  <p className="text-body-sm text-quaternary">Every figure in the draft resolves to a released record line and equals it.</p>
                </div>
              )}
            </Panel>
            <Panel title="Which record carries the document?" action={<span className="text-caption text-quaternary">traced figures by record</span>}>
              <BarList rows={byRecord} selectedId={kind} onSelect={(id) => setKind(id === kind ? undefined : id)} />
              <div className="mt-4 border-t border-muted pt-3">
                <p className={LABEL_CLASS}>Required facts not yet used · {trace.unusedRequired.length}</p>
                {trace.unusedRequired.length ? (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {trace.unusedRequired.map((f) => (
                      <li key={f.id}>
                        <button type="button" onClick={() => openInspector({ type: "fact", id: f.id })} className="flex w-full items-baseline justify-between gap-3 rounded-md bg-raised px-3 py-1.5 text-left text-body-sm hover:bg-raised-2">
                          <span className="min-w-0 truncate">
                            <span className="tabular text-primary">{f.id}</span> <span className="text-tertiary">{f.label}</span>
                          </span>
                          <span className="shrink-0 tabular text-secondary">{f.value}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-body-sm text-tertiary">All required facts appear in the draft.</p>
                )}
                {trace.unusedRequired.some((f) => f.id === "ID-006") ? (
                  <p className="mt-2 text-caption text-quaternary">
                    The FCC ID is unused because the FCC statement is missing. See{" "}
                    <Link href="/findings?f=F-02" className="underline underline-offset-2 hover:text-primary">
                      F-02
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            </Panel>
          </SplitRow>

          <Panel title={`Fact, record line, sentence · ${rows.length}`} padded={false} className="max-h-[600px]">
            <div className="min-h-0 flex-1">
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(r) => r.key}
                onRowClick={(r) => openInspector({ type: "fact", id: r.factId })}
                searchPlaceholder="Search fact, record, sentence"
                exportName="traceability-matrix"
                defaultSort={{ key: "fact", dir: "asc" }}
                pageSize={30}
                emptyTitle="No traced figure from this record"
              />
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}
