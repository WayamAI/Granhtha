/**
 * Pure selectors over the dataset plus the session state. Every number a
 * page shows comes through here, so a fix applied on one page moves the
 * verdict, the queue and the dashboard together.
 */

import { DOCS, LIVE_DOC, LIVE_MODEL, STAGES, stageIndex } from "./data";
import { FINDINGS, UCG } from "./document";
import { ECNS, RATES } from "./ecn";
import { AGREE_LABEL, CONSTRAINTS, FACTS, RECORDS, numericToken, recordsForModel } from "./records";
import { OUTPUT_CHECKS, isBlocking, ruleById, severityRank } from "./rules";
import { MISSING_FR, SHARED_FR, TOPICS } from "./topics";
import type {
  AuditEvent,
  Block,
  Check,
  CheckStatus,
  DocTypeId,
  Finding,
  FindingState,
  FindingStatus,
  FlowStage,
  Lang,
  LitDoc,
  RBlock,
  RSection,
  Seg,
  SourceRecord,
  Topic,
} from "./types";

export interface RunState {
  status: "idle" | "running" | "done";
  step: number;
  /** Input check, extractor, one step per section, verifier. */
  total: number;
  typeId: string;
  modelId: string;
}

export interface GState {
  modelId: string;
  findings: Record<string, FindingState>;
  rulesOff: string[];
  /** Overtyped record cells, keyed `${recordId}:${line}`. */
  recordEdits: Record<string, string>;
  restoredTopics: string[];
  mtQueued: string[];
  termsFixed: string[];
  docStage: Record<string, FlowStage>;
  docNote: Record<string, string>;
  signed: Record<string, { by: string; at: string }>;
  revisionSets: string[];
  insightStatus: Record<string, string>;
  audit: AuditEvent[];
  run: RunState;
}

export const INITIAL_STATE: GState = {
  modelId: LIVE_MODEL,
  findings: {},
  rulesOff: [],
  recordEdits: {},
  restoredTopics: [],
  mtQueued: [],
  termsFixed: [],
  docStage: {},
  docNote: {},
  signed: {},
  revisionSets: [],
  insightStatus: {},
  audit: [],
  run: { status: "done", step: 15, total: 15, typeId: "UCG", modelId: LIVE_MODEL },
};


// --- findings --------------------------------------------------------------

export const findingState = (st: GState, id: string): FindingState => st.findings[id] ?? { status: "open" };
export const ruleOn = (st: GState, ruleId: string) => !st.rulesOff.includes(ruleId);

export interface LiveFinding extends Finding {
  state: FindingState;
  ruleOff: boolean;
  /** Still counts against the verdict. */
  active: boolean;
}

export function liveFindings(st: GState): LiveFinding[] {
  return FINDINGS.map((f) => {
    const state = findingState(st, f.id);
    const ruleOff = !ruleOn(st, f.ruleId);
    const active = !ruleOff && (state.status === "open" || state.status === "applying" || state.status === "waiver");
    let title = f.title;
    if (f.id === "F-11") {
      const pct = Math.round(leverage(st, "es-MX", "UCG").pct);
      title = `es-MX exact-match leverage ${pct}% against a 75% threshold`;
    }
    return { ...f, title, state, ruleOff, active };
  }).sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.id.localeCompare(b.id));
}

/** How a span carrying a finding should read right now. */
function spanMode(st: GState, findingId: string): FindingStatus | "off" {
  const f = FINDINGS.find((x) => x.id === findingId);
  if (f && !ruleOn(st, f.ruleId)) return "off";
  return findingState(st, findingId).status;
}

// --- document resolution ---------------------------------------------------

const TOKEN = /\{(f|x):([^|}]+)\|([^}]*)\}/g;

