"use client";

import { Check, LoaderCircle, Undo2, Wrench } from "lucide-react";
import { useState } from "react";

import { Select, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { PEOPLE, personName } from "@/lib/grantha/data";
import { DISMISS_REASONS } from "@/lib/grantha/document";
import type { LiveFinding } from "@/lib/grantha/selectors";

import { Btn, SELECT_CLASS } from "./ui";

export function FindingStateBadge({ finding }: { finding: LiveFinding }) {
  if (finding.ruleOff) return <StatusBadge tone="neutral">Rule off</StatusBadge>;
  switch (finding.state.status) {
    case "applied":
      return <StatusBadge tone="success">Fixed</StatusBadge>;
    case "applying":
      return <StatusBadge tone="info">Re-running</StatusBadge>;
    case "dismissed":
      return <StatusBadge tone="neutral">Dismissed</StatusBadge>;
    case "waiver":
      return <StatusBadge tone="warning">Waiver requested</StatusBadge>;
    default:
      return <StatusBadge tone={finding.severity === "DANGER" ? "error" : "warning"}>Open</StatusBadge>;
  }
}

/** Apply fix, dismiss with a reason, assign. DANGER cannot be dismissed, only waived by compliance. */
export function FindingActions({ finding }: { finding: LiveFinding }) {
  const { applyFix, dismissFinding, requestWaiver, reopenFinding, assignFinding } = useGrantha();
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState(DISMISS_REASONS[0]);
  const status = finding.state.status;

  if (status === "applying") {
    return (
      <p className="inline-flex items-center gap-2 text-body-sm text-info">
        <LoaderCircle size={14} strokeWidth={1.75} aria-hidden className="animate-spin" />
        Rewriting the span and re-running {finding.ruleId}
      </p>
    );
  }

  if (status === "applied" || status === "dismissed") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-body-sm ${status === "applied" ? "text-success" : "text-tertiary"}`}>
          <Check size={14} strokeWidth={1.75} aria-hidden />
          {status === "applied" ? `${finding.ruleId} re-run: pass` : `Dismissed: ${finding.state.reason}`}
        </span>
        <Btn variant="ghost" onClick={() => reopenFinding(finding.id)}>
          <Undo2 size={13} strokeWidth={1.75} aria-hidden />
          Reopen
        </Btn>
      </div>
    );
  }

  if (dismissing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Select aria-label="Reason for dismissal" value={reason} onChange={(e) => setReason(e.target.value)} className={`${SELECT_CLASS} max-w-[18rem]`}>
          {DISMISS_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
        <Btn
          variant="primary"
          onClick={() => {
            dismissFinding(finding.id, reason);
            setDismissing(false);
          }}
        >
          Confirm dismissal
        </Btn>
        <Btn variant="ghost" onClick={() => setDismissing(false)}>
          Cancel
        </Btn>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Btn variant="primary" onClick={() => applyFix(finding.id)}>
        <Wrench size={13} strokeWidth={1.75} aria-hidden />
        Apply fix
      </Btn>
      {finding.severity === "DANGER" ? (
        <Btn onClick={() => requestWaiver(finding.id)} disabled={status === "waiver"}>
          {status === "waiver" ? "Waiver with compliance" : "Request waiver"}
        </Btn>
      ) : (
        <Btn onClick={() => setDismissing(true)}>Dismiss</Btn>
      )}
      <Select
        aria-label="Assign"
        value={finding.state.assigneeId ?? ""}
        onChange={(e) => e.target.value && assignFinding(finding.id, e.target.value)}
        className={`${SELECT_CLASS} max-w-[11rem]`}
      >
        <option value="">Assign</option>
        {PEOPLE.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      {finding.state.assigneeId ? <span className="text-caption text-quaternary">with {personName(finding.state.assigneeId)}</span> : null}
    </div>
  );
}
