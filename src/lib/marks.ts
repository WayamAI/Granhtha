/**
 * Mark registry: id, the Lucide glyph shown until the 3D render exists, and
 * where the mark is used. prompts.md carries one Flow prompt per id, in this
 * order. The render for an id lives at public/images/marks/<id>.png.
 */

import {
  BadgeCheck,
  Ban,
  Blocks,
  BookA,
  BookCopy,
  BookOpen,
  BookOpenText,
  BrickWall,
  Cable,
  Calculator,
  Coins,
  Database,
  FileQuestion,
  FileSearch,
  FileSpreadsheet,
  Gauge,
  GitCompareArrows,
  Hourglass,
  Languages,
  Layers,
  LayoutDashboard,
  Library,
  Lightbulb,
  Link2,
  Lock,
  Printer,
  Receipt,
  Ruler,
  ScanSearch,
  ScrollText,
  Settings,
  ShieldAlert,
  Signature,
  Stamp,
  Strikethrough,
  Tag,
  TriangleAlert,
  Globe,
  type LucideIcon,
} from "lucide-react";

export interface MarkDef {
  icon: LucideIcon;
  where: string;
}

export const MARKS = {
  "mark-command": { icon: LayoutDashboard, where: "/dashboard page header" },
  "mark-flow-records": { icon: Database, where: "Flow canvas: Records in. Pipeline: input check" },
  "mark-flow-extracted": { icon: ScanSearch, where: "Flow canvas: Extracted. Pipeline: extractor" },
  "mark-flow-drafted": { icon: BookOpen, where: "Flow canvas: Drafted. Pipeline: author" },
  "mark-flow-verified": { icon: Gauge, where: "Flow canvas: Verified. Pipeline: verifier" },
  "mark-flow-review": { icon: FileSearch, where: "Flow canvas: In review" },
  "mark-flow-signed": { icon: Signature, where: "Flow canvas: Signed off" },
  "mark-flow-published": { icon: Library, where: "Flow canvas: Published" },
  "mark-flow-translated": { icon: Globe, where: "Flow canvas: Translated" },
  "mark-kpi-blocked": { icon: Ban, where: "/dashboard KPI: documents blocked from release" },
  "mark-kpi-danger": { icon: TriangleAlert, where: "/dashboard KPI: open DANGER findings" },
  "mark-kpi-trace": { icon: Link2, where: "/dashboard and /traceability KPI: coverage. /rules traceability group" },
  "mark-kpi-reuse": { icon: BrickWall, where: "/dashboard and /reuse KPI: carry-over reuse" },
  "mark-kpi-spend": { icon: Coins, where: "/dashboard and /business-case KPI: translation spend avoided" },
  "mark-kpi-cycle": { icon: Hourglass, where: "/dashboard and /business-case KPI: days from ECN to reissue" },
  "mark-insight": { icon: Lightbulb, where: "Agent observation cards" },
  "mark-generate": { icon: Printer, where: "/generate page header" },
  "mark-library": { icon: BookCopy, where: "/library page header" },
  "mark-doc-reading": { icon: BookOpenText, where: "/library/[docId] header and manual title block" },
  "mark-parts-catalog": { icon: Layers, where: "/library/[docId] outline view for documents without full text" },
  "mark-topics": { icon: Blocks, where: "/topics page header" },
  "mark-findings": { icon: Strikethrough, where: "/findings page header" },
  "mark-verdict-ready": { icon: BadgeCheck, where: "Verdict banner once the document is ready for sign-off" },
  "mark-traceability": { icon: Cable, where: "/traceability page header" },
  "mark-rules": { icon: Ruler, where: "/rules page header" },
  "mark-safety-panel": { icon: ShieldAlert, where: "/rules safety conformance group. /dashboard safety-critical ECN" },
  "mark-change-impact": { icon: Stamp, where: "/change-impact page header and ECN cards" },
  "mark-reuse": { icon: GitCompareArrows, where: "/reuse page header" },
  "mark-localisation": { icon: Languages, where: "/localisation page header" },
  "mark-rewording-tax": { icon: Receipt, where: "/localisation and /reuse rewording tax panels" },
  "mark-mt-queue": { icon: Lock, where: "/localisation terminology-locked translation queue" },
  "mark-records": { icon: FileSpreadsheet, where: "/records page header" },
  "mark-terminology": { icon: BookA, where: "/terminology page header" },
  "mark-facts": { icon: Tag, where: "/facts page header and the fact drawer" },
  "mark-signoff": { icon: Signature, where: "/signoff page header" },
  "mark-business-case": { icon: Calculator, where: "/business-case page header" },
  "mark-audit": { icon: ScrollText, where: "/audit page header" },
  "mark-settings": { icon: Settings, where: "/settings page header" },
  "mark-empty": { icon: FileQuestion, where: "Empty states across the app" },
} satisfies Record<string, MarkDef>;

export type MarkId = keyof typeof MARKS;

export const MARK_IDS = Object.keys(MARKS) as MarkId[];
