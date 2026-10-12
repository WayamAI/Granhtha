"use client";

/**
 * Literature Set: the ten documents every product ships with, per model,
 * with where each one stands against today's engineering record.
 */

import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { GMark, LinkBtn, Meter, SELECT_CLASS, StackBar, useLinkedSelection } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, Select, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { MODELS, STAGES, docType, modelById, personName, stageIndex } from "@/lib/grantha/data";
import { pct, shortDate } from "@/lib/grantha/format";
import { blockingCount, docStatusLabel, docStatusTone } from "@/lib/grantha/selectors";
import type { LitDoc } from "@/lib/grantha/types";

const STATUS_FILTERS = ["All", "Not started", "In draft", "Needs revision", "In review", "Published"];

function statusBucket(doc: LitDoc): string {
  const label = docStatusLabel(doc);
  if (label === "Facts extracted") return "Not started";
  if (label === "Verified" || label === "Signed off") return "In review";
  if (label === "Translated") return "Published";
  return label;
}

const STAGE_BAR = ["bg-neutral", "bg-neutral", "bg-warning", "bg-info", "bg-info", "bg-success", "bg-success", "bg-success"];

function LibraryInner() {
  const router = useRouter();
  const { docs, st, setModel } = useGrantha();
  const [scope, setScope] = useLinkedSelection("model", st.modelId);
  const [status, setStatus] = useState("All");

  const inScope = useMemo(() => (scope === "all" ? docs : docs.filter((d) => d.modelId === scope)), [docs, scope]);
  const rows = status === "All" ? inScope : inScope.filter((d) => statusBucket(d) === status);
  const model = scope && scope !== "all" ? modelById(scope) : null;
  const published = inScope.filter((d) => stageIndex(d.stage) >= 6 && !d.stale).length;
  const needs = inScope.filter((d) => docStatusLabel(d) === "Needs revision").length;
  const findings = inScope.reduce((n, d) => n + d.findings.danger + d.findings.warning + d.findings.caution + d.findings.notice, 0);
  const langsDone = inScope.filter((d) => d.stage === "translated").length;

  const columns: Column<LitDoc>[] = [
    {
      key: "doc",
      header: "Document",
      card: "title",
      value: (d) => `${docType(d.type).name} ${d.id}`,
      render: (d) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-primary">{docType(d.type).name}</span>
          <span className="truncate text-caption tabular text-quaternary">
            {scope === "all" ? `${d.modelId} · ` : ""}
            {d.docNumber} {d.rev}
          </span>
        </span>
      ),
    },
    { key: "status", header: "Status", value: (d) => docStatusLabel(d), render: (d) => <StatusBadge tone={docStatusTone(d)}>{docStatusLabel(d)}</StatusBadge> },
    { key: "pages", header: "Pages", align: "right", hide: "md", value: (d) => d.pages, render: (d) => <span className="tabular">{d.pages}</span> },
    { key: "langs", header: "Languages", hide: "md", value: (d) => d.langs.join(" "), render: (d) => <span className="tabular whitespace-nowrap text-tertiary">{d.langs.join(" · ")}</span> },
    {
      key: "generated",
      header: "Generated",
      value: (d) => d.pctGenerated,
      render: (d) => (
        <span className="flex w-28 items-center gap-2">
          <Meter value={d.pctGenerated} tone={d.pctGenerated === 100 ? "success" : d.pctGenerated ? "info" : "neutral"} />
          <span className="w-9 shrink-0 text-right text-caption tabular text-tertiary">{d.pctGenerated}%</span>
        </span>
      ),
    },
    {
      key: "findings",
      header: "Findings vs today’s record",
      align: "right",
      card: "metric",
      value: (d) => blockingCount(d) * 100 + d.findings.caution + d.findings.notice,
      render: (d) =>
        stageIndex(d.stage) < 2 ? (
          <span className="text-quaternary">Not checked</span>
        ) : (
          <span className="tabular whitespace-nowrap">
            <span className={d.findings.danger ? "text-error" : "text-quaternary"}>{d.findings.danger} D</span>
            <span className="text-quaternary"> · </span>
            <span className={d.findings.warning ? "text-warning" : "text-quaternary"}>{d.findings.warning} W</span>
            <span className="text-quaternary"> · </span>
            <span className="text-tertiary">{d.findings.caution + d.findings.notice} adv</span>
          </span>
        ),
    },
    { key: "trace", header: "Traced", align: "right", hide: "lg", value: (d) => d.traceCoverage, render: (d) => <span className="tabular">{d.traceCoverage ? pct(d.traceCoverage, d.traceCoverage % 1 ? 1 : 0) : "—"}</span> },
    { key: "owner", header: "Author", hide: "lg", value: (d) => personName(d.ownerId), render: (d) => <span className="whitespace-nowrap">{personName(d.ownerId)}</span> },
    { key: "due", header: "Due", align: "right", hide: "lg", value: (d) => d.due, render: (d) => <span className="tabular whitespace-nowrap">{shortDate(d.due)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Literature Set"
        description={model ? `${model.id}, ${model.name}. ${model.status}, supersedes ${model.supersedes}. Ten documents, each reissued when engineering changes anything.` : "Every document for every model in the line."}
        mark={<GMark id="mark-library" size={44} />}
        actions={
          <>
            <Select
              aria-label="Model"
              value={scope ?? "all"}
              onChange={(e) => {
                setScope(e.target.value);
                if (e.target.value !== "all") setModel(e.target.value);
              }}
              className={`${SELECT_CLASS} max-w-[16rem]`}
            >
              <option value="all">All models</option>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} · {m.family}
                </option>
              ))}
            </Select>
            <LinkBtn href="/generate" variant="primary">
              Draft a document
            </LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Published and current" value={`${published}`} hint={`of ${inScope.length} documents`} tone="success" />
            <KpiTile label="Needs revision" value={String(needs)} hint="draft or published text that fails a check" tone={needs ? "error" : "success"} delta={needs ? "open" : "none"} />
            <KpiTile label="Open findings" value={String(findings)} hint="against today’s record" tone={findings ? "warning" : "success"} />
            <KpiTile label="In every market language" value={String(langsDone)} hint="fr-CA and es-MX released" tone="info" />
          </div>

          <Panel title="Where the set stands">
            <StackBar parts={STAGES.map((s, i) => ({ label: s.label, value: inScope.filter((d) => d.stage === s.id).length, className: `${STAGE_BAR[i]} ${i % 2 ? "opacity-70" : ""}` }))} />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4 @7xl:grid-cols-8">
              {STAGES.map((s) => (
                <div key={s.id} className="flex items-baseline justify-between gap-2 text-body-sm">
                  <span className="truncate text-tertiary">{s.label}</span>
                  <span className="tabular text-primary">{inScope.filter((d) => d.stage === s.id).length}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={`Documents · ${rows.length}`} padded={false} className="max-h-[640px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-muted p-3">
                <FilterChips options={STATUS_FILTERS.map((s) => ({ id: s, label: s, count: s === "All" ? inScope.length : inScope.filter((d) => statusBucket(d) === s).length }))} value={status} onChange={setStatus} />
              </div>
              <div className="min-h-0 flex-1">
                <DataTable
                  rows={rows}
                  columns={columns}
                  rowKey={(d) => d.id}
                  onRowClick={(d) => router.push(`/library/${d.id}`)}
                  searchPlaceholder="Search document, number, author"
                  exportName="literature-set"
                  pageSize={40}
                  emptyTitle="No document in this status"
                />
              </div>
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}

export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryInner />
    </Suspense>
  );
}
