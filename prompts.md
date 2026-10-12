# Grantha 3D mark prompts

Copy-paste these into Flow, Midjourney, or Ideogram. Every prompt is built for **Grantha**, the Wayam AI technical-literature authoring desk for an appliance maker, not generic document clipart.

Use them on page headers, KPI tiles, flow-canvas nodes, pipeline steps, agent observation cards and empty states. Do **not** put readable text, model numbers, document numbers, signal words, safety symbols, brand marks or people in the render. The Lucide icons in the sidebar stay; these are the dimensional marks for headers, tiles and empty surfaces. Until a render exists, the app shows the Lucide fallback registered for that id in `src/lib/marks.ts`.

## Color lock (use this every time)

Wayam orange is token `--ref-orange-500`.

| Role | Hex | Token |
| --- | --- | --- |
| Hero / body | `#FF7B1C` | `--ref-orange-500` |
| Rim / highlight | `#FFB365` | `--ref-orange-300` |
| Mid shade | `#FF963D` | `--ref-orange-400` |
| Recess / core | `#C1460F` | `--ref-orange-700` |
| Deep shadow | `#9A3814` | `--ref-orange-800` |
| Ember | `#431507` | `--ref-orange-950` |
| Studio void | `#101010` | `--ref-gray-950` |
| Graphite body | `#191919` | `--ref-gray-900` |

Do not substitute coral, amber, gold, or red. If a second material is needed, it is **dark graphite**, never a second brand color.

## Login page background

Save the render as `public/brand/login-bg.jpg`. The login screen object-covers it in the left panel (~4:5 portrait). No text, logos, faces, model numbers, safety symbols, or Gemini watermark.

```
Cinematic still for a dark technical-literature authoring desk login, 4:5 portrait 2400x3000, 8k, photoreal 3D product cinema. A vast graphite #101010 print hall seen from a three-quarter balcony: one monumental open manual with a graphite spiral spine stands like a building, its blank pages Wayam-orange #FF7B1C, #FFB365 rim light from upper left, #C1460F recesses between the pages. Along graphite channels in the floor, thick engineering record ledger slabs glide toward the manual; small square fact tiles lift out of the slabs and travel on thin taut tether lines into the pages, each line ending at a point on a page. At the far side a glass prism splits one wide orange ribbon into three ribbons that leave toward a distant void: one source text, three market languages. A heavy engineering-change stamp hangs above the hall on a graphite gantry. Satin polymer and brushed graphite only. Shallow depth of field, anamorphic bokeh, no floor-shadow fade into white. No people, no human faces, no desks, no laptops, no UI screens, no appliances with brand marks, no letters, no numbers, no warning triangles with symbols, no logos, no watermarks, no Gemini sparkle. Hue locked to #FF7B1C, not red, not amber, not gold.
```

## Style prefix (paste before every subject)

```
3D product icon, one object, centered, 1:1 square, 8k, studio key light from upper left, dark graphite #101010 void, no floor shadow fade, Wayam orange #FF7B1C as the only chromatic color with #FFB365 rim light and #C1460F recesses, satin polymer with a single glass specular, crisp silhouette readable at 64px, no text, no letters, no numbers, no logos, no human faces, no watermarks, no extra props
```

Then append the subject line.

---

## Command center and literature flow

Use on the `/dashboard` header, the eight flow-canvas nodes (Records in through Translated) and the four pipeline steps on `/generate`.