function parseInline(st: GState, text: string, wrap?: { findingId: string; kind: Seg["kind"] }): Seg[] {
  const segs: Seg[] = [];
  let last = 0;
  const plain = (t: string) => {
    if (!t) return;
    segs.push(wrap ? { text: t, kind: wrap.kind, findingId: wrap.findingId } : { text: t, kind: "plain" });
  };
  for (const m of text.matchAll(TOKEN)) {
    plain(text.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    const [, type, id, body] = m;
    if (type === "f") {
      segs.push({ text: body, kind: "fact", factId: id, findingId: wrap?.kind === "fixed" ? wrap.findingId : undefined });
      continue;
    }
    const mode = spanMode(st, id);
    const fix = FINDINGS.find((f) => f.id === id)?.fixText;
    if (mode === "applied" && fix) segs.push(...parseInline(st, fix, { findingId: id, kind: "fixed" }));
    else if (mode === "dismissed" || mode === "off") segs.push({ text: body, kind: "dismissed", findingId: id });
    else segs.push({ text: body, kind: "finding", findingId: id });
  }
  plain(text.slice(last));
  return segs;
}

function resolveBlock(st: GState, block: Block): RBlock[] {
  switch (block.t) {
    case "p": {
      if (block.finding && block.alt) {
        const mode = spanMode(st, block.finding);
        if (mode === "applied") {
          return [{ t: "p", topic: block.topic, segs: parseInline(st, block.alt, { findingId: block.finding, kind: "fixed" }), finding: block.finding, state: "applied" }];
        }
        const open = mode !== "dismissed" && mode !== "off";
        return [
          {
            t: "p",
            topic: block.topic,
            segs: parseInline(st, block.text, { findingId: block.finding, kind: open ? "finding" : "dismissed" }),
            finding: block.finding,
            state: open ? (mode as FindingStatus) : "dismissed",
          },
        ];
      }
      return [{ t: "p", topic: block.topic, segs: parseInline(st, block.text) }];
    }
    case "list":
      return [{ t: "list", topic: block.topic, items: block.items.map((item) => parseInline(st, item)) }];
    case "table":
      return [{ t: "table", topic: block.topic, head: block.head, rows: block.rows.map((row) => row.map((cell) => parseInline(st, cell))) }];
    case "steps": {
      const out: RBlock[] = [];
      const items: { segs: Seg[]; finding?: string; state?: FindingStatus }[] = [];
      const notes: RBlock[] = [];
      for (const item of block.items) {
        if (item.finding && item.alt) {
          const mode = spanMode(st, item.finding);
          if (mode === "applied") {
            for (const alt of item.alt) items.push({ segs: parseInline(st, alt, { findingId: item.finding, kind: "fixed" }), finding: item.finding, state: "applied" });
            if (item.altNote) notes.push({ t: "p", topic: block.topic, segs: parseInline(st, item.altNote, { findingId: item.finding, kind: "fixed" }), finding: item.finding, state: "applied" });
            continue;
          }
          const open = mode !== "dismissed" && mode !== "off";
          items.push({
            segs: parseInline(st, item.text, { findingId: item.finding, kind: open ? "finding" : "dismissed" }),
            finding: item.finding,
            state: open ? (mode as FindingStatus) : "dismissed",
          });
          continue;
        }
        items.push({ segs: parseInline(st, item.text) });
      }
      out.push({ t: "steps", topic: block.topic, items }, ...notes);
      return out;
    }
    case "panel": {
      if (!block.finding) return [{ t: "panel", topic: block.topic, word: block.word, hazard: block.hazard, segs: parseInline(st, block.text), symbol: block.symbol }];
      const mode = spanMode(st, block.finding);
      const applied = mode === "applied";
      const segs = parseInline(st, block.text);
      if (applied && block.append) segs.push(...parseInline(st, block.append, { findingId: block.finding, kind: "fixed" }));
      return [
        {
          t: "panel",
          topic: block.topic,
          word: block.word,
          hazard: block.hazard,
          segs,
          symbol: applied && !block.append ? false : block.symbol,
          finding: block.finding,
          state: mode === "off" ? "dismissed" : mode,
        },
      ];
    }
    case "required": {
      const mode = spanMode(st, block.finding);
      return [
        {
          t: "required",
          topic: block.topic,
          label: block.label,
          segs: mode === "applied" ? parseInline(st, block.text, { findingId: block.finding, kind: "fixed" }) : [],
          finding: block.finding,
          state: mode === "off" ? "dismissed" : mode,
        },
      ];
    }
  }
}

export function blockSegs(block: RBlock): Seg[] {
  switch (block.t) {
    case "p":
    case "panel":
    case "required":
      return block.segs;
    case "list":
      return block.items.flat();
    case "steps":
      return block.items.flatMap((i) => i.segs);
    case "table":
      return block.rows.flat(2);
  }
}

export function resolveDocument(st: GState): RSection[] {
  return UCG.map((section) => {
    const blocks = section.blocks.flatMap((b) => resolveBlock(st, b));
    const factCount = blocks.reduce((n, b) => n + blockSegs(b).filter((s) => s.kind === "fact").length, 0);
    return { id: section.id, title: section.title, blocks, factCount };
  });
}

// --- traceability ----------------------------------------------------------

export interface TraceRow {
  key: string;
  factId: string;
  sectionId: string;
  section: string;
  topic: string;
  sentence: string;
  shown: string;
}

export interface OrphanRow {
  findingId: string;
  section: string;
  sectionId: string;
  text: string;
  why: string;
}

const TRACE_RULES = new Set(["GRN-TRC-001", "GRN-TRC-002", "GRN-TRC-004"]);

function sentenceAround(segs: Seg[], index: number): string {
  const full = segs.map((s) => s.text).join("");
  const offset = segs.slice(0, index).reduce((n, s) => n + s.text.length, 0);
  const start = Math.max(full.lastIndexOf(". ", offset - 1) + 2, 0);
  let end = full.indexOf(". ", offset + segs[index].text.length);
  end = end === -1 ? full.length : end + 1;
  return full.slice(start < offset ? start : 0, end).trim();
}

export function traceMatrix(sections: RSection[]) {
  const rows: TraceRow[] = [];
  const orphans: OrphanRow[] = [];
  const seenOrphan = new Set<string>();
  for (const section of sections) {
    section.blocks.forEach((block, bi) => {
      const groups: Seg[][] =
        block.t === "list" ? block.items : block.t === "steps" ? block.items.map((i) => i.segs) : block.t === "table" ? block.rows.map((r) => r.flat()) : [block.segs];
      groups.forEach((segs, gi) => {
        segs.forEach((seg, si) => {
          if (seg.kind === "fact" && seg.factId) {
            rows.push({
              key: `${section.id}-${bi}-${gi}-${si}`,
              factId: seg.factId,
              sectionId: section.id,
              section: section.title,
              topic: block.topic,
              sentence: sentenceAround(segs, si),
              shown: seg.text,
            });
          }
          if (seg.kind === "finding" && seg.findingId && !seenOrphan.has(seg.findingId)) {
            const f = FINDINGS.find((x) => x.id === seg.findingId);
            if (f && TRACE_RULES.has(f.ruleId)) {
              seenOrphan.add(f.id);
              orphans.push({
                findingId: f.id,
                sectionId: section.id,
                section: section.title,
                text: seg.text,
                why: f.ruleId === "GRN-TRC-002" ? "Contradicts the record" : f.ruleId === "GRN-TRC-004" ? "Prohibited claim" : "No supporting fact",
              });
            }
          }
        });
      });
    });
  }
  const used = new Set(rows.map((r) => r.factId));
  const unusedRequired = FACTS.filter((f) => f.required && !used.has(f.id));
  const unused = FACTS.filter((f) => !used.has(f.id));
  const coverage = rows.length + orphans.length === 0 ? 100 : (rows.length / (rows.length + orphans.length)) * 100;
  return { rows, orphans, used, unusedRequired, unused, coverage };
}

// --- record checks ---------------------------------------------------------

export const editKey = (recordId: string, line: number) => `${recordId}:${line}`;

export function cellValue(st: GState, record: SourceRecord, line: number): string {
  const row = record.rows.find((r) => r.line === line);
  return st.recordEdits[editKey(record.id, line)] ?? row?.cells[record.editCol] ?? "";
}

export const recordEdited = (st: GState, record: SourceRecord) => record.rows.some((r) => st.recordEdits[editKey(record.id, r.line)] !== undefined);

export interface AgreeCheck {
  key: string;
  label: string;
  values: { recordId: string; ref: string; line: number; value: string }[];
  agrees: boolean;
}

export function agreementChecks(st: GState, modelId: string): AgreeCheck[] {
  const byKey = new Map<string, AgreeCheck["values"]>();
  for (const record of recordsForModel(modelId)) {
    for (const row of record.rows) {
      if (!row.agreeKey) continue;
      const list = byKey.get(row.agreeKey) ?? [];
      list.push({ recordId: record.id, ref: record.ref, line: row.line, value: cellValue(st, record, row.line) });
      byKey.set(row.agreeKey, list);
    }
  }
  return [...byKey.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key, values]) => ({
      key,
      label: AGREE_LABEL[key] ?? key,
      values,
      agrees: new Set(values.map((v) => numericToken(v.value))).size === 1,
    }));
}

