/**
 * Engineering records and the fact base extracted from them.
 *
 * The item attribute report preview is generated from the facts that cite it,
 * so a fact's source line always exists in the record it names.
 */

import { LIVE_MODEL, MODELS, seed } from "./data";
import type { Constraint, Fact, RecordRow, SourceRecord } from "./types";

type FactRow = [id: string, label: string, value: string, unit: string, category: string, record: SourceRecord["kind"], line: number];

const MEASURED: FactRow[] = [
  ["SPEC-010", "Capacity", "5.3", "cu ft", "Capacity", "IAR", 12],
  ["SPEC-011", "Max dry load", "22", "lb", "Capacity", "IAR", 13],
  ["SPEC-020", "Cabinet width", "27.25", "in", "Dimensions", "IAR", 18],
  ["SPEC-021", "Cabinet depth", "28.0", "in", "Dimensions", "ECN", 1],
  ["SPEC-022", "Height to top of console", "42.5", "in", "Dimensions", "IAR", 20],
  ["SPEC-023", "Height with lid open", "57.0", "in", "Dimensions", "IAR", 21],
  ["SPEC-024", "Net weight", "142", "lb", "Dimensions", "IAR", 22],
  ["SPEC-030", "Supply voltage", "120", "V", "Electrical", "IAR", 26],
  ["SPEC-031", "Supply frequency", "60", "Hz", "Electrical", "IAR", 27],
  ["SPEC-032", "Branch circuit rating", "15", "A", "Electrical", "IAR", 28],
  ["SPEC-040", "Water pressure", "20–100", "psi", "Water", "IAR", 31],
  ["SPEC-041", "Inlet hose thread", "3/4", "in", "Water", "BOM", 15],
  ["SPEC-042", "Drain standpipe height, min", "39", "in", "Water", "IAR", 33],
  ["SPEC-043", "Drain standpipe height, max", "96", "in", "Water", "IAR", 34],
  ["SPEC-044", "Hot water inlet temperature, max", "140", "°F", "Water", "IAR", 35],
  ["SPEC-050", "Max spin speed", "850", "RPM", "Performance", "ECN", 2],
  ["SPEC-051", "Number of cycles", "12", "", "Controls", "IAR", 40],
  ["SPEC-052", "Soil levels", "4", "", "Controls", "IAR", 41],
  ["SPEC-053", "Water temperature settings", "5", "", "Controls", "IAR", 42],
  ["SPEC-060", "Radio band", "2.4", "GHz", "Connectivity", "IAR", 46],
  ["SPEC-070", "Normal cycle time", "52", "min", "Performance", "DVP", 1],
  ["SPEC-071", "Quick Wash cycle time", "28", "min", "Performance", "DVP", 2],
  ["SPEC-072", "Heavy Duty cycle time", "74", "min", "Performance", "DVP", 3],
  ["SPEC-073", "Clean Washer cycle time", "65", "min", "Performance", "DVP", 4],
  ["SPEC-074", "Delay start, max", "12", "hours", "Controls", "IAR", 43],
  ["SPEC-080", "Detergent reservoir volume", "48", "fl oz", "Dispensers", "BOM", 9],
  ["SPEC-081", "Fabric softener cup, max fill", "3.4", "fl oz", "Dispensers", "BOM", 10],
  ["SPEC-082", "Bleach cup, max fill", "8", "fl oz", "Dispensers", "BOM", 11],
  ["SPEC-090", "Leveling leg adjustment", "1.0", "in", "Installation", "IAR", 50],
  ["SPEC-091", "Ambient temperature, min", "32", "°F", "Installation", "IAR", 51],
  ["SPEC-093", "Clearance behind washer, min", "4", "in", "Installation", "IAR", 52],
  ["SPEC-094", "Clean Washer interval", "30", "cycles", "Care", "DVP", 7],
  ["SPEC-095", "Inlet hose replacement interval", "5", "years", "Care", "IAR", 55],
  ["SPEC-096", "Wi-Fi pairing hold time", "3", "seconds", "Connectivity", "IAR", 47],
  ["SPEC-100", "Integrated modified energy factor", "2.06", "IMEF", "Energy", "CM", 6],
  ["SPEC-102", "Estimated yearly electricity", "195", "kWh", "Energy", "CM", 7],
  ["SPEC-110", "Limited warranty, parts and labor", "1", "year", "Service", "IAR", 58],
  ["SPEC-111", "Limited warranty, drive motor", "10", "years", "Service", "IAR", 59],
];

