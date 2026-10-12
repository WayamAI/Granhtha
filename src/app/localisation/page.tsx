"use client";

/**
 * Localise: translation-memory leverage and cost per language, the topics
 * with no rendering yet, and the terminology-locked translation queue.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Btn, GMark, LABEL_CLASS, LinkBtn, Meter, SELECT_CLASS } from "@/components/grantha/ui";
import { AXIS_TICK, ChartTip, GRID_STROKE } from "@/components/grantha/widgets";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, Select, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useGrantha } from "@/lib/grantha/context";
import { DOC_TYPES, LANG_LABEL, docType } from "@/lib/grantha/data";
import { RATES } from "@/lib/grantha/ecn";
import { pct, usd } from "@/lib/grantha/format";
import { TERMS } from "@/lib/grantha/misc";
import { leverage, rewordingTax, type Leverage } from "@/lib/grantha/selectors";
import { MISSING_FR, topicById } from "@/lib/grantha/topics";
import type { DocTypeId, Lang } from "@/lib/grantha/types";

const THRESHOLD = 75;
const MARKET: Lang[] = ["fr-CA", "es-MX"];
const MT_STEPS = ["Queued", "Machine translated", "In post-edit", "Released"];

interface QueueItem {
  id: string;
  model: string;
  topic: string;
  title: string;
  lang: Lang;
  words: number;
  locked: number;
  reviewer: string;
  step: number;
}

const SEED_QUEUE: QueueItem[] = [
  { id: "MT-0412", model: "NFL-4420", topic: "T-UC-040", title: "Control Panel and Features", lang: "fr-CA", words: 284, locked: 6, reviewer: "Camille Fortin", step: 2 },
  { id: "MT-0413", model: "NDW-3380", topic: "T-IN-050", title: "Water Supply Requirements", lang: "es-MX", words: 146, locked: 3, reviewer: "Lucía Barrera", step: 1 },
  { id: "MT-0414", model: "NRF-2865", topic: "T-UC-020", title: "Important Safety Instructions", lang: "fr-CA", words: 342, locked: 4, reviewer: "Camille Fortin", step: 2 },
  { id: "MT-0415", model: "NDG-7245", topic: "T-IN-060", title: "Exhaust Requirements", lang: "es-MX", words: 228, locked: 5, reviewer: "Lucía Barrera", step: 0 },
  { id: "MT-0416", model: "NDG-7245", topic: "T-IN-060", title: "Exhaust Requirements", lang: "fr-CA", words: 228, locked: 5, reviewer: "Camille Fortin", step: 0 },
];

interface LevRow extends Leverage {
  key: string;
  doc: DocTypeId;
}

export default function LocalisationPage() {
  const toast = useToast();
  const { st, topics, queueMt, restoreTopic, log } = useGrantha();
  const [scope, setScope] = useState<DocTypeId | "all">("UCG");
  const [advanced, setAdvanced] = useState<Record<string, number>>({});

  const doc = scope === "all" ? undefined : scope;
  const lev = useMemo(() => MARKET.map((l) => leverage(st, l, doc)), [st, doc]);
  const chart = lev.map((l) => ({ lang: l.lang, "Exact match": l.exact, "Fuzzy match": l.fuzzy, "New words": l.fresh }));
  const missing = MISSING_FR.filter((t) => !st.mtQueued.includes(t));
  const reworded = topics.filter((t) => t.reworded && !t.restored && (doc ? t.doc === doc : true));
  const taxPerLang = reworded.reduce((n, t) => n + rewordingTax(t.words), 0);
  const lockedTerms = TERMS.filter((t) => t.locked).length;

  const levRows: LevRow[] = useMemo(
    () => DOC_TYPES.flatMap((d) => d.langs.filter((l) => l !== "en-US").map((l) => ({ ...leverage(st, l, d.id), key: `${d.id}-${l}`, doc: d.id }))),
    [st],
  );

  const queue: QueueItem[] = [
    ...st.mtQueued.map((t, i) => ({ id: `MT-04${17 + i}`, model: "NTL-6157", topic: t, title: topicById(t)?.title ?? t, lang: "fr-CA" as Lang, words: topicById(t)?.words ?? 0, locked: 3 + i, reviewer: "Camille Fortin", step: 0 })),
    ...SEED_QUEUE,
  ].map((q) => ({ ...q, step: Math.min(3, q.step + (advanced[q.id] ?? 0)) }));

  const columns: Column<LevRow>[] = [
    { key: "doc", header: "Document", card: "title", value: (r) => docType(r.doc).name, render: (r) => <span className="whitespace-nowrap text-primary">{docType(r.doc).name}</span> },
    { key: "lang", header: "Language", value: (r) => r.lang, render: (r) => <span className="tabular">{r.lang}</span> },
    { key: "exact", header: "Exact", align: "right", hide: "md", value: (r) => r.exact, render: (r) => <span className="tabular">{r.exact.toLocaleString("en-US")}</span> },
    { key: "fuzzy", header: "Fuzzy", align: "right", hide: "md", value: (r) => r.fuzzy, render: (r) => <span className="tabular">{r.fuzzy.toLocaleString("en-US")}</span> },
    { key: "new", header: "New", align: "right", hide: "md", value: (r) => r.fresh, render: (r) => <span className="tabular">{r.fresh.toLocaleString("en-US")}</span> },
    {
      key: "pct",
      header: "Exact-match leverage",
      value: (r) => r.pct,
      render: (r) => (
        <span className="flex w-36 items-center gap-2">
          <Meter value={r.pct} tone={r.pct >= THRESHOLD ? "success" : "warning"} />
          <span className={`w-10 shrink-0 text-right tabular ${r.pct >= THRESHOLD ? "text-secondary" : "text-warning"}`}>{pct(r.pct)}</span>
        </span>
      ),
    },
    { key: "cost", header: "Cost this issue", align: "right", card: "metric", value: (r) => r.cost, render: (r) => <span className="tabular text-primary">{usd(r.cost)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Localise"
        description="What each market language costs for the NTL-6157 literature set, how much of it the translation memory already holds, and what is still missing."
        mark={<GMark id="mark-localisation" size={44} />}
        actions={
          <>
            <Select aria-label="Document scope" value={scope} onChange={(e) => setScope(e.target.value as DocTypeId | "all")} className={`${SELECT_CLASS} max-w-[15rem]`}>
              <option value="all">Whole literature set</option>
              {DOC_TYPES.filter((d) => d.langs.length > 1).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <LinkBtn href="/terminology">Glossary</LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 @5xl:grid-cols-5">
            {lev.map((l) => (
              <KpiTile key={l.lang} label={`${l.lang} exact-match leverage`} value={pct(l.pct)} hint={`threshold ${THRESHOLD}%`} tone={l.pct >= THRESHOLD ? "success" : "warning"} delta={l.pct >= THRESHOLD ? "above" : "below"} mark={<GMark id="mark-localisation" />} />
            ))}
            <KpiTile label="Translation cost, this issue" value={usd(lev.reduce((n, l) => n + l.cost, 0))} hint={lev.map((l) => `${l.lang} ${usd(l.cost)}`).join(" · ")} />
            <KpiTile label="Topics with no fr-CA rendering" value={String(missing.length)} hint={missing.length ? "blocks release in Canada" : "all queued or rendered"} tone={missing.length ? "error" : "success"} delta={missing.length ? "queue them" : "clear"} />
            <KpiTile label="Rewording tax" value={usd(taxPerLang * MARKET.length)} hint={`${reworded.length} topic${reworded.length === 1 ? "" : "s"}, per reissue`} tone={reworded.length ? "error" : "success"} mark={<GMark id="mark-rewording-tax" />} />
          </div>

          <SplitRow ratio="1.4/1">
            <Panel title="How much of each language is already translated?" action={<span className="text-caption text-quaternary">words, {scope === "all" ? "whole set" : docType(scope).name}</span>}>
              <div className="h-[170px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 0 }} barCategoryGap={18}>
                    <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis type="category" interval={0} dataKey="lang" tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ChartTip format={(v) => `${v.toLocaleString("en-US")} words`} />} cursor={{ fill: "var(--surface-raised)" }} />
                    <Bar dataKey="Exact match" stackId="a" fill="var(--analytics-series-2)" isAnimationActive={false} />
                    <Bar dataKey="Fuzzy match" stackId="a" fill="var(--analytics-series-3)" isAnimationActive={false} />
                    <Bar dataKey="New words" stackId="a" fill="var(--analytics-series-1)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3 border-t border-muted pt-3 sm:grid-cols-2">
                {lev.map((l) => (
                  <div key={l.lang} className="min-w-0">
                    <p className={LABEL_CLASS}>{LANG_LABEL[l.lang]}</p>
                    <dl className="mt-1 flex flex-col gap-0.5 text-body-sm">
                      {[
                        ["Exact match", l.exact, RATES.exactWord, "bg-success"],
                        ["Fuzzy match", l.fuzzy, RATES.fuzzyWord, "bg-warning"],
                        ["New words", l.fresh, RATES.newWord, "bg-info"],
                      ].map(([label, words, rate, dot]) => (
                        <div key={String(label)} className="flex items-baseline justify-between gap-3">
                          <dt className="flex items-center gap-1.5 text-tertiary">
                            <span className={`size-2 rounded-full ${dot}`} />
                            {label}
                          </dt>
                          <dd className="tabular text-secondary">
                            {Number(words).toLocaleString("en-US")} × {usd(Number(rate), { cents: true })}
                          </dd>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-tertiary">Review and layout, {l.touched} touched topics</dt>
                        <dd className="tabular text-secondary">{usd(l.touched * RATES.touchPerTopicLang)}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="The rewording tax" action={<Link href="/reuse" className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Reuse planner</Link>}>
              <p className="text-body-sm text-secondary">
                Rewording a carry-over topic turns its exact matches into fuzzy ones. The cost is small once and repeats in each language at every reissue.
              </p>
              {reworded.length ? (
                <ul className="mt-2 flex flex-col">
                  {reworded.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 border-b border-muted py-2 last:border-b-0">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm text-primary">
                          <span className="tabular">{t.id}</span> {t.title}
                        </span>
                        <span className="block truncate text-caption text-quaternary">{t.reason}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-body-md tabular text-error">{usd(rewordingTax(t.words))}</span>
                        <span className="block text-caption text-quaternary">per language</span>
                      </span>
                      <Btn className="h-7" onClick={() => restoreTopic(t.id)}>
                        Restore
                      </Btn>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-md border border-success-stroke bg-success-surface px-3 py-2 text-body-sm text-success">No unnecessary rewrite in this scope. Carry-over text matches the translation memory exactly.</p>
              )}
            </Panel>
          </SplitRow>

          <SplitRow ratio="1/1.4">
            <Panel title={`Topics with no rendering · ${missing.length}`} action={missing.length ? <Btn variant="primary" className="h-7" onClick={() => queueMt(missing)}>Queue all {missing.length}</Btn> : undefined}>
              {MISSING_FR.map((id) => {
                const t = topicById(id);
                const queued = st.mtQueued.includes(id);
                return (
                  <div key={id} className="flex items-center gap-3 border-b border-muted py-2.5 last:border-b-0">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm text-primary">
                        <span className="tabular">{id}</span> {t?.title}
                      </span>
                      <span className="block text-caption tabular text-quaternary">
                        fr-CA · {t?.words} words · new for NTL-6157
                      </span>
                    </span>
                    {queued ? (
                      <StatusBadge tone="info">Queued</StatusBadge>
                    ) : (
                      <Btn className="h-7" onClick={() => queueMt([id])}>
                        Queue
                      </Btn>
                    )}
                  </div>
                );
              })}
              <p className="mt-2 text-caption text-quaternary">
                Queued topics go to machine translation with {lockedTerms} glossary terms locked, then to a human post-editor. Queueing all three closes finding F-07. The fr-CA reviewer releases the text.
              </p>
            </Panel>

            <Panel title={`Terminology-locked translation queue · ${queue.length}`} action={<GMark id="mark-mt-queue" size={24} />}>
              <ul className="flex flex-col">
                {queue.map((q) => (
                  <li key={q.id} className="flex flex-wrap items-center gap-3 border-b border-muted py-2.5 last:border-b-0">
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block truncate text-body-sm text-primary">
                        <span className="tabular">{q.topic}</span> {q.title}
                      </span>
                      <span className="block truncate text-caption tabular text-quaternary">
                        {q.id} · {q.model} · {q.lang} · {q.words} words · {q.locked} locked terms · {q.reviewer}
                      </span>
                    </span>
                    <StatusBadge tone={q.step === 3 ? "success" : q.step === 0 ? "neutral" : "info"}>{MT_STEPS[q.step]}</StatusBadge>
                    <Btn
                      className="h-7"
                      disabled={q.step === 3}
                      onClick={() => {
                        setAdvanced((a) => ({ ...a, [q.id]: (a[q.id] ?? 0) + 1 }));
                        const next = MT_STEPS[q.step + 1];
                        log(q.step >= 1 ? q.reviewer : "Translation engine", q.step >= 1 ? "human" : "agent", next, `${q.id} · ${q.topic}`, `${q.lang}, ${q.words} words, ${q.locked} locked terms unchanged.`, "/localisation");
                        toast(`${q.id}: ${next}`, { detail: q.step === 2 ? `${q.reviewer} released the ${q.lang} text.` : `${q.locked} locked glossary terms were left untouched.` });
                      }}
                    >
                      {q.step === 0 ? "Run translation" : q.step === 1 ? "Send to post-edit" : q.step === 2 ? "Release" : "Released"}
                    </Btn>
                  </li>
                ))}
              </ul>
            </Panel>
          </SplitRow>

          <Panel title={`Leverage by document and language · ${levRows.length}`} padded={false} className="max-h-[560px]">
            <div className="min-h-0 flex-1">
              <DataTable
                rows={levRows}
                columns={columns}
                rowKey={(r) => r.key}
                onRowClick={(r) => setScope(r.doc)}
                isRowSelected={(r) => r.doc === scope}
                searchPlaceholder="Search document or language"
                exportName="tm-leverage"
                pageSize={30}
              />
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}
