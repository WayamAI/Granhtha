/**
 * Deterministic synthetic dataset: Northfield Appliances (fictional).
 *
 * No randomness and no clock reads: every value is either written out or
 * derived from a string hash, so server and client render the same thing.
 */

import type {
  DocTypeDef,
  DocTypeId,
  FindingCounts,
  FlowStage,
  Lang,
  LitDoc,
  Person,
  ProductModel,
} from "./types";

export const TODAY = "2026-10-12";
export const LIVE_MODEL = "NTL-6157";
export const LIVE_DOC = "NTL-6157-UCG";

/** FNV-1a, enough to spread seeded values. */
export function seed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// --- people ----------------------------------------------------------------

export const PEOPLE: Person[] = [
  { id: "ivarga", name: "Ilse Varga", role: "Senior technical author, Laundry", initials: "IV" },
  { id: "dokafor", name: "Devan Okafor", role: "Technical author, Laundry", initials: "DO" },
  { id: "smirza", name: "Sana Mirza", role: "Technical author, Kitchen", initials: "SM" },
  { id: "obrandt", name: "Owen Brandt", role: "Technical author, Refrigeration", initials: "OB" },
  { id: "msolheim", name: "Marit Solheim", role: "Documentation manager", initials: "MS" },
  { id: "pnambiar", name: "Priya Nambiar", role: "Compliance and regulatory", initials: "PN" },
  { id: "rquintero", name: "Rafael Quintero", role: "Localisation lead", initials: "RQ" },
  { id: "haalto", name: "Henrik Aalto", role: "Service content owner", initials: "HA" },
  { id: "cfortin", name: "Camille Fortin", role: "fr-CA reviewer", initials: "CF" },
  { id: "lbarrera", name: "Lucía Barrera", role: "es-MX reviewer", initials: "LB" },
];

export const personName = (id?: string) => PEOPLE.find((p) => p.id === id)?.name ?? "Unassigned";

// --- model line ------------------------------------------------------------

