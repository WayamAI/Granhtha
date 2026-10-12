/** Glossary, audit history, agent observations and the business-case baseline. */

import type { AuditEvent, Insight, Term } from "./types";

type TermRow = [id: string, approved: string, definition: string, forbidden: string[], fr: string, es: string, locked: boolean, occurrences: number, domain: string];

const TERM_ROWS: TermRow[] = [
  ["NF-GL-014", "dispenser drawer", "Pull-out drawer that holds the fabric softener and bleach cups.", ["detergent drawer", "soap tray"], "tiroir distributeur", "cajón dispensador", true, 7, "Laundry"],
  ["NF-GL-002", "impeller", "Low-profile wash plate at the bottom of a top-load basket.", ["agitator plate", "wash plate"], "impulseur", "impulsor", true, 3, "Laundry"],
  ["NF-GL-003", "basket", "Perforated inner container of a top-load washer.", ["drum", "tub"], "panier", "canasta", true, 5, "Laundry"],
  ["NF-GL-004", "lid", "Top cover of a top-load washer.", ["door", "cover"], "couvercle", "tapa", false, 2, "Laundry"],
  ["NF-GL-005", "lid lock", "Mechanism that holds the lid closed while the basket turns.", ["lid latch", "door lock"], "verrou du couvercle", "seguro de la tapa", true, 0, "Laundry"],
  ["NF-GL-006", "cycle knob", "Rotary control that selects the wash cycle.", ["dial", "selector", "program knob"], "bouton de programme", "perilla de ciclos", false, 4, "Laundry"],
  ["NF-GL-007", "HE detergent", "Low-sudsing detergent for high-efficiency washers.", ["high-efficiency soap", "low-suds detergent"], "détergent HE", "detergente HE", true, 1, "Laundry"],
  ["NF-GL-008", "detergent reservoir", "Bulk tank that doses liquid detergent automatically.", ["detergent tank", "auto-dose tank"], "réservoir de détergent", "depósito de detergente", true, 2, "Laundry"],
  ["NF-GL-009", "inlet hose", "Hose from the water tap to the inlet valve.", ["fill hose", "water line"], "tuyau d’arrivée d’eau", "manguera de entrada", false, 3, "Laundry"],
  ["NF-GL-010", "drain hose", "Hose from the drain pump to the standpipe.", ["outlet hose", "waste hose"], "tuyau de vidange", "manguera de desagüe", false, 0, "Laundry"],
  ["NF-GL-011", "standpipe", "Vertical drain pipe that receives the drain hose.", ["drain pipe", "riser"], "tuyau de rejet à l’égout", "tubo vertical de desagüe", false, 1, "Laundry"],
  ["NF-GL-012", "leveling leg", "Threaded foot used to level the appliance.", ["levelling foot", "adjuster"], "pied de nivellement", "pata niveladora", false, 6, "All"],
  ["NF-GL-013", "Remote Start", "Control that lets the app start a cycle.", ["remote enable", "smart start"], "Mise en marche à distance", "Inicio remoto", true, 0, "Connected"],
  ["NF-GL-015", "Northfield Home", "Name of the companion app. Never translated.", ["Northfield app", "the Home app"], "Northfield Home", "Northfield Home", true, 2, "Connected"],
  ["NF-GL-016", "Clean Washer cycle", "Maintenance cycle run with an empty basket.", ["tub clean", "self clean"], "programme Nettoyage de la laveuse", "ciclo Limpiar lavadora", true, 1, "Laundry"],
  ["NF-GL-017", "lint screen", "Removable screen that collects lint in a dryer.", ["lint filter", "lint trap"], "filtre à charpie", "filtro de pelusa", true, 8, "Laundry"],
  ["NF-GL-018", "exhaust vent", "Duct that carries dryer exhaust outdoors.", ["dryer duct", "vent pipe"], "conduit d’évacuation", "ducto de escape", true, 4, "Laundry"],
  ["NF-GL-019", "rinse aid", "Additive that improves drying in a dishwasher.", ["rinse agent", "drying agent"], "agent de rinçage", "abrillantador", false, 3, "Kitchen"],
  ["NF-GL-020", "third rack", "Shallow top rack for utensils.", ["cutlery tray", "top tray"], "troisième panier", "tercera rejilla", false, 0, "Kitchen"],
  ["NF-GL-021", "water filter", "Replaceable filter for the water and ice system.", ["filter cartridge"], "filtre à eau", "filtro de agua", false, 2, "Refrigeration"],
  ["NF-GL-022", "crisper", "Humidity-controlled drawer for produce.", ["vegetable drawer", "produce bin"], "bac à légumes", "cajón para verduras", false, 5, "Refrigeration"],
  ["NF-GL-023", "ice maker", "Assembly that makes and stores ice.", ["icemaker", "ice machine"], "machine à glaçons", "fábrica de hielo", true, 9, "Refrigeration"],
  ["NF-GL-024", "rating label", "Label that carries model, serial and electrical ratings.", ["nameplate", "serial tag"], "plaque signalétique", "etiqueta de clasificación", false, 1, "All"],
  ["NF-GL-025", "qualified installer", "Person trained and licensed to install the appliance.", ["professional", "fitter"], "installateur qualifié", "instalador calificado", false, 0, "All"],
];

