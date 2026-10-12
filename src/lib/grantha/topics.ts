/**
 * Topic library for NTL-6157: every deliverable broken into reusable,
 * DITA-style topics with a disposition against the predecessor NTL-8127.
 */

import { MODELS } from "./data";
import type { DocTypeId, Lang, Topic } from "./types";

type Row = [id: string, title: string, type: Topic["type"], disposition: Topic["disposition"], words: number, note?: string];

const ALL: Lang[] = ["en-US", "fr-CA", "es-MX"];
const NA: Lang[] = ["en-US", "fr-CA"];

const UC: Row[] = [
  ["T-UC-010", "Washer Safety", "Safety", "carried", 212],
  ["T-UC-020", "Important Safety Instructions", "Safety", "carried", 318],
  ["T-UC-030", "Parts and Features", "Reference", "revised", 246, "reworded:Callout labels were rephrased. No part in the callouts changed."],
  ["T-UC-040", "Control Panel and Features", "Reference", "revised", 262, "Remote Start button added with the Wi-Fi module."],
  ["T-UC-050", "What Wi-Fi does on this washer", "Concept", "new", 148],
  ["T-UC-060", "Connecting Your Washer to Wi-Fi", "Task", "new", 234],
  ["T-UC-070", "Regulatory statements for the radio", "Reference", "new", 96],
  ["T-UC-080", "Starting Your Washer", "Task", "revised", 256, "reworded:Steps were rephrased and merged. The procedure itself is unchanged."],
  ["T-UC-090", "Cycle Guide", "Reference", "revised", 298, "ECN-4471 changes the max spin speed. Cycle times were re-measured."],
  ["T-UC-100", "Using the Dispensers", "Task", "revised", 224, "reworded:“Dispenser drawer” became “detergent drawer”. The drawer did not change."],
  ["T-UC-110", "Filling the detergent reservoir", "Task", "new", 172],
  ["T-UC-120", "Loading Recommendations", "Concept", "carried", 198],
  ["T-UC-130", "Cleaning the washer", "Task", "carried", 256],
  ["T-UC-140", "Cleaning the dispenser drawer", "Task", "carried", 134],
  ["T-UC-150", "Winter storage and moving", "Task", "carried", 188],
  ["T-UC-160", "Troubleshooting: washing and draining", "Reference", "carried", 402],
  ["T-UC-170", "Troubleshooting: connectivity", "Reference", "new", 158],
  ["T-UC-180", "Error codes", "Reference", "carried", 176],
  ["T-UC-190", "Assistance or Service", "Reference", "carried", 128],
];

const OTHER: Partial<Record<DocTypeId, Row[]>> = {
  II: [
    ["T-IN-010", "Installation Safety", "Safety", "carried", 186],
    ["T-IN-020", "Tools and Parts", "Reference", "carried", 142],
    ["T-IN-030", "Location Requirements", "Reference", "revised", 224, "ECN-4471 changes the cabinet depth and the rear clearance drawing."],
    ["T-IN-040", "Electrical Requirements", "Reference", "carried", 168],
    ["T-IN-050", "Water Supply Requirements", "Reference", "revised", 132, "Inlet pressure minimum is 20 psi for the new inlet valve."],
    ["T-IN-060", "Drain System", "Reference", "carried", 156],
    ["T-IN-070", "Remove the shipping materials", "Task", "carried", 118],
    ["T-IN-080", "Connect the inlet hoses", "Task", "carried", 204],
    ["T-IN-090", "Connect the drain hose", "Task", "carried", 172],
    ["T-IN-100", "Level the washer", "Task", "carried", 148],
    ["T-IN-110", "Installation Checklist", "Reference", "revised", 96, "Wi-Fi pairing check added."],
  ],
  QSG: [
    ["T-QS-010", "Load and start", "Task", "revised", 84, "reworded:Rephrased to match the reworded Use & Care steps."],
    ["T-QS-020", "Cycle quick reference", "Reference", "revised", 112, "Cycle times re-measured."],
    ["T-QS-030", "Connect to the app", "Task", "new", 76],
    ["T-QS-040", "Where to get help", "Reference", "carried", 48],
  ],
  DG: [
    ["T-DG-010", "Product dimensions", "Reference", "revised", 62, "ECN-4471 changes the cabinet depth."],
    ["T-DG-020", "Installation clearances", "Reference", "revised", 74, "Rear clearance redrawn for the standoff."],
    ["T-DG-030", "Pedestal and stacking options", "Reference", "carried", 58],
  ],
  EL: [["T-EL-010", "EnergyGuide values", "Reference", "new", 38]],
  PSS: [
    ["T-PS-010", "Dimensions and Clearances", "Reference", "revised", 96, "ECN-4471 changes the cabinet depth."],
    ["T-PS-020", "Electrical and Water", "Reference", "revised", 88, "Inlet pressure minimum is 20 psi."],
    ["T-PS-030", "Capacity and Performance", "Reference", "revised", 124, "ECN-4471 changes the max spin speed."],
  ],
  WAR: [
    ["T-WA-010", "Limited warranty terms", "Reference", "carried", 286],
    ["T-WA-020", "What is not covered", "Reference", "carried", 198],
  ],
  TS: [
    ["T-TS-010", "Service Safety", "Safety", "carried", 96],
    ["T-TS-020", "Diagnostic mode entry", "Task", "carried", 142],
    ["T-TS-030", "Fault code table", "Reference", "revised", 318, "Wi-Fi module fault codes added."],
    ["T-TS-040", "Component resistance values", "Reference", "revised", 164, "Suspension and drain pump part changes."],
    ["T-TS-050", "Wiring diagram", "Reference", "new", 72],
  ],
  SM: [
    ["T-SM-010", "Service Safety", "Safety", "carried", 248],
    ["T-SM-020", "Product Identification", "Reference", "revised", 132, "Model and serial break."],
    ["T-SM-030", "Theory of Operation: wash system", "Concept", "carried", 486],
    ["T-SM-040", "Theory of Operation: drive and suspension", "Concept", "revised", 392, "Suspension rod kit W-SUS-3316."],
    ["T-SM-050", "Theory of Operation: connectivity", "Concept", "new", 274],
    ["T-SM-060", "Diagnostic Mode", "Task", "carried", 318],
    ["T-SM-070", "Fault Codes", "Reference", "revised", 612, "Wi-Fi module fault codes added."],
    ["T-SM-080", "Remove the console", "Task", "carried", 226],
    ["T-SM-090", "Remove the cabinet rear panel", "Task", "revised", 204, "Standoffs added behind the rear panel."],
    ["T-SM-100", "Replace the drain pump", "Task", "revised", 262, "Pump superseded to W-PMP-2214."],
    ["T-SM-110", "Replace the suspension rods", "Task", "revised", 288, "Suspension rod kit W-SUS-3316."],
    ["T-SM-120", "Replace the Wi-Fi module", "Task", "new", 196],
    ["T-SM-130", "Component Testing", "Reference", "carried", 428],
    ["T-SM-140", "Wiring Diagram", "Reference", "new", 86],
  ],
  IPC: [
    ["T-PC-010", "Cabinet and top", "Reference", "revised", 148, "Standoff W-11027-441 added."],
    ["T-PC-020", "Console and controls", "Reference", "revised", 132, "Wi-Fi module WM-24 added."],
    ["T-PC-030", "Basket, tub and impeller", "Reference", "carried", 164],
    ["T-PC-040", "Drive and suspension", "Reference", "revised", 126, "Suspension rod kit W-SUS-3316."],
    ["T-PC-050", "Pump and hoses", "Reference", "revised", 118, "Pump superseded to W-PMP-2214."],
    ["T-PC-060", "Dispenser", "Reference", "revised", 104, "Detergent reservoir W-RSV-0048 added."],
  ],
};