export function inputChecks(st: GState, modelId: string): Check[] {
  const checks: Check[] = [];
  const records = recordsForModel(modelId);
  let n = 1;
  const push = (label: string, detail: string, status: CheckStatus) =>
    checks.push({ id: `C-${String(n++).padStart(2, "0")}`, stage: 1, label, detail, status, ruleIds: ["GRN-TRC-003"], findingIds: [] });
  for (const record of records) {
    const edited = recordEdited(st, record);
    push(`${record.name} recognised`, `${record.ref} · ${record.system}`, "pass");
    push(`${record.name} columns present`, record.columns.join(", "), "pass");
    push(
      `${record.name} released`,
      edited
        ? `${record.ref} was edited after release. The preview no longer matches the released revision ${record.rev}.`
        : record.state === "Released"
          ? `Revision ${record.rev}, released ${record.released}`
          : `State is ${record.state}. Only released records may be cited.`,
      edited || record.state !== "Released" ? "fail" : "pass",
    );
  }
  for (const agree of agreementChecks(st, modelId)) {
    push(
      `Records agree: ${agree.label.toLowerCase()}`,
      agree.agrees
        ? `${agree.values[0].value} in ${agree.values.map((v) => v.ref).join(", ")}`
        : agree.values.map((v) => `${v.ref} line ${v.line}: ${v.value}`).join(" · "),
      agree.agrees ? "pass" : "fail",
    );
  }
  const ecn = records.find((r) => r.kind === "ECN");
  if (ecn) push("ECN effectivity applied to the attribute report", `${ecn.ref} is reflected in the released attribute report`, "pass");
  const dvp = records.find((r) => r.kind === "DVP");
  if (dvp) {
    const failed = dvp.rows.filter((r) => r.flag === "fail");
    const open = dvp.rows.filter((r) => r.flag === "open");
    push(
      "DVP&R complete",
      failed.length + open.length === 0
        ? "Every test closed and passed"
        : `${failed.length} failed test${failed.length === 1 ? "" : "s"}${failed.length ? ` (${failed.map((r) => r.cells[0].split(" ")[0]).join(", ")})` : ""} and ${open.length} open. Claims that rest on them are held as prohibitions.`,
      failed.length + open.length === 0 ? "pass" : "warn",
    );
  }
  const cm = records.find((r) => r.kind === "CM");
  if (cm) {
    const pending = cm.rows.filter((r) => r.flag === "pending");
    push(
      "Compliance obligations closed",
      pending.length === 0 ? "Every obligation closed" : `${pending.length} pending: ${pending.map((r) => `${r.cells[0]}, ${r.cells[2].toLowerCase()}`).join("; ")}`,
      pending.length === 0 ? "pass" : "warn",
    );
  }
  return checks;
}