const DESCRIPTIVE: FactRow[] = [
  ["ID-001", "Model number", "NTL-6157", "", "Identity", "IAR", 4],
  ["ID-002", "Product name", "Northfield 5.3 cu ft Top Load Washer", "", "Identity", "IAR", 5],
  ["ID-003", "Supersedes", "NTL-8127", "", "Identity", "IAR", 6],
  ["ID-004", "Document number", "N11789021 Rev. A", "", "Identity", "IAR", 7],
  ["ID-005", "Companion app name", "Northfield Home", "", "Connectivity", "IAR", 48],
  ["ID-006", "FCC ID", "2AXNF-WM24", "", "Connectivity", "CM", 4],
  ["ID-007", "ISED certification number", "27114-WM24", "", "Connectivity", "CM", 5],
  ["ID-008", "Wi-Fi standard", "IEEE 802.11 b/g/n", "", "Connectivity", "BOM", 13],
  ["ID-009", "Detergent type", "HE only", "", "Dispensers", "IAR", 44],
  ["ID-010", "Approved washer cleaner", "Brightwell Washer Cleaner", "", "Care", "IAR", 56],
  ["ID-011", "Drive system", "Direct drive", "", "Performance", "BOM", 6],
  ["ID-012", "Customer service phone", "1-800-555-0142", "", "Service", "IAR", 60],
  ["ID-013", "Service website", "northfield.example/service", "", "Service", "IAR", 61],
];

const REQUIRED_FACTS = new Set(["ID-006", "ID-007", "SPEC-030", "ID-001"]);

export const FACTS: Fact[] = [
  ...MEASURED.map(([id, label, value, unit, category, recordKind, line]) => ({
    id,
    label,
    value,
    unit,
    kind: "measured" as const,
    category,
    recordKind,
    line,
    required: REQUIRED_FACTS.has(id),
  })),
  ...DESCRIPTIVE.map(([id, label, value, unit, category, recordKind, line]) => ({
    id,
    label,
    value,
    unit,
    kind: "descriptive" as const,
    category,
    recordKind,
    line,
    required: REQUIRED_FACTS.has(id),
  })),
];

export const factById = (id: string) => FACTS.find((f) => f.id === id);

export const CONSTRAINTS: Constraint[] = [
  {
    id: "P-01",
    kind: "prohibition",
    title: "No loads-per-fill claim",
    detail: "Reservoir dosing count was not tested. No loads-per-fill claim is approved for this model.",
    recordKind: "DVP",
    line: 10,
    ruleId: "GRN-TRC-004",
  },
  {
    id: "P-02",
    kind: "prohibition",
    title: "No Wi-Fi range claim",
    detail: "Radio range was not characterised. The EMC report covers emissions and output power only.",
    recordKind: "DVP",
    line: 11,
    ruleId: "GRN-TRC-004",
  },
  {
    id: "P-03",
    kind: "prohibition",
    title: "No sanitise claim",
    detail: "No NSF P172 sanitisation test is planned. The word sanitise may not describe any cycle.",
    recordKind: "DVP",
    line: 12,
    ruleId: "GRN-TRC-004",
  },
  {
    id: "R-01",
    kind: "required",
    title: "FCC Part 15 Subpart B compliance statement",
    detail: "The user manual must carry the two-condition compliance statement and the FCC ID of the radio module.",
    recordKind: "CM",
    line: 3,
    ruleId: "GRN-CMP-001",
  },
  {
    id: "R-02",
    kind: "required",
    title: "ISED licence-exempt notice",
    detail: "The user manual must carry the RSS-Gen licence-exempt notice in English and French.",
    recordKind: "CM",
    line: 5,
    ruleId: "GRN-CMP-001",
  },
  {
    id: "R-03",
    kind: "required",
    title: "Grounding instructions",
    detail: "UL 2157 requires grounding instructions in the important safety instructions.",
    recordKind: "CM",
    line: 1,
    ruleId: "GRN-CMP-001",
  },
];

