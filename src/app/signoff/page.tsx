"use client";

/**
 * Sign-off: documents whose blocking checks all pass, waiting for a named
 * technical author. The evidence summary is what the approver signs against.
 */

import Link from "next/link";
import { useState } from "react";

import { Btn, GMark, LABEL_CLASS, LinkBtn, SELECT_CLASS } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { InfoPopover } from "@/components/ui/info-popover";
import { KpiTile, Panel, Select, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { LIVE_DOC, PEOPLE, docType, personName, seed, stageLabel } from "@/lib/grantha/data";
import { daysFromToday, pct, shortDate } from "@/lib/grantha/format";
import { signoffQueue } from "@/lib/grantha/selectors";
import type { LitDoc } from "@/lib/grantha/types";

const RETURN_REASONS = ["A figure needs engineering confirmation", "Illustration does not match the text", "Wording change requested", "Wrong revision of a record cited"];
const APPROVERS = PEOPLE.filter((p) => /author|Service content|Documentation manager/.test(p.role));

export default function SignoffPage() {
  const { docs, st, checks, verdict, trace, findings, approveDoc, returnDoc, setDocStage } = useGrantha();
  const queue = signoffQueue(docs);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approver, setApprover] = useState<Record<string, string>>({});
  const [reason, setReason] = useState(RETURN_REASONS[0]);

  const signedNow = docs.filter((d) => st.signed[d.id]);
  const returned = docs.filter((d) => st.docNote[d.id]?.startsWith("Returned"));
  const rows = [...queue, ...signedNow];
  const doc = rows.find((d) => d.id === selectedId) ?? rows[0];
  const liveDoc = docs.find((d) => d.id === LIVE_DOC)!;
  const liveBlocking = findings.filter((f) => f.active && (f.severity === "DANGER" || f.severity === "WARNING"));

  function evidence(d: LitDoc) {
    if (d.live) {
      return {
        checks: checks.length,
        passing: checks.filter((c) => c.status === "pass").length,
        advisories: findings.filter((f) => f.active).length,
        figures: trace.rows.length,
        coverage: trace.coverage,
        dismissed: findings.filter((f) => f.state.status === "dismissed").length,
        fixed: findings.filter((f) => f.state.status === "applied").length,
      };
    }
    const s = seed(d.id);
    const total = 28 + (s % 8);
    const adv = d.findings.caution + d.findings.notice;
    return { checks: total, passing: total - Math.min(adv, 2), advisories: adv, figures: Math.max(4, Math.round(d.words / 46)), coverage: 100, dismissed: s % 2, fixed: 2 + (s % 6) };
  }

  const columns: Column<LitDoc>[] = [
    {
      key: "doc",
      header: "Document",
      card: "title",
      value: (d) => d.id,
      render: (d) => (
        <span className="flex min-w-0 flex-col">
          <span className="tabular text-primary">{d.id}</span>
          <span className="truncate text-caption text-quaternary">
            {docType(d.type).name} · {d.docNumber} {d.rev}
          </span>
        </span>
      ),
    },
    { key: "state", header: "State", value: (d) => (st.signed[d.id] ? "Signed off" : stageLabel(d.stage)), render: (d) => <StatusBadge tone={st.signed[d.id] ? "success" : d.stage === "verified" ? "info" : "warning"}>{st.signed[d.id] ? "Signed off" : d.stage === "verified" ? "Ready for sign-off" : "In review"}</StatusBadge> },
    { key: "owner", header: "Named author", value: (d) => personName(d.ownerId), render: (d) => <span className="whitespace-nowrap">{personName(d.ownerId)}</span> },
    { key: "adv", header: "Advisories", align: "right", card: "metric", value: (d) => d.findings.caution + d.findings.notice, render: (d) => <span className="tabular">{d.findings.caution + d.findings.notice}</span> },
    { key: "due", header: "Due", align: "right", hide: "md", value: (d) => d.due, render: (d) => <span className={`tabular whitespace-nowrap ${daysFromToday(d.due) <= 2 ? "text-warning" : ""}`}>{shortDate(d.due)}</span> },
  ];

  const ev = doc ? evidence(doc) : null;
  const by = doc ? (approver[doc.id] ?? doc.ownerId) : "";

  return (
    <>
      <PageHeader
        title="Sign-off"
        description="A document arrives here only when no DANGER or WARNING finding is open. A named technical author reads the evidence and approves or returns it."
        mark={<GMark id="mark-signoff" size={44} />}
        info={
          <InfoPopover label="Why a person signs">
            <p className="text-body-sm text-secondary">
              IEC/IEEE 82079-1 expects information for use to be prepared and reviewed by competent people. The checks show that every figure traces to a record and that the safety messages are well formed. They do not
              judge whether the instructions are the right ones. That judgment belongs to the author whose name goes on the document.
            </p>
          </InfoPopover>
        }
        actions={<LinkBtn href="/audit">Audit trail</LinkBtn>}
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Waiting for sign-off" value={String(queue.length)} hint="all blocking checks pass" tone="info" />
            <KpiTile label="Due within 2 days" value={String(queue.filter((d) => daysFromToday(d.due) <= 2).length)} hint="of those waiting" tone="warning" />
            <KpiTile label="Signed this session" value={String(signedNow.length)} hint="released to publishing" tone="success" />
            <KpiTile label="Returned this session" value={String(returned.length)} hint="back with the author" />
          </div>

          {returned.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-warning-stroke bg-warning-surface px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-body-md text-primary">
                  <span className="tabular">{d.id}</span> is back with {personName(d.ownerId)}
                </p>
                <p className="text-body-sm text-secondary">{st.docNote[d.id]}</p>
              </div>
              <Btn onClick={() => setDocStage(d.id, "in-review", "Resubmitted after return")}>Resubmit for sign-off</Btn>
            </div>
          ))}

          {!verdict.ready ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-muted bg-container px-4 py-3">
              <GMark id="mark-findings" />
              <div className="min-w-0 flex-1">
                <p className="text-body-md text-primary">NTL-6157 Use & Care Guide is not in the queue yet</p>
                <p className="text-body-sm text-tertiary">
                  {liveBlocking.length} blocking finding{liveBlocking.length === 1 ? "" : "s"} still open: {liveBlocking.map((f) => f.id).join(", ")}. It joins this queue the moment the last one is cleared.
                </p>
              </div>
              <LinkBtn href="/findings" variant="primary">
                Work findings
              </LinkBtn>
            </div>
          ) : null}

          <SplitRow ratio="1.4/1" className="lg:h-[38rem] lg:max-h-[38rem]">
            <Panel title={`Queue · ${rows.length}`} padded={false}>
              <div className="min-h-0 flex-1">
                <DataTable
                  rows={rows}
                  columns={columns}
                  rowKey={(d) => d.id}
                  onRowClick={(d) => setSelectedId(d.id)}
                  isRowSelected={(d) => d.id === doc?.id}
                  searchPlaceholder="Search document or author"
                  exportName="signoff-queue"
                  pageSize={25}
                  emptyTitle="Nothing is waiting for sign-off"
                  emptyDetail="Documents arrive here when their blocking checks pass."
                />
              </div>
            </Panel>

            <Panel title="Evidence summary" action={doc ? <Link href={`/library/${doc.id}`} className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">Read the document</Link> : undefined}>
              {doc && ev ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-body-lg text-primary">
                      {docType(doc.type).name}, <span className="tabular">{doc.modelId}</span>
                    </p>
                    <p className="text-body-sm tabular text-tertiary">
                      {doc.docNumber} {doc.rev} · {doc.pages} pages · {doc.langs.join(", ")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      ["Checks passing", `${ev.passing} of ${ev.checks}`],
                      ["DANGER and WARNING open", "0"],
                      ["Figures traced", `${ev.figures}, ${pct(ev.coverage, ev.coverage % 1 ? 1 : 0)}`],
                      ["Advisories carried", String(ev.advisories)],
                      ["Fixes applied", String(ev.fixed)],
                      ["Findings dismissed", String(ev.dismissed)],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <p className={LABEL_CLASS}>{label}</p>
                        <p className="mt-0.5 font-display text-display-base tabular text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="rounded-md border border-muted bg-raised px-3 py-2 text-body-sm text-tertiary">
                    The checks confirm form and traceability. Whether the instructions are right for the product is the approver’s judgment.
                    {ev.dismissed ? ` ${ev.dismissed} dismissed finding${ev.dismissed === 1 ? " has" : "s have"} a recorded reason in the audit trail.` : ""}
                  </p>
                  {st.signed[doc.id] ? (
                    <p className="rounded-md border border-success-stroke bg-success-surface px-3 py-2 text-body-sm text-success">
                      Signed by {st.signed[doc.id].by}, {st.signed[doc.id].at}. Released to publishing.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-muted pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={LABEL_CLASS}>Approver</span>
                        <Select aria-label="Approver" value={by} onChange={(e) => setApprover((a) => ({ ...a, [doc.id]: e.target.value }))} className={`${SELECT_CLASS} max-w-[14rem]`}>
                          {APPROVERS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                        <Btn variant="primary" onClick={() => approveDoc(doc.id, personName(by))}>
                          Approve for issue
                        </Btn>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={LABEL_CLASS}>Or return</span>
                        <Select aria-label="Reason for return" value={reason} onChange={(e) => setReason(e.target.value)} className={`${SELECT_CLASS} max-w-[16rem]`}>
                          {RETURN_REASONS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </Select>
                        <Btn onClick={() => returnDoc(doc.id, reason)}>Return to author</Btn>
                      </div>
                      <p className="text-caption text-quaternary">The approver’s name, the time and this evidence summary are written to the audit trail.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <GMark id="mark-empty" size={56} />
                  <p className="text-body-md text-tertiary">Nothing is waiting for sign-off</p>
                </div>
              )}
            </Panel>
          </SplitRow>
          {liveDoc.stage === "signed-off" ? <p className="text-body-sm text-success">NTL-6157 Use & Care Guide is signed off. The dashboard and the literature set now show it as signed.</p> : null}
        </div>
      </PageBody>
    </>
  );
}
