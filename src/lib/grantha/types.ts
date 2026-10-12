/** Shared types for the Grantha dataset. */

export type Severity = "DANGER" | "WARNING" | "CAUTION" | "NOTICE";

export type FlowStage =
  | "records-in"
  | "extracted"
  | "drafted"
  | "verified"
  | "in-review"
  | "signed-off"
  | "published"
  | "translated";

export type DocTypeId =
  | "UCG"
  | "II"
  | "QSG"
  | "DG"
  | "EL"
  | "PSS"
  | "WAR"
  | "TS"
  | "SM"
  | "IPC";

export type Lang = "en-US" | "fr-CA" | "es-MX";

export interface Person {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface ProductModel {
  id: string;
  name: string;
  family: "Top-load washer" | "Front-load washer" | "Electric dryer" | "Gas dryer" | "Dishwasher" | "Refrigerator";
  line: "Laundry" | "Kitchen" | "Refrigeration";
  status: "In production" | "Pilot build" | "Launch Q1 2027";
  supersedes: string;
  plmRev: string;
  ownerId: string;
  /** Headline attributes used to build the item attribute report preview. */
  specs: [label: string, value: string, unit: string][];
}

export interface DocTypeDef {
  id: DocTypeId;
  name: string;
  audience: string;
  basePages: number;
  langs: Lang[];
  prefix: string;
}

export interface FindingCounts {
  danger: number;
  warning: number;
  caution: number;
  notice: number;
}

export interface LitDoc {
  id: string;
  modelId: string;
  type: DocTypeId;
  title: string;
  docNumber: string;
  rev: string;
  stage: FlowStage;
  /** Published once, but an engineering change has since moved the record. */
  stale: boolean;
  staleEcn?: string;
  pages: number;
  words: number;
  langs: Lang[];
  pctGenerated: number;
  findings: FindingCounts;
  traceCoverage: number;
  reusePct: number;
  ownerId: string;
  due: string;
  /** True for the one document whose text is carried in full. */
  live: boolean;
  note?: string;
}

export interface SourceRecord {
  id: string;
  modelId: string;
  kind: "IAR" | "BOM" | "ECN" | "CM" | "DVP";
  name: string;
  system: string;
  ref: string;
  rev: string;
  state: "Released" | "In work" | "Under review";
  released: string;
  ownerDept: string;
  columns: string[];
  /** Index of the column an author may overtype in the preview. */
  editCol: number;
  rows: RecordRow[];
}

export interface RecordRow {
  line: number;
  cells: string[];
  /** Rows sharing a key across records must state the same value. */
  agreeKey?: string;
  flag?: "fail" | "open" | "pending";
}

export interface Fact {
  id: string;
  label: string;
  value: string;
  unit: string;
  kind: "measured" | "descriptive";
  category: string;
  recordKind: SourceRecord["kind"];
  line: number;
  required?: boolean;
}

export interface Constraint {
  id: string;
  kind: "prohibition" | "required";
  title: string;
  detail: string;
  recordKind: SourceRecord["kind"];
  line: number;
  ruleId: string;
}

export type FindingStatus = "open" | "applying" | "applied" | "dismissed" | "waiver";

export interface Finding {
  id: string;
  severity: Severity;
  ruleId: string;
  origin: "drafted" | "inherited";
  title: string;
  detail: string;
  sectionId: string;
  topicId: string;
  evidence: string;
  proposedFix: string;
  /** Replacement markup for inline spans carrying this finding. */
  fixText?: string;
  confidence: number;
}

export interface FindingState {
  status: FindingStatus;
  reason?: string;
  assigneeId?: string;
}

export interface Rule {
  id: string;
  group: "Traceability" | "Completeness" | "Safety conformance" | "Terminology" | "Readability" | "Localisation";
  name: string;
  tests: string;
  clause: string;
  severity: Severity;
  /** Hits across the rest of the model line in the last 90 days. */
  lineHits: number;
}

export type CheckStatus = "pass" | "warn" | "fail" | "running";

export interface Check {
  id: string;
  stage: 1 | 2 | 3;
  label: string;
  detail: string;
  status: CheckStatus;
  ruleIds: string[];
  findingIds: string[];
}

export interface Topic {
  id: string;
  doc: DocTypeId;
  title: string;
  type: "Safety" | "Reference" | "Task" | "Concept";
  disposition: "carried" | "revised" | "new";
  /** A revision with no engineering reason behind it. */
  reworded?: boolean;
  reason?: string;
  reusedFrom?: string;
  words: number;
  langs: Lang[];
}

export interface EcnChange {
  attribute: string;
  from: string;
  to: string;
  factId?: string;
}

export interface EcnImpact {
  id: string;
  docId: string;
  topicId: string;
  kind: "Sentence" | "Table cell" | "Illustration callout" | "Safety message" | "Label" | "Parts row";
  where: string;
  text: string;
  langs: Lang[];
  action: string;
  words: number;
}

export interface Ecn {
  id: string;
  modelIds: string[];
  title: string;
  kind: "Dimension and performance" | "Connectivity" | "Part supersession" | "Safety limit" | "Energy label" | "Refrigerant charge";
  released: string;
  daysWaiting: number;
  safetyCritical: boolean;
  origin: string;
  changes: EcnChange[];
  impacts: EcnImpact[];
}

export interface Term {
  id: string;
  approved: string;
  definition: string;
  forbidden: string[];
  frCA: string;
  esMX: string;
  locked: boolean;
  occurrences: number;
  domain: string;
  findingId?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actorKind: "human" | "agent" | "rule";
  action: string;
  object: string;
  detail: string;
  href?: string;
}

export interface Insight {
  id: string;
  observation: string;
  cause: string;
  evidence: { label: string; detail: string }[];
  confidence: number;
  impact: string;
  recommendation: string;
  signer: string;
  href: string;
  cta: string;
}

/** Inline run of resolved document text. */
export interface Seg {
  text: string;
  kind: "plain" | "fact" | "finding" | "fixed" | "dismissed";
  factId?: string;
  findingId?: string;
}

export type SignalWord = Severity;

export type Block =
  | { t: "p"; topic: string; text: string; finding?: string; alt?: string }
  | { t: "steps"; topic: string; items: StepItem[] }
  | { t: "list"; topic: string; items: string[] }
  | {
      t: "panel";
      topic: string;
      word: SignalWord;
      hazard: string;
      text: string;
      symbol: boolean;
      finding?: string;
      /** Sentence appended once the finding's fix is applied. */
      append?: string;
    }
  | { t: "table"; topic: string; head: string[]; rows: string[][] }
  | { t: "required"; topic: string; label: string; text: string; finding: string };

export interface StepItem {
  text: string;
  finding?: string;
  /** Replacement steps once the finding's fix is applied. */
  alt?: string[];
  altNote?: string;
}

export interface DocSection {
  id: string;
  title: string;
  blocks: Block[];
}

export type RBlock =
  | { t: "p"; topic: string; segs: Seg[]; finding?: string; state?: FindingStatus }
  | { t: "steps"; topic: string; items: { segs: Seg[]; finding?: string; state?: FindingStatus }[] }
  | { t: "list"; topic: string; items: Seg[][] }
  | {
      t: "panel";
      topic: string;
      word: SignalWord;
      hazard: string;
      segs: Seg[];
      symbol: boolean;
      finding?: string;
      state?: FindingStatus;
    }
  | { t: "table"; topic: string; head: string[]; rows: Seg[][][] }
  | { t: "required"; topic: string; label: string; segs: Seg[]; finding: string; state: FindingStatus };

export interface RSection {
  id: string;
  title: string;
  blocks: RBlock[];
  factCount: number;
}
