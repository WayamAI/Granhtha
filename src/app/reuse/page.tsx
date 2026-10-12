"use client";

/**
 * Reuse & Delta: the carry-over plan against the predecessor model. What is
 * reused as is, what an ECN forces to change, and what was reworded for no
 * engineering reason and now costs money in every language.
 */

import { useState } from "react";

import { Btn, GMark, LABEL_CLASS, LinkBtn, StackBar } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { InfoPopover } from "@/components/ui/info-popover";
import { KpiTile, Panel, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { DOC_TYPES, docType } from "@/lib/grantha/data";
import { pct, usd } from "@/lib/grantha/format";
import { reuseSummary, rewordingTax, type LiveTopic } from "@/lib/grantha/selectors";
import type { DocTypeId } from "@/lib/grantha/types";

const DISPOSITION = { carried: { label: "Carried over", tone: "success" }, revised: { label: "Revised", tone: "warning" }, new: { label: "New", tone: "info" } } as const;

export default function ReusePage() {
  const { st, topics, restoreTopic, openInspector } = useGrantha();
  const [doc, setDoc] = useState<DocTypeId>("UCG");
  const [filter, setFilter] = useState("all");

  const summary = reuseSummary(st, doc);
  const type = docType(doc);
  const rows = filter === "all" ? summary.topics : filter === "reworded" ? summary.topics.filter((t) => t.reworded && !t.restored) : summary.topics.filter((t) => t.effective === filter);
  const allReworded = topics.filter((t) => t.reworded && !t.restored);
  const marketLangs = (t: LiveTopic) => Math.max(1, docType(t.doc).langs.length - 1);
  const taxTotal = allReworded.reduce((n, t) => n + rewordingTax(t.words) * marketLangs(t), 0);

  const columns: Column<LiveTopic>[] = [
    { key: "id", header: "Topic", card: "title", value: (t) => t.id, render: (t) => <span className="tabular whitespace-nowrap text-primary">{t.id}</span> },
    { key: "title", header: "Title", value: (t) => t.title, render: (t) => <span className="block max-w-[18rem] truncate">{t.title}</span> },
    { key: "type", header: "Type", hide: "md", value: (t) => t.type, render: (t) => t.type },
    {
      key: "disposition",
      header: "Disposition",
      value: (t) => t.effective,
      render: (t) => (
        <span className="flex items-center gap-1.5">
          <StatusBadge tone={DISPOSITION[t.effective].tone}>{DISPOSITION[t.effective].label}</StatusBadge>
          {t.restored ? <StatusBadge tone="neutral">Restored</StatusBadge> : null}
        </span>
      ),
    },
    { key: "from", header: "Reused from", hide: "lg", value: (t) => t.reusedFrom ?? "", render: (t) => <span className="tabular whitespace-nowrap text-tertiary">{t.reusedFrom ?? "New for this model"}</span> },
    { key: "words", header: "Words", align: "right", card: "metric", value: (t) => t.words, render: (t) => <span className="tabular">{t.words}</span> },
    { key: "langs", header: "Languages", align: "right", hide: "md", value: (t) => t.langs.length, render: (t) => <span className="tabular">{t.langs.length}</span> },
    {
      key: "reason",
      header: "Why it changed",
      value: (t) => t.reason ?? "",
      render: (t) =>
        t.reworded && !t.restored ? (
          <span className="flex items-center gap-2">
            <span className="block max-w-[14rem] truncate text-error">No ECN. {t.reason}</span>
            <Btn
              className="h-7"
              onClick={(e) => {
                e.stopPropagation();
                restoreTopic(t.id);
              }}
            >
              Restore
            </Btn>
          </span>
        ) : (
          <span className="block max-w-[20rem] truncate text-tertiary">{t.restored ? "Predecessor wording restored" : (t.reason ?? (t.effective === "new" ? "No predecessor" : "Unchanged"))}</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reuse & Delta"
        description="NTL-6157 against its predecessor NTL-8127, topic by topic. Carry over what did not change. Revise only what an engineering change requires."
        mark={<GMark id="mark-reuse" size={44} />}
        info={
          <InfoPopover label="Why rewording is a defect">
            <p className="text-body-sm text-secondary">
              A carry-over topic already has an exact match in the translation memory for every language. Reword it and each segment falls to a fuzzy match, which is paid again and reviewed again, once per language, every
              time the document is reissued. If no ECN required the change, the rewrite bought nothing.
            </p>
          </InfoPopover>
        }
        actions={
          <>
            <LinkBtn href="/topics">Topic library</LinkBtn>
            <LinkBtn href="/business-case">Business case</LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 @5xl:grid-cols-5">
            {DOC_TYPES.map((d) => {
              const s = reuseSummary(st, d.id);
              const active = d.id === doc;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setDoc(d.id);
                    setFilter("all");
                  }}
                  className={`flex min-w-0 flex-col gap-1.5 rounded-lg border bg-container px-3 py-2.5 text-left outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-active ${
                    active ? "border-active" : "border-muted hover:border-default"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-body-sm text-primary">{d.name}</span>
                    <span className="shrink-0 text-caption tabular text-quaternary">{pct(s.carriedPct)}</span>
                  </span>
                  <StackBar
                    parts={[
                      { label: "Carried over", value: s.carriedWords, className: "bg-success" },
                      { label: "Revised", value: s.revisedWords, className: "bg-warning" },
                      { label: "New", value: s.newWords, className: "bg-info" },
                    ]}
                  />
                  <span className="truncate text-caption tabular text-quaternary">
                    {s.carried} carried · {s.revised} revised · {s.fresh} new
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label={`${type.name} topics`} value={String(summary.topics.length)} hint={`${summary.words.toLocaleString("en-US")} words, ${type.langs.length} language${type.langs.length === 1 ? "" : "s"}`} />
            <KpiTile label="Carried over" value={pct(summary.carriedPct)} hint={`${summary.carriedWords.toLocaleString("en-US")} words reused as is`} tone="success" mark={<GMark id="mark-kpi-reuse" />} />
            <KpiTile label="Revised for an ECN" value={String(summary.revised - summary.reworded.length)} hint="change required by engineering" tone="info" />
            <KpiTile label="Reworded, no ECN" value={String(summary.reworded.length)} hint="exact matches lost in each language" tone={summary.reworded.length ? "error" : "success"} delta={summary.reworded.length ? "restore" : "none"} />
          </div>

          <SplitRow ratio="1.6/1">
            <Panel title={`${type.name} · topics against NTL-8127 · ${rows.length}`} padded={false} className="max-h-[620px]">
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 border-b border-muted p-3">
                  <FilterChips
                    options={[
                      { id: "all", label: "All", count: summary.topics.length },
                      { id: "carried", label: "Carried over", count: summary.carried },
                      { id: "revised", label: "Revised", count: summary.revised },
                      { id: "new", label: "New", count: summary.fresh },
                      { id: "reworded", label: "Reworded, no ECN", count: summary.reworded.length },
                    ]}
                    value={filter}
                    onChange={setFilter}
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} onRowClick={(t) => openInspector({ type: "topic", id: t.id })} searchPlaceholder="Search topic or title" exportName={`reuse-${doc}`} pageSize={30} emptyTitle="No topic in this view" />
                </div>
              </div>
            </Panel>

            <Panel title="Rewording tax" action={<span className="text-caption text-quaternary">whole literature set</span>}>
              <div className="flex items-center gap-3">
                <GMark id="mark-rewording-tax" size={36} />
                <div className="min-w-0">
                  <p className="font-display text-display-xl tabular text-primary">{usd(taxTotal)}</p>
                  <p className="text-caption text-quaternary">per reissue, across market languages</p>
                </div>
              </div>
              {allReworded.length ? (
                <ul className="mt-3 flex flex-col">
                  {allReworded.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 border-b border-muted py-2 last:border-b-0">
                      <button type="button" onClick={() => openInspector({ type: "topic", id: t.id })} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-body-sm text-primary">
                          <span className="tabular">{t.id}</span> {t.title}
                        </span>
                        <span className="block truncate text-caption tabular text-quaternary">
                          {t.words} words · {usd(rewordingTax(t.words))} × {marketLangs(t)} language{marketLangs(t) === 1 ? "" : "s"}
                        </span>
                      </button>
                      <Btn className="h-7" onClick={() => restoreTopic(t.id)}>
                        Restore
                      </Btn>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-body-sm text-success">No carry-over topic is reworded without an engineering reason.</p>
              )}
              <div className="mt-3 rounded-md border border-muted bg-raised px-3 py-2">
                <p className={LABEL_CLASS}>How the figure is built</p>
                <p className="mt-1 text-body-sm text-tertiary">
                  A reworded topic drops from exact to fuzzy matches: 85% of its words are paid at the fuzzy rate and 5% as new, and the topic goes back through review and layout in each language. An untouched topic is paid
                  at the exact-match rate and skips review.
                </p>
              </div>
              <p className="mt-2 text-caption text-quaternary">Restoring all three Use & Care topics also closes finding F-11. The author decides which wording stands.</p>
            </Panel>
          </SplitRow>
        </div>
      </PageBody>
    </>
  );
}