export const TERMS: Term[] = TERM_ROWS.map(([id, approved, definition, forbidden, frCA, esMX, locked, occurrences, domain]) => ({
  id,
  approved,
  definition,
  forbidden,
  frCA,
  esMX,
  locked,
  occurrences,
  domain,
  findingId: id === "NF-GL-014" ? "F-10" : undefined,
}));

type AuditRow = [at: string, actor: string, kind: AuditEvent["actorKind"], action: string, object: string, detail: string, href?: string];

const AUDIT_ROWS: AuditRow[] = [
  ["2026-10-12 09:58", "Verifier", "rule", "Check run", "NTL-6157-UCG", "35 checks run. 6 fail, 4 warn. 13 findings raised.", "/findings"],
  ["2026-10-12 09:57", "Author agent", "agent", "Draft written", "NTL-6157-UCG", "12 sections drafted from 51 facts. Model proposes wording only.", "/generate"],
  ["2026-10-12 09:55", "Extractor", "agent", "Facts extracted", "NTL-6157", "51 facts, 3 prohibitions and 3 required statements from 5 records.", "/facts"],
  ["2026-10-12 09:54", "Input check", "rule", "Records checked", "NTL-6157", "21 passed, 2 warnings. DVP&R has 1 failed test and 4 open.", "/records"],
  ["2026-10-12 09:41", "Ilse Varga", "human", "Run started", "NTL-6157-UCG", "Use & Care Guide, 5 records selected.", "/generate"],
  ["2026-10-12 09:12", "Marit Solheim", "human", "Assigned", "ECN-4548", "Gas dryer exhaust limit assigned to Devan Okafor. Safety-critical.", "/change-impact?ecn=ECN-4548"],
  ["2026-10-09 16:40", "Henrik Aalto", "human", "Signed off", "NRB-1940-TS", "Tech Sheet Rev. C approved. 0 blocking findings.", "/signoff"],
  ["2026-10-09 15:22", "Verifier", "rule", "Check run", "NRB-1940-TS", "31 checks run. All pass.", "/library/NRB-1940-TS"],
  ["2026-10-09 11:05", "Rafael Quintero", "human", "Translation released", "NDE-7240-UCG", "fr-CA and es-MX released. Exact-match leverage 88%.", "/localisation"],
  ["2026-10-08 17:31", "Change board", "human", "ECN released", "ECN-4571", "R-600a charge 58 g to 62 g on NRF-2865.", "/change-impact?ecn=ECN-4571"],
  ["2026-10-08 14:18", "Priya Nambiar", "human", "Rule changed", "GRN-LOC-006", "NOM-003-SCFI market obligation rule enabled for all laundry models.", "/rules?rule=GRN-LOC-006"],
  ["2026-10-08 10:02", "Owen Brandt", "human", "Returned", "NRF-2865-PSS", "Returned to draft. Depth with handles disagrees with the dimension guide.", "/library/NRF-2865-PSS"],
  ["2026-10-07 16:44", "Change board", "human", "ECN released", "ECN-4560", "EnergyGuide value restated on NDW-3380.", "/change-impact?ecn=ECN-4560"],
  ["2026-10-07 13:27", "Sana Mirza", "human", "Finding dismissed", "NDW-3380-UCG", "GRN-RDB-002 dismissed: sentence is a required regulatory statement.", "/library/NDW-3380-UCG"],
  ["2026-10-07 09:15", "Verifier", "rule", "Check run", "NDW-3380-II", "33 checks run. All pass. Sent to sign-off queue.", "/signoff"],
  ["2026-10-06 15:50", "Change board", "human", "ECN released", "ECN-4548", "Max exhaust length 64 ft to 54 ft on NDG-7245.", "/change-impact?ecn=ECN-4548"],
  ["2026-10-06 11:36", "Devan Okafor", "human", "Fix applied", "NDE-7240-TS", "Heater resistance replaced with the recorded value.", "/library/NDE-7240-TS"],
  ["2026-10-05 16:08", "Change board", "human", "ECN released", "ECN-4533", "Drain pump superseded on NTL-4105.", "/change-impact?ecn=ECN-4533"],
  ["2026-10-05 10:44", "Camille Fortin", "human", "Post-edit complete", "NTL-4105-UCG", "fr-CA post-edit of 4 topics. 0 locked-term changes.", "/localisation"],
  ["2026-10-02 14:12", "Test engineering", "human", "Record released", "DVP&R LAU-2291", "Revision 3 released. Test 12.3 failed, 4 tests open.", "/records?record=DVP-LAU-2291"],
  ["2026-10-02 09:30", "Marit Solheim", "human", "Threshold changed", "GRN-LOC-005", "Exact-match leverage threshold set to 75% for successor documents.", "/rules?rule=GRN-LOC-005"],
  ["2026-10-01 15:19", "Change board", "human", "ECN released", "ECN-4502", "Wi-Fi module added to NFL-4420.", "/change-impact?ecn=ECN-4502"],
  ["2026-10-01 11:48", "Ilse Varga", "human", "Signed off", "NTL-4105-WAR", "Warranty Rev. B approved.", "/signoff"],
  ["2026-09-30 16:25", "Lucía Barrera", "human", "Post-edit complete", "NTL-4105-II", "es-MX post-edit of 2 topics.", "/localisation"],
  ["2026-09-29 13:02", "Change board", "human", "ECN released", "ECN-4471", "Cabinet depth 27.5 in to 28.0 in, spin speed 900 to 850 RPM on NTL-6157.", "/change-impact?ecn=ECN-4471"],
  ["2026-09-29 10:17", "Priya Nambiar", "human", "Glossary changed", "NF-GL-014", "“detergent drawer” added as a forbidden variant of “dispenser drawer”.", "/terminology"],
  ["2026-09-26 15:40", "Henrik Aalto", "human", "Returned", "NDG-7245-SM", "Returned to draft. Igniter resistance range missing a unit.", "/library/NDG-7245-SM"],
  ["2026-09-25 12:21", "Compliance and regulatory", "human", "Record released", "CM-LAU-11", "Revision 4 released. NOM-003-SCFI pending.", "/records?record=CM-LAU-11"],
  ["2026-09-24 09:55", "Verifier", "rule", "Check run", "NFL-4420-PSS", "30 checks run. All pass.", "/library/NFL-4420-PSS"],
  ["2026-09-22 16:33", "Product engineering", "human", "Record released", "BOM 1104-2287", "Revision 07 released with reservoir and Wi-Fi module.", "/records?record=BOM-1104-2287"],
  ["2026-09-18 11:09", "Product engineering", "human", "Record released", "WTPart NTL-6157", "Item attribute report revision A.3 released.", "/records?record=IAR-NTL-6157"],
  ["2026-09-17 14:47", "Rafael Quintero", "human", "Memory updated", "NF-TM-LAU", "1,240 fr-CA segments added from the NFL-4420 programme.", "/localisation"],
];

