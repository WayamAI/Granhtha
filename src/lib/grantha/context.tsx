"use client";

/**
 * Session state shared by every page: findings, the document text, the
 * verdict, the sign-off queue and the dashboard numbers all derive from it.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useToast } from "@/components/ui/toast";
import { APP } from "@/lib/app";

import { CATALOGUE, LIVE_DOC, docById, personName } from "./data";
import { FINDINGS, findingById } from "./document";
import { ECNS, ecnById } from "./ecn";
import { AUDIT_SEED, TERMS } from "./misc";
import { recordById } from "./records";
import { ruleById } from "./rules";
import {
  INITIAL_STATE,
  allChecks,
  dashboardKpis,
  editKey,
  liveDocs,
  liveFindings,
  liveTopics,
  resolveDocument,
  traceMatrix,
  verdictOf,
  type GState,
} from "./selectors";
import { MISSING_FR, REWORDED_UC, topicById } from "./topics";
import type { AuditEvent, FlowStage } from "./types";

export type Inspect =
  | { type: "fact"; id: string }
  | { type: "finding"; id: string }
  | { type: "topic"; id: string }
  | { type: "constraint"; id: string }
  | null;

const OPERATOR: string = APP.operator.name;

function useGranthaState() {
  const toast = useToast();
  const [st, setSt] = useState<GState>(INITIAL_STATE);
  const [inspect, setInspect] = useState<Inspect>(null);
  const clock = useRef(0);

  /** Session events are stamped a minute apart from a fixed start, not from the wall clock. */
  const stamp = useCallback(() => {
    clock.current += 1;
    const minutes = 10 * 60 + 2 + clock.current;
    return `2026-10-12 ${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }, []);

  const event = useCallback(
    (actor: string, actorKind: AuditEvent["actorKind"], action: string, object: string, detail: string, href?: string): AuditEvent => ({
      id: `AU-${2400 + clock.current + 1}`,
      at: stamp(),
      actor,
      actorKind,
      action,
      object,
      detail,
      href,
    }),
    [stamp],
  );

  const log = useCallback(
    (actor: string, kind: AuditEvent["actorKind"], action: string, object: string, detail: string, href?: string) => {
      const e = event(actor, kind, action, object, detail, href);
      setSt((s) => ({ ...s, audit: [e, ...s.audit] }));
    },
    [event],
  );

  // Paced pipeline: one step per tick until the verifier has run.
  useEffect(() => {
    if (st.run.status !== "running") return;
    const timer = window.setTimeout(() => {
      setSt((s) => {
        if (s.run.status !== "running") return s;
        const step = s.run.step + 1;
        return { ...s, run: { ...s.run, step, status: step >= s.run.total ? "done" : "running" } };
      });
    }, st.run.step < 2 ? 700 : 430);
    return () => window.clearTimeout(timer);
  }, [st.run]);

  const startRun = useCallback(
    (typeId: string) => {
      const type = CATALOGUE.find((c) => c.id === typeId);
      setSt((s) => ({ ...s, run: { status: "running", step: 0, total: (type?.sections.length ?? 12) + 3, typeId, modelId: s.modelId } }));
      log(OPERATOR, "human", "Run started", `${st.modelId} · ${type?.name ?? typeId}`, "Input check, extractor, author and verifier queued.", "/generate");
    },
    [log, st.modelId],
  );

  const setModel = useCallback((modelId: string) => setSt((s) => ({ ...s, modelId })), []);

  const applyFix = useCallback(
    (id: string) => {
      const finding = findingById(id);
      if (!finding) return;
      setSt((s) => ({ ...s, findings: { ...s.findings, [id]: { ...s.findings[id], status: "applying" } } }));
      window.setTimeout(() => {
        const e = event(OPERATOR, "human", "Fix applied", `${LIVE_DOC} · ${id}`, `${finding.proposedFix} ${finding.ruleId} re-run: pass.`, `/findings?f=${id}`);
        setSt((s) => ({
          ...s,
          findings: { ...s.findings, [id]: { ...s.findings[id], status: "applied" } },
          restoredTopics: id === "F-11" ? [...new Set([...s.restoredTopics, ...REWORDED_UC])] : s.restoredTopics,
          mtQueued: id === "F-07" ? [...new Set([...s.mtQueued, ...MISSING_FR])] : s.mtQueued,
          termsFixed: id === "F-10" ? [...new Set([...s.termsFixed, "NF-GL-014"])] : s.termsFixed,
          audit: [e, ...s.audit],
        }));
        toast(`${id} fixed. ${finding.ruleId} re-run: pass`, { detail: "The document text and the verdict have been updated." });
      }, 950);
    },
    [event, toast],
  );

  const applyAllSafe = useCallback(() => {
    const open = FINDINGS.filter((f) => (st.findings[f.id]?.status ?? "open") === "open" && f.confidence >= 0.97);
    open.forEach((f, i) => window.setTimeout(() => applyFix(f.id), i * 260));
    if (!open.length) toast("No open finding at 97% confidence or above", { tone: "info" });
  }, [applyFix, st.findings, toast]);

  const dismissFinding = useCallback(
    (id: string, reason: string) => {
      const e = event(OPERATOR, "human", "Finding dismissed", `${LIVE_DOC} · ${id}`, `Reason: ${reason}`, `/findings?f=${id}`);
      setSt((s) => ({ ...s, findings: { ...s.findings, [id]: { ...s.findings[id], status: "dismissed", reason } }, audit: [e, ...s.audit] }));
      toast(`${id} dismissed`, { detail: reason, tone: "info" });
    },
    [event, toast],
  );

  const requestWaiver = useCallback(
    (id: string) => {
      const e = event(OPERATOR, "human", "Waiver requested", `${LIVE_DOC} · ${id}`, "DANGER finding routed to compliance. It stays blocking until compliance rules.", `/findings?f=${id}`);
      setSt((s) => ({ ...s, findings: { ...s.findings, [id]: { status: "waiver", assigneeId: "pnambiar" } }, audit: [e, ...s.audit] }));
      toast(`Waiver for ${id} sent to Priya Nambiar`, { detail: "The finding stays blocking until compliance rules on it.", tone: "warning" });
    },
    [event, toast],
  );

  const reopenFinding = useCallback(
    (id: string) => {
      const e = event(OPERATOR, "human", "Finding reopened", `${LIVE_DOC} · ${id}`, "Fix or dismissal withdrawn. Original text restored.", `/findings?f=${id}`);
      setSt((s) => ({
        ...s,
        findings: { ...s.findings, [id]: { status: "open", assigneeId: s.findings[id]?.assigneeId } },
        restoredTopics: id === "F-11" ? s.restoredTopics.filter((t) => !REWORDED_UC.includes(t)) : s.restoredTopics,
        mtQueued: id === "F-07" ? [] : s.mtQueued,
        termsFixed: id === "F-10" ? s.termsFixed.filter((t) => t !== "NF-GL-014") : s.termsFixed,
        signed: Object.fromEntries(Object.entries(s.signed).filter(([k]) => k !== LIVE_DOC)),
        docStage: Object.fromEntries(Object.entries(s.docStage).filter(([k]) => k !== LIVE_DOC)),
        audit: [e, ...s.audit],
      }));
      toast(`${id} reopened`, { tone: "info" });
    },
    [event, toast],
  );

  const assignFinding = useCallback(
    (id: string, personId: string) => {
      const e = event(OPERATOR, "human", "Assigned", `${LIVE_DOC} · ${id}`, `Assigned to ${personName(personId)}.`, `/findings?f=${id}`);
      setSt((s) => ({ ...s, findings: { ...s.findings, [id]: { ...s.findings[id], status: s.findings[id]?.status ?? "open", assigneeId: personId } }, audit: [e, ...s.audit] }));
      toast(`${id} assigned to ${personName(personId)}`);
    },
    [event, toast],
  );

  const toggleRule = useCallback(
    (ruleId: string) => {
      const rule = ruleById(ruleId);
      const off = st.rulesOff.includes(ruleId);
      const e = event(OPERATOR, "human", off ? "Rule enabled" : "Rule disabled", ruleId, `${rule?.name ?? ruleId}. Change recorded for the documentation manager.`, `/rules?rule=${ruleId}`);
      setSt((s) => ({ ...s, rulesOff: off ? s.rulesOff.filter((r) => r !== ruleId) : [...s.rulesOff, ruleId], audit: [e, ...s.audit] }));
      toast(off ? `${ruleId} switched on` : `${ruleId} switched off`, {
        detail: off ? "Its findings count against the verdict again." : "Its findings no longer count. The change is in the audit trail.",
        tone: off ? "success" : "warning",
      });
    },
    [event, st.rulesOff, toast],
  );

  const editRecord = useCallback(
    (recordId: string, line: number, value: string) => {
      const record = recordById(recordId);
      const original = record?.rows.find((r) => r.line === line)?.cells[record.editCol];
      setSt((s) => {
        const edits = { ...s.recordEdits };
        if (value === original) delete edits[editKey(recordId, line)];
        else edits[editKey(recordId, line)] = value;
        return { ...s, recordEdits: edits };
      });
    },
    [],
  );

  const commitRecordEdit = useCallback(
    (recordId: string, line: number, value: string) => {
      const record = recordById(recordId);
      log(OPERATOR, "human", "Record preview edited", `${record?.ref ?? recordId} line ${line}`, `Value overtyped to “${value}”. The released record in ${record?.system ?? "PLM"} is unchanged.`, `/records?record=${recordId}`);
      toast(`${record?.ref ?? recordId} line ${line} overtyped`, { detail: "The input check has been re-run.", tone: "warning" });
    },
    [log, toast],
  );

  const resetRecord = useCallback(
    (recordId: string) => {
      setSt((s) => ({ ...s, recordEdits: Object.fromEntries(Object.entries(s.recordEdits).filter(([k]) => !k.startsWith(`${recordId}:`))) }));
      toast("Preview reloaded from the released revision");
    },
    [toast],
  );

  const restoreTopic = useCallback(
    (topicId: string) => {
      const topic = topicById(topicId);
      const e = event(OPERATOR, "human", "Wording restored", topicId, `${topic?.title ?? topicId} restored to predecessor wording. Translation-memory matches return to exact.`, "/reuse");
      setSt((s) => {
        const restoredTopics = [...new Set([...s.restoredTopics, topicId])];
        const allUc = REWORDED_UC.every((t) => restoredTopics.includes(t));
        return {
          ...s,
          restoredTopics,
          findings: allUc && (s.findings["F-11"]?.status ?? "open") === "open" ? { ...s.findings, "F-11": { ...s.findings["F-11"], status: "applied" } } : s.findings,
          audit: [e, ...s.audit],
        };
      });
      toast(`${topicId} restored to predecessor wording`, { detail: "Exact matches recovered in every language." });
    },
    [event, toast],
  );

  const queueMt = useCallback(
    (topicIds: string[]) => {
      const e = event("Rafael Quintero", "human", "Translation queued", topicIds.join(", "), "Terminology-locked machine translation with human post-edit by the fr-CA reviewer.", "/localisation");
      setSt((s) => {
        const mtQueued = [...new Set([...s.mtQueued, ...topicIds])];
        const all = MISSING_FR.every((t) => mtQueued.includes(t));
        return {
          ...s,
          mtQueued,
          findings: all && (s.findings["F-07"]?.status ?? "open") === "open" ? { ...s.findings, "F-07": { ...s.findings["F-07"], status: "applied" } } : s.findings,
          audit: [e, ...s.audit],
        };
      });
      toast(`${topicIds.length} topic${topicIds.length === 1 ? "" : "s"} queued for fr-CA`, { detail: "Locked glossary terms are protected. Camille Fortin post-edits." });
    },
    [event, toast],
  );

  const fixTerm = useCallback(
    (termId: string) => {
      const term = TERMS.find((t) => t.id === termId);
      if (term?.findingId) {
        applyFix(term.findingId);
        return;
      }
      const e = event(OPERATOR, "human", "Term replaced", termId, `Forbidden variants replaced with “${term?.approved}” in ${term?.occurrences} places across open drafts.`, "/terminology");
      setSt((s) => ({ ...s, termsFixed: [...new Set([...s.termsFixed, termId])], audit: [e, ...s.audit] }));
      toast(`${term?.occurrences} occurrence${term?.occurrences === 1 ? "" : "s"} replaced with “${term?.approved}”`);
    },
    [applyFix, event, toast],
  );

  const setDocStage = useCallback((docId: string, stage: FlowStage, note?: string) => {
    setSt((s) => ({ ...s, docStage: { ...s.docStage, [docId]: stage }, docNote: note ? { ...s.docNote, [docId]: note } : s.docNote }));
  }, []);

  const approveDoc = useCallback(
    (docId: string, by: string) => {
      const doc = docById(docId);
      const at = stamp();
      const e = event(by, "human", "Signed off", docId, `${doc?.title ?? docId} ${doc?.rev ?? ""} approved for issue. Evidence summary attached.`, `/library/${docId}`);
      setSt((s) => ({ ...s, docStage: { ...s.docStage, [docId]: "signed-off" }, signed: { ...s.signed, [docId]: { by, at } }, audit: [e, ...s.audit] }));
      toast(`${docId} signed off by ${by}`, { detail: "Released to publishing." });
    },
    [event, stamp, toast],
  );

  const returnDoc = useCallback(
    (docId: string, reason: string) => {
      const e = event(OPERATOR, "human", "Returned", docId, `Returned to draft. ${reason}`, `/library/${docId}`);
      setSt((s) => ({ ...s, docStage: { ...s.docStage, [docId]: "drafted" }, docNote: { ...s.docNote, [docId]: `Returned: ${reason}` }, audit: [e, ...s.audit] }));
      toast(`${docId} returned to draft`, { detail: reason, tone: "warning" });
    },
    [event, toast],
  );

  const openRevisionSet = useCallback(
    (ecnId: string) => {
      const ecn = ecnById(ecnId);
      if (!ecn) return;
      const docs = new Set(ecn.impacts.map((i) => i.docId));
      const e = event(OPERATOR, "human", "Revision set opened", `RS-${ecnId.slice(4)}`, `${docs.size} documents and ${ecn.impacts.length} objects from ${ecnId} placed in one revision set.`, `/change-impact?ecn=${ecnId}`);
      setSt((s) => ({ ...s, revisionSets: [...new Set([...s.revisionSets, ecnId])], audit: [e, ...s.audit] }));
      toast(`Revision set RS-${ecnId.slice(4)} opened`, { detail: `${docs.size} documents moved to draft with the affected spans marked.` });
    },
    [event, toast],
  );

  const setInsight = useCallback(
    (id: string, status: string) => {
      setSt((s) => ({ ...s, insightStatus: { ...s.insightStatus, [id]: status } }));
      toast(status === "dismissed" ? "Observation dismissed" : "Review task created", { detail: status === "dismissed" ? undefined : "It is in the owner's queue and the audit trail." });
    },
    [toast],
  );

  const derived = useMemo(() => {
    const sections = resolveDocument(st);
    const findings = liveFindings(st);
    const checks = allChecks(st);
    const verdict = verdictOf(st, checks);
    const trace = traceMatrix(sections);
    const docs = liveDocs(st);
    const kpis = dashboardKpis(st, docs);
    const topics = liveTopics(st);
    const audit = [...st.audit, ...AUDIT_SEED];
    return { sections, findings, checks, verdict, trace, docs, kpis, topics, audit };
  }, [st]);

  return {
    st,
    ...derived,
    inspect,
    openInspector: setInspect,
    closeInspector: () => setInspect(null),
    startRun,
    setModel,
    applyFix,
    applyAllSafe,
    dismissFinding,
    requestWaiver,
    reopenFinding,
    assignFinding,
    toggleRule,
    editRecord,
    commitRecordEdit,
    resetRecord,
    restoreTopic,
    queueMt,
    fixTerm,
    setDocStage,
    approveDoc,
    returnDoc,
    openRevisionSet,
    setInsight,
    log,
    ecns: ECNS,
  };
}

type Ctx = ReturnType<typeof useGranthaState>;

const GranthaContext = createContext<Ctx | null>(null);

export function GranthaProvider({ children }: { children: ReactNode }) {
  const value = useGranthaState();
  return <GranthaContext.Provider value={value}>{children}</GranthaContext.Provider>;
}

export function useGrantha(): Ctx {
  const ctx = useContext(GranthaContext);
  if (!ctx) throw new Error("useGrantha must be used inside GranthaProvider");
  return ctx;
}