1. a 3D Wayam-orange `#FF7B1C` documentation control lectern, a slanted stand holding one thick open manual, a row of graphite index tabs along its lower edge, front three-quarter view
2. a 3D Wayam-orange `#FF7B1C` engineering record ledger slab lying in a graphite inbox tray, three recessed row grooves on its top face, graphite spine
3. a 3D Wayam-orange `#FF7B1C` square fact tile being lifted out of a graphite ledger slab by a thin graphite tweezer arm, a matching square recess left behind
4. a 3D Wayam-orange `#FF7B1C` open user manual with a graphite spiral spine, blank pages fanned, one page caught mid-turn
5. a 3D Wayam-orange `#FF7B1C` thin manual held between the jaws of a graphite go/no-go rule gauge, the gauge closed flush on it
6. a 3D Wayam-orange `#FF7B1C` reading loupe on a short graphite stand over a blank manual page, glass lens with one specular
7. a 3D Wayam-orange `#FF7B1C` sign-off signet ring pressed into a round seal bead on the corner of a blank graphite page, abstract seal face, no letters
8. a 3D Wayam-orange `#FF7B1C` bound stack of five identical manuals tied with a graphite strap, squared corners, ready to ship
9. a 3D Wayam-orange `#FF7B1C` row of three manuals of the same shape standing like books, each spine cut with a different graphite notch pattern, three market languages

## Command center KPIs and observations

Use on the six `/dashboard` KPI tiles, the matching tiles on `/findings`, `/traceability`, `/reuse` and `/business-case`, and every agent observation card.

10. a 3D Wayam-orange `#FF7B1C` manual stopped against a lowered graphite gate bar, the book pressed to the barrier, blocked from release
11. a 3D Wayam-orange `#FF7B1C` safety-alert triangle prism, a thick equilateral triangular volume standing upright with a recessed inner triangle, completely blank, no symbol, graphite base
12. a 3D Wayam-orange `#FF7B1C` fact tile tethered by one taut graphite line to a point on a blank page, the line pulled straight
13. a 3D Wayam-orange `#FF7B1C` topic brick wall in running bond with graphite grout, one brighter rim-lit new brick being slotted into a gap
14. a 3D Wayam-orange `#FF7B1C` coin stack resting inside the open cover of a graphite manual, a ribbon bookmark looped round the coins, spend avoided
15. a 3D Wayam-orange `#FF7B1C` engineering-change stamp fused to a graphite hourglass, the stamp head forming the upper bulb
16. a 3D Wayam-orange `#FF7B1C` author's desk lamp with an orange shade and a jointed graphite arm, lighting one small faceted ember crystal on the desk

## Author

Use on `/generate`, `/library`, `/library/[docId]` and `/topics`.

17. a 3D Wayam-orange `#FF7B1C` compact press roller pulling a blank manual page out of a graphite record cassette
18. a 3D Wayam-orange `#FF7B1C` set of ten slim manuals of different thicknesses standing in a graphite slipcase, orange spines, no lettering
19. a 3D Wayam-orange `#FF7B1C` single manual open flat on a graphite reading stand, a ribbon bookmark across the right-hand page
20. a 3D Wayam-orange `#FF7B1C` parts-catalog exploded stack, four flat appliance component plates floating apart along one vertical graphite axis line
21. a 3D Wayam-orange `#FF7B1C` row of four modular topic blocks of different lengths clicked together, one block lifted out above its slot, graphite studs

## Verify

Use on `/findings`, `/traceability`, `/rules`, and on the verdict banner once a document is ready for sign-off.

22. a 3D Wayam-orange `#FF7B1C` redaction strike bar laid across three graphite text-line ridges on a blank page, the bar thick and bevelled
23. a 3D Wayam-orange `#FF7B1C` closed manual with a round medallion clipped to its cover, a closed ring with an abstract tick cut as a groove, not a letter, graphite clip
24. a 3D Wayam-orange `#FF7B1C` three fact tiles each joined by a thin graphite cable to the edge of one blank page, cables parallel and taut
25. a 3D Wayam-orange `#FF7B1C` gauge block being checked against a set of three stepped graphite gauge blocks, machinist's rule set, no engraved numbers
26. a 3D Wayam-orange `#FF7B1C` blank safety signal panel, a thick rectangular plate with an orange header band over a graphite body and a small blank triangle prism mounted at the left of the band, no text

## Change

Use on `/change-impact` (header and each engineering-change card) and `/reuse`.

27. a 3D Wayam-orange `#FF7B1C` engineering-change stamp, a heavy stamp with a turned handle hovering above a graphite revision block, blank stamp face
28. a 3D Wayam-orange `#FF7B1C` pair of overlapped manuals, predecessor and successor, the shared block of pages fused in orange and the differing pages in graphite