// --- record previews -------------------------------------------------------

const IAR_AGREE: Record<string, string> = { "SPEC-010": "capacity", "SPEC-011": "load", "SPEC-060": "band" };

function iarRows(): RecordRow[] {
  const rows: RecordRow[] = FACTS.filter((f) => f.recordKind === "IAR").map((f) => ({
    line: f.line,
    cells: [f.label, f.value, f.unit || "—", f.id],
    agreeKey: IAR_AGREE[f.id],
  }));
  rows.push({ line: 19, cells: ["Cabinet depth", "28.0", "in", "SPEC-021"], agreeKey: "depth" });
  rows.push({ line: 37, cells: ["Max spin speed", "850", "RPM", "SPEC-050"], agreeKey: "spin" });
  return rows.sort((a, b) => a.line - b.line);
}

const LIVE_RECORDS: SourceRecord[] = [
  {
    id: "IAR-NTL-6157",
    modelId: LIVE_MODEL,
    kind: "IAR",
    name: "Item Attribute Report",
    system: "Windchill PLM",
    ref: "WTPart NTL-6157",
    rev: "A.3",
    state: "Released",
    released: "2026-09-18",
    ownerDept: "Product engineering",
    columns: ["Attribute", "Value", "Unit", "Spec ID"],
    editCol: 1,
    rows: iarRows(),
  },
  {
    id: "BOM-1104-2287",
    modelId: LIVE_MODEL,
    kind: "BOM",
    name: "Indented BOM",
    system: "SAP S/4HANA",
    ref: "1104-2287",
    rev: "07",
    state: "Released",
    released: "2026-09-22",
    ownerDept: "Product engineering",
    columns: ["Level", "Find", "Part number", "Description", "Qty"],
    editCol: 3,
    rows: [
      { line: 1, cells: ["0", "—", "1104-2287", "Washer assembly, NTL-6157", "1"] },
      { line: 2, cells: ["1", "10", "W-CAB-6150", "Cabinet assembly", "1"] },
      { line: 3, cells: ["2", "12", "W-11027-441", "Rear panel standoff, 8 mm", "4"] },
      { line: 4, cells: ["1", "20", "W-BSK-5300", "Basket, stainless", "1"] },
      { line: 5, cells: ["1", "30", "W-IMP-2204", "Impeller", "1"] },
      { line: 6, cells: ["1", "40", "W-MTR-9010", "Motor, direct drive", "1"] },
      { line: 7, cells: ["1", "50", "W-SUS-3316", "Suspension rod kit", "1"] },
      { line: 8, cells: ["1", "60", "W-DSP-7700", "Dispenser drawer assembly", "1"] },
      { line: 9, cells: ["2", "62", "W-RSV-0048", "Detergent reservoir, 48 fl oz", "1"] },
      { line: 10, cells: ["2", "64", "W-DSP-7712", "Fabric softener cup, 3.4 fl oz", "1"] },
      { line: 11, cells: ["2", "66", "W-DSP-7714", "Bleach cup, 8 fl oz", "1"] },
      { line: 12, cells: ["1", "70", "W-PMP-2214", "Drain pump", "1"] },
      { line: 13, cells: ["1", "80", "WM-24", "Wi-Fi module, 2.4 GHz, IEEE 802.11 b/g/n", "1"], agreeKey: "band" },
      { line: 14, cells: ["1", "90", "W-LID-6157", "Lid assembly with lid lock", "1"] },
      { line: 15, cells: ["1", "95", "W-HOS-0034", "Inlet hose, 3/4 in thread", "2"] },
      { line: 16, cells: ["1", "99", "LBL-6157-03", "Rating label", "1"] },
    ],
  },
  {
    id: "ECN-4471",
    modelId: LIVE_MODEL,
    kind: "ECN",
    name: "Engineering Change Notice",
    system: "Windchill PLM",
    ref: "ECN-4471",
    rev: "Released",
    state: "Released",
    released: "2026-09-29",
    ownerDept: "Change board",
    columns: ["Attribute", "Was", "Is", "Effectivity"],
    editCol: 2,
    rows: [
      { line: 1, cells: ["Cabinet depth", "27.5 in", "28.0 in", "S/N NT26400001"], agreeKey: "depth" },
      { line: 2, cells: ["Max spin speed", "900 RPM", "850 RPM", "S/N NT26400001"], agreeKey: "spin" },
      { line: 3, cells: ["Rear panel standoff", "None", "W-11027-441, 8 mm, qty 4", "S/N NT26400001"] },
      { line: 4, cells: ["Suspension rod kit", "W-SUS-3310", "W-SUS-3316", "S/N NT26400001"] },
      { line: 5, cells: ["Shipping carton depth", "30.0 in", "30.5 in", "Lot 26-40"] },
      { line: 6, cells: ["Rating label artwork", "LBL-6157-02", "LBL-6157-03", "S/N NT26400001"] },
    ],
  },
  {
    id: "CM-LAU-11",
    modelId: LIVE_MODEL,
    kind: "CM",
    name: "Compliance Matrix",
    system: "Compliance register",
    ref: "CM-LAU-11",
    rev: "4",
    state: "Released",
    released: "2026-09-25",
    ownerDept: "Compliance and regulatory",
    columns: ["Obligation", "Market", "Value or requirement", "Status"],
    editCol: 2,
    rows: [
      { line: 1, cells: ["UL 2157", "US", "Listing. Grounding instructions in the manual", "Closed"] },
      { line: 2, cells: ["CSA C22.2 No. 169", "CA", "Certification", "Closed"] },
      { line: 3, cells: ["47 CFR Part 15 Subpart B", "US", "Compliance statement in the user manual", "Closed"] },
      { line: 4, cells: ["FCC module grant", "US", "FCC ID 2AXNF-WM24, 2.4 GHz", "Closed"], agreeKey: "band-cm" },
      { line: 5, cells: ["ISED RSS-247, RSS-Gen", "CA", "Licence-exempt notice, IC 27114-WM24", "Closed"] },
      { line: 6, cells: ["10 CFR 430 Subpart B, Appendix J", "US", "IMEF 2.06", "Closed"] },
      { line: 7, cells: ["EnergyGuide, 16 CFR 305", "US", "195 kWh per year", "Closed"] },
      { line: 8, cells: ["EnergyGuide capacity class", "US", "5.3 cu ft", "Closed"], agreeKey: "capacity" },
      { line: 9, cells: ["NOM-003-SCFI", "MX", "Spanish instructions and warranty", "Pending"], flag: "pending" },
      { line: 10, cells: ["California Proposition 65", "US", "Reviewed. No warning required", "Closed"] },
    ],
  },
  {
    id: "DVP-LAU-2291",
    modelId: LIVE_MODEL,
    kind: "DVP",
    name: "DVP&R",
    system: "Test lab LIMS",
    ref: "LAU-2291",
    rev: "3",
    state: "Released",
    released: "2026-10-02",
    ownerDept: "Test engineering",
    columns: ["Test", "Method", "Result", "Status"],
    editCol: 2,
    rows: [
      { line: 1, cells: ["4.1 Normal cycle time", "AHAM HLW-1", "52 min", "Pass"] },
      { line: 2, cells: ["4.2 Quick Wash cycle time", "AHAM HLW-1", "28 min", "Pass"] },
      { line: 3, cells: ["4.3 Heavy Duty cycle time", "AHAM HLW-1", "74 min", "Pass"] },
      { line: 4, cells: ["4.4 Clean Washer cycle time", "Internal LT-118", "65 min", "Pass"] },
      { line: 5, cells: ["6.1 Max spin speed", "Tachometer, empty basket", "850 RPM", "Pass"], agreeKey: "spin" },
      { line: 6, cells: ["6.2 Rated dry load", "10 CFR 430 Appendix J", "22 lb", "Pass"], agreeKey: "load" },
      { line: 7, cells: ["9.2 Clean Washer interval", "Internal LT-204, odour panel", "30 cycles", "Pass"] },
      { line: 8, cells: ["11.4 Inlet valve endurance", "UL 2157", "20,000 cycles", "Pass"] },
      { line: 9, cells: ["12.3 Out-of-balance recovery", "Internal LT-331, single 22 lb item", "Recovery not reached in 3 of 10 runs", "Fail"], flag: "fail" },
      { line: 10, cells: ["13.1 Reservoir dosing count", "Not tested", "No loads-per-fill claim approved", "Open"], flag: "open" },
      { line: 11, cells: ["13.2 Wi-Fi range", "Not tested", "No range claim approved", "Open"], flag: "open" },
      { line: 12, cells: ["13.3 Sanitisation", "NSF P172, not planned", "No sanitise claim approved", "Open"], flag: "open" },
      { line: 13, cells: ["14.1 Lid lock endurance", "UL 2157", "4,100 of 6,000 cycles run", "Open"], flag: "open" },
    ],
  },
];

