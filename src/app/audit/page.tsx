"use client";

/**
 * Audit Trail: who or what did what, to which object, and when. Actions taken
 * in this session appear at the top as they happen.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Drawer, Field, GMark, LinkBtn } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, FilterChips, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import type { AuditEvent } from "@/lib/grantha/types";

const KIND = { human: { label: "Person", tone: "info" }, agent: { label: "Agent", tone: "neutral" }, rule: { label: "Rule engine", tone: "success" } } as const;

const FILTERS: { id: string; label: string; test: (e: AuditEvent) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "session", label: "This session", test: (e) => Number(e.id.slice(3)) > 2400 },
  { id: "human", label: "People", test: (e) => e.actorKind === "human" },
  { id: "agent", label: "Agents", test: (e) => e.actorKind === "agent" },
  { id: "rule", label: "Rule engine", test: (e) => e.actorKind === "rule" },
  { id: "signoff", label: "Sign-off and returns", test: (e) => /Signed off|Returned/.test(e.action) },
  { id: "change", label: "Engineering changes", test: (e) => /ECN|Revision set|Record/.test(e.action) },
];

export default function AuditPage() {
  const router = useRouter();
  const { audit } = useGrantha();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const rows = audit.filter(FILTERS.find((f) => f.id === filter)?.test ?? (() => true));
  const event = audit.find((e) => e.id === selected);
  const session = audit.filter(FILTERS[1].test).length;

  const columns: Column<AuditEvent>[] = [
    { key: "at", header: "When", card: "title", value: (e) => e.at, render: (e) => <span className="tabular whitespace-nowrap text-primary">{e.at}</span> },
    { key: "actor", header: "Actor", value: (e) => e.actor, render: (e) => <span className="whitespace-nowrap">{e.actor}</span> },
    { key: "kind", header: "Kind", hide: "md", value: (e) => KIND[e.actorKind].label, render: (e) => <StatusBadge tone={KIND[e.actorKind].tone}>{KIND[e.actorKind].label}</StatusBadge> },
    { key: "action", header: "Action", value: (e) => e.action, render: (e) => <span className="whitespace-nowrap text-primary">{e.action}</span> },
    { key: "object", header: "Object", card: "metric", value: (e) => e.object, render: (e) => <span className="tabular whitespace-nowrap">{e.object}</span> },
    { key: "detail", header: "Detail", value: (e) => e.detail, render: (e) => <span className="block max-w-[26rem] truncate text-tertiary">{e.detail}</span> },
    { key: "id", header: "Entry", hide: "lg", value: (e) => e.id, render: (e) => <span className="tabular text-quaternary">{e.id}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Audit Trail"
        description="Every draft, check, fix, dismissal, rule change and signature, with who or what made it. Entries cannot be edited."
        mark={<GMark id="mark-audit" size={44} />}
        actions={<LinkBtn href="/signoff">Sign-off queue</LinkBtn>}
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Entries" value={String(audit.length)} hint="since 17 September" />
            <KpiTile label="This session" value={String(session)} hint="actions you took here" tone="info" />
            <KpiTile label="By a named person" value={String(audit.filter((e) => e.actorKind === "human").length)} hint="approvals, fixes, changes" />
            <KpiTile label="By agents or rules" value={String(audit.filter((e) => e.actorKind !== "human").length)} hint="drafts, extractions, check runs" />
          </div>
          <Panel title={`Events · ${rows.length}`} padded={false} className="max-h-[680px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-muted p-3">
                <FilterChips options={FILTERS.map((f) => ({ id: f.id, label: f.label, count: audit.filter(f.test).length }))} value={filter} onChange={setFilter} />
              </div>
              <div className="min-h-0 flex-1">
                <DataTable rows={rows} columns={columns} rowKey={(e) => `${e.id}-${e.at}`} onRowClick={(e) => setSelected(e.id)} isRowSelected={(e) => e.id === selected} searchPlaceholder="Search actor, action, object" exportName="audit-trail" pageSize={40} emptyTitle="No event in this view" emptyDetail="Actions you take in the app are logged here." />
              </div>
            </div>
          </Panel>
        </div>
      </PageBody>
      {event ? (
        <Drawer
          eyebrow={`Audit entry · ${event.id}`}
          title={`${event.action} · ${event.object}`}
          onClose={() => setSelected(null)}
          footer={
            event.href ? (
              <button type="button" onClick={() => router.push(event.href!)} className="inline-flex h-8 items-center rounded-full bg-action-primary px-3 text-label-sm text-on-color transition-colors duration-[180ms] hover:bg-action-primary-hover">
                Open {event.object}
              </button>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-secondary">{event.detail}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="When">
                <span className="tabular">{event.at}</span>
              </Field>
              <Field label="Actor">{event.actor}</Field>
              <Field label="Kind">{KIND[event.actorKind].label}</Field>
              <Field label="Object">
                <span className="tabular">{event.object}</span>
              </Field>
            </div>
            <p className="text-caption text-quaternary">Entries are append-only. A correction is a new entry that refers to this one.</p>
          </div>
        </Drawer>
      ) : null}
    </>
  );
}