## Localise

Use on `/localisation` (header, leverage tiles, rewording tax panel, translation queue) and the rewording tax panel on `/reuse`.

29. a 3D Wayam-orange `#FF7B1C` translation prism, a glass wedge splitting one orange ribbon into three ribbons that leave the far face at different angles
30. a 3D Wayam-orange `#FF7B1C` ribbon that frays into loose threads where it passes through a small graphite toll gate, intact before the gate
31. a 3D Wayam-orange `#FF7B1C` glossary term block held in a graphite padlock shackle, riding a short graphite conveyor

## Records

Use on `/records`, `/terminology` and `/facts`, and in the fact drawer.

32. a 3D Wayam-orange `#FF7B1C` stack of three engineering record ledger slabs of different sizes separated by graphite tab dividers
33. a 3D Wayam-orange `#FF7B1C` glossary index block, a thick thumb-indexed book block with stepped graphite index cuts down the fore-edge, no letters
34. a 3D Wayam-orange `#FF7B1C` graphite tray holding blank square fact tiles in a three-by-three grid, one tile raised above the rest

## Governance and system

Use on `/signoff`, `/business-case`, `/audit`, `/settings`, and every empty state.

35. a 3D Wayam-orange `#FF7B1C` lever seal press closing on the corner of a blank graphite document, signet die in the jaw, no letters
36. a 3D Wayam-orange `#FF7B1C` balance scale with a manual on one pan and a short coin stack on the other, graphite beam and post
37. a 3D Wayam-orange `#FF7B1C` audit scroll, a long ledger roll with a graphite wax bead and entries as shallow blank grooves, no writing
38. a 3D Wayam-orange `#FF7B1C` threshold dial, a knurled graphite knob with one orange index mark set against a blank gauge arc
39. a 3D Wayam-orange `#FF7B1C` single blank manual page curling at one corner on a graphite surface, nothing on it

---

## How to generate

- One subject per image. Do not collage several of these into one render.
- Export **square PNG**, transparent if the tool allows, else `#101010` background so it sits on `bg-container`.
- Target **1024²**; the UI displays them at 28px on tiles and cards, 44px on page headers and 56–64px on empty states.
- If the model adds text, rerun with `no text, no letters, no numbers` at the end.
- If the orange drifts toward red or gold, append `hue locked to #FF7B1C, not red, not amber`.
- Prompts 11 and 26 must stay blank: no exclamation mark, no lightning bolt, no signal word. A rendered safety symbol would read as a real hazard label.
- Do not generate appliance brand marks, model plates or regulatory logos.
- Save each render under the filename below. No code change is needed: `Mark` loads `public/images/marks/<id>.png` and falls back to the Lucide glyph when the file is missing.

## Filenames