// --- other models, built from family templates -----------------------------

const BOM_PARTS: Record<string, string[]> = {
  "Top-load washer": ["Cabinet assembly", "Basket, stainless", "Impeller", "Motor, direct drive", "Suspension rod kit", "Dispenser drawer assembly", "Drain pump", "Lid assembly with lid lock"],
  "Front-load washer": ["Cabinet assembly", "Outer tub", "Drum, stainless", "Motor, inverter", "Door assembly with boot", "Dispenser drawer assembly", "Drain pump", "Wi-Fi module, 2.4 GHz"],
  "Electric dryer": ["Cabinet assembly", "Drum", "Heater assembly", "Blower housing", "Drive motor", "Lint screen", "Door assembly", "Control board"],
  "Gas dryer": ["Cabinet assembly", "Drum", "Burner assembly", "Gas valve", "Igniter", "Blower housing", "Lint screen", "Control board"],
  Dishwasher: ["Tub assembly", "Wash pump", "Drain pump", "Upper rack", "Lower rack", "Third rack", "Door assembly", "Rinse aid dispenser"],
  Refrigerator: ["Cabinet, foamed", "Compressor, variable speed", "Evaporator", "Condenser", "Ice maker assembly", "Water filter housing", "Door assembly, left", "Main control board"],
};

