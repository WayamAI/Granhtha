/** Engineering change notices and every document object each one touches. */

import type { Ecn, EcnImpact, Lang } from "./types";

const ALL: Lang[] = ["en-US", "fr-CA", "es-MX"];
const NA: Lang[] = ["en-US", "fr-CA"];
const EN: Lang[] = ["en-US"];

type Row = [doc: string, topic: string, kind: EcnImpact["kind"], where: string, text: string, langs: Lang[], action: string, words: number];

const build = (ecn: string, model: string, rows: Row[]): EcnImpact[] =>
  rows.map(([doc, topicId, kind, where, text, langs, action, words], i) => ({
    id: `${ecn}-I${String(i + 1).padStart(2, "0")}`,
    docId: `${model}-${doc}`,
    topicId,
    kind,
    where,
    text,
    langs,
    action,
    words,
  }));

export const ECNS: Ecn[] = [
  {
    id: "ECN-4471",
    modelIds: ["NTL-6157"],
    title: "Rear panel standoff and suspension re-rating",
    kind: "Dimension and performance",
    released: "2026-09-29",
    daysWaiting: 13,
    safetyCritical: false,
    origin: "Wi-Fi module harness needs 8 mm behind the rear panel. Suspension rods re-rated after out-of-balance testing.",
    changes: [
      { attribute: "Cabinet depth", from: "27.5 in", to: "28.0 in", factId: "SPEC-021" },
      { attribute: "Max spin speed", from: "900 RPM", to: "850 RPM", factId: "SPEC-050" },
      { attribute: "Suspension rod kit", from: "W-SUS-3310", to: "W-SUS-3316" },
      { attribute: "Rear panel standoff", from: "None", to: "W-11027-441, qty 4" },
    ],
    impacts: build("ECN-4471", "NTL-6157", [
      ["UCG", "T-UC-030", "Table cell", "Parts and Features, dimension table, row Depth", "Depth 27.5 in", ALL, "Replace with 28.0 in, bound to SPEC-021", 3],
      ["UCG", "T-UC-040", "Sentence", "Control Panel and Features, Spin", "The fastest spin is 1,100 RPM.", ALL, "Replace with 850 RPM, bound to SPEC-050", 6],
      ["UCG", "T-UC-090", "Sentence", "Cycle Guide, note under the table", "The final spin reaches up to 850 RPM on the Normal and Heavy Duty cycles.", ALL, "Already current. Re-verify against SPEC-050", 0],
      ["II", "T-IN-030", "Table cell", "Location Requirements, product dimensions", "Depth 27.5 in (699 mm)", ALL, "Replace with 28.0 in (711 mm)", 4],
      ["II", "T-IN-030", "Illustration callout", "Figure 2, side view, callout C", "Rear clearance dimension drawn from the old panel face", ALL, "Redraw callout C from the standoff face", 6],
      ["II", "T-IN-030", "Sentence", "Location Requirements, recessed area", "A recessed area must be at least 31.5 in deep.", ALL, "Recompute: 28.0 in depth plus 4 in clearance is 32.0 in", 10],
      ["QSG", "T-QS-020", "Table cell", "Cycle quick reference, Spin column", "Max 900 RPM", ALL, "Replace with 850 RPM", 3],
      ["DG", "T-DG-010", "Illustration callout", "Side elevation, dimension B", "B = 27.5 in", NA, "Redraw dimension B at 28.0 in", 2],
      ["DG", "T-DG-020", "Illustration callout", "Installation clearances, rear", "Rear clearance from panel", NA, "Redraw from the standoff face", 4],
      ["PSS", "T-PS-010", "Table cell", "Dimensions and Clearances, Depth", "27.5 in", NA, "Replace with 28.0 in", 2],
      ["PSS", "T-PS-030", "Table cell", "Capacity and Performance, Max spin speed", "900 RPM", NA, "Replace with 850 RPM", 2],
      ["TS", "T-TS-040", "Table cell", "Component resistance values, suspension", "Rod kit W-SUS-3310", NA, "Replace with W-SUS-3316", 3],
      ["SM", "T-SM-040", "Sentence", "Theory of Operation: drive and suspension", "Four suspension rods, kit W-SUS-3310, carry the tub.", NA, "Replace part number. Restate max spin at 850 RPM", 12],
      ["SM", "T-SM-090", "Illustration callout", "Remove the cabinet rear panel, figure 14", "Rear panel drawn without standoffs", NA, "Add four standoffs W-11027-441 to the figure and a step to keep them", 28],
      ["SM", "T-SM-110", "Sentence", "Replace the suspension rods, step 6", "Install the rods from kit W-SUS-3310.", NA, "Replace part number", 6],
      ["IPC", "T-PC-010", "Parts row", "Cabinet and top, new find number 12", "No row for the standoff", EN, "Add W-11027-441, qty 4", 8],
      ["IPC", "T-PC-040", "Parts row", "Drive and suspension, find number 50", "W-SUS-3310 Suspension rod kit", EN, "Supersede to W-SUS-3316, keep the old number as replaced-by", 8],
    ]),
  },
  {
    id: "ECN-4502",
    modelIds: ["NFL-4420"],
    title: "Wi-Fi module WM-24 added to the front-load washer",
    kind: "Connectivity",
    released: "2026-10-01",
    daysWaiting: 11,
    safetyCritical: false,
    origin: "Connected variant for the 2027 line. Same module and app as NTL-6157.",
    changes: [
      { attribute: "Wi-Fi module", from: "None", to: "WM-24, 2.4 GHz" },
      { attribute: "Standby power", from: "0.4 W", to: "0.9 W" },
      { attribute: "Control panel", from: "No Remote Start", to: "Remote Start button" },
    ],
    impacts: build("ECN-4502", "NFL-4420", [
      ["UCG", "T-UC-040", "Sentence", "Control Panel and Features", "No Remote Start entry", ALL, "Add the Remote Start entry", 22],
      ["UCG", "T-UC-050", "Sentence", "New topic: what Wi-Fi does", "Topic absent", ALL, "Reuse T-UC-050 from NTL-6157 unchanged", 148],
      ["UCG", "T-UC-060", "Sentence", "New topic: connecting to Wi-Fi", "Topic absent", ALL, "Reuse T-UC-060 from NTL-6157 unchanged", 234],
      ["UCG", "T-UC-070", "Safety message", "New topic: regulatory statements", "FCC and ISED statements absent", ALL, "Reuse T-UC-070. Statements are required text", 96],
      ["UCG", "T-UC-170", "Table cell", "Troubleshooting, connectivity", "Rows absent", ALL, "Reuse T-UC-170 from NTL-6157", 158],
      ["QSG", "T-QS-030", "Sentence", "New panel: connect to the app", "Panel absent", ALL, "Reuse T-QS-030 from NTL-6157", 76],
      ["EL", "T-EL-010", "Label", "EnergyGuide, estimated yearly electricity", "Value computed at 0.4 W standby", NA, "Recompute with 0.9 W standby and re-file", 4],
      ["DG", "T-DG-010", "Illustration callout", "Front elevation, control panel", "Panel drawn without Remote Start", NA, "Redraw the panel", 2],
      ["TS", "T-TS-030", "Table cell", "Fault code table", "No Wi-Fi fault codes", NA, "Add the module fault codes from the NTL-6157 tech sheet", 64],
      ["PSS", "T-PS-020", "Table cell", "Electrical and Water, standby power", "0.4 W", NA, "Replace with 0.9 W", 2],
    ]),
  },
  {
    id: "ECN-4533",
    modelIds: ["NTL-4105"],
    title: "Drain pump superseded, W-PMP-2210 to W-PMP-2214",
    kind: "Part supersession",
    released: "2026-10-05",
    daysWaiting: 7,
    safetyCritical: false,
    origin: "Supplier change. New pump has a different connector and a 3-screw mount.",
    changes: [
      { attribute: "Drain pump", from: "W-PMP-2210", to: "W-PMP-2214" },
      { attribute: "Pump mounting", from: "Twist-lock", to: "3 screws, 1/4 in hex" },
      { attribute: "Pump winding resistance", from: "14.2 Ω", to: "16.8 Ω" },
    ],
    impacts: build("ECN-4533", "NTL-4105", [
      ["TS", "T-TS-040", "Table cell", "Component resistance values, drain pump", "14.2 Ω", NA, "Replace with 16.8 Ω", 2],
      ["TS", "T-TS-030", "Table cell", "Fault code table, long drain", "Check pump W-PMP-2210", NA, "Replace part number", 3],
      ["SM", "T-SM-100", "Sentence", "Replace the drain pump, step 4", "Turn the pump counterclockwise to release it.", NA, "Rewrite for 3-screw mount. Add tool: 1/4 in hex driver", 34],
      ["SM", "T-SM-100", "Illustration callout", "Replace the drain pump, figure 22", "Twist-lock pump drawn", NA, "Redraw with 3 screws and the new connector", 12],
      ["SM", "T-SM-130", "Table cell", "Component Testing, drain pump", "14.2 Ω", NA, "Replace with 16.8 Ω", 2],
      ["IPC", "T-PC-050", "Parts row", "Pump and hoses, find number 70", "W-PMP-2210 Drain pump", EN, "Supersede to W-PMP-2214. Add 3 screws as a new row", 14],
      ["UCG", "T-UC-160", "Sentence", "Troubleshooting, washer does not drain", "No part reference", ALL, "No change. Verified: no pump detail in consumer text", 0],
    ]),
  },
  {
    id: "ECN-4548",
    modelIds: ["NDG-7245"],
    title: "Maximum exhaust length reduced, 64 ft to 54 ft",
    kind: "Safety limit",
    released: "2026-10-06",
    daysWaiting: 6,
    safetyCritical: true,
    origin: "Blower re-rated after field lint-accumulation returns. Fire-safety relevant installation limit.",
    changes: [
      { attribute: "Max exhaust length, rigid duct", from: "64 ft", to: "54 ft" },
      { attribute: "Deduction per 90° elbow", from: "8 ft", to: "10 ft" },
    ],
    impacts: build("ECN-4548", "NDG-7245", [
      ["II", "T-IN-060", "Table cell", "Exhaust Requirements, vent length chart, 0 elbows", "64 ft", ALL, "Replace with 54 ft and recompute every row of the chart", 24],
      ["II", "T-IN-060", "Safety message", "Exhaust Requirements, fire hazard WARNING", "Do not exceed 64 ft of rigid duct.", ALL, "Replace the limit. Message keeps hazard, consequence and avoidance", 9],
      ["II", "T-IN-060", "Illustration callout", "Figure 6, exhaust run example", "Example run labelled 60 ft", ALL, "Relabel to a run within 54 ft", 4],
      ["II", "T-IN-110", "Sentence", "Installation Checklist", "Exhaust run is within the chart limit.", ALL, "No wording change. Re-verify the cross-reference", 0],
      ["UCG", "T-UC-160", "Sentence", "Troubleshooting, clothes take too long to dry", "The exhaust run must not be longer than 64 ft.", ALL, "Replace with 54 ft", 11],
      ["QSG", "T-QS-020", "Sentence", "Before first use", "Check that the vent is shorter than 64 ft.", ALL, "Replace with 54 ft", 9],
      ["PSS", "T-PS-020", "Table cell", "Venting, max length", "64 ft", NA, "Replace with 54 ft", 2],
      ["SM", "T-SM-030", "Sentence", "Theory of Operation: airflow", "The blower supports up to 64 ft of rigid duct.", NA, "Replace with 54 ft and the new elbow deduction", 14],
    ]),
  },
  {
    id: "ECN-4560",
    modelIds: ["NDW-3380"],
    title: "EnergyGuide value restated after DOE retest",
    kind: "Energy label",
    released: "2026-10-07",
    daysWaiting: 5,
    safetyCritical: false,
    origin: "Retest under 10 CFR 430 Appendix C1 with the production heater.",
    changes: [
      { attribute: "Estimated yearly electricity", from: "232 kWh", to: "239 kWh" },
      { attribute: "Estimated yearly cost", from: "$32", to: "$33" },
    ],
    impacts: build("ECN-4560", "NDW-3380", [
      ["EL", "T-EL-010", "Label", "EnergyGuide, estimated yearly electricity", "232 kWh", NA, "Replace with 239 kWh and re-file the label", 2],
      ["EL", "T-EL-010", "Label", "EnergyGuide, estimated yearly cost", "$32", NA, "Replace with $33", 2],
      ["PSS", "T-PS-030", "Table cell", "Capacity and Performance, yearly electricity", "232 kWh", NA, "Replace with 239 kWh", 2],
      ["UCG", "T-UC-090", "Sentence", "Cycle Guide, energy note", "This dishwasher uses about 232 kWh a year.", ALL, "Replace with 239 kWh", 9],
      ["WAR", "T-WA-010", "Sentence", "Limited warranty terms", "No energy reference", ALL, "No change. Verified", 0],
    ]),
  },
  {
    id: "ECN-4571",
    modelIds: ["NRF-2865"],
    title: "R-600a charge increased, 58 g to 62 g",
    kind: "Refrigerant charge",
    released: "2026-10-08",
    daysWaiting: 4,
    safetyCritical: true,
    origin: "Evaporator redesign. Charge stays inside the UL 60335-2-24 limit for a flammable refrigerant.",
    changes: [
      { attribute: "Refrigerant charge", from: "58 g", to: "62 g" },
      { attribute: "Minimum room volume", from: "7.3 m³", to: "7.8 m³" },
    ],
    impacts: build("ECN-4571", "NRF-2865", [
      ["UCG", "T-UC-020", "Safety message", "Important Safety Instructions, flammable refrigerant WARNING", "This refrigerator contains 58 g of R-600a.", ALL, "Replace with 62 g. Message keeps hazard, consequence and avoidance", 8],
      ["II", "T-IN-030", "Sentence", "Location Requirements, room volume", "Install in a room of at least 7.3 m³.", ALL, "Replace with 7.8 m³", 9],
      ["II", "T-IN-010", "Safety message", "Installation Safety, flammable refrigerant", "Charge: 58 g R-600a", ALL, "Replace with 62 g", 4],
      ["PSS", "T-PS-020", "Table cell", "Refrigerant and charge", "R-600a, 58 g", NA, "Replace with 62 g", 2],
      ["TS", "T-TS-040", "Table cell", "Sealed system data", "58 g", NA, "Replace with 62 g", 2],
      ["SM", "T-SM-010", "Safety message", "Service Safety, flammable refrigerant DANGER", "System charge 58 g. Recover before brazing.", NA, "Replace with 62 g", 7],
      ["SM", "T-SM-130", "Table cell", "Component Testing, charge weight", "58 g ± 2 g", NA, "Replace with 62 g ± 2 g", 4],
    ]),
  },
];