/** Facts whose cited record line no longer contains their value. */
export function brokenFacts(st: GState) {
  return FACTS.filter((fact) => {
    const record = RECORDS.find((r) => r.modelId === LIVE_MODEL && r.kind === fact.recordKind);
    const row = record?.rows.find((r) => r.line === fact.line);
    if (!record || !row) return true;
    const cells = row.cells.map((c, i) => (i === record.editCol ? cellValue(st, record, row.line) : c));
    return !cells.join(" | ").toLowerCase().includes(fact.value.toLowerCase());
  });
}

export function allChecks(st: GState): Check[] {
  const stage1 = inputChecks(st, LIVE_MODEL);
  const broken = brokenFacts(st);
  const measured = FACTS.filter((f) => f.kind === "measured");
  const brokenMeasured = broken.filter((f) => f.kind === "measured");
  const stage2: Check[] = [
    {
      id: "C-24",
      stage: 2,
      label: `All ${measured.length} measured facts found in the record they cite`,
      detail: brokenMeasured.length
        ? `${brokenMeasured.map((f) => f.id).join(", ")} no longer match${brokenMeasured.length === 1 ? "es" : ""} the cited line.`
        : `${measured.length} of ${measured.length} values match their source line character for character`,
      status: brokenMeasured.length ? "fail" : "pass",
      ruleIds: ["GRN-TRC-003"],
      findingIds: [],
    },
    {
      id: "C-25",
      stage: 2,
      label: "Prohibitions and required statements captured",
      detail: `${CONSTRAINTS.filter((c) => c.kind === "prohibition").length} prohibitions and ${CONSTRAINTS.filter((c) => c.kind === "required").length} required statements, each with a source line`,
      status: "pass",
      ruleIds: ["GRN-TRC-004", "GRN-CMP-001"],
      findingIds: [],
    },
  ];
  const live = liveFindings(st);
  const stage3: Check[] = OUTPUT_CHECKS.map((def) => {
    const mine = live.filter((f) => def.ruleIds.includes(f.ruleId));
    const active = mine.filter((f) => f.active);
    const allOff = def.ruleIds.every((r) => !ruleOn(st, r));
    const status: CheckStatus = active.some((f) => f.state.status === "applying")
      ? "running"
      : active.some((f) => isBlocking(f.severity))
        ? "fail"
        : active.length
          ? "warn"
          : "pass";
    return {
      id: def.id,
      stage: 3,
      label: def.label,
      detail: allOff ? "Rule switched off in the rule library. Not checked." : active.length ? active.map((f) => `${f.id} ${f.title}`).join(" · ") : def.pass,
      status,
      ruleIds: def.ruleIds,
      findingIds: active.map((f) => f.id),
    };
  });
  return [...stage1, ...stage2, ...stage3];
}

