"use client";

/**
 * Command Center: the documentation manager's view across the model line.
 * Which documents are stuck, what is stopping them, and which engineering
 * changes are still waiting on literature.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Btn, GMark, LABEL_CLASS, LinkBtn } from "@/components/grantha/ui";
import { AXIS_TICK, ChartTip, FlowCanvas, GRID_STROKE, InsightCard } from "@/components/grantha/widgets";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { STAGES, docType, modelById, personName, stageLabel } from "@/lib/grantha/data";
import { ecnCost } from "@/lib/grantha/ecn";
import { pct, shortDate, usdCompact } from "@/lib/grantha/format";
import { CYCLE_TREND, INSIGHTS } from "@/lib/grantha/misc";
import { blockerReason, docStatusLabel, docStatusTone, ecnState, isBlocked } from "@/lib/grantha/selectors";
import type { FlowStage, LitDoc } from "@/lib/grantha/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "danger", label: "DANGER open" },
  { id: "stale", label: "Published, now contradicted" },
  { id: "Laundry", label: "Laundry" },
  { id: "Kitchen", label: "Kitchen" },
  { id: "Refrigeration", label: "Refrigeration" },
];

function matches(doc: LitDoc, filter: string): boolean {
  if (filter === "danger") return doc.findings.danger > 0;
  if (filter === "stale") return doc.stale;
  if (filter === "all") return true;
  return modelById(doc.modelId).line === filter;
}

export default function CommandCenterPage() {
  const router = useRouter();
  const { docs, kpis, st, ecns, openRevisionSet } = useGrantha();
  const [stage, setStage] = useState<FlowStage | null>(null);
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    const c = Object.fromEntries(STAGES.map((s) => [s.id, 0])) as Record<FlowStage, number>;
    const b = { ...c };
    for (const doc of docs) {
      c[doc.stage] += 1;
      if (isBlocked(doc)) b[doc.stage] += 1;
    }
    return { c, b };
  }, [docs]);

  // The flow canvas is a filter: a stage shows everything in it, blocked first.
  const scoped = useMemo(() => (stage ? docs.filter((d) => d.stage === stage) : docs.filter(isBlocked)), [docs, stage]);
  const rows = useMemo(
    () => scoped.filter((d) => matches(d, filter)).sort((a, b) => Number(isBlocked(b)) - Number(isBlocked(a)) || b.findings.danger - a.findings.danger || b.findings.warning - a.findings.warning),
    [scoped, filter],
  );

  const columns: Column<LitDoc>[] = [
    {
      key: "doc",
      header: "Document",
      card: "title",
      value: (d) => d.id,
      render: (d) => (
        <span className="flex min-w-0 flex-col">
          <span className="tabular text-primary">{d.id}</span>
          <span className="truncate text-caption text-quaternary">{docType(d.type).name}</span>
        </span>
      ),
    },
    { key: "state", header: "State", value: (d) => docStatusLabel(d), render: (d) => <StatusBadge tone={docStatusTone(d)}>{docStatusLabel(d)}</StatusBadge> },
    {
      key: "blocker",
      header: "What stops release",
      value: (d) => (isBlocked(d) ? blockerReason(d) : "Nothing"),
      render: (d) => <span className={`whitespace-nowrap ${isBlocked(d) ? "text-secondary" : "text-quaternary"}`}>{isBlocked(d) ? blockerReason(d) : "Nothing"}</span>,
    },
    { key: "danger", header: "Danger", align: "right", card: "metric", value: (d) => d.findings.danger, render: (d) => <span className={`tabular ${d.findings.danger ? "text-error" : "text-quaternary"}`}>{d.findings.danger}</span> },
    { key: "warning", header: "Warning", align: "right", hide: "md", value: (d) => d.findings.warning, render: (d) => <span className={`tabular ${d.findings.warning ? "text-warning" : "text-quaternary"}`}>{d.findings.warning}</span> },
    { key: "owner", header: "Author", hide: "lg", value: (d) => personName(d.ownerId), render: (d) => <span className="whitespace-nowrap">{personName(d.ownerId)}</span> },
    { key: "due", header: "Due", align: "right", hide: "md", value: (d) => d.due, render: (d) => <span className="tabular whitespace-nowrap">{shortDate(d.due)}</span> },
  ];

  const waiting = ecns.filter((e) => !st.revisionSets.includes(e.id));

  return (
    <>
      <PageHeader
        title="Command Center"
        description="Every document in the model line by state, what is stopping each one from release, and the engineering changes still waiting on literature."
        mark={<GMark id="mark-command" size={44} />}
        actions={
          stage ? (
            <Btn onClick={() => setStage(null)}>Scoped to {stageLabel(stage)} · clear</Btn>
          ) : (
            <LinkBtn href="/generate" variant="primary">
              Draft a document
            </LinkBtn>
          )
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 @6xl:grid-cols-6">
            <Link href="/findings" className="block min-w-0">
              <KpiTile label="Blocked from release" value={String(kpis.blocked)} hint={`of ${docs.length} documents`} tone="error" delta={kpis.blocked ? "needs action" : "clear"} mark={<GMark id="mark-kpi-blocked" />} />
            </Link>
            <Link href="/findings" className="block min-w-0">
              <KpiTile label="Open DANGER findings" value={String(kpis.danger)} hint="safety or regulatory" tone={kpis.danger ? "error" : "success"} delta={kpis.danger ? "blocks sign-off" : "none open"} mark={<GMark id="mark-kpi-danger" />} />
            </Link>
            <Link href="/traceability" className="block min-w-0">
              <KpiTile label="Traceability coverage" value={pct(kpis.coverage, 1)} hint="figures with a record line" tone="info" delta="target 100%" mark={<GMark id="mark-kpi-trace" />} />
            </Link>
            <Link href="/reuse" className="block min-w-0">
              <KpiTile label="Carry-over reuse" value={pct(kpis.reuse)} hint="words unchanged from predecessor" tone="success" mark={<GMark id="mark-kpi-reuse" />} />
            </Link>
            <Link href="/localisation" className="block min-w-0">
              <KpiTile label="Translation spend avoided" value={usdCompact(kpis.avoided)} hint="exact matches, this cycle" tone="success" mark={<GMark id="mark-kpi-spend" />} />
            </Link>
            <Link href="/change-impact" className="block min-w-0">
              <KpiTile label="Days, ECN to reissue" value={String(kpis.ecnDays)} hint="median, was 31 in May" tone="success" delta="-61%" mark={<GMark id="mark-kpi-cycle" />} />
            </Link>
          </div>

          <Panel title="Literature flow" padded={false} action={<span className="text-caption text-quaternary">Select a state to scope the queue below</span>}>
            <FlowCanvas counts={counts.c} blocked={counts.b} selected={stage} onSelect={setStage} />
          </Panel>

          <SplitRow className="lg:h-[34rem] lg:max-h-[34rem] lg:overflow-hidden">
            <Panel title={stage ? `Documents in ${stageLabel(stage)} · ${rows.length}` : `Release blockers · ${rows.length}`} padded={false} action={<span className="text-caption text-quaternary">blocked first</span>}>
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 border-b border-muted p-3">
                  <FilterChips options={FILTERS.map((f) => ({ ...f, count: scoped.filter((d) => matches(d, f.id)).length }))} value={filter} onChange={setFilter} />
                </div>
                <div className="min-h-0 flex-1">
                  <DataTable
                    rows={rows}
                    columns={columns}
                    rowKey={(d) => d.id}
                    onRowClick={(d) => router.push(`/library/${d.id}`)}
                    emptyTitle="Nothing is blocked in this scope"
                    emptyDetail="Pick another state on the flow, or clear the filter."
                    searchPlaceholder="Search document, model, author"
                    exportName="release-blockers"
                    pageSize={25}
                  />
                </div>
              </div>
            </Panel>
            <Panel title="Agent observations" padded={false} action={<span className="text-caption text-quaternary">evidence first, a person decides</span>}>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
                {INSIGHTS.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {INSIGHTS.every((i) => st.insightStatus[i.id] === "dismissed") ? <p className="p-3 text-body-sm text-tertiary">All observations dismissed for this session.</p> : null}
              </div>
            </Panel>
          </SplitRow>

          <SplitRow>
            <Panel title={`ECNs waiting on literature · ${waiting.length} of ${ecns.length}`} action={<Link href="/change-impact" className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Change impact</Link>}>
              <ul className="flex flex-col">
                {ecns.map((ecn) => {
                  const cost = ecnCost(ecn);
                  const open = ecnState(st, ecn.id) === "Revision set open";
                  return (
                    <li key={ecn.id} className="flex flex-wrap items-center gap-3 border-b border-muted py-2.5 last:border-b-0">
                      <GMark id={ecn.safetyCritical ? "mark-safety-panel" : "mark-change-impact"} />
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="flex flex-wrap items-center gap-2 text-body-md text-primary">
                          <Link href={`/change-impact?ecn=${ecn.id}`} className="tabular underline-offset-2 hover:underline">
                            {ecn.id}
                          </Link>
                          {ecn.safetyCritical ? <StatusBadge tone="error">Safety-critical</StatusBadge> : null}
                          <StatusBadge tone={open ? "info" : "warning"}>{open ? "Revision set open" : `Waiting ${ecn.daysWaiting} days`}</StatusBadge>
                        </p>
                        <p className="mt-0.5 truncate text-body-sm text-tertiary">
                          {ecn.modelIds.join(", ")} · {ecn.title}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-caption tabular text-quaternary">
                        {cost.docs} documents
                        <br />
                        {cost.objects} objects
                      </p>
                      {open ? (
                        <LinkBtn href={`/change-impact?ecn=${ecn.id}`}>View set</LinkBtn>
                      ) : (
                        <Btn variant="primary" onClick={() => openRevisionSet(ecn.id)}>
                          Open revision set
                        </Btn>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
            <Panel title="How long does an ECN wait for reissued literature?" action={<Link href="/business-case" className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Business case</Link>}>
              <div className="flex flex-col gap-3">
                <div className="h-[220px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CYCLE_TREND} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                      <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} domain={[0, 36]} />
                      <Tooltip content={<ChartTip format={(v) => `${v} days`} />} cursor={{ stroke: GRID_STROKE }} />
                      <ReferenceLine y={10} stroke="var(--feedback-success-icon)" strokeDasharray="4 4" />
                      <Line type="monotone" name="Median days" dataKey="days" stroke="var(--analytics-series-1)" strokeWidth={2} dot={{ r: 3, fill: "var(--analytics-series-1)" }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-body-sm text-tertiary">
                  Median days from ECN release to the reissued document in its source language. The dashed line is the 10-day target. The remaining gap is illustration rework, not text.
                </p>
                <div className="grid grid-cols-3 gap-3 border-t border-muted pt-3">
                  <div>
                    <p className={LABEL_CLASS}>Longest waiting</p>
                    <p className="mt-0.5 text-body-md tabular text-primary">{waiting[0]?.id ?? "None"}</p>
                  </div>
                  <div>
                    <p className={LABEL_CLASS}>Safety-critical</p>
                    <p className="mt-0.5 text-body-md tabular text-primary">{waiting.filter((e) => e.safetyCritical).length} waiting</p>
                  </div>
                  <div>
                    <p className={LABEL_CLASS}>Sets open</p>
                    <p className="mt-0.5 text-body-md tabular text-primary">{st.revisionSets.length}</p>
                  </div>
                </div>
              </div>
            </Panel>
          </SplitRow>
        </div>
      </PageBody>
    </>
  );
}
