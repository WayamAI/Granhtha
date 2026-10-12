"use client";

/**
 * Change Impact: pick an engineering change and see every document, topic,
 * sentence, callout and language rendering it touches, with the cost of
 * reissue. One action puts all of them in a revision set.
 */

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

import { Btn, Drawer, Field, GMark, LABEL_CLASS, LinkBtn, useLinkedSelection } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { InfoPopover } from "@/components/ui/info-popover";
import { InlineArrow, KpiTile, Panel, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { docById, docType } from "@/lib/grantha/data";
import { RATES, ecnCost } from "@/lib/grantha/ecn";
import { shortDate, usd } from "@/lib/grantha/format";
import { docStatusLabel, docStatusTone, ecnState } from "@/lib/grantha/selectors";
import type { EcnImpact } from "@/lib/grantha/types";

const KIND_TONE: Record<EcnImpact["kind"], "error" | "warning" | "info" | "neutral"> = {
  "Safety message": "error",
  "Illustration callout": "warning",
  Label: "warning",
  Sentence: "info",
  "Table cell": "info",
  "Parts row": "neutral",
};

function ChangeImpactInner() {
  const { ecns, st, docs, findings, openRevisionSet, openInspector } = useGrantha();
  const [selected, setSelected] = useLinkedSelection("ecn", ecns[0].id);
  const [kind, setKind] = useState("all");
  const [docFilter, setDocFilter] = useState<string | null>(null);
  const [impactId, setImpactId] = useState<string | null>(null);

  const ecn = ecns.find((e) => e.id === selected) ?? ecns[0];
  const cost = useMemo(() => ecnCost(ecn), [ecn]);
  const open = ecnState(st, ecn.id) === "Revision set open";
  const inDoc = docFilter ? ecn.impacts.filter((i) => i.docId === docFilter) : ecn.impacts;
  const rows = kind === "all" ? inDoc : inDoc.filter((i) => i.kind === kind);
  const kinds = [...new Set(ecn.impacts.map((i) => i.kind))];
  const impact = ecn.impacts.find((i) => i.id === impactId);
  const docIds = [...new Set(ecn.impacts.map((i) => i.docId))];

  function pick(id: string) {
    setSelected(id);
    setKind("all");
    setDocFilter(null);
  }

  /** A live finding on the same topic that this change explains. */
  const findingFor = (i: EcnImpact) => (i.docId === "NTL-6157-UCG" ? findings.find((f) => f.topicId === i.topicId && f.ruleId === "GRN-TRC-002") : undefined);

  const columns: Column<EcnImpact>[] = [
    {
      key: "doc",
      header: "Document",
      card: "title",
      value: (i) => i.docId,
      render: (i) => (
        <span className="flex min-w-0 flex-col">
          <span className="tabular whitespace-nowrap text-primary">{i.docId}</span>
          <span className="truncate text-caption text-quaternary">{docType(docById(i.docId)?.type ?? "UCG").name}</span>
        </span>
      ),
    },
    { key: "topic", header: "Topic", hide: "md", value: (i) => i.topicId, render: (i) => <span className="tabular whitespace-nowrap">{i.topicId}</span> },
    { key: "kind", header: "Object", value: (i) => i.kind, render: (i) => <StatusBadge tone={KIND_TONE[i.kind]}>{i.kind}</StatusBadge> },
    { key: "text", header: "Text today", value: (i) => i.text, render: (i) => <span className="block max-w-[18rem] truncate text-secondary">{i.text}</span> },
    { key: "action", header: "What must change", value: (i) => i.action, render: (i) => <span className={`block max-w-[20rem] truncate ${i.words ? "text-primary" : "text-quaternary"}`}>{i.action}</span> },
    { key: "langs", header: "Renderings", align: "right", card: "metric", value: (i) => i.langs.length, render: (i) => <span className="tabular whitespace-nowrap text-tertiary">{i.langs.join(" · ")}</span> },
    { key: "words", header: "Words", align: "right", hide: "lg", value: (i) => i.words, render: (i) => <span className="tabular">{i.words}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Change Impact"
        description="An engineering change is only finished when the literature says the same thing. Pick a change to see everything it touches, in every language."
        mark={<GMark id="mark-change-impact" size={44} />}
        info={
          <InfoPopover label="How impact is found">
            <p className="text-body-sm text-secondary">
              Every figure in every document is bound to a fact, and every fact to a record line. When an ECN changes a line, the bindings give the exact sentences, table cells, callouts and parts rows that state the old
              value, and the language renderings of each. Nothing is found by searching text.
            </p>
          </InfoPopover>
        }
        actions={
          open ? (
            <StatusBadge tone="info">Revision set RS-{ecn.id.slice(4)} open</StatusBadge>
          ) : (
            <Btn variant="primary" onClick={() => openRevisionSet(ecn.id)}>
              Open revision set for {ecn.id}
            </Btn>
          )
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ecns.map((e) => {
              const active = e.id === ecn.id;
              const c = ecnCost(e);
              const isOpen = st.revisionSets.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pick(e.id)}
                  className={`flex min-w-0 items-start gap-3 rounded-lg border bg-container p-3.5 text-left outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-active ${
                    active ? "border-active" : "border-muted hover:border-default"
                  }`}
                >
                  <GMark id={e.safetyCritical ? "mark-safety-panel" : "mark-change-impact"} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-body-md tabular font-medium text-primary">{e.id}</span>
                      {e.safetyCritical ? <StatusBadge tone="error">Safety-critical</StatusBadge> : null}
                      <StatusBadge tone={isOpen ? "info" : "warning"}>{isOpen ? "Set open" : `${e.daysWaiting} days`}</StatusBadge>
                    </span>
                    <span className="mt-1 block truncate text-body-sm text-secondary">{e.title}</span>
                    <span className="mt-0.5 block truncate text-caption tabular text-quaternary">
                      {e.modelIds.join(", ")} · {c.docs} documents · {c.objects} objects
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <SplitRow ratio="1/1.4">
            <Panel title={`${ecn.id} · what engineering changed`} action={<span className="text-caption text-quaternary">released {shortDate(ecn.released)}</span>}>
              <p className="text-body-sm text-tertiary">{ecn.origin}</p>
              <ul className="mt-3 flex flex-col">
                {ecn.changes.map((c) => (
                  <li key={c.attribute} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-muted py-2 last:border-b-0">
                    <span className="text-body-md text-primary">{c.attribute}</span>
                    <span className="inline-flex items-center gap-1.5 text-body-md tabular">
                      <span className="text-tertiary line-through">{c.from}</span>
                      <InlineArrow className="text-quaternary" />
                      <span className="text-primary">{c.to}</span>
                      {c.factId ? (
                        <button type="button" onClick={() => openInspector({ type: "fact", id: c.factId! })} className="ml-1 text-caption text-info underline underline-offset-2">
                          {c.factId}
                        </button>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href={ecn.id === "ECN-4471" ? "/records?record=ECN-4471" : `/records?model=${ecn.modelIds[0]}`} className="mt-3 inline-block text-caption text-tertiary underline underline-offset-2 hover:text-primary">
                Open the change notice in source records
              </Link>
            </Panel>
            <Panel title="What it costs to reissue" action={<span className="text-caption text-quaternary">planning estimate</span>}>
              <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4">
                <KpiTile label="Documents" value={String(cost.docs)} hint={`${cost.topics} topics`} />
                <KpiTile label="Objects" value={String(cost.objects)} hint="sentences, cells, callouts" />
                <KpiTile label="Renderings" value={String(cost.renderings)} hint="object × language" />
                <KpiTile label="Reissue cost" value={usd(cost.total)} hint={`${cost.authorHours.toFixed(1)} author hours`} tone="warning" />
              </div>
              <div className="mt-3 flex flex-col">
                {[
                  ["Authoring and sign-off", cost.authoring, `${cost.authorHours.toFixed(1)} h at ${usd(RATES.authorPerHour)} an hour`],
                  ["Translation and review", cost.translation, "changed words, plus review each time a topic is touched in a language"],
                  ["Layout", cost.dtp, `${usd(RATES.dtpPerDocLang)} per document per language`],
                ].map(([label, value, note]) => (
                  <div key={String(label)} className="flex items-baseline justify-between gap-4 border-b border-muted py-1.5 last:border-b-0">
                    <span className="min-w-0">
                      <span className="text-body-sm text-secondary">{label}</span>
                      <span className="ml-2 text-caption text-quaternary">{note}</span>
                    </span>
                    <span className="shrink-0 text-body-md tabular text-primary">{usd(Number(value))}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-body-sm text-tertiary">
                Finding these {cost.objects} objects by reading {cost.docs} documents takes about {cost.manualSearchHours.toFixed(1)} hours and still misses callouts. Here they come from the fact bindings.
              </p>
            </Panel>
          </SplitRow>

          <Panel title="Documents touched" action={docFilter ? <button type="button" onClick={() => setDocFilter(null)} className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Clear document filter</button> : <span className="text-caption text-quaternary">select one to filter the table</span>}>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
              {docIds.map((id) => {
                const doc = docs.find((d) => d.id === id);
                const n = ecn.impacts.filter((i) => i.docId === id);
                const active = docFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDocFilter(active ? null : id)}
                    className={`flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active ${
                      active ? "border-active bg-raised" : "border-muted bg-page hover:border-default"
                    }`}
                  >
                    <span className="truncate text-body-sm text-primary">{doc ? docType(doc.type).name : id}</span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-caption tabular text-quaternary">
                        {n.length} object{n.length === 1 ? "" : "s"} · {n.filter((i) => i.words > 0).length} to change
                      </span>
                      {doc ? <StatusBadge tone={docStatusTone(doc)}>{docStatusLabel(doc)}</StatusBadge> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title={`Every object ${ecn.id} touches · ${rows.length}`} padded={false} className="max-h-[600px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-muted p-3">
                <FilterChips
                  options={[{ id: "all", label: "All", count: inDoc.length }, ...kinds.map((k) => ({ id: k, label: k, count: inDoc.filter((i) => i.kind === k).length }))]}
                  value={kind}
                  onChange={setKind}
                />
              </div>
              <div className="min-h-0 flex-1">
                <DataTable rows={rows} columns={columns} rowKey={(i) => i.id} onRowClick={(i) => setImpactId(i.id)} isRowSelected={(i) => i.id === impactId} searchPlaceholder="Search document, topic, text" exportName={`impact-${ecn.id}`} pageSize={30} emptyTitle="No object of this kind" />
              </div>
            </div>
          </Panel>
        </div>
      </PageBody>

      {impact ? (
        <Drawer
          eyebrow={`${ecn.id} · ${impact.kind}`}
          title={impact.where}
          onClose={() => setImpactId(null)}
          footer={
            <>
              <LinkBtn href={`/library/${impact.docId}`} variant="primary">
                Open {impact.docId}
              </LinkBtn>
              {findingFor(impact) ? <LinkBtn href={`/findings?f=${findingFor(impact)!.id}`}>Open finding {findingFor(impact)!.id}</LinkBtn> : null}
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-muted bg-raised px-3 py-2">
              <p className={LABEL_CLASS}>Text today</p>
              <p className="mt-1 text-body-md text-secondary">{impact.text}</p>
            </div>
            <div className={`rounded-md border px-3 py-2 ${impact.words ? "border-warning-stroke bg-warning-surface" : "border-success-stroke bg-success-surface"}`}>
              <p className={LABEL_CLASS}>{impact.words ? "What must change" : "No change needed"}</p>
              <p className="mt-1 text-body-md text-secondary">{impact.action}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Document">
                <span className="tabular">{impact.docId}</span>
              </Field>
              <Field label="Topic">
                <span className="tabular">{impact.topicId}</span>
              </Field>
              <Field label="Language renderings">{impact.langs.join(", ")}</Field>
              <Field label="Words to retranslate">
                <span className="tabular">{impact.words * (impact.langs.length - 1)}</span>
              </Field>
            </div>
            <p className="text-caption text-quaternary">
              The change is proposed from the fact binding. The author of {impact.docId} reviews each object in the revision set and signs the reissued document.
            </p>
          </div>
        </Drawer>
      ) : null}
    </>
  );
}

export default function ChangeImpactPage() {
  return (
    <Suspense>
      <ChangeImpactInner />
    </Suspense>
  );
}