export const AUDIT_SEED: AuditEvent[] = AUDIT_ROWS.map(([at, actor, actorKind, action, object, detail, href], i) => ({
  id: `AU-${String(2400 - i).padStart(4, "0")}`,
  at,
  actor,
  actorKind,
  action,
  object,
  detail,
  href,
}));

export const INSIGHTS: Insight[] = [
  {
    id: "OBS-01",
    observation: "ECN-4548 lowers a fire-safety limit and three published gas dryer documents still say 64 ft.",
    cause: "The change board released the ECN on 6 October. No revision set was opened, so the published Installation Instructions, Use & Care Guide and Quick Start Guide for NDG-7245 keep the old exhaust limit.",
    evidence: [
      { label: "ECN-4548 line 1", detail: "Max exhaust length, rigid duct: 64 ft to 54 ft" },
      { label: "8 document objects", detail: "1 safety message, 2 table cells, 4 sentences, 1 callout" },
      { label: "3 languages", detail: "en-US, fr-CA and es-MX renderings all carry 64 ft" },
    ],
    confidence: 0.98,
    impact: "3 published documents contradict a safety limit",
    recommendation: "Open the revision set for ECN-4548 today and reissue the Installation Instructions first.",
    signer: "Devan Okafor signs the reissue",
    href: "/change-impact?ecn=ECN-4548",
    cta: "Open change impact",
  },
  {
    id: "OBS-02",
    observation: "Three carry-over topics in the NTL-6157 Use & Care Guide were reworded with no engineering change behind them.",
    cause: "The draft rephrased Parts and Features, Starting Your Washer and Using the Dispensers. None of the three is touched by ECN-4471 or by the Wi-Fi module. Their translation-memory matches fell from exact to fuzzy in fr-CA and es-MX.",
    evidence: [
      { label: "726 words", detail: "across T-UC-030, T-UC-080 and T-UC-100" },
      { label: "es-MX leverage", detail: "61% exact against a 75% threshold" },
      { label: "Finding F-11", detail: "GRN-LOC-005 raised on the draft" },
    ],
    confidence: 0.91,
    impact: "Translation cost repeats in each language",
    recommendation: "Restore the predecessor wording. The rewording also introduced the forbidden term “detergent drawer”.",
    signer: "Ilse Varga decides which wording stands",
    href: "/reuse",
    cta: "Open reuse planner",
  },
  {
    id: "OBS-03",
    observation: "One inherited defect, a NOTICE drawn with the safety alert symbol, appears in 14 documents across the laundry line.",
    cause: "All 14 trace to the same predecessor topic, Cleaning the washer, last revised in 2023. Each successor model carried the panel over unchanged.",
    evidence: [
      { label: "GRN-SAF-002", detail: "14 hits in 90 days, all in carry-over topics" },
      { label: "ANSI Z535.6 §5.2", detail: "NOTICE addresses property damage and takes no safety alert symbol" },
      { label: "Topic T-UC-130", detail: "used in 3 top-load models" },
    ],
    confidence: 0.94,
    impact: "Fix once in the topic, 14 documents inherit it",
    recommendation: "Apply the fix on NTL-6157, then promote the corrected topic to the library master.",
    signer: "Marit Solheim approves the library change",
    href: "/findings?f=F-06",
    cta: "Open finding F-06",
  },
  {
    id: "OBS-04",
    observation: "NOM-003-SCFI is still pending in the compliance matrix and es-MX literature for NTL-6157 is not scheduled.",
    cause: "The Mexican market obligation needs Spanish instructions and warranty at first shipment. The compliance matrix row has been pending since 25 September.",
    evidence: [
      { label: "CM-LAU-11 line 9", detail: "NOM-003-SCFI, Spanish instructions and warranty: Pending" },
      { label: "es-MX exact-match leverage", detail: "61% on the Use & Care Guide, the lowest of the three languages" },
    ],
    confidence: 0.88,
    impact: "Blocks first shipment to Mexico",
    recommendation: "Schedule the es-MX release with the fr-CA post-edit and ask compliance to close the matrix row.",
    signer: "Rafael Quintero releases the translation",
    href: "/localisation",
    cta: "Open localisation",
  },
];

