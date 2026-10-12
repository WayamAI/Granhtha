/**
 * Extra command-palette results beyond pages: the records an operator looks
 * up by id or name. Each entry navigates to the page that shows it.
 */
import { DOCS, MODELS, docType } from "./grantha/data";
import { FINDINGS } from "./grantha/document";
import { ECNS } from "./grantha/ecn";
import { TERMS } from "./grantha/misc";
import { FACTS, RECORDS } from "./grantha/records";
import { RULES } from "./grantha/rules";
import { TOPICS } from "./grantha/topics";

export interface SearchRecord {
  id: string;
  group: string;
  title: string;
  detail: string;
  href: string;
}

export const SEARCH_RECORDS: SearchRecord[] = [
  ...FINDINGS.map((f) => ({ id: `finding-${f.id}`, group: "Findings", title: `${f.id} ${f.title}`, detail: `${f.severity} · ${f.ruleId}`, href: `/findings?f=${f.id}` })),
  ...ECNS.map((e) => ({ id: `ecn-${e.id}`, group: "Engineering changes", title: `${e.id} ${e.title}`, detail: `${e.modelIds.join(", ")} · ${e.kind}`, href: `/change-impact?ecn=${e.id}` })),
  ...MODELS.map((m) => ({ id: `model-${m.id}`, group: "Models", title: `${m.id} ${m.name}`, detail: `${m.family} · ${m.status}`, href: `/library?model=${m.id}` })),
  ...DOCS.map((d) => ({ id: `doc-${d.id}`, group: "Documents", title: `${d.id} ${docType(d.type).name}`, detail: `${d.docNumber} ${d.rev}`, href: `/library/${d.id}` })),
  ...FACTS.map((f) => ({ id: `fact-${f.id}`, group: "Facts", title: `${f.id} ${f.label}`, detail: `${f.value} ${f.unit}`.trim(), href: `/facts?fact=${f.id}` })),
  ...RECORDS.map((r) => ({ id: `record-${r.id}`, group: "Source records", title: `${r.ref} ${r.name}`, detail: `${r.modelId} · ${r.system}`, href: `/records?record=${r.id}` })),
  ...RULES.map((r) => ({ id: `rule-${r.id}`, group: "Rules", title: `${r.id} ${r.name}`, detail: `${r.group} · ${r.clause}`, href: `/rules?rule=${r.id}` })),
  ...TOPICS.map((t) => ({ id: `topic-${t.id}`, group: "Topics", title: `${t.id} ${t.title}`, detail: `${t.type} · ${t.disposition}`, href: `/topics?topic=${t.id}` })),
  ...TERMS.map((t) => ({ id: `term-${t.id}`, group: "Terminology", title: `${t.approved}`, detail: `${t.id} · not ${t.forbidden.join(", ")}`, href: `/terminology?term=${t.id}` })),
];