| # | Mark id | File | Where it appears |
| --- | --- | --- | --- |
| 1 | `mark-command` | `public/images/marks/mark-command.png` | `/dashboard` page header |
| 2 | `mark-flow-records` | `public/images/marks/mark-flow-records.png` | Flow canvas: Records in. `/generate` pipeline: input check |
| 3 | `mark-flow-extracted` | `public/images/marks/mark-flow-extracted.png` | Flow canvas: Extracted. `/generate` pipeline: extractor |
| 4 | `mark-flow-drafted` | `public/images/marks/mark-flow-drafted.png` | Flow canvas: Drafted. `/generate` pipeline: author |
| 5 | `mark-flow-verified` | `public/images/marks/mark-flow-verified.png` | Flow canvas: Verified. `/generate` pipeline: verifier |
| 6 | `mark-flow-review` | `public/images/marks/mark-flow-review.png` | Flow canvas: In review |
| 7 | `mark-flow-signed` | `public/images/marks/mark-flow-signed.png` | Flow canvas: Signed off |
| 8 | `mark-flow-published` | `public/images/marks/mark-flow-published.png` | Flow canvas: Published |
| 9 | `mark-flow-translated` | `public/images/marks/mark-flow-translated.png` | Flow canvas: Translated |
| 10 | `mark-kpi-blocked` | `public/images/marks/mark-kpi-blocked.png` | `/dashboard` KPI: blocked from release |
| 11 | `mark-kpi-danger` | `public/images/marks/mark-kpi-danger.png` | `/dashboard` KPI: open DANGER findings |
| 12 | `mark-kpi-trace` | `public/images/marks/mark-kpi-trace.png` | `/dashboard` and `/traceability` KPI: coverage. `/rules` traceability group |
| 13 | `mark-kpi-reuse` | `public/images/marks/mark-kpi-reuse.png` | `/dashboard` and `/reuse` KPI: carry-over reuse |
| 14 | `mark-kpi-spend` | `public/images/marks/mark-kpi-spend.png` | `/dashboard` and `/business-case` KPI: translation spend avoided |
| 15 | `mark-kpi-cycle` | `public/images/marks/mark-kpi-cycle.png` | `/dashboard` and `/business-case` KPI: days from ECN to reissue |
| 16 | `mark-insight` | `public/images/marks/mark-insight.png` | Agent observation cards on `/dashboard` |
| 17 | `mark-generate` | `public/images/marks/mark-generate.png` | `/generate` page header |
| 18 | `mark-library` | `public/images/marks/mark-library.png` | `/library` page header |
| 19 | `mark-doc-reading` | `public/images/marks/mark-doc-reading.png` | `/library/[docId]` header and the title block of the manual preview |
| 20 | `mark-parts-catalog` | `public/images/marks/mark-parts-catalog.png` | `/library/[docId]` structure view |
| 21 | `mark-topics` | `public/images/marks/mark-topics.png` | `/topics` page header |
| 22 | `mark-findings` | `public/images/marks/mark-findings.png` | `/findings` page header. `/signoff` not-yet-eligible strip |
| 23 | `mark-verdict-ready` | `public/images/marks/mark-verdict-ready.png` | Verdict banner when ready for sign-off. `/traceability` no-orphans state |
| 24 | `mark-traceability` | `public/images/marks/mark-traceability.png` | `/traceability` page header |
| 25 | `mark-rules` | `public/images/marks/mark-rules.png` | `/rules` page header and rule group cards |
| 26 | `mark-safety-panel` | `public/images/marks/mark-safety-panel.png` | `/rules` safety conformance group. Safety-critical ECNs on `/dashboard` and `/change-impact` |
| 27 | `mark-change-impact` | `public/images/marks/mark-change-impact.png` | `/change-impact` page header and ECN cards. ECN list on `/dashboard` |
| 28 | `mark-reuse` | `public/images/marks/mark-reuse.png` | `/reuse` page header |
| 29 | `mark-localisation` | `public/images/marks/mark-localisation.png` | `/localisation` page header and leverage tiles. `/rules` localisation group |
| 30 | `mark-rewording-tax` | `public/images/marks/mark-rewording-tax.png` | Rewording tax panels on `/localisation` and `/reuse` |
| 31 | `mark-mt-queue` | `public/images/marks/mark-mt-queue.png` | `/localisation` terminology-locked translation queue |
| 32 | `mark-records` | `public/images/marks/mark-records.png` | `/records` page header |
| 33 | `mark-terminology` | `public/images/marks/mark-terminology.png` | `/terminology` page header. `/rules` terminology group |
| 34 | `mark-facts` | `public/images/marks/mark-facts.png` | `/facts` page header and the fact drawer |
| 35 | `mark-signoff` | `public/images/marks/mark-signoff.png` | `/signoff` page header |
| 36 | `mark-business-case` | `public/images/marks/mark-business-case.png` | `/business-case` page header |
| 37 | `mark-audit` | `public/images/marks/mark-audit.png` | `/audit` page header |
| 38 | `mark-settings` | `public/images/marks/mark-settings.png` | `/settings` page header |
| 39 | `mark-empty` | `public/images/marks/mark-empty.png` | Empty states on `/generate`, `/findings`, `/library/[docId]`, `/signoff` |