export const MODELS: ProductModel[] = [
  {
    id: "NTL-6157",
    name: "5.3 cu ft top-load washer, connected",
    family: "Top-load washer",
    line: "Laundry",
    status: "In production",
    supersedes: "NTL-8127",
    plmRev: "A.3",
    ownerId: "ivarga",
    specs: [],
  },
  {
    id: "NTL-4105",
    name: "4.5 cu ft top-load washer",
    family: "Top-load washer",
    line: "Laundry",
    status: "In production",
    supersedes: "NTL-4090",
    plmRev: "C.1",
    ownerId: "dokafor",
    specs: [
      ["Capacity", "4.5", "cu ft"],
      ["Max dry load", "18", "lb"],
      ["Cabinet width", "27.25", "in"],
      ["Cabinet depth", "27.0", "in"],
      ["Supply voltage", "120", "V"],
      ["Max spin speed", "770", "RPM"],
      ["Water pressure", "20–100", "psi"],
      ["Number of cycles", "10", ""],
    ],
  },
  {
    id: "NFL-4420",
    name: "4.8 cu ft front-load washer, connected",
    family: "Front-load washer",
    line: "Laundry",
    status: "Pilot build",
    supersedes: "NFL-4310",
    plmRev: "B.2",
    ownerId: "ivarga",
    specs: [
      ["Capacity", "4.8", "cu ft"],
      ["Max dry load", "20", "lb"],
      ["Cabinet width", "27.0", "in"],
      ["Cabinet depth", "31.5", "in"],
      ["Supply voltage", "120", "V"],
      ["Max spin speed", "1,200", "RPM"],
      ["Water pressure", "20–100", "psi"],
      ["Radio band", "2.4", "GHz"],
    ],
  },
  {
    id: "NDE-7240",
    name: "7.4 cu ft electric dryer",
    family: "Electric dryer",
    line: "Laundry",
    status: "In production",
    supersedes: "NDE-7100",
    plmRev: "D.0",
    ownerId: "dokafor",
    specs: [
      ["Capacity", "7.4", "cu ft"],
      ["Supply voltage", "240", "V"],
      ["Circuit rating", "30", "A"],
      ["Heater power", "5,400", "W"],
      ["Cabinet width", "27.0", "in"],
      ["Cabinet depth", "29.5", "in"],
      ["Max exhaust length, rigid duct", "64", "ft"],
      ["Number of cycles", "9", ""],
    ],
  },
  {
    id: "NDG-7245",
    name: "7.4 cu ft gas dryer",
    family: "Gas dryer",
    line: "Laundry",
    status: "In production",
    supersedes: "NDG-7105",
    plmRev: "B.4",
    ownerId: "dokafor",
    specs: [
      ["Capacity", "7.4", "cu ft"],
      ["Supply voltage", "120", "V"],
      ["Burner input", "22,000", "BTU/h"],
      ["Gas supply pressure, natural", "5.2–10.5", "in. w.c."],
      ["Cabinet width", "27.0", "in"],
      ["Cabinet depth", "29.5", "in"],
      ["Max exhaust length, rigid duct", "54", "ft"],
      ["Number of cycles", "9", ""],
    ],
  },
  {
    id: "NDW-3380",
    name: "24 in built-in dishwasher, 44 dBA",
    family: "Dishwasher",
    line: "Kitchen",
    status: "Pilot build",
    supersedes: "NDW-3310",
    plmRev: "A.6",
    ownerId: "smirza",
    specs: [
      ["Place settings", "14", ""],
      ["Sound level", "44", "dBA"],
      ["Supply voltage", "120", "V"],
      ["Cutout width", "24.0", "in"],
      ["Cutout height, min", "33.5", "in"],
      ["Water pressure", "20–120", "psi"],
      ["Inlet water temperature, min", "120", "°F"],
      ["Estimated yearly electricity", "239", "kWh"],
    ],
  },
  {
    id: "NRF-2865",
    name: "28 cu ft French-door refrigerator",
    family: "Refrigerator",
    line: "Refrigeration",
    status: "Launch Q1 2027",
    supersedes: "NRF-2740",
    plmRev: "A.2",
    ownerId: "obrandt",
    specs: [
      ["Total capacity", "28.0", "cu ft"],
      ["Refrigerant", "R-600a", ""],
      ["Refrigerant charge", "62", "g"],
      ["Supply voltage", "115", "V"],
      ["Cabinet width", "35.75", "in"],
      ["Depth with handles", "36.25", "in"],
      ["Water filter life", "6", "months"],
      ["Estimated yearly electricity", "728", "kWh"],
    ],
  },
  {
    id: "NRB-1940",
    name: "19 cu ft bottom-freezer refrigerator",
    family: "Refrigerator",
    line: "Refrigeration",
    status: "In production",
    supersedes: "NRB-1910",
    plmRev: "E.1",
    ownerId: "obrandt",
    specs: [
      ["Total capacity", "19.2", "cu ft"],
      ["Refrigerant", "R-600a", ""],
      ["Refrigerant charge", "54", "g"],
      ["Supply voltage", "115", "V"],
      ["Cabinet width", "29.75", "in"],
      ["Depth with handles", "33.5", "in"],
      ["Door swing clearance", "2.5", "in"],
      ["Estimated yearly electricity", "521", "kWh"],
    ],
  },
];

export const modelById = (id: string) => MODELS.find((m) => m.id === id) ?? MODELS[0];

// --- document types --------------------------------------------------------

const ALL: Lang[] = ["en-US", "fr-CA", "es-MX"];
const NA: Lang[] = ["en-US", "fr-CA"];

export const DOC_TYPES: DocTypeDef[] = [
  { id: "UCG", name: "Use & Care Guide", audience: "Consumer", basePages: 36, langs: ALL, prefix: "N1178" },
  { id: "II", name: "Installation Instructions", audience: "Installer", basePages: 16, langs: ALL, prefix: "N1179" },
  { id: "QSG", name: "Quick Start Guide", audience: "Consumer", basePages: 2, langs: ALL, prefix: "N1180" },
  { id: "DG", name: "Dimension Guide", audience: "Trade", basePages: 2, langs: NA, prefix: "N1181" },
  { id: "EL", name: "Energy label", audience: "Consumer", basePages: 1, langs: NA, prefix: "N1182" },
  { id: "PSS", name: "Product Specification Sheet", audience: "Trade", basePages: 2, langs: NA, prefix: "N1183" },
  { id: "WAR", name: "Warranty", audience: "Consumer", basePages: 2, langs: ALL, prefix: "N1184" },
  { id: "TS", name: "Tech Sheet", audience: "Technician", basePages: 4, langs: NA, prefix: "N1185" },
  { id: "SM", name: "Service Manual", audience: "Technician", basePages: 64, langs: NA, prefix: "N1186" },
  { id: "IPC", name: "Illustrated Parts Catalog", audience: "Technician", basePages: 28, langs: ["en-US"], prefix: "N1187" },
];

