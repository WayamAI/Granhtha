"use client";

/**
 * Topic Library: the reusable topics behind the literature set, and where
 * each one is used across models and documents.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GMark, LinkBtn, useQueryParam } from "@/components/grantha/ui";
import { AXIS_TICK, ChartTip, GRID_STROKE } from "@/components/grantha/widgets";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { BarList, KpiTile, Panel, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { docType } from "@/lib/grantha/data";
import { pct } from "@/lib/grantha/format";
import type { LiveTopic } from "@/lib/grantha/selectors";
import { whereUsed } from "@/lib/grantha/topics";

const FILTERS: { id: string; label: string; test: (t: LiveTopic) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "carried", label: "Carried over", test: (t) => t.effective === "carried" },
  { id: "revised", label: "Revised", test: (t) => t.effective === "revised" },
  { id: "new", label: "New", test: (t) => t.effective === "new" },
  { id: "reworded", label: "Reworded, no ECN", test: (t) => Boolean(t.reworded) && !t.restored },
  { id: "safety", label: "Safety", test: (t) => t.type === "Safety" },
];

const DISPOSITION = { carried: { label: "Carried over", tone: "success" }, revised: { label: "Revised", tone: "warning" }, new: { label: "New", tone: "info" } } as const;

function TopicsInner() {
  const { topics, openInspector } = useGrantha();
  const linked = useQueryParam("topic");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (linked) openInspector({ type: "topic", id: linked });
  }, [linked, openInspector]);

  const uses = useMemo(() => new Map(topics.map((t) => [t.id, whereUsed(t)])), [topics]);
  const rows = topics.filter(FILTERS.find((f) => f.id === filter)?.test ?? (() => true));
  const words = topics.reduce((n, t) => n + t.words, 0);
  const carried = topics.filter((t) => t.effective === "carried").reduce((n, t) => n + t.words, 0);
  const shared = topics.filter((t) => new Set(uses.get(t.id)?.map((u) => u.modelId)).size >= 3).length;
  const reworded = topics.filter((t) => t.reworded && !t.restored);

  const byType = (["Safety", "Reference", "Task", "Concept"] as const).map((type) => ({
    type,
    "Carried over": topics.filter((t) => t.type === type && t.effective === "carried").length,
    Revised: topics.filter((t) => t.type === type && t.effective === "revised").length,
    New: topics.filter((t) => t.type === type && t.effective === "new").length,
  }));

  const mostUsed = [...topics]
    .sort((a, b) => (uses.get(b.id)?.length ?? 0) - (uses.get(a.id)?.length ?? 0))
    .slice(0, 8)
    .map((t) => ({ id: t.id, label: `${t.id} · ${t.title}`, value: uses.get(t.id)?.length ?? 0 }));

  const columns: Column<LiveTopic>[] = [
    { key: "id", header: "Topic", card: "title", value: (t) => t.id, render: (t) => <span className="tabular whitespace-nowrap text-primary">{t.id}</span> },
    { key: "title", header: "Title", value: (t) => t.title, render: (t) => <span className="block max-w-[20rem] truncate">{t.title}</span> },
    { key: "doc", header: "Document", hide: "md", value: (t) => docType(t.doc).name, render: (t) => <span className="whitespace-nowrap text-tertiary">{docType(t.doc).name}</span> },
    { key: "type", header: "Type", value: (t) => t.type, render: (t) => t.type },
    {
      key: "disposition",
      header: "Disposition",
      value: (t) => t.effective,
      render: (t) => (
        <span className="flex items-center gap-1.5">
          <StatusBadge tone={DISPOSITION[t.effective].tone}>{DISPOSITION[t.effective].label}</StatusBadge>
          {t.reworded && !t.restored ? <StatusBadge tone="error">No ECN</StatusBadge> : null}
        </span>
      ),
    },
    { key: "from", header: "Reused from", hide: "lg", value: (t) => t.reusedFrom ?? "", render: (t) => <span className="tabular whitespace-nowrap text-tertiary">{t.reusedFrom ?? "—"}</span> },
    { key: "words", header: "Words", align: "right", value: (t) => t.words, render: (t) => <span className="tabular">{t.words}</span> },
    { key: "langs", header: "Languages", hide: "md", value: (t) => t.langs.join(" "), render: (t) => <span className="tabular whitespace-nowrap text-tertiary">{t.langs.join(" · ")}</span> },
    { key: "uses", header: "Used in", align: "right", card: "metric", value: (t) => uses.get(t.id)?.length ?? 0, render: (t) => <span className="tabular text-primary">{uses.get(t.id)?.length ?? 0}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Topic Library"
        description="Documents are assembled from topics. A topic carried over unchanged costs nothing to translate again. Select a topic to see every model and document that uses it."
        mark={<GMark id="mark-topics" size={44} />}
        actions={<LinkBtn href="/reuse">Reuse planner</LinkBtn>}
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Topics" value={String(topics.length)} hint="NTL-6157 literature set, 10 documents" />
            <KpiTile label="Words carried over" value={pct((carried / words) * 100)} hint={`${carried.toLocaleString("en-US")} of ${words.toLocaleString("en-US")}`} tone="success" />
            <KpiTile label="Shared by 3 or more models" value={String(shared)} hint="fix once, every model inherits it" tone="info" />
            <KpiTile label="Reworded, no ECN" value={String(reworded.length)} hint="carry-over text changed for no engineering reason" tone={reworded.length ? "error" : "success"} delta={reworded.length ? "restore" : "none"} />
          </div>

          <SplitRow ratio="1/1.4">
            <Panel title="Most reused topics" action={<span className="text-caption text-quaternary">placements across the line</span>}>
              <BarList rows={mostUsed} onSelect={(id) => openInspector({ type: "topic", id })} />
            </Panel>
            <Panel title="What kind of content is being rewritten?" action={<span className="text-caption text-quaternary">topics by type</span>}>
              <div className="h-[230px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byType} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="type" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-raised)" }} />
                    <Bar dataKey="Carried over" stackId="a" fill="var(--analytics-series-2)" isAnimationActive={false} />
                    <Bar dataKey="Revised" stackId="a" fill="var(--analytics-series-3)" isAnimationActive={false} />
                    <Bar dataKey="New" stackId="a" fill="var(--analytics-series-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-body-sm text-tertiary">Safety topics should almost never change between a model and its successor. A revised safety topic deserves a second look before it reaches translation.</p>
            </Panel>
          </SplitRow>

          <Panel title={`Topics · ${rows.length}`} padded={false} className="max-h-[640px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-muted p-3">
                <FilterChips options={FILTERS.map((f) => ({ id: f.id, label: f.label, count: topics.filter(f.test).length }))} value={filter} onChange={setFilter} />
              </div>
              <div className="min-h-0 flex-1">
                <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} onRowClick={(t) => openInspector({ type: "topic", id: t.id })} searchPlaceholder="Search topic, title, document" exportName="topic-library" pageSize={40} emptyTitle="No topic in this view" />
              </div>
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}

export default function TopicsPage() {
  return (
    <Suspense>
      <TopicsInner />
    </Suspense>
  );
}
