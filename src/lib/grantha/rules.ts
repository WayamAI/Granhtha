/** The deterministic checks. A rule is a test, not a prompt. */

import type { Rule, Severity } from "./types";

export const RULE_GROUPS: { id: Rule["group"]; standard: string; summary: string }[] = [
  { id: "Traceability", standard: "IEC/IEEE 82079-1, correctness", summary: "Every figure and claim resolves to a line in a released record." },
  { id: "Completeness", standard: "IEC/IEEE 82079-1, completeness", summary: "Nothing the market or the document type requires is missing." },
  { id: "Safety conformance", standard: "ANSI Z535.6", summary: "Safety messages are built and ranked the way the standard requires." },
  { id: "Terminology", standard: "Brand glossary NF-GL", summary: "One approved term for one thing, in every document." },
  { id: "Readability", standard: "ASD-STE100, Flesch-Kincaid", summary: "Sentences a consumer or a technician can act on the first time." },
  { id: "Localisation", standard: "Translation memory NF-TM", summary: "Every market language is present and reuses what was already translated." },
];

export const RULES: Rule[] = [
  { id: "GRN-TRC-001", group: "Traceability", name: "Every figure has a supporting fact", tests: "Each number with a unit, each count and each named limit in the draft is matched to a fact in the fact base. A figure with no fact is an orphan.", clause: "IEC/IEEE 82079-1 §5.3, correctness", severity: "WARNING", lineHits: 41 },
  { id: "GRN-TRC-002", group: "Traceability", name: "Figure equals the cited fact", tests: "Value and unit in the sentence are compared with the fact after unit normalisation. A different value is a contradiction.", clause: "IEC/IEEE 82079-1 §5.3, correctness", severity: "WARNING", lineHits: 27 },
  { id: "GRN-TRC-003", group: "Traceability", name: "Cited record is released and current", tests: "The record revision behind each fact is the released revision in PLM, with every released ECN applied.", clause: "IEC/IEEE 82079-1 §5.3, consistency", severity: "WARNING", lineHits: 9 },
  { id: "GRN-TRC-004", group: "Traceability", name: "No prohibited claim is published", tests: "Sentences are matched against the prohibitions extracted from test and compliance records: untested performance, unapproved claims.", clause: "FTC Act §5, claim substantiation · record prohibition", severity: "DANGER", lineHits: 6 },
  { id: "GRN-CMP-001", group: "Completeness", name: "Required statements are present", tests: "Each required statement in the compliance matrix is found in the draft with its mandated wording.", clause: "47 CFR 15.19 and 15.105 · RSS-Gen", severity: "DANGER", lineHits: 8 },
  { id: "GRN-CMP-002", group: "Completeness", name: "All sections of the document type are present", tests: "The section list of the draft is compared with the template for its document type, in order.", clause: "IEC/IEEE 82079-1 §5.3, completeness", severity: "WARNING", lineHits: 3 },
  { id: "GRN-CMP-003", group: "Completeness", name: "Title block is complete", tests: "Model, product name, document number, revision, language and issue date are present and match the record.", clause: "IEC/IEEE 82079-1, identification of the information", severity: "CAUTION", lineHits: 5 },
  { id: "GRN-CMP-004", group: "Completeness", name: "Every required fact is used", tests: "Facts marked required for the document type appear at least once in the draft.", clause: "IEC/IEEE 82079-1 §5.3, completeness", severity: "CAUTION", lineHits: 12 },
  { id: "GRN-SAF-001", group: "Safety conformance", name: "Safety message states hazard, consequence and avoidance", tests: "Each safety message is parsed for the nature of the hazard, the consequence of not avoiding it and how to avoid it.", clause: "ANSI Z535.6 §6.3", severity: "DANGER", lineHits: 11 },
  { id: "GRN-SAF-002", group: "Safety conformance", name: "NOTICE is for property damage only", tests: "A NOTICE carries no safety alert symbol and names no personal-injury hazard.", clause: "ANSI Z535.6 §5.2", severity: "WARNING", lineHits: 14 },
  { id: "GRN-SAF-003", group: "Safety conformance", name: "Signal word matches hazard severity", tests: "The signal word is compared with the severity recorded for the hazard in the design FMEA.", clause: "ANSI Z535.6 §5.1", severity: "DANGER", lineHits: 4 },
  { id: "GRN-SAF-004", group: "Safety conformance", name: "Section safety message precedes the procedure", tests: "A hazard that applies to a procedure is stated before step 1, not inside or after the steps.", clause: "ANSI Z535.6 §7", severity: "WARNING", lineHits: 7 },
  { id: "GRN-TRM-001", group: "Terminology", name: "Only approved glossary terms", tests: "Every forbidden variant in the brand glossary is searched for in the draft.", clause: "Glossary NF-GL · IEC/IEEE 82079-1 §5.3, consistency", severity: "CAUTION", lineHits: 63 },
  { id: "GRN-TRM-002", group: "Terminology", name: "One term per part", tests: "A part named in the BOM is referred to by one term within a document.", clause: "ASD-STE100 section 1, words", severity: "CAUTION", lineHits: 22 },
  { id: "GRN-TRM-003", group: "Terminology", name: "Product and app names match the brand register", tests: "Model, product and app names are compared character by character with the register.", clause: "Brand register NF-BR", severity: "WARNING", lineHits: 5 },
  { id: "GRN-TRM-004", group: "Terminology", name: "Units follow the style sheet", tests: "Unit symbols, spacing and the order of US customary and SI units follow the market style sheet.", clause: "Style sheet NF-SS-03", severity: "NOTICE", lineHits: 31 },
  { id: "GRN-RDB-001", group: "Readability", name: "Reading grade 8.0 or lower for consumer documents", tests: "Flesch-Kincaid grade is computed per paragraph. Tables and safety panels are excluded.", clause: "Plain language policy NF-PL-01", severity: "CAUTION", lineHits: 38 },
  { id: "GRN-RDB-002", group: "Readability", name: "Descriptive sentence of 25 words or fewer", tests: "Words are counted per sentence in descriptive text.", clause: "ASD-STE100 section 6", severity: "NOTICE", lineHits: 44 },
  { id: "GRN-RDB-003", group: "Readability", name: "One instruction per step", tests: "Each step is parsed for imperative verbs. More than one unrelated action fails.", clause: "ASD-STE100 section 5", severity: "NOTICE", lineHits: 29 },
  { id: "GRN-RDB-004", group: "Readability", name: "Procedural step of 20 words or fewer", tests: "Words are counted per step in procedures.", clause: "ASD-STE100 section 5", severity: "NOTICE", lineHits: 36 },
  { id: "GRN-RDB-005", group: "Readability", name: "Active voice in procedures", tests: "Steps are checked for passive constructions.", clause: "ASD-STE100 section 3", severity: "NOTICE", lineHits: 18 },
  { id: "GRN-LOC-001", group: "Localisation", name: "Every topic has a source-language master", tests: "Each topic id resolves to one en-US master at the current revision.", clause: "Localisation procedure NF-LP-02", severity: "WARNING", lineHits: 2 },
  { id: "GRN-LOC-002", group: "Localisation", name: "Every topic is rendered in each market language", tests: "Each topic of the document has a rendering for every language of its markets.", clause: "Charter of the French Language · NOM-003-SCFI", severity: "WARNING", lineHits: 17 },
  { id: "GRN-LOC-003", group: "Localisation", name: "Locked glossary terms survive machine translation", tests: "Target text is checked for the locked target term wherever the source term occurs.", clause: "Glossary NF-GL", severity: "WARNING", lineHits: 13 },
  { id: "GRN-LOC-004", group: "Localisation", name: "Units are converted for the locale", tests: "fr-CA and es-MX renderings give SI units first, with the converted value recomputed from the fact.", clause: "Style sheet NF-SS-03", severity: "CAUTION", lineHits: 9 },
  { id: "GRN-LOC-005", group: "Localisation", name: "Exact-match leverage of 75% or more on a successor document", tests: "Exact translation-memory matches as a share of words, per language. Below the threshold means carry-over text was reworded.", clause: "Localisation procedure NF-LP-02", severity: "CAUTION", lineHits: 6 },
  { id: "GRN-LOC-006", group: "Localisation", name: "Market obligation language is present", tests: "Each market with a language obligation in the compliance matrix has that language scheduled.", clause: "NOM-003-SCFI", severity: "WARNING", lineHits: 3 },
];