export const ecnById = (id: string) => ECNS.find((e) => e.id === id);

/** Planning rates. Loaded authoring rate is adjustable on the business case. */
export const RATES = {
  authorPerHour: 85,
  newWord: 0.22,
  fuzzyWord: 0.11,
  exactWord: 0.03,
  /** LQA, DTP re-flow and in-country review each time a topic is touched in a language. */
  touchPerTopicLang: 85,
  dtpPerDocLang: 60,
};

const AUTHOR_MINUTES: Record<EcnImpact["kind"], number> = {
  Sentence: 12,
  "Table cell": 8,
  "Illustration callout": 45,
  "Safety message": 40,
  Label: 30,
  "Parts row": 10,
};

export function ecnCost(ecn: Ecn) {
  const live = ecn.impacts.filter((i) => i.words > 0);
  const docs = new Set(ecn.impacts.map((i) => i.docId));
  const authorHours = live.reduce((sum, i) => sum + AUTHOR_MINUTES[i.kind], 0) / 60 + docs.size * 0.75;
  const transWords = live.reduce((sum, i) => sum + i.words * (i.langs.length - 1), 0);
  const topicLangs = new Set(live.flatMap((i) => i.langs.filter((l) => l !== "en-US").map((l) => `${i.docId}|${i.topicId}|${l}`)));
  const docLangs = new Set(live.flatMap((i) => i.langs.map((l) => `${i.docId}|${l}`)));
  const authoring = authorHours * RATES.authorPerHour;
  const translation = transWords * RATES.newWord + topicLangs.size * RATES.touchPerTopicLang;
  const dtp = docLangs.size * RATES.dtpPerDocLang;
  /** Finding the same objects by reading each document: about 2.5 h per document. */
  const manualSearchHours = docs.size * 2.5;
  return {
    docs: docs.size,
    topics: new Set(ecn.impacts.map((i) => `${i.docId}|${i.topicId}`)).size,
    objects: ecn.impacts.length,
    renderings: ecn.impacts.reduce((sum, i) => sum + i.langs.length, 0),
    authorHours,
    authoring,
    translation,
    dtp,
    total: authoring + translation + dtp,
    manualSearchHours,
  };
}