/** New topics with no fr-CA rendering yet. */
export const MISSING_FR = ["T-UC-070", "T-UC-110", "T-UC-170"];
/** New Wi-Fi topics already translated for the front-load programme. */
export const SHARED_FR = ["T-UC-050", "T-UC-060"];

function toTopic(doc: DocTypeId, langs: Lang[]) {
  return ([id, title, type, disposition, words, note]: Row): Topic => {
    const reworded = note?.startsWith("reworded:") ?? false;
    return {
      id,
      doc,
      title,
      type,
      disposition,
      reworded,
      reason: note?.replace("reworded:", ""),
      reusedFrom: disposition === "new" ? undefined : `NTL-8127 · ${id}`,
      words,
      langs: MISSING_FR.includes(id) ? langs.filter((l) => l !== "fr-CA") : langs,
    };
  };
}

export const TOPICS: Topic[] = [
  ...UC.map(toTopic("UCG", ALL)),
  ...(Object.entries(OTHER) as [DocTypeId, Row[]][]).flatMap(([doc, rows]) =>
    rows.map(toTopic(doc, doc === "II" || doc === "QSG" || doc === "WAR" ? ALL : doc === "IPC" ? ["en-US"] : NA)),
  ),
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
export const topicsForDoc = (doc: DocTypeId) => TOPICS.filter((t) => t.doc === doc);

/** The carry-over topics an author reworded with no ECN behind the change. */
export const REWORDED_UC = TOPICS.filter((t) => t.doc === "UCG" && t.reworded).map((t) => t.id);

/**
 * Where a topic is used across the model line. Carry-over safety and service
 * boilerplate travels furthest; new topics live in one model until reused.
 */
export function whereUsed(topic: Topic): { modelId: string; doc: DocTypeId }[] {
  const uses: { modelId: string; doc: DocTypeId }[] = [{ modelId: "NTL-6157", doc: topic.doc }];
  if (topic.disposition === "new") {
    if (SHARED_FR.includes(topic.id) || topic.id === "T-UC-170") uses.push({ modelId: "NFL-4420", doc: topic.doc });
    return uses;
  }
  uses.push({ modelId: "NTL-8127", doc: topic.doc });
  const laundry = MODELS.filter((m) => m.line === "Laundry" && m.id !== "NTL-6157");
  const washers = laundry.filter((m) => m.family.includes("washer"));
  if (topic.type === "Safety" || topic.doc === "WAR") laundry.forEach((m) => uses.push({ modelId: m.id, doc: topic.doc }));
  else if (topic.disposition === "carried") washers.filter((m) => m.family === "Top-load washer").forEach((m) => uses.push({ modelId: m.id, doc: topic.doc }));
  if (topic.doc === "UCG" && topic.type === "Safety") uses.push({ modelId: "NTL-6157", doc: "QSG" });
  return uses;
}
