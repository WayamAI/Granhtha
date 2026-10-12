"use client";

/**
 * Global detail drawer. Any fact, finding, topic or constraint named anywhere
 * in the app opens here, with its source line and where it is used.
 */

import Link from "next/link";

import { StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { CONSTRAINTS, factById, liveRecord } from "@/lib/grantha/records";
import { ruleById } from "@/lib/grantha/rules";
import { cellValue, rewordingTax } from "@/lib/grantha/selectors";
import { whereUsed } from "@/lib/grantha/topics";
import { docType } from "@/lib/grantha/data";
import { usd } from "@/lib/grantha/format";

import { FindingActions, FindingStateBadge } from "./finding-actions";
import { Btn, Drawer, Field, GMark, LABEL_CLASS, LinkBtn, SeverityBadge } from "./ui";

/** The cited line of a record, shown the way the record shows it. */
export function RecordLine({ kind, line }: { kind: Parameters<typeof liveRecord>[0]; line: number }) {
  const { st } = useGrantha();
  const record = liveRecord(kind);
  const row = record.rows.find((r) => r.line === line);
  if (!row) return <p className="text-body-sm text-error">Line {line} not found in {record.ref}.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-muted">
      <div className="flex items-center justify-between gap-3 border-b border-muted bg-raised px-3 py-1.5">
        <span className="min-w-0 truncate text-caption text-tertiary">
          {record.name} · {record.ref} · rev {record.rev}
        </span>
        <Link href={`/records?record=${record.id}`} className="shrink-0 text-caption text-tertiary underline underline-offset-2 hover:text-primary">
          Open record
        </Link>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-3 py-2 text-body-sm">
        <dt className="text-quaternary">Line</dt>
        <dd className="tabular text-primary">{line}</dd>
        {record.columns.map((col, i) => (
          <div key={col} className="contents">
            <dt className="text-quaternary">{col}</dt>
            <dd className="min-w-0 break-words text-secondary">{i === record.editCol ? cellValue(st, record, line) : row.cells[i]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Inspector() {
  const { inspect, closeInspector, openInspector, trace, findings, topics, st, restoreTopic } = useGrantha();
  if (!inspect) return null;

  if (inspect.type === "fact") {
    const fact = factById(inspect.id);
    if (!fact) return null;
    const uses = trace.rows.filter((r) => r.factId === fact.id);
    return (
      <Drawer
        eyebrow={`Fact · ${fact.kind}`}
        title={`${fact.id} · ${fact.label}`}
        onClose={closeInspector}
        footer={
          <>
            <LinkBtn href={`/facts?fact=${fact.id}`}>Open in fact base</LinkBtn>
            <LinkBtn href="/traceability">Traceability matrix</LinkBtn>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <GMark id="mark-facts" size={36} />
            <p className="font-display text-display-xl tabular text-primary">
              {fact.value} <span className="text-display-base text-tertiary">{fact.unit}</span>
            </p>
          </div>
          <div>
            <p className={`${LABEL_CLASS} mb-1.5`}>Source line</p>
            <RecordLine kind={fact.recordKind} line={fact.line} />
          </div>
          <div>
            <p className={`${LABEL_CLASS} mb-1.5`}>Used in {uses.length} place{uses.length === 1 ? "" : "s"}</p>
            {uses.length ? (
              <ul className="flex flex-col gap-2">
                {uses.map((u) => (
                  <li key={u.key} className="rounded-md border border-muted bg-raised px-3 py-2">
                    <p className="text-caption text-quaternary">
                      {u.section} · <span className="tabular">{u.topic}</span>
                    </p>
                    <p className="mt-0.5 text-body-sm text-secondary">{u.sentence}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-tertiary">
                Not used in the Use & Care Guide. {fact.required ? "This fact is required, so its absence is reported on the traceability page." : "It is available to other document types."}
              </p>
            )}
          </div>
        </div>
      </Drawer>
    );
  }

  if (inspect.type === "constraint") {
    const c = CONSTRAINTS.find((x) => x.id === inspect.id);
    if (!c) return null;
    const raised = findings.filter((f) => f.evidence.includes(c.id));
    return (
      <Drawer eyebrow={c.kind === "prohibition" ? "Prohibition" : "Required statement"} title={`${c.id} · ${c.title}`} onClose={closeInspector}>
        <div className="flex flex-col gap-4">
          <p className="text-body-md text-secondary">{c.detail}</p>
          <div>
            <p className={`${LABEL_CLASS} mb-1.5`}>Source line</p>
            <RecordLine kind={c.recordKind} line={c.line} />
          </div>
          <Field label="Enforced by">
            <Link href={`/rules?rule=${c.ruleId}`} className="tabular underline underline-offset-2 hover:text-primary">
              {c.ruleId}
            </Link>{" "}
            {ruleById(c.ruleId)?.name}
          </Field>
          {raised.length ? (
            <div>
              <p className={`${LABEL_CLASS} mb-1.5`}>Findings resting on it</p>
              {raised.map((f) => (
                <button key={f.id} type="button" onClick={() => openInspector({ type: "finding", id: f.id })} className="flex w-full items-center gap-2 rounded-md border border-muted bg-raised px-3 py-2 text-left text-body-sm text-secondary hover:border-default">
                  <span className="tabular text-primary">{f.id}</span>
                  <span className="min-w-0 flex-1 truncate">{f.title}</span>
                  <FindingStateBadge finding={f} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Drawer>
    );
  }

  if (inspect.type === "topic") {
    const topic = topics.find((t) => t.id === inspect.id);
    if (!topic) return null;
    const uses = whereUsed(topic);
    const topicFindings = findings.filter((f) => f.topicId === topic.id);
    return (
      <Drawer
        eyebrow={`Topic · ${topic.type}`}
        title={`${topic.id} · ${topic.title}`}
        onClose={closeInspector}
        footer={
          <>
            <LinkBtn href={`/topics?topic=${topic.id}`}>Open in topic library</LinkBtn>
            {topic.reworded && !topic.restored ? (
              <Btn variant="primary" onClick={() => restoreTopic(topic.id)}>
                Restore predecessor wording
              </Btn>
            ) : null}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Disposition">
              <StatusBadge tone={topic.effective === "carried" ? "success" : topic.effective === "revised" ? "warning" : "info"}>
                {topic.effective === "carried" ? "Carried over" : topic.effective === "revised" ? "Revised" : "New"}
              </StatusBadge>
            </Field>
            <Field label="Words">
              <span className="tabular">{topic.words.toLocaleString("en-US")}</span>
            </Field>
            <Field label="Reused from">{topic.reusedFrom ?? "New for this model"}</Field>
            <Field label="Renderings">{topic.langs.join(", ")}</Field>
          </div>
          {topic.reason ? (
            <div className={`rounded-md border px-3 py-2 ${topic.reworded && !topic.restored ? "border-warning-stroke bg-warning-surface" : "border-muted bg-raised"}`}>
              <p className={LABEL_CLASS}>{topic.reworded ? (topic.restored ? "Rewording withdrawn" : "Reworded with no engineering change") : "Why it was revised"}</p>
              <p className="mt-1 text-body-sm text-secondary">{topic.reason}</p>
              {topic.reworded && !topic.restored ? (
                <p className="mt-1 text-body-sm text-warning">
                  Rewording tax: {usd(rewordingTax(topic.words))} per language, each time the document is reissued.
                </p>
              ) : null}
            </div>
          ) : null}
          <div>
            <p className={`${LABEL_CLASS} mb-1.5`}>Where used · {uses.length}</p>
            <ul className="flex flex-col gap-1">
              {uses.map((u) => (
                <li key={`${u.modelId}-${u.doc}`} className="flex items-center justify-between gap-3 rounded-md bg-raised px-3 py-1.5 text-body-sm">
                  <span className="tabular text-primary">{u.modelId}</span>
                  <span className="min-w-0 truncate text-tertiary">{docType(u.doc).name}</span>
                </li>
              ))}
            </ul>
          </div>
          {topicFindings.length ? (
            <div>
              <p className={`${LABEL_CLASS} mb-1.5`}>Findings in this topic</p>
              <ul className="flex flex-col gap-1">
                {topicFindings.map((f) => (
                  <li key={f.id}>
                    <button type="button" onClick={() => openInspector({ type: "finding", id: f.id })} className="flex w-full items-center gap-2 rounded-md border border-muted bg-raised px-3 py-2 text-left text-body-sm text-secondary hover:border-default">
                      <span className="tabular text-primary">{f.id}</span>
                      <span className="min-w-0 flex-1 truncate">{f.title}</span>
                      <FindingStateBadge finding={f} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Drawer>
    );
  }

  const finding = findings.find((f) => f.id === inspect.id);
  if (!finding) return null;
  const rule = ruleById(finding.ruleId);
  return (
    <Drawer
      eyebrow={`Finding · ${finding.origin}`}
      title={`${finding.id} · ${finding.title}`}
      onClose={closeInspector}
      footer={<LinkBtn href={`/findings?f=${finding.id}`}>Open in findings</LinkBtn>}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          <FindingStateBadge finding={finding} />
          <Link href={`/rules?rule=${finding.ruleId}`} className="text-caption tabular text-tertiary underline underline-offset-2 hover:text-primary">
            {finding.ruleId}
          </Link>
        </div>
        <p className="text-body-md text-secondary">{finding.detail}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rule">{rule?.name}</Field>
          <Field label="Clause">{rule?.clause}</Field>
          <Field label="Evidence">{finding.evidence}</Field>
          <Field label="Topic">
            <button type="button" className="tabular underline underline-offset-2 hover:text-primary" onClick={() => openInspector({ type: "topic", id: finding.topicId })}>
              {finding.topicId}
            </button>
          </Field>
        </div>
        <div className="rounded-md border border-muted bg-raised px-3 py-2">
          <p className={LABEL_CLASS}>Proposed fix · {Math.round(finding.confidence * 100)}% confidence</p>
          <p className="mt-1 text-body-md text-secondary">{finding.proposedFix}</p>
          <p className="mt-1 text-caption text-quaternary">
            The fix is proposed. The rule decides pass or fail, and {st.signed["NTL-6157-UCG"]?.by ?? "a named technical author"} signs the document.
          </p>
        </div>
        <FindingActions finding={finding} />
      </div>
    </Drawer>
  );
}
