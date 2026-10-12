"use client";

/**
 * One document: its text or structure, the findings against today's record,
 * its language renderings and its path to sign-off.
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { FindingStateBadge } from "@/components/grantha/finding-actions";
import { DocumentLegend, ManualDocument } from "@/components/grantha/manual-document";
import { Btn, Card, Field, GMark, LABEL_CLASS, LinkBtn, Meter, SeverityBadge } from "@/components/grantha/ui";
import { VerdictBanner } from "@/components/grantha/widgets";
import { PageBody } from "@/components/layout/page-header";
import { EmptyState, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useGrantha } from "@/lib/grantha/context";
import { LANG_LABEL, docType, modelById, personName, stageIndex } from "@/lib/grantha/data";
import { ecnById } from "@/lib/grantha/ecn";
import { pct, shortDate } from "@/lib/grantha/format";
import { docStatusLabel, docStatusTone, isBlocked } from "@/lib/grantha/selectors";
import { stubFindings } from "@/lib/grantha/stubs";
import { topicsForDoc } from "@/lib/grantha/topics";
import type { LitDoc } from "@/lib/grantha/types";

function langState(doc: LitDoc, lang: string): { label: string; tone: "success" | "info" | "warning" | "neutral" } {
  if (lang === "en-US") return stageIndex(doc.stage) >= 6 ? { label: "Source, released", tone: "success" } : { label: "Source, in work", tone: "info" };
  if (doc.stage === "translated" && !doc.stale) return { label: "Released", tone: "success" };
  if (doc.stage === "published" || doc.stale) return { label: doc.stale ? "Stale, follows source" : "In translation", tone: "warning" };
  return { label: "Waits on source sign-off", tone: "neutral" };
}

export default function DocumentPage() {
  const params = useParams<{ docId: string }>();
  const toast = useToast();
  const { docs, sections, findings, openInspector, openRevisionSet, st, log } = useGrantha();
  const doc = docs.find((d) => d.id === params.docId);

  if (!doc) {
    return (
      <PageBody>
        <EmptyState title={`No document ${params.docId}`} detail="Check the id, or open the literature set." mark={<GMark id="mark-empty" size={64} />} />
      </PageBody>
    );
  }

  const type = docType(doc.type);
  const model = modelById(doc.modelId);
  const ecn = doc.staleEcn ? ecnById(doc.staleEcn) : undefined;
  const stubs = doc.live ? [] : stubFindings(doc);
  const topics = topicsForDoc(doc.type);
  const liveOpen = findings.filter((f) => f.active);
  const started = stageIndex(doc.stage) >= 2;

  return (
    <>
      <div className="shrink-0 border-b border-muted px-4 py-4 sm:px-5">
        <Link href={`/library?model=${doc.modelId}`} className="inline-flex items-center gap-1.5 text-caption text-tertiary transition-colors duration-[150ms] hover:text-primary">
          <ArrowLeft size={12} strokeWidth={1.75} aria-hidden />
          Literature set, {doc.modelId}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <GMark id="mark-doc-reading" size={40} />
            <h2 className="min-w-0 font-display text-display-lg text-primary sm:text-display-xl">{type.name}</h2>
            <span className="text-body-md tabular text-secondary">{doc.modelId}</span>
            <StatusBadge tone={docStatusTone(doc)}>{docStatusLabel(doc)}</StatusBadge>
            {isBlocked(doc) ? <StatusBadge tone="error">Blocked from release</StatusBadge> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {doc.live ? (
              <>
                <LinkBtn href="/findings" variant="primary">
                  Work findings
                </LinkBtn>
                <LinkBtn href="/generate">Open in Generate</LinkBtn>
              </>
            ) : ecn && !st.revisionSets.includes(ecn.id) ? (
              <Btn variant="primary" onClick={() => openRevisionSet(ecn.id)}>
                Open revision set for {ecn.id}
              </Btn>
            ) : (
              <LinkBtn href="/generate" variant="primary">
                {started ? "Redraft in Generate" : "Draft in Generate"}
              </LinkBtn>
            )}
            <Btn
              onClick={() => {
                log(personName(doc.ownerId), "human", "Exported", doc.id, "PDF proof with the evidence summary appended.", `/library/${doc.id}`);
                toast("Proof exported", { detail: `${doc.docNumber} ${doc.rev}, with the evidence summary appended.` });
              }}
            >
              Export proof
            </Btn>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4 @7xl:grid-cols-7">
          <Field label="Document number">
            <span className="tabular">
              {doc.docNumber} {doc.rev}
            </span>
          </Field>
          <Field label="Audience">{type.audience}</Field>
          <Field label="Pages · words">
            <span className="tabular">
              {doc.pages} · {doc.words.toLocaleString("en-US")}
            </span>
          </Field>
          <Field label="Author">{personName(doc.ownerId)}</Field>
          <Field label="Due">{shortDate(doc.due)}</Field>
          <Field label="Traced figures">{doc.traceCoverage ? pct(doc.traceCoverage, doc.traceCoverage % 1 ? 1 : 0) : "Not checked"}</Field>
          <Field label="Carried over">{pct(doc.reusePct)}</Field>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 bg-raised p-4 max-lg:flex-none lg:overflow-y-auto">
          {doc.live ? (
            <>
              <div className="mx-auto w-full max-w-[46rem]">
                <DocumentLegend />
              </div>
              <ManualDocument
                sections={sections}
                title={{ product: "Northfield 5.3 cu ft Top Load Washer", docName: type.name, model: doc.modelId, docNumber: `${doc.docNumber} ${doc.rev}`, language: "en-US", issued: "12 Oct 2026" }}
              />
            </>
          ) : (
            <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-3">
              <div className="flex items-start gap-3 rounded-lg border border-muted bg-container p-4">
                <GMark id="mark-parts-catalog" size={36} />
                <div className="min-w-0">
                  <p className="text-body-md text-primary">Structure view</p>
                  <p className="mt-0.5 text-body-sm text-tertiary">
                    {started
                      ? "This dataset carries full text for the NTL-6157 Use & Care Guide. Other documents are shown by topic, with their findings."
                      : `No draft yet. The records for ${model.id} are in. Drafting starts from the Generate page.`}
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-muted bg-container">
                <div className="flex items-center justify-between gap-3 border-b border-muted px-4 py-2.5">
                  <p className={LABEL_CLASS}>Topics · {topics.length}</p>
                  <div className="flex w-40 items-center gap-2">
                    <Meter value={doc.pctGenerated} tone={doc.pctGenerated === 100 ? "success" : "info"} />
                    <span className="shrink-0 text-caption tabular text-tertiary">{doc.pctGenerated}% drafted</span>
                  </div>
                </div>
                <ul>
                  {topics.map((t, i) => (
                    <li key={t.id} className="border-b border-muted last:border-b-0">
                      <button
                        type="button"
                        onClick={() => (doc.modelId === "NTL-6157" ? openInspector({ type: "topic", id: t.id }) : toast(`${t.id} is shared with NTL-6157`, { detail: "Open the topic library to see where it is used.", tone: "info" }))}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left outline-none transition-colors duration-[150ms] hover:bg-raised focus-visible:ring-2 focus-visible:ring-active"
                      >
                        <span className="w-6 shrink-0 text-caption tabular text-quaternary">{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-md text-primary">{t.title}</span>
                          <span className="block text-caption tabular text-quaternary">
                            {t.id} · {t.type}
                          </span>
                        </span>
                        <span className="shrink-0 text-caption tabular text-tertiary">{t.words} words</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <aside className="flex min-w-0 shrink-0 flex-col gap-4 border-t border-muted p-4 lg:w-[22rem] lg:overflow-y-auto lg:border-t-0 lg:border-l xl:w-[25rem]">
          {doc.live ? <VerdictBanner compact /> : null}
          {doc.note ? <p className="rounded-lg border border-warning-stroke bg-warning-surface px-3 py-2.5 text-body-sm text-secondary">{doc.note}</p> : null}
          {ecn ? (
            <div className="rounded-lg border border-error-stroke bg-error-surface px-3 py-2.5">
              <p className="text-body-sm text-error">Published text contradicts {ecn.id}</p>
              <p className="mt-0.5 text-body-sm text-secondary">{ecn.changes.map((c) => `${c.attribute}: ${c.from} to ${c.to}`).join(". ")}.</p>
              <Link href={`/change-impact?ecn=${ecn.id}`} className="mt-1 inline-block text-caption text-tertiary underline underline-offset-2 hover:text-primary">
                See every object it touches
              </Link>
            </div>
          ) : null}

          <Card title={`Findings · ${doc.live ? liveOpen.length : stubs.length}`} action={doc.live ? <Link href="/findings" className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Work them</Link> : undefined}>
            {doc.live ? (
              <ul className="flex flex-col">
                {findings.map((f) => (
                  <li key={f.id} className="border-b border-muted last:border-b-0">
                    <button type="button" onClick={() => openInspector({ type: "finding", id: f.id })} className="flex w-full items-center gap-2 py-2 text-left outline-none hover:bg-raised focus-visible:ring-2 focus-visible:ring-active">
                      <span className="w-9 shrink-0 text-body-sm tabular text-primary">{f.id}</span>
                      <span className="min-w-0 flex-1 truncate text-body-sm text-secondary">{f.title}</span>
                      {f.active ? <SeverityBadge severity={f.severity} /> : <FindingStateBadge finding={f} />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : stubs.length ? (
              <ul className="flex flex-col">
                {stubs.map((s) => (
                  <li key={s.id} className="flex items-start gap-2 border-b border-muted py-2 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm text-primary">{s.title}</p>
                      <p className="mt-0.5 text-caption text-tertiary">
                        <Link href={`/rules?rule=${s.ruleId}`} className="tabular underline underline-offset-2 hover:text-primary">
                          {s.ruleId}
                        </Link>{" "}
                        · {s.where}
                      </p>
                    </div>
                    <SeverityBadge severity={s.severity} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-tertiary">{started ? "No open finding against today’s record." : "Not checked. There is no draft yet."}</p>
            )}
          </Card>

          <Card title="Language renderings" action={<Link href="/localisation" className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Localise</Link>}>
            <ul className="flex flex-col gap-2">
              {doc.langs.map((lang) => {
                const state = langState(doc, lang);
                return (
                  <li key={lang} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-body-sm tabular text-primary">{lang}</span>
                      <span className="block truncate text-caption text-quaternary">{LANG_LABEL[lang]}</span>
                    </span>
                    <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Sign-off">
            {st.signed[doc.id] ? (
              <p className="text-body-sm text-success">
                Signed by {st.signed[doc.id].by}, {st.signed[doc.id].at}.
              </p>
            ) : doc.stage === "verified" || doc.stage === "in-review" ? (
              <div className="flex flex-col gap-2">
                <p className="text-body-sm text-secondary">All blocking checks pass. Waiting for {personName(doc.ownerId)} to approve.</p>
                <LinkBtn href="/signoff" className="self-start">
                  Open sign-off queue
                </LinkBtn>
              </div>
            ) : stageIndex(doc.stage) >= 5 ? (
              <p className="text-body-sm text-secondary">Signed by {personName(doc.ownerId)} before release. The evidence summary is in the audit trail.</p>
            ) : (
              <p className="text-body-sm text-tertiary">Not eligible. A document reaches sign-off only when no DANGER or WARNING finding is open.</p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