export const docType = (id: DocTypeId) => DOC_TYPES.find((d) => d.id === id) ?? DOC_TYPES[0];

export const STAGES: { id: FlowStage; label: string; hint: string }[] = [
  { id: "records-in", label: "Records in", hint: "Released records received, nothing extracted" },
  { id: "extracted", label: "Extracted", hint: "Fact base built, no draft yet" },
  { id: "drafted", label: "Drafted", hint: "Draft exists, checks not all passing" },
  { id: "verified", label: "Verified", hint: "All blocking checks pass" },
  { id: "in-review", label: "In review", hint: "With the named author" },
  { id: "signed-off", label: "Signed off", hint: "Approved, waiting on release" },
  { id: "published", label: "Published", hint: "Released in the source language" },
  { id: "translated", label: "Translated", hint: "Released in every market language" },
];

export const stageIndex = (stage: FlowStage) => STAGES.findIndex((s) => s.id === stage);
export const stageLabel = (stage: FlowStage) => STAGES[stageIndex(stage)]?.label ?? stage;

// --- literature set --------------------------------------------------------

/** Stage per model, one digit per document type in DOC_TYPES order. */
const STAGE_MATRIX: Record<string, string> = {
  "NTL-6157": "2222627100",
  "NTL-4105": "7777767646",
  "NFL-4420": "3426657210",
  "NDE-7240": "7767777546",
  "NDG-7245": "6767767432",
  "NDW-3380": "4536267321",
  "NRF-2865": "3445627110",
  "NRB-1940": "7777777665",
};

/** Published documents that an open engineering change has since contradicted. */
const STALE: Record<string, string> = {
  "NTL-4105-TS": "ECN-4533",
  "NTL-4105-IPC": "ECN-4533",
  "NDG-7245-II": "ECN-4548",
  "NDG-7245-UCG": "ECN-4548",
  "NDG-7245-QSG": "ECN-4548",
  "NFL-4420-DG": "ECN-4502",
  "NFL-4420-EL": "ECN-4502",
};

const OWNER_BY_TYPE: Partial<Record<DocTypeId, string>> = {
  TS: "haalto",
  SM: "haalto",
  IPC: "haalto",
  EL: "pnambiar",
  WAR: "pnambiar",
};

const DUE = ["2026-10-14", "2026-10-16", "2026-10-19", "2026-10-21", "2026-10-23", "2026-10-27", "2026-10-30", "2026-11-04"];

function countsFor(stage: number, s: number, stale: boolean, safety: boolean): FindingCounts {
  if (stale) return { danger: safety ? 1 : 0, warning: 1 + (s % 3), caution: s % 2, notice: 0 };
  if (stage <= 1) return { danger: 0, warning: 0, caution: 0, notice: 0 };
  if (stage === 2) return { danger: s % 3, warning: 1 + (s % 4), caution: (s >>> 3) % 5, notice: (s >>> 5) % 3 };
  if (stage <= 5) return { danger: 0, warning: 0, caution: (s >>> 3) % 3, notice: (s >>> 5) % 2 };
  return { danger: 0, warning: 0, caution: 0, notice: 0 };
}

const STAGE_IDS = STAGES.map((s) => s.id);