const DVP_TESTS: Record<string, [string, string][]> = {
  Laundry: [["Cycle time, default cycle", "AHAM method"], ["Energy and water consumption", "10 CFR 430 Subpart B"], ["Abnormal operation", "UL safety standard"], ["Endurance, door or lid lock", "UL safety standard"], ["Vibration at max spin or tumble", "Internal LT-331"], ["Sound power", "IEC 60704-2"], ["Transit drop", "ISTA 3B"]],
  Kitchen: [["Cleaning index, normal cycle", "AHAM DW-1"], ["Energy and water consumption", "10 CFR 430 Appendix C1"], ["Sound level", "IEC 60704-2-3"], ["Door hinge endurance", "UL 749"], ["Leak protection", "UL 749"], ["Dry performance", "AHAM DW-1"], ["Transit drop", "ISTA 3B"]],
  Refrigeration: [["Pull-down time", "AHAM HRF-1"], ["Energy consumption", "10 CFR 430 Appendix A"], ["Refrigerant charge verification", "UL 60335-2-24"], ["Door seal endurance", "Internal RT-140"], ["Ice production rate", "AHAM HRF-1"], ["Sound power", "IEC 60704-2-14"], ["Transit drop", "ISTA 3B"]],
};

const CM_OBLIGATIONS: Record<string, [string, string, string][]> = {
  Laundry: [["UL safety listing", "US", "Listing"], ["CSA certification", "CA", "Certification"], ["47 CFR Part 15 Subpart B", "US", "Compliance statement in the user manual"], ["EnergyGuide, 16 CFR 305", "US", "Label values"], ["NOM-003-SCFI", "MX", "Spanish instructions and warranty"]],
  Kitchen: [["UL 749", "US", "Listing"], ["CSA C22.2 No. 167", "CA", "Certification"], ["47 CFR Part 15 Subpart B", "US", "Compliance statement in the user manual"], ["EnergyGuide, 16 CFR 305", "US", "Label values"], ["NSF/ANSI 184", "US", "Sanitisation claim evidence"]],
  Refrigeration: [["UL 60335-2-24", "US", "Listing, flammable refrigerant marking"], ["CSA C22.2 No. 60335-2-24", "CA", "Certification"], ["EPA SNAP", "US", "R-600a charge limit"], ["EnergyGuide, 16 CFR 305", "US", "Label values"], ["NSF/ANSI 42 and 53", "US", "Water filter claims"]],
};

