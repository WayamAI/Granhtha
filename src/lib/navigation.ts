/**
 * Primary navigation.
 *
 * One source of truth: the sidebar, the command palette's page results and the
 * top bar's title all read this. Adding a route means adding it here once.
 *
 * Groups with more than one item render as a collapsible tree in the sidebar.
 * Optional `sections` add a second branch level. Keep the sidebar to seven
 * groups or fewer so the collapsed rail never outgrows a laptop viewport.
 */

import {
  BadgeDollarSign,
  BookA,
  BookCopy,
  Blocks,
  Cable,
  FilePen,
  FileSpreadsheet,
  FolderCog,
  GitCompareArrows,
  Languages,
  LayoutDashboard,
  ListChecks,
  PenLine,
  Printer,
  Ruler,
  ScrollText,
  Settings,
  ShieldCheck,
  Signature,
  Stamp,
  Tag,
  type LucideIcon,
} from "lucide-react";

import { FINDINGS } from "./grantha/document";
import { ECNS } from "./grantha/ecn";
import { DOCS } from "./grantha/data";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Open-work count shown beside the leaf in the expanded tree. */
  badge?: number;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  /** Optional second-level labels inside a dropdown. */
  sections?: NavSection[];
  /** Hidden from the sidebar; still indexed for the top bar and search. */
  sidebar?: false;
}

/** Open-work counts at session start. Live counts are shown on the pages themselves. */
const OPEN_FINDINGS = FINDINGS.length;
const ECNS_WAITING = ECNS.length;
const IN_REVIEW = DOCS.filter((d) => d.stage === "verified" || d.stage === "in-review").length;

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "command-center",
    label: "Command Center",
    icon: LayoutDashboard,
    items: [{ label: "Command Center", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    id: "author",
    label: "Author",
    icon: PenLine,
    items: [
      { label: "Generate", href: "/generate", icon: Printer },
      { label: "Literature Set", href: "/library", icon: BookCopy },
      { label: "Topic Library", href: "/topics", icon: Blocks },
    ],
  },
  {
    id: "verify",
    label: "Verify",
    icon: ShieldCheck,
    items: [
      { label: "Findings", href: "/findings", icon: ListChecks, badge: OPEN_FINDINGS },
      { label: "Traceability", href: "/traceability", icon: Cable },
      { label: "Rule Library", href: "/rules", icon: Ruler },
    ],
  },
  {
    id: "change",
    label: "Change",
    icon: Stamp,
    items: [
      { label: "Change Impact", href: "/change-impact", icon: Stamp, badge: ECNS_WAITING },
      { label: "Reuse & Delta", href: "/reuse", icon: GitCompareArrows },
    ],
  },
  {
    id: "localise",
    label: "Localise",
    icon: Languages,
    items: [{ label: "Localise", href: "/localisation", icon: Languages }],
  },
  {
    id: "records",
    label: "Records",
    icon: FolderCog,
    items: [
      { label: "Source Records", href: "/records", icon: FileSpreadsheet },
      { label: "Terminology", href: "/terminology", icon: BookA },
      { label: "Facts", href: "/facts", icon: Tag },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    icon: Signature,
    items: [
      { label: "Sign-off", href: "/signoff", icon: FilePen, badge: IN_REVIEW },
      { label: "Business Case", href: "/business-case", icon: BadgeDollarSign },
      { label: "Audit Trail", href: "/audit", icon: ScrollText },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    sidebar: false,
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export function itemsInGroup(group: NavGroup): NavItem[] {
  return group.sections?.length
    ? group.sections.flatMap((section) => section.items)
    : group.items;
}

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(itemsInGroup);

export const SIDEBAR_GROUPS: NavGroup[] = NAV_GROUPS.filter((g) => g.sidebar !== false);

/** Longest-prefix match, so /designs/D-1 still resolves to Designs. */
export function navItemForPath(pathname: string): NavItem | undefined {
  return ALL_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}

export function groupForPath(pathname: string): NavGroup | undefined {
  const item = navItemForPath(pathname);
  if (!item) return undefined;
  return NAV_GROUPS.find((g) => itemsInGroup(g).includes(item));
}