function buildDocs(): LitDoc[] {
  const docs: LitDoc[] = [];
  MODELS.forEach((model, mi) => {
    DOC_TYPES.forEach((type, ti) => {
      const id = `${model.id}-${type.id}`;
      const s = seed(id);
      const stageNo = Number(STAGE_MATRIX[model.id][ti]);
      const staleEcn = STALE[id];
      const stale = staleEcn !== undefined && staleEcn !== "" && stageNo >= 6;
      const pages = Math.max(1, type.basePages + (type.basePages > 4 ? (s % 9) - 4 : 0));
      const words = type.id === "UCG" && model.id === LIVE_MODEL ? 4106 : pages * (type.basePages > 4 ? 114 : 180) + (s % 60);
      const pct = stageNo === 0 ? 0 : stageNo === 1 ? 12 + (s % 9) : stageNo === 2 ? 62 + (s % 34) : 100;
      docs.push({
        id,
        modelId: model.id,
        type: type.id,
        title: `${type.name}, ${model.id}`,
        docNumber: `${type.prefix}${String(9021 + mi * 37 + ti * 3).padStart(4, "0")}`,
        rev: `Rev. ${"ABCDE"[(s >>> 2) % (stageNo >= 6 ? 4 : 2)]}`,
        stage: STAGE_IDS[stageNo],
        stale,
        staleEcn: stale ? staleEcn : undefined,
        pages,
        words,
        langs: type.langs,
        pctGenerated: pct,
        findings: countsFor(stageNo, s, stale, staleEcn === "ECN-4548"),
        traceCoverage: stageNo <= 1 ? 0 : stageNo === 2 ? 84 + (s % 12) : stale ? 91 + (s % 5) : 100,
        reusePct: 38 + (s % 41),
        ownerId: OWNER_BY_TYPE[type.id] ?? model.ownerId,
        due: DUE[(s >>> 4) % DUE.length],
        live: id === LIVE_DOC,
      });
    });
  });
  return docs;
}

/** Hand-set details for the model the demo carries in depth. */
const OVERRIDES: Record<string, Partial<LitDoc>> = {
  "NTL-6157-UCG": { docNumber: "N11789021", rev: "Rev. A", pages: 36, pctGenerated: 100, reusePct: 49, due: "2026-10-16" },
  "NTL-6157-II": {
    docNumber: "N11799024",
    rev: "Rev. A",
    pages: 16,
    pctGenerated: 88,
    findings: { danger: 1, warning: 3, caution: 2, notice: 1 },
    note: "Cabinet depth and water pressure still carry predecessor values.",
  },
  "NTL-6157-QSG": { pctGenerated: 74, findings: { danger: 0, warning: 2, caution: 1, notice: 0 } },
  "NTL-6157-DG": {
    pctGenerated: 96,
    findings: { danger: 0, warning: 1, caution: 0, notice: 0 },
    note: "Depth dimension drawn at 27.5 in. ECN-4471 sets 28.0 in.",
  },
  "NTL-6157-PSS": { pctGenerated: 81, findings: { danger: 0, warning: 2, caution: 1, notice: 1 } },
  "NTL-6157-TS": { pctGenerated: 18 },
};

export const DOCS: LitDoc[] = buildDocs().map((doc) => ({ ...doc, ...(OVERRIDES[doc.id] ?? {}) }));

export const docById = (id: string) => DOCS.find((d) => d.id === id);

// --- generate catalogue ----------------------------------------------------

export interface CatalogueType {
  id: string;
  group: "Technical literature" | "Engineering records";
  name: string;
  audience: string;
  rules: string;
  sections: string[];
}

export const UCG_SECTIONS = [
  "Washer Safety",
  "Important Safety Instructions",
  "Parts and Features",
  "Control Panel and Features",
  "Connecting Your Washer to Wi-Fi",
  "Starting Your Washer",
  "Cycle Guide",
  "Using the Dispensers",
  "Loading Recommendations",
  "Washer Care",
  "Troubleshooting",
  "Assistance or Service",
];

