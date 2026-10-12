# Grantha

**ग्रन्थ** (grantha) is Sanskrit for a treatise: an authored, bound text. Grantha is a Wayam AI accelerator that writes an appliance maker's technical literature from the product's own engineering record, then checks the draft against that record rule by rule.

## What it is

Every appliance ships with a set of documents: Use & Care Guide, Installation Instructions, Quick Start Guide, Dimension Guide, energy label, Product Specification Sheet, Warranty, Tech Sheet, Service Manual and Illustrated Parts Catalog. Each is reissued whenever engineering changes anything, in every market language (here en-US, fr-CA and es-MX).

Grantha drafts those documents from released engineering records: the PLM item attribute report, the indented BOM, engineering change notices, the compliance matrix and the DVP&R test report. Three principles hold throughout:

- **The model proposes wording only.** It writes from an extracted fact base and may not state a figure the fact base does not hold.
- **Rules decide pass or fail.** Traceability, completeness, ANSI Z535.6 safety-message form, terminology, readability and localisation are deterministic checks with a clause behind each. A model reviewing its own draft catches a minority of its errors, so it never grades itself.
- **A named technical author signs.** A document reaches sign-off only when no DANGER or WARNING finding is open, and a person approves it, as IEC/IEEE 82079-1 expects.

## Who it serves

Technical authors, documentation managers, compliance and regulatory leads, localisation leads and service-content owners at a home-appliance OEM. The demo tenant is the fictional **Northfield Appliances**, with eight fictional models across laundry, kitchen and refrigeration. The model carried in depth is the `NTL-6157` top-load washer, which supersedes `NTL-8127`.

## Use cases, page by page

| Group | Page | Route | What it answers |
| --- | --- | --- | --- |
| Command Center | Command Center | `/dashboard` | Which of the 80 documents are stuck, what stops each one, and which ECNs still wait on literature. The flow canvas filters the release-blocker queue. |
| Author | Generate | `/generate` | Three-pane workspace: source records, the paced pipeline and the printed-manual preview, and the 35 rule checks. Every figure in the preview opens its fact and record line. |
| Author | Literature Set | `/library` | The ten documents per model with status, pages, languages, percent generated and findings against today's record. |
| Author | Document | `/library/[docId]` | One document: full text (Use & Care Guide, NTL-6157) or its topic structure, its findings, language renderings and sign-off state. |
| Author | Topic Library | `/topics` | The reusable DITA-style topics behind the set, their disposition against the predecessor, and where each is used across models and documents. |
| Verify | Findings | `/findings` | The 13 findings on the live document. Apply fix, dismiss with a reason, request a waiver, or assign. Applying a fix rewrites the span, re-runs the rule and moves the verdict. |
| Verify | Traceability | `/traceability` | Fact, record line and sentence in one matrix, with coverage, orphan figures and required facts not yet used. |
| Verify | Rule Library | `/rules` | The 27 deterministic rules in six groups: what each tests, the clause, severity, hit counts, and an audited on/off switch. |
| Change | Change Impact | `/change-impact` | Pick an ECN and see every document, topic, sentence, table cell, illustration callout and language rendering it touches, the reissue cost, and one action to open a revision set. |
| Change | Reuse & Delta | `/reuse` | The carry-over plan against the predecessor: carried, revised for an ECN, new, and reworded for no engineering reason. |
| Localise | Localise | `/localisation` | Exact, fuzzy and new words per language, cost per language, topics with no rendering, the terminology-locked translation queue, and the rewording tax in dollars. |
| Records | Source Records | `/records` | Readable previews of the engineering records per model, release state, and whether the records agree. Overtyping a value makes the input check fail visibly. |
| Records | Terminology | `/terminology` | The brand glossary: approved term, forbidden variants, locked target terms, and occurrences in open drafts. |
| Records | Facts | `/facts` | The 51 extracted facts with value, unit, source line and where each is used, plus the prohibitions and required statements the records impose. |
| Governance | Sign-off | `/signoff` | Documents whose blocking checks pass, with the evidence summary a named author approves or returns. |
| Governance | Business Case | `/business-case` | Authoring hours, translation spend, cycle time and escaped findings by model, with adjustable rate and run cost. |
| Governance | Audit Trail | `/audit` | Every draft, check, fix, dismissal, rule change and signature, including the actions taken in the current session. |
| (hidden) | Settings | `/settings` | Systems of record, rule thresholds, signing authority, theme. |