export interface Verdict {
  ready: boolean;
  signed: boolean;
  fails: number;
  warns: number;
  passes: number;
  running: boolean;
  label: string;
  detail: string;
  tone: "error" | "success" | "info";
}

export function verdictOf(st: GState, checks: Check[]): Verdict {
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const running = checks.some((c) => c.status === "running");
  const passes = checks.filter((c) => c.status === "pass").length;
  const signed = Boolean(st.signed[LIVE_DOC]);
  const ready = fails === 0 && !running;
  if (signed) {
    return { ready: true, signed, fails, warns, passes, running, tone: "success", label: "Signed off", detail: `Approved by ${st.signed[LIVE_DOC].by}, ${st.signed[LIVE_DOC].at}. Released to publishing.` };
  }
  if (running) return { ready: false, signed, fails, warns, passes, running, tone: "info", label: "Re-running checks", detail: "The affected rules are running against the revised text." };
  if (ready) {
    return {
      ready,
      signed,
      fails,
      warns,
      passes,
      running,
      tone: "success",
      label: "Ready for sign-off",
      detail: `No DANGER or WARNING finding remains. ${warns} check${warns === 1 ? "" : "s"} carry advisories. A named technical author must approve before issue.`,
    };
  }
  return {
    ready,
    signed,
    fails,
    warns,
    passes,
    running,
    tone: "error",
    label: `Not ready to issue. ${fails} check${fails === 1 ? "" : "s"} fail`,
    detail: `${passes} of ${checks.length} checks pass, ${warns} warn. Clear every DANGER and WARNING finding before sign-off.`,
  };
}