function templateRecords(): SourceRecord[] {
  const records: SourceRecord[] = [];
  for (const model of MODELS) {
    if (model.id === LIVE_MODEL) continue;
    const s = seed(model.id);
    const bomRef = `11${String(10 + (s % 80)).padStart(2, "0")}-${String(2300 + (s % 600))}`;
    const pending = s % 3 === 0;
    records.push({
      id: `IAR-${model.id}`,
      modelId: model.id,
      kind: "IAR",
      name: "Item Attribute Report",
      system: "Windchill PLM",
      ref: `WTPart ${model.id}`,
      rev: model.plmRev,
      state: "Released",
      released: `2026-09-${String(8 + (s % 20)).padStart(2, "0")}`,
      ownerDept: "Product engineering",
      columns: ["Attribute", "Value", "Unit", "Spec ID"],
      editCol: 1,
      rows: model.specs.map(([label, value, unit], i) => ({
        line: 10 + i * 2,
        cells: [label, value, unit || "—", `SPEC-${String(10 + i * 10).padStart(3, "0")}`],
        agreeKey: i === 0 ? "headline" : label === "Supply voltage" ? "voltage" : undefined,
      })),
    });
    records.push({
      id: `BOM-${bomRef}`,
      modelId: model.id,
      kind: "BOM",
      name: "Indented BOM",
      system: "SAP S/4HANA",
      ref: bomRef,
      rev: String(2 + (s % 9)).padStart(2, "0"),
      state: "Released",
      released: `2026-09-${String(10 + (s % 18)).padStart(2, "0")}`,
      ownerDept: "Product engineering",
      columns: ["Level", "Find", "Part number", "Description", "Qty"],
      editCol: 3,
      rows: [
        { line: 1, cells: ["0", "—", bomRef, `Assembly, ${model.id}`, "1"] },
        ...BOM_PARTS[model.family].map((part, i) => ({
          line: i + 2,
          cells: ["1", String((i + 1) * 10), `${model.id.slice(0, 1)}-${String(1000 + ((s >>> i) % 8999))}`, part, "1"],
        })),
      ],
    });
    const ecnNo = 4400 + (s % 90);
    const inWork = model.status !== "In production" && s % 2 === 0;
    records.push({
      id: `ECN-${ecnNo}-${model.id}`,
      modelId: model.id,
      kind: "ECN",
      name: "Engineering Change Notice",
      system: "Windchill PLM",
      ref: `ECN-${ecnNo}`,
      rev: inWork ? "In work" : "Released",
      state: inWork ? "In work" : "Released",
      released: inWork ? "—" : `2026-09-${String(12 + (s % 16)).padStart(2, "0")}`,
      ownerDept: "Change board",
      columns: ["Attribute", "Was", "Is", "Effectivity"],
      editCol: 2,
      rows: [
        { line: 1, cells: [model.specs[0][0], `${model.specs[0][1]} ${model.specs[0][2]}`.trim(), `${model.specs[0][1]} ${model.specs[0][2]}`.trim(), "No change, restated"], agreeKey: "headline" },
        { line: 2, cells: ["Control board firmware", `v${1 + (s % 3)}.${s % 9}`, `v${1 + (s % 3)}.${(s % 9) + 1}`, "Running change"] },
        { line: 3, cells: ["Rating label artwork", "Issue 02", "Issue 03", "Running change"] },
      ],
    });
    records.push({
      id: `CM-${model.id}`,
      modelId: model.id,
      kind: "CM",
      name: "Compliance Matrix",
      system: "Compliance register",
      ref: `CM-${model.line.slice(0, 3).toUpperCase()}-${10 + (s % 30)}`,
      rev: String(1 + (s % 6)),
      state: pending ? "Under review" : "Released",
      released: pending ? "—" : `2026-09-${String(6 + (s % 22)).padStart(2, "0")}`,
      ownerDept: "Compliance and regulatory",
      columns: ["Obligation", "Market", "Value or requirement", "Status"],
      editCol: 2,
      rows: CM_OBLIGATIONS[model.line].map(([obligation, market, requirement], i) => ({
        line: i + 1,
        cells: [obligation, market, requirement, pending && i === 4 ? "Pending" : "Closed"],
        flag: pending && i === 4 ? ("pending" as const) : undefined,
      })),
    });
    records.push({
      id: `DVP-${model.id}`,
      modelId: model.id,
      kind: "DVP",
      name: "DVP&R",
      system: "Test lab LIMS",
      ref: `${model.line.slice(0, 3).toUpperCase()}-${2200 + (s % 300)}`,
      rev: String(1 + (s % 4)),
      state: "Released",
      released: `2026-09-${String(14 + (s % 14)).padStart(2, "0")}`,
      ownerDept: "Test engineering",
      columns: ["Test", "Method", "Result", "Status"],
      editCol: 2,
      rows: [
        { line: 1, cells: [`1.1 ${model.specs[0][0]}`, "Dimensional or volumetric check", `${model.specs[0][1]} ${model.specs[0][2]}`.trim(), "Pass"], agreeKey: "headline" },
        ...DVP_TESTS[model.line].map(([test, method], i) => {
          const open = model.status !== "In production" && (s >>> i) % 4 === 0;
          return {
            line: i + 2,
            cells: [`${i + 2}.1 ${test}`, method, open ? "In progress" : "Within acceptance limit", open ? "Open" : "Pass"],
            flag: open ? ("open" as const) : undefined,
          };
        }),
      ],
    });
  }
  return records;
}

export const RECORDS: SourceRecord[] = [...LIVE_RECORDS, ...templateRecords()];

export const recordById = (id: string) => RECORDS.find((r) => r.id === id);
export const recordsForModel = (modelId: string) => RECORDS.filter((r) => r.modelId === modelId);
export const liveRecord = (kind: SourceRecord["kind"]) => LIVE_RECORDS.find((r) => r.kind === kind)!;

export const RECORD_SHORT: Record<SourceRecord["kind"], string> = {
  IAR: "Item Attribute Report",
  BOM: "Indented BOM",
  ECN: "Engineering Change Notice",
  CM: "Compliance Matrix",
  DVP: "DVP&R",
};

/** First numeric token in a cell, used to compare a value across records. */
export function numericToken(cell: string): string {
  const m = cell.match(/\d[\d,.]*/);
  return m ? m[0].replace(/,/g, "").replace(/\.$/, "") : cell.trim().toLowerCase();
}

export const AGREE_LABEL: Record<string, string> = {
  depth: "Cabinet depth",
  spin: "Max spin speed",
  load: "Max dry load",
  capacity: "Capacity",
  band: "Radio band",
  headline: "Headline attribute",
  voltage: "Supply voltage",
};