export const CATALOGUE: CatalogueType[] = [
  { id: "UCG", group: "Technical literature", name: "Use & Care Guide", audience: "Consumer", rules: "Plain language, reading grade 8. Safety messages in ANSI Z535.6 form.", sections: UCG_SECTIONS },
  { id: "II", group: "Technical literature", name: "Installation Instructions", audience: "Installer", rules: "Numbered steps, one action each. Tools and parts listed before step 1.", sections: ["Installation Safety", "Tools and Parts", "Location Requirements", "Connect and Level", "Installation Checklist"] },
  { id: "PSS", group: "Technical literature", name: "Product Specification Sheet", audience: "Trade", rules: "Tabular. Every value with unit and tolerance as recorded.", sections: ["Dimensions and Clearances", "Electrical and Water", "Capacity and Performance"] },
  { id: "SM", group: "Technical literature", name: "Service Manual", audience: "Technician", rules: "Simplified Technical English. Hazard statements before the step.", sections: ["Service Safety", "Product Identification", "Theory of Operation", "Diagnostic Mode", "Fault Codes", "Component Access", "Component Testing", "Wiring Diagram"] },
  { id: "TSP", group: "Technical literature", name: "Technical Service Pointer", audience: "Technician", rules: "One concern, one cause, one correction.", sections: ["Concern", "Cause", "Correction"] },
  { id: "CIR", group: "Technical literature", name: "Change Impact Report", audience: "Documentation manager", rules: "Lists every document object an engineering change touches.", sections: ["Change Summary", "Affected Documents", "Affected Topics and Languages", "Reissue Plan"] },
  { id: "PRD", group: "Engineering records", name: "Product Requirements Document", audience: "Programme team", rules: "Each requirement uniquely numbered and testable.", sections: ["Scope", "Users and Use Cases", "Functional Requirements", "Regulatory Requirements"] },
  { id: "CTD", group: "Engineering records", name: "Competitive Teardown", audience: "Engineering", rules: "Measured values only, with instrument and date.", sections: ["Units Compared", "Construction", "Performance", "Cost Observations"] },
  { id: "DFMEA", group: "Engineering records", name: "Design FMEA", audience: "Design engineering", rules: "AIAG-VDA form: function, failure, effect, cause, controls.", sections: ["Structure Analysis", "Function Analysis", "Failure Analysis", "Risk Analysis", "Optimisation"] },
  { id: "CSM", group: "Engineering records", name: "Concept Selection Matrix", audience: "Engineering", rules: "Pugh matrix against a stated datum.", sections: ["Criteria", "Concepts", "Scoring", "Selection"] },
  { id: "EBOM", group: "Engineering records", name: "Engineering BOM", audience: "Design engineering", rules: "Indented, with find numbers and effectivity.", sections: ["Assembly Structure", "Effectivity", "Alternates"] },
  { id: "MBOM", group: "Engineering records", name: "Manufacturing BOM", audience: "Manufacturing", rules: "Plant-specific, with operation and work centre.", sections: ["Plant Structure", "Operations", "Phantoms and Kits"] },
  { id: "SBOM", group: "Engineering records", name: "Service BOM", audience: "Service", rules: "Serviceable parts only, with supersession chain.", sections: ["Serviceable Assemblies", "Supersessions", "Kits"] },
  { id: "DVPR", group: "Engineering records", name: "DVP&R", audience: "Test engineering", rules: "Each test with method, acceptance criterion, sample size and result.", sections: ["Test Plan", "Results", "Open Items"] },
  { id: "EMC", group: "Engineering records", name: "EMC & Radio Test Report", audience: "Compliance", rules: "47 CFR Part 15 and RSS-247 measurements with limits.", sections: ["Equipment Under Test", "Conducted Emissions", "Radiated Emissions", "Radio Parameters"] },
  { id: "RTM", group: "Engineering records", name: "Requirements Traceability Matrix", audience: "Systems engineering", rules: "Requirement to design to test, no orphan rows.", sections: ["Requirements", "Design Elements", "Verification"] },
  { id: "PFMEA", group: "Engineering records", name: "Process FMEA", audience: "Manufacturing", rules: "AIAG-VDA form by process step.", sections: ["Process Steps", "Failure Analysis", "Risk Analysis", "Optimisation"] },
  { id: "CP", group: "Engineering records", name: "Control Plan", audience: "Quality", rules: "Characteristic, method, frequency, reaction plan.", sections: ["Process Characteristics", "Product Characteristics", "Reaction Plans"] },
  { id: "WI", group: "Engineering records", name: "Work Instruction", audience: "Line operator", rules: "One action per step, with torque and tool.", sections: ["Station Setup", "Assembly Steps", "Checks"] },
  { id: "RCD", group: "Engineering records", name: "Regulatory Compliance Dossier", audience: "Compliance", rules: "One section per market obligation with evidence reference.", sections: ["Markets", "Safety", "EMC and Radio", "Energy", "Chemical"] },
  { id: "QAM", group: "Engineering records", name: "QA Matrix", audience: "Quality", rules: "Defect mode against detection station.", sections: ["Defect Modes", "Detection Stations", "Escapes"] },
  { id: "8D", group: "Engineering records", name: "8D Report", audience: "Quality", rules: "Eight disciplines, root cause verified before closure.", sections: ["Problem", "Containment", "Root Cause", "Corrective Action", "Prevention"] },
];

export const LANG_LABEL: Record<Lang, string> = {
  "en-US": "English (US)",
  "fr-CA": "French (Canada)",
  "es-MX": "Spanish (Mexico)",
};
