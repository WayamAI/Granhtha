"use client";

/**
 * Business Case: authoring hours, translation spend, cycle time and findings
 * that escaped to print, by model, before and with Grantha.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GMark, LABEL_CLASS, LinkBtn, SELECT_CLASS } from "@/components/grantha/ui";
import { AXIS_TICK, ChartTip, GRID_STROKE } from "@/components/grantha/widgets";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, Select } from "@/components/ui/primitives";
import { modelById } from "@/lib/grantha/data";
import { usd, usdCompact } from "@/lib/grantha/format";
import { CASE_ROWS, type CaseRow } from "@/lib/grantha/misc";

export default function BusinessCasePage() {
  const router = useRouter();
  const [rate, setRate] = useState(85);
  const [run, setRun] = useState(180000);
  const [line, setLine] = useState("All");

  const rows = useMemo(() => (line === "All" ? CASE_ROWS : CASE_ROWS.filter((r) => modelById(r.modelId).line === line)), [line]);
  const sum = (f: (r: CaseRow) => number) => rows.reduce((n, r) => n + f(r), 0);
  const hoursSaved = sum((r) => r.hoursBefore - r.hoursAfter);
  const transSaved = sum((r) => r.transBefore - r.transAfter);
  const escaped = sum((r) => r.escapedBefore - r.escapedAfter);
  /** A finding that reaches print costs a reprint or a service bulletin; planning figure. */
  const escapeCost = 6400;
  const gross = hoursSaved * rate + transSaved + escaped * escapeCost;
  const share = rows.length / CASE_ROWS.length;
  const net = gross - run * share;
  const cycleBefore = sum((r) => r.cycleBefore) / rows.length;
  const cycleAfter = sum((r) => r.cycleAfter) / rows.length;
  const saving = (r: CaseRow) => (r.hoursBefore - r.hoursAfter) * rate + (r.transBefore - r.transAfter) + (r.escapedBefore - r.escapedAfter) * escapeCost;

  const hoursChart = rows.map((r) => ({ model: r.modelId, "Before": r.hoursBefore, "With Grantha": r.hoursAfter }));
  const transChart = rows.map((r) => ({ model: r.modelId, "Before": r.transBefore, "With Grantha": r.transAfter }));

  const columns: Column<CaseRow>[] = [
    {
      key: "model",
      header: "Model",
      card: "title",
      value: (r) => r.modelId,
      render: (r) => (
        <span className="flex min-w-0 flex-col">
          <span className="tabular text-primary">{r.modelId}</span>
          <span className="truncate text-caption text-quaternary">{modelById(r.modelId).family}</span>
        </span>
      ),
    },
    { key: "reissues", header: "Reissues a year", align: "right", hide: "md", value: (r) => r.reissues, render: (r) => <span className="tabular">{r.reissues}</span> },
    { key: "hours", header: "Authoring hours", align: "right", value: (r) => r.hoursBefore - r.hoursAfter, render: (r) => <span className="tabular whitespace-nowrap">{r.hoursBefore} to {r.hoursAfter}</span> },
    { key: "trans", header: "Translation spend", align: "right", hide: "md", value: (r) => r.transBefore - r.transAfter, render: (r) => <span className="tabular whitespace-nowrap">{usdCompact(r.transBefore)} to {usdCompact(r.transAfter)}</span> },
    { key: "cycle", header: "Days, ECN to reissue", align: "right", value: (r) => r.cycleAfter, render: (r) => <span className="tabular whitespace-nowrap">{r.cycleBefore} to {r.cycleAfter}</span> },
    { key: "escaped", header: "Findings escaped", align: "right", hide: "lg", value: (r) => r.escapedAfter, render: (r) => <span className="tabular whitespace-nowrap">{r.escapedBefore} to <span className={r.escapedAfter ? "text-warning" : "text-success"}>{r.escapedAfter}</span></span> },
    { key: "saving", header: "Yearly saving", align: "right", card: "metric", value: (r) => saving(r), render: (r) => <span className="tabular text-primary">{usd(saving(r))}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Business Case"
        description="What drafting from the record and checking by rule is worth, model by model. Before figures are the 2025 baseline. Change the assumptions to test the case."
        mark={<GMark id="mark-business-case" size={44} />}
        actions={
          <>
            <Select aria-label="Product line" value={line} onChange={(e) => setLine(e.target.value)} className={SELECT_CLASS}>
              {["All", "Laundry", "Kitchen", "Refrigeration"].map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All product lines" : l}
                </option>
              ))}
            </Select>
            <Select aria-label="Loaded authoring rate" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={SELECT_CLASS}>
              {[68, 85, 110].map((r) => (
                <option key={r} value={r}>
                  Author rate ${r} an hour
                </option>
              ))}
            </Select>
            <Select aria-label="Yearly run cost" value={run} onChange={(e) => setRun(Number(e.target.value))} className={SELECT_CLASS}>
              {[120000, 180000, 240000].map((r) => (
                <option key={r} value={r}>
                  Run cost {usdCompact(r)} a year
                </option>
              ))}
            </Select>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 @5xl:grid-cols-5">
            <KpiTile label="Authoring hours saved" value={hoursSaved.toLocaleString("en-US")} hint={`${usdCompact(hoursSaved * rate)} a year at $${rate}`} tone="success" delta={`-${Math.round((hoursSaved / sum((r) => r.hoursBefore)) * 100)}%`} />
            <KpiTile label="Translation spend avoided" value={usdCompact(transSaved)} hint="exact matches kept, rewrites stopped" tone="success" delta={`-${Math.round((transSaved / sum((r) => r.transBefore)) * 100)}%`} mark={<GMark id="mark-kpi-spend" />} />
            <KpiTile label="Days, ECN to reissue" value={cycleAfter.toFixed(0)} hint={`was ${cycleBefore.toFixed(0)} days`} tone="success" delta={`-${Math.round(((cycleBefore - cycleAfter) / cycleBefore) * 100)}%`} mark={<GMark id="mark-kpi-cycle" />} />
            <KpiTile label="Findings escaped to print" value={String(sum((r) => r.escapedAfter))} hint={`was ${sum((r) => r.escapedBefore)} a year`} tone="info" delta={`-${escaped}`} />
            <KpiTile label="Net yearly benefit" value={usdCompact(net)} hint={`after ${usdCompact(run * share)} run cost`} tone={net > 0 ? "success" : "error"} delta={net > 0 ? `pays back in ${Math.max(1, Math.round(((run * share) / gross) * 12))} months` : "does not pay back"} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title="Where do authoring hours go, by model?" action={<span className="text-caption text-quaternary">hours a year</span>}>
              <div className="h-[260px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursChart} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="model" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={34} />
                    <Tooltip content={<ChartTip format={(v) => `${v} h`} />} cursor={{ fill: "var(--surface-raised)" }} />
                    <Bar dataKey="Before" fill="var(--analytics-series-5)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="With Grantha" fill="var(--analytics-series-1)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-body-sm text-tertiary">The hours that remain are review, illustration and sign-off. First drafts and impact searches are what went away.</p>
            </Panel>
            <Panel title="How much translation spend does carry-over protect?" action={<span className="text-caption text-quaternary">dollars a year</span>}>
              <div className="h-[260px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transChart} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="model" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={42} tickFormatter={(v: number) => usdCompact(v)} />
                    <Tooltip content={<ChartTip format={(v) => usd(v)} />} cursor={{ fill: "var(--surface-raised)" }} />
                    <Bar dataKey="Before" fill="var(--analytics-series-5)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="With Grantha" fill="var(--analytics-series-2)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-body-sm text-tertiary">Most of the saving is not cheaper translation. It is text that was never sent for translation, because it did not change.</p>
            </Panel>
          </div>

          <Panel title={`By model · ${rows.length}`} padded={false} className="max-h-[520px]">
            <div className="min-h-0 flex-1">
              <DataTable rows={rows} columns={columns} rowKey={(r) => r.modelId} onRowClick={(r) => router.push(`/library?model=${r.modelId}`)} searchPlaceholder="Search model" exportName="business-case" pageSize={20} defaultSort={{ key: "saving", dir: "desc" }} />
            </div>
          </Panel>

          <Panel title="Assumptions behind the figures">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className={LABEL_CLASS}>Authoring</p>
                <p className="mt-1 text-body-sm text-tertiary">Hours cover drafting, impact search, revision and sign-off for every reissue of the ten documents in a year. Loaded rate is adjustable above.</p>
              </div>
              <div>
                <p className={LABEL_CLASS}>Translation</p>
                <p className="mt-1 text-body-sm text-tertiary">fr-CA and es-MX at $0.22 a new word, $0.11 fuzzy, $0.03 exact, plus $85 review and layout each time a topic is touched in a language.</p>
              </div>
              <div>
                <p className={LABEL_CLASS}>Escaped findings</p>
                <p className="mt-1 text-body-sm text-tertiary">A DANGER or WARNING finding that reaches print is costed at {usd(escapeCost)}: a reprint or a service bulletin. Recall exposure is not included.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <LinkBtn href="/reuse">See the reuse plan</LinkBtn>
              <LinkBtn href="/localisation">See leverage by language</LinkBtn>
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}