### The headline workflow

1. Open `/findings`. The verdict reads **Not ready to issue. 6 checks fail**.
2. Select a finding. The document on the right scrolls to the span: an untraceable `1,100 RPM`, a prohibited `up to 40 loads` claim, a WARNING with no avoidance instruction, a missing FCC statement.
3. **Apply fix.** The span is rewritten from the fact base, the rule is re-run, and the finding closes.
4. When no DANGER or WARNING remains, the verdict flips to **Ready for sign-off**, the document joins `/signoff`, and the Command Center numbers move.
5. A named author approves it. The signature and its evidence summary land in `/audit`.

### Shared state

Findings, the document text, the 35 checks, the verdict, traceability coverage, translation leverage, the literature set, the sign-off queue, dashboard KPIs and the audit trail all derive from one session state (`src/lib/grantha/context.tsx`). Examples: restoring the three reworded topics on `/reuse` lifts es-MX leverage from 61% to 77% and closes finding F-11; overtyping a record value on `/records` fails the input check on `/generate`; switching a rule off on `/rules` removes its findings from the verdict and writes an audit entry.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4 on the Wayam semantic token system (`src/styles/tokens.css`), light by default with a dark theme
- recharts for charts, lucide-react for icons
- Entirely client-side over a deterministic synthetic dataset in `src/lib/grantha/`. No backend, no model calls, no randomness, fixed dates around October 2026

```
src/lib/grantha/
  data.ts        models, document types, the 80-document literature set, generate catalogue
  records.ts     engineering records, the fact base, prohibitions and required statements
  document.ts    the NTL-6157 Use & Care Guide text and its 13 findings
  rules.ts       the rule library and the output checks
  topics.ts      topics, dispositions, where-used
  ecn.ts         engineering changes, their impacts, reissue cost
  misc.ts        glossary, audit history, agent observations, business-case baseline
  selectors.ts   every derived number (document resolution, checks, verdict, leverage, KPIs)
  context.tsx    session state and actions
src/lib/marks.ts mark registry: id, fallback icon, where used
```

## Run

```
npm install
npm run dev
```

The app runs on **http://localhost:3103** (the port is set in `package.json`). `npm run build` and `npm run start` serve the production build on the same port.

## Demo sign-in

- Email: `operator@grantha.ai`
- Password: `command`

The sign-in page has a **Demo operator** link that fills both fields. The session is a cookie only; there is no identity provider. Reloading the page returns the demo to its starting state.

## Dropping in the Flow renders

`prompts.md` holds the Google Flow prompt pack: the color lock, the login background prompt, the style prefix, and one numbered subject for each of the 39 mark ids.

1. Generate each subject as a square PNG (1024², transparent or on `#101010`).
2. Save it as `public/images/marks/<mark id>.png`, using the Filenames table at the end of `prompts.md`.
3. Save the login background as `public/brand/login-bg.jpg` (4:5 portrait, 2400×3000).

No code change is needed. `Mark` loads the PNG for an id and shows the Lucide glyph registered in `src/lib/marks.ts` until the file exists.

## Notes on the data

All organisations, people, models, part numbers, document numbers, the app name and the cleaner brand are fictional. Standards, regulations and enterprise systems are real and named as such (IEC/IEEE 82079-1, ANSI Z535.6, ASD-STE100, 47 CFR Part 15, ISED RSS-Gen, NOM-003-SCFI, UL 2157, Windchill, SAP S/4HANA). Clause references in the rule library are indicative and should be confirmed against the current edition of each standard before production use.