export interface CaseRow {
  modelId: string;
  reissues: number;
  hoursBefore: number;
  hoursAfter: number;
  transBefore: number;
  transAfter: number;
  cycleBefore: number;
  cycleAfter: number;
  escapedBefore: number;
  escapedAfter: number;
}

const CASE: [string, number, number, number, number, number, number, number, number, number][] = [
  ["NTL-6157", 14, 412, 148, 38400, 21900, 34, 12, 9, 1],
  ["NTL-4105", 9, 248, 96, 22100, 13800, 29, 11, 5, 0],
  ["NFL-4420", 12, 386, 152, 35600, 20400, 36, 14, 8, 1],
  ["NDE-7240", 7, 204, 82, 18900, 12200, 27, 10, 4, 0],
  ["NDG-7245", 8, 236, 94, 21300, 13100, 31, 11, 6, 1],
  ["NDW-3380", 11, 342, 138, 31800, 19700, 33, 13, 7, 1],
  ["NRF-2865", 13, 428, 176, 41200, 25600, 38, 15, 10, 2],
  ["NRB-1940", 6, 188, 78, 16400, 10900, 26, 9, 3, 0],
];

export const CASE_ROWS: CaseRow[] = CASE.map(([modelId, reissues, hoursBefore, hoursAfter, transBefore, transAfter, cycleBefore, cycleAfter, escapedBefore, escapedAfter]) => ({
  modelId,
  reissues,
  hoursBefore,
  hoursAfter,
  transBefore,
  transAfter,
  cycleBefore,
  cycleAfter,
  escapedBefore,
  escapedAfter,
}));

/** Days from ECN release to reissued literature, by month. */
export const CYCLE_TREND = [
  { month: "May", days: 31 },
  { month: "Jun", days: 29 },
  { month: "Jul", days: 24 },
  { month: "Aug", days: 18 },
  { month: "Sep", days: 14 },
  { month: "Oct", days: 12 },
];
