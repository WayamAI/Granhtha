/**
 * Findings for documents whose text the dataset does not carry in full.
 * Counts come from the document row; wording comes from the rule each one
 * names, or from the engineering change that made a published document stale.
 */

import { seed } from "./data";
import { ECNS } from "./ecn";
import type { LitDoc, Severity } from "./types";

export interface StubFinding {
  id: string;
  severity: Severity;
  ruleId: string;
  title: string;
  where: string;
}

const POOL: Record<Severity, [ruleId: string, title: string][]> = {
  DANGER: [
    ["GRN-SAF-001", "Safety message has no avoidance instruction"],
    ["GRN-CMP-001", "Required regulatory statement is absent"],
    ["GRN-TRC-004", "Claim published that the test record prohibits"],
  ],
  WARNING: [
    ["GRN-TRC-002", "Figure differs from the value in the cited record"],
    ["GRN-TRC-001", "Figure has no supporting fact"],
    ["GRN-SAF-002", "NOTICE drawn with the safety alert symbol"],
    ["GRN-LOC-002", "Market language rendering missing for a new topic"],
    ["GRN-TRC-003", "Cited record revision is not the released one"],
  ],
  CAUTION: [
    ["GRN-TRM-001", "Unapproved term used in place of the glossary term"],
    ["GRN-RDB-001", "Reading grade above the target for the audience"],
    ["GRN-CMP-004", "Required fact is not used"],
  ],
  NOTICE: [
    ["GRN-RDB-004", "Step longer than 20 words"],
    ["GRN-TRM-004", "Unit not written per the style sheet"],
  ],
};

export function stubFindings(doc: LitDoc): StubFinding[] {
  const out: StubFinding[] = [];
  const s = seed(doc.id);
  const impacts = doc.staleEcn ? (ECNS.find((e) => e.id === doc.staleEcn)?.impacts.filter((i) => i.docId === doc.id && i.words > 0) ?? []) : [];
  const add = (severity: Severity, n: number) => {
    for (let i = 0; i < n; i += 1) {
      const impact = severity === "DANGER" ? impacts.find((x) => x.kind === "Safety message") : severity === "WARNING" ? impacts.filter((x) => x.kind !== "Safety message")[i] : undefined;
      const [ruleId, title] = POOL[severity][(s + i * 3) % POOL[severity].length];
      out.push({
        id: `${doc.type}-${String(out.length + 1).padStart(2, "0")}`,
        severity,
        ruleId: impact ? "GRN-TRC-002" : ruleId,
        title: impact ? `${doc.staleEcn}: “${impact.text}” no longer matches the record` : title,
        where: impact ? impact.where : `Section ${1 + ((s >>> (i + 2)) % 5)}`,
      });
    }
  };
  add("DANGER", doc.findings.danger);
  add("WARNING", doc.findings.warning);
  add("CAUTION", doc.findings.caution);
  add("NOTICE", doc.findings.notice);
  return out;
}