export const ruleById = (id: string) => RULES.find((r) => r.id === id);

export const SEVERITY_ORDER: Severity[] = ["DANGER", "WARNING", "CAUTION", "NOTICE"];
export const severityRank = (s: Severity) => SEVERITY_ORDER.indexOf(s);
export const isBlocking = (s: Severity) => s === "DANGER" || s === "WARNING";

/** The ten output checks, each backed by one or more rules. */
export const OUTPUT_CHECKS: { id: string; label: string; ruleIds: string[]; pass: string }[] = [
  { id: "C-26", label: "All sections present", ruleIds: ["GRN-CMP-002"], pass: "12 of 12 sections in template order" },
  { id: "C-27", label: "Title block complete", ruleIds: ["GRN-CMP-003"], pass: "Model, document number, revision, language and date present" },
  { id: "C-28", label: "Every figure traces to a record", ruleIds: ["GRN-TRC-001", "GRN-TRC-002", "GRN-TRC-003"], pass: "Every figure resolves to a fact and equals it" },
  { id: "C-29", label: "No prohibited claim published", ruleIds: ["GRN-TRC-004"], pass: "0 of 3 prohibitions matched" },
  { id: "C-30", label: "Required statements present", ruleIds: ["GRN-CMP-001"], pass: "3 of 3 required statements found" },
  { id: "C-31", label: "Safety messages state how to avoid the hazard", ruleIds: ["GRN-SAF-001", "GRN-SAF-003"], pass: "Every safety message has hazard, consequence and avoidance" },
  { id: "C-32", label: "NOTICE used for property damage only", ruleIds: ["GRN-SAF-002"], pass: "No NOTICE carries the safety alert symbol" },
  { id: "C-33", label: "Approved terms only", ruleIds: ["GRN-TRM-001", "GRN-TRM-002"], pass: "No forbidden variant found" },
  { id: "C-34", label: "Readability within limits", ruleIds: ["GRN-RDB-001", "GRN-RDB-004"], pass: "Reading grade and step length within limits" },
  { id: "C-35", label: "Language renderings and leverage", ruleIds: ["GRN-LOC-002", "GRN-LOC-005"], pass: "Every topic rendered, leverage above threshold" },
];