// --- topics and translation memory ----------------------------------------

export interface LiveTopic extends Topic {
  restored: boolean;
  /** Disposition after any restore to predecessor wording. */
  effective: Topic["disposition"];
}

export function liveTopics(st: GState): LiveTopic[] {
  return TOPICS.map((t) => {
    const restored = Boolean(t.reworded) && st.restoredTopics.includes(t.id);
    return { ...t, restored, effective: restored ? "carried" : t.disposition };
  });
}

/** Share of a topic's words that match exactly, fuzzily or not at all. */
function tmSplit(topic: LiveTopic, lang: Lang): [number, number, number] {
  if (topic.effective === "carried") return [1, 0, 0];
  if (topic.effective === "revised") return topic.reworded ? [0.1, 0.85, 0.05] : [0.75, 0.15, 0.1];
  if (lang === "fr-CA" && SHARED_FR.includes(topic.id)) return [1, 0, 0];
  return [0, 0.1, 0.9];
}

export interface Leverage {
  lang: Lang;
  exact: number;
  fuzzy: number;
  fresh: number;
  total: number;
  pct: number;
  cost: number;
  touched: number;
}

export function leverage(st: GState, lang: Lang, doc?: DocTypeId): Leverage {
  const topics = liveTopics(st).filter((t) => (doc ? t.doc === doc : true) && (t.langs.includes(lang) || MISSING_FR.includes(t.id)));
  let exact = 0;
  let fuzzy = 0;
  let fresh = 0;
  let touched = 0;
  for (const t of topics) {
    const [e, f, n] = tmSplit(t, lang);
    exact += t.words * e;
    fuzzy += t.words * f;
    fresh += t.words * n;
    if (e < 1) touched += 1;
  }
  const total = exact + fuzzy + fresh;
  return {
    lang,
    exact: Math.round(exact),
    fuzzy: Math.round(fuzzy),
    fresh: Math.round(fresh),
    total: Math.round(total),
    pct: total ? (exact / total) * 100 : 0,
    cost: exact * RATES.exactWord + fuzzy * RATES.fuzzyWord + fresh * RATES.newWord + touched * RATES.touchPerTopicLang,
    touched,
  };
}

/** What one unnecessary rewrite of a carry-over topic costs, per language. */
export function rewordingTax(words: number): number {
  const reworded = words * (0.1 * RATES.exactWord + 0.85 * RATES.fuzzyWord + 0.05 * RATES.newWord);
  return reworded - words * RATES.exactWord + RATES.touchPerTopicLang;
}

export function reuseSummary(st: GState, doc: DocTypeId) {
  const topics = liveTopics(st).filter((t) => t.doc === doc);
  const words = topics.reduce((n, t) => n + t.words, 0);
  const by = (d: Topic["disposition"]) => topics.filter((t) => t.effective === d);
  const w = (d: Topic["disposition"]) => by(d).reduce((n, t) => n + t.words, 0);
  return {
    topics,
    words,
    carried: by("carried").length,
    revised: by("revised").length,
    fresh: by("new").length,
    carriedWords: w("carried"),
    revisedWords: w("revised"),
    newWords: w("new"),
    carriedPct: words ? (w("carried") / words) * 100 : 0,
    reworded: topics.filter((t) => t.reworded && !t.restored),
  };
}

// --- literature set --------------------------------------------------------

