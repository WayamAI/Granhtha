"use client";

/**
 * Terminology: the brand glossary. One approved term per thing, the variants
 * that are forbidden, the locked target terms, and where drafts break it.
 */

import { Lock } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

import { Btn, Drawer, Field, GMark, LABEL_CLASS, LinkBtn, useLinkedSelection } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { DOCS, seed } from "@/lib/grantha/data";
import { TERMS } from "@/lib/grantha/misc";
import { blockSegs } from "@/lib/grantha/selectors";
import type { Term } from "@/lib/grantha/types";

const DRAFTS = DOCS.filter((d) => d.stage === "drafted" && !d.live);

function TerminologyInner() {
  const { st, sections, findings, fixTerm } = useGrantha();
  const [selected, setSelected] = useLinkedSelection("term");
  const [filter, setFilter] = useState("all");

  /** Live count for the term the Use & Care Guide breaks; others clear when replaced. */
  const liveOccurrences = useMemo(() => {
    const places: { section: string; text: string }[] = [];
    for (const section of sections) for (const block of section.blocks) for (const seg of blockSegs(block)) if (seg.findingId === "F-10" && seg.kind === "finding") places.push({ section: section.title, text: seg.text });
    return places;
  }, [sections]);

  const occ = (t: Term) => (t.findingId ? liveOccurrences.length : st.termsFixed.includes(t.id) ? 0 : t.occurrences);
  const rows = TERMS.filter((t) => (filter === "all" ? true : filter === "broken" ? occ(t) > 0 : filter === "locked" ? t.locked : t.domain === filter));
  const term = TERMS.find((t) => t.id === selected);
  const total = TERMS.reduce((n, t) => n + occ(t), 0);
  const worst = [...TERMS].sort((a, b) => occ(b) - occ(a))[0];
  const f10 = findings.find((f) => f.id === "F-10");

  const columns: Column<Term>[] = [
    {
      key: "approved",
      header: "Approved term",
      card: "title",
      value: (t) => t.approved,
      render: (t) => (
        <span className="inline-flex items-center gap-1.5 text-primary">
          {t.approved}
          {t.locked ? <Lock size={11} strokeWidth={1.75} aria-label="Locked for translation" className="text-quaternary" /> : null}
        </span>
      ),
    },
    { key: "forbidden", header: "Forbidden variants", value: (t) => t.forbidden.join(", "), render: (t) => <span className="text-tertiary line-through decoration-error">{t.forbidden.join(", ")}</span> },
    { key: "fr", header: "fr-CA", hide: "md", value: (t) => t.frCA, render: (t) => t.frCA },
    { key: "es", header: "es-MX", hide: "md", value: (t) => t.esMX, render: (t) => t.esMX },
    { key: "domain", header: "Domain", hide: "lg", value: (t) => t.domain, render: (t) => <span className="text-tertiary">{t.domain}</span> },
    { key: "id", header: "Entry", hide: "lg", value: (t) => t.id, render: (t) => <span className="tabular text-tertiary">{t.id}</span> },
    { key: "occ", header: "In open drafts", align: "right", card: "metric", value: (t) => occ(t), render: (t) => <span className={`tabular ${occ(t) ? "text-warning" : "text-quaternary"}`}>{occ(t)}</span> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (t) => (
        <Btn
          className="h-7"
          disabled={occ(t) === 0 || (t.findingId ? f10?.state.status === "applying" : false)}
          onClick={(e) => {
            e.stopPropagation();
            fixTerm(t.id);
          }}
        >
          {occ(t) ? "Replace all" : "Clean"}
        </Btn>
      ),
    },
  ];

  const places = term ? (term.findingId ? liveOccurrences.map((p) => ({ where: `NTL-6157-UCG · ${p.section}`, text: p.text })) : Array.from({ length: occ(term) }, (_, i) => {
    const doc = DRAFTS[(seed(term.id) + i * 5) % DRAFTS.length];
    return { where: `${doc.id} · section ${1 + ((seed(term.id) >>> i) % 6)}`, text: term.forbidden[i % term.forbidden.length] };
  })) : [];

  return (
    <>
      <PageHeader
        title="Terminology"
        description="The brand glossary. The same part carries the same name in every document and every language, and locked terms pass through machine translation untouched."
        mark={<GMark id="mark-terminology" size={44} />}
        actions={
          <>
            <LinkBtn href="/rules?rule=GRN-TRM-001">Terminology rules</LinkBtn>
            <LinkBtn href="/localisation">Localise</LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Glossary entries" value={String(TERMS.length)} hint="glossary NF-GL, 3 languages" />
            <KpiTile label="Locked for translation" value={String(TERMS.filter((t) => t.locked).length)} hint="target term fixed, not re-translated" tone="info" />
            <KpiTile label="Forbidden variants in drafts" value={String(total)} hint="occurrences across open drafts" tone={total ? "warning" : "success"} delta={total ? "replace" : "clean"} />
            <KpiTile label="Most broken" value={occ(worst) ? String(occ(worst)) : "0"} hint={occ(worst) ? `“${worst.approved}”` : "no term broken"} tone={occ(worst) ? "warning" : "success"} />
          </div>

          <Panel title={`Glossary · ${rows.length}`} padded={false} className="max-h-[640px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-muted p-3">
                <FilterChips
                  options={[
                    { id: "all", label: "All", count: TERMS.length },
                    { id: "broken", label: "Broken in drafts", count: TERMS.filter((t) => occ(t) > 0).length },
                    { id: "locked", label: "Locked", count: TERMS.filter((t) => t.locked).length },
                    ...["Laundry", "Kitchen", "Refrigeration", "Connected"].map((d) => ({ id: d, label: d, count: TERMS.filter((t) => t.domain === d).length })),
                  ]}
                  value={filter}
                  onChange={setFilter}
                />
              </div>
              <div className="min-h-0 flex-1">
                <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} onRowClick={(t) => setSelected(t.id)} isRowSelected={(t) => t.id === selected} searchPlaceholder="Search term, variant, translation" exportName="glossary" pageSize={40} emptyTitle="No entry in this view" />
              </div>
            </div>
          </Panel>
        </div>
      </PageBody>

      {term ? (
        <Drawer
          eyebrow={`Glossary entry · ${term.id}`}
          title={term.approved}
          onClose={() => setSelected(null)}
          footer={
            <>
              <Btn variant="primary" disabled={occ(term) === 0} onClick={() => fixTerm(term.id)}>
                {occ(term) ? `Replace all ${occ(term)}` : "No occurrence to replace"}
              </Btn>
              {term.findingId ? <LinkBtn href={`/findings?f=${term.findingId}`}>Open finding {term.findingId}</LinkBtn> : null}
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-secondary">{term.definition}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="fr-CA">{term.frCA}</Field>
              <Field label="es-MX">{term.esMX}</Field>
              <Field label="Domain">{term.domain}</Field>
              <Field label="Machine translation">{term.locked ? <StatusBadge tone="info">Locked</StatusBadge> : <StatusBadge tone="neutral">Free</StatusBadge>}</Field>
            </div>
            <div>
              <p className={`${LABEL_CLASS} mb-1.5`}>Forbidden variants</p>
              <div className="flex flex-wrap gap-1.5">
                {term.forbidden.map((v) => (
                  <span key={v} className="rounded-full border border-error-stroke bg-error-surface px-2.5 py-0.5 text-caption text-error">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className={`${LABEL_CLASS} mb-1.5`}>Occurrences in open drafts · {places.length}</p>
              {places.length ? (
                <ul className="flex flex-col gap-1">
                  {places.map((p, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 rounded-md bg-raised px-3 py-1.5 text-body-sm">
                      <span className="min-w-0 truncate tabular text-tertiary">{p.where}</span>
                      <span className="shrink-0 text-warning">{p.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-success">No forbidden variant in any open draft.</p>
              )}
            </div>
            <p className="text-caption text-quaternary">
              Enforced by{" "}
              <Link href="/rules?rule=GRN-TRM-001" className="underline underline-offset-2 hover:text-primary">
                GRN-TRM-001
              </Link>
              . Replacement is a find-and-replace on exact variants, then the rule is re-run.
            </p>
          </div>
        </Drawer>
      ) : null}
    </>
  );
}

export default function TerminologyPage() {
  return (
    <Suspense>
      <TerminologyInner />
    </Suspense>
  );
}