export function liveDocs(st: GState): LitDoc[] {
  const live = liveFindings(st).filter((f) => f.active);
  const checks = allChecks(st);
  const verdict = verdictOf(st, checks);
  const trace = traceMatrix(resolveDocument(st));
  const reuse = reuseSummary(st, "UCG");
  const openSets = new Map<string, string>();
  for (const ecn of ECNS) if (st.revisionSets.includes(ecn.id)) for (const i of ecn.impacts) openSets.set(i.docId, ecn.id);
  return DOCS.map((doc) => {
    let next = doc;
    if (doc.id === LIVE_DOC) {
      const count = (s: Finding["severity"]) => live.filter((f) => f.severity === s).length;
      next = {
        ...doc,
        findings: { danger: count("DANGER"), warning: count("WARNING"), caution: count("CAUTION"), notice: count("NOTICE") },
        traceCoverage: Math.round(trace.coverage * 10) / 10,
        reusePct: Math.round(reuse.carriedPct),
        stage: verdict.ready ? "verified" : "drafted",
        pctGenerated: st.run.status === "running" && st.run.typeId === "UCG" && st.run.modelId === LIVE_MODEL ? Math.round((Math.max(0, st.run.step - 2) / 12) * 100) : 100,
      };
    }
    const setEcn = openSets.get(doc.id);
    if (setEcn) next = { ...next, note: `In revision set RS-${setEcn.slice(4)}`, stage: stageIndex(next.stage) >= 6 ? "drafted" : next.stage };
    if (st.docStage[doc.id]) next = { ...next, stage: st.docStage[doc.id] };
    if (st.docNote[doc.id]) next = { ...next, note: st.docNote[doc.id] };
    return next;
  });
}

export const blockingCount = (doc: LitDoc) => doc.findings.danger + doc.findings.warning;

/** Not yet released and carrying a blocking finding, or released and now contradicted. */
export const isBlocked = (doc: LitDoc) => (stageIndex(doc.stage) < 6 && stageIndex(doc.stage) >= 2 && blockingCount(doc) > 0) || (doc.stale && stageIndex(doc.stage) >= 6);

export function blockerReason(doc: LitDoc): string {
  if (doc.stale && stageIndex(doc.stage) >= 6) return `Published text contradicts ${doc.staleEcn}`;
  if (doc.findings.danger) return `${doc.findings.danger} DANGER, ${doc.findings.warning} WARNING open`;
  return `${doc.findings.warning} WARNING open`;
}

export const docStatusLabel = (doc: LitDoc): string => {
  if (doc.stale && stageIndex(doc.stage) >= 6) return "Needs revision";
  const i = stageIndex(doc.stage);
  if (i <= 1) return i === 0 ? "Not started" : "Facts extracted";
  if (i === 2) return blockingCount(doc) > 0 || doc.note ? "Needs revision" : "In draft";
  return STAGES[i].label;
};

export const docStatusTone = (doc: LitDoc) => {
  const label = docStatusLabel(doc);
  if (label === "Needs revision") return "error" as const;
  if (label === "In draft" || label === "Facts extracted") return "warning" as const;
  if (label === "Not started") return "neutral" as const;
  if (label === "Published" || label === "Translated" || label === "Signed off") return "success" as const;
  return "info" as const;
};

export function signoffQueue(docs: LitDoc[]) {
  return docs.filter((d) => d.stage === "verified" || d.stage === "in-review");
}

export function ecnState(st: GState, ecnId: string): "Waiting on literature" | "Revision set open" {
  return st.revisionSets.includes(ecnId) ? "Revision set open" : "Waiting on literature";
}

export function dashboardKpis(st: GState, docs: LitDoc[]) {
  const inFlight = docs.filter((d) => stageIndex(d.stage) >= 2);
  const blocked = docs.filter(isBlocked);
  const danger = docs.reduce((n, d) => n + d.findings.danger, 0);
  const words = inFlight.reduce((n, d) => n + d.words, 0) || 1;
  const coverage = inFlight.reduce((n, d) => n + d.traceCoverage * d.words, 0) / words;
  const reuse = inFlight.reduce((n, d) => n + d.reusePct * d.words, 0) / words;
  /** Exact-match words not sent for fresh translation, across market languages. */
  const avoided = inFlight.reduce((n, d) => n + d.words * (d.reusePct / 100) * (d.langs.length - 1) * (RATES.newWord - RATES.exactWord), 0);
  const waiting = ECNS.filter((e) => !st.revisionSets.includes(e.id));
  return { blocked: blocked.length, danger, coverage, reuse, avoided, waiting: waiting.length, ecnDays: 12 };
}

export { ruleById };
