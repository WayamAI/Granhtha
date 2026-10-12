"use client";

/**
 * Rule Library: the deterministic checks, what each one tests, the clause it
 * enforces, and how often it fires. Switching a rule off is recorded.
 */

import { Suspense, useState } from "react";

import { FindingStateBadge } from "@/components/grantha/finding-actions";
import { Btn, Drawer, Field, GMark, LABEL_CLASS, LinkBtn, SeverityBadge, useLinkedSelection } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { KpiTile, Panel } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { RULES, RULE_GROUPS, ruleById } from "@/lib/grantha/rules";
import type { Rule } from "@/lib/grantha/types";

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-active ${
        on ? "border-transparent bg-action-primary" : "border-default bg-raised-2"
      }`}
    >
      <span className={`inline-block size-3.5 rounded-full transition-transform duration-[180ms] ${on ? "translate-x-[18px] bg-container" : "translate-x-[3px] bg-quaternary"}`} />
    </button>
  );
}

function RulesInner() {
  const { st, findings, toggleRule, openInspector } = useGrantha();
  const [selected, setSelected] = useLinkedSelection("rule");
  const [group, setGroup] = useState<string | null>(null);

  const hitsHere = (ruleId: string) => findings.filter((f) => f.ruleId === ruleId && f.active).length;
  const rows = group ? RULES.filter((r) => r.group === group) : RULES;
  const rule = selected ? ruleById(selected) : undefined;
  const top = [...RULES].sort((a, b) => b.lineHits - a.lineHits)[0];

  const columns: Column<Rule>[] = [
    { key: "id", header: "Rule", card: "title", value: (r) => r.id, render: (r) => <span className="tabular whitespace-nowrap text-primary">{r.id}</span> },
    { key: "name", header: "What it checks", value: (r) => r.name, render: (r) => <span className="block max-w-[24rem] truncate">{r.name}</span> },
    { key: "group", header: "Group", hide: "lg", value: (r) => r.group, render: (r) => <span className="whitespace-nowrap">{r.group}</span> },
    { key: "clause", header: "Clause", hide: "md", value: (r) => r.clause, render: (r) => <span className="block max-w-[16rem] truncate text-tertiary">{r.clause}</span> },
    { key: "severity", header: "Severity", value: (r) => r.severity, render: (r) => <SeverityBadge severity={r.severity} /> },
    { key: "here", header: "Open here", align: "right", card: "metric", value: (r) => hitsHere(r.id), render: (r) => <span className={`tabular ${hitsHere(r.id) ? "text-primary" : "text-quaternary"}`}>{hitsHere(r.id)}</span> },
    { key: "line", header: "Line, 90 days", align: "right", hide: "md", value: (r) => r.lineHits, render: (r) => <span className="tabular">{r.lineHits}</span> },
    {
      key: "on",
      header: "On",
      align: "right",
      value: (r) => (st.rulesOff.includes(r.id) ? "off" : "on"),
      render: (r) => <Switch on={!st.rulesOff.includes(r.id)} onChange={() => toggleRule(r.id)} label={`${r.id} on or off`} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Rule Library"
        description="The checks that decide pass or fail. Each one is a test with a clause behind it, not a prompt. The model never grades its own draft."
        mark={<GMark id="mark-rules" size={44} />}
        actions={group ? <Btn onClick={() => setGroup(null)}>Scoped to {group} · clear</Btn> : <LinkBtn href="/findings">Open findings</LinkBtn>}
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Rules active" value={`${RULES.length - st.rulesOff.length}`} hint={`of ${RULES.length}`} tone={st.rulesOff.length ? "warning" : "success"} delta={st.rulesOff.length ? `${st.rulesOff.length} off` : "all on"} />
            <KpiTile label="Open on this document" value={String(findings.filter((f) => f.active).length)} hint="NTL-6157 Use & Care Guide" />
            <KpiTile label="Hits across the line" value={String(RULES.reduce((n, r) => n + r.lineHits, 0))} hint="last 90 days, 80 documents" />
            <KpiTile label="Most-hit rule" value={top.id.replace("GRN-", "")} hint={`${top.lineHits} hits · ${top.name}`} tone="info" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {RULE_GROUPS.map((g) => {
              const rules = RULES.filter((r) => r.group === g.id);
              const active = group === g.id;
              const open = rules.reduce((n, r) => n + hitsHere(r.id), 0);
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setGroup(active ? null : g.id)}
                  className={`flex min-w-0 items-start gap-3 rounded-lg border bg-container p-3.5 text-left outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-active ${
                    active ? "border-active" : "border-muted hover:border-default"
                  }`}
                >
                  <GMark id={g.id === "Safety conformance" ? "mark-safety-panel" : g.id === "Traceability" ? "mark-kpi-trace" : g.id === "Localisation" ? "mark-localisation" : g.id === "Terminology" ? "mark-terminology" : "mark-rules"} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-body-md font-medium text-primary">{g.id}</span>
                      <span className="shrink-0 text-caption tabular text-quaternary">{rules.length} rules</span>
                    </span>
                    <span className="mt-0.5 block text-body-sm text-tertiary">{g.summary}</span>
                    <span className="mt-1.5 flex items-center justify-between gap-2 text-caption">
                      <span className="truncate text-quaternary">{g.standard}</span>
                      <span className={`shrink-0 tabular ${open ? "text-warning" : "text-quaternary"}`}>{open} open here</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <Panel title={`${group ?? "All rules"} · ${rows.length}`} padded={false} className="max-h-[620px]">
            <div className="min-h-0 flex-1">
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(r) => r.id}
                onRowClick={(r) => setSelected(r.id)}
                isRowSelected={(r) => r.id === selected}
                searchPlaceholder="Search rule, clause, group"
                exportName="rule-library"
                pageSize={30}
              />
            </div>
          </Panel>
        </div>
      </PageBody>

      {rule ? (
        <Drawer
          eyebrow={`${rule.group} rule`}
          title={`${rule.id} · ${rule.name}`}
          onClose={() => setSelected(null)}
          footer={
            <>
              <Btn variant={st.rulesOff.includes(rule.id) ? "primary" : "secondary"} onClick={() => toggleRule(rule.id)}>
                {st.rulesOff.includes(rule.id) ? "Switch rule on" : "Switch rule off"}
              </Btn>
              <span className="text-caption text-quaternary">Every switch is written to the audit trail.</span>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={rule.severity} />
              <span className="text-caption text-tertiary">{st.rulesOff.includes(rule.id) ? "Switched off. Its findings do not count against the verdict." : "On. Runs on every draft and every reissue."}</span>
            </div>
            <Field label="What it tests">{rule.tests}</Field>
            <Field label="Standard clause">{rule.clause}</Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Open on this document">
                <span className="tabular">{hitsHere(rule.id)}</span>
              </Field>
              <Field label="Hits across the line, 90 days">
                <span className="tabular">{rule.lineHits}</span>
              </Field>
            </div>
            <div>
              <p className={`${LABEL_CLASS} mb-1.5`}>Findings from this rule</p>
              {findings.filter((f) => f.ruleId === rule.id).length ? (
                <ul className="flex flex-col gap-1">
                  {findings
                    .filter((f) => f.ruleId === rule.id)
                    .map((f) => (
                      <li key={f.id}>
                        <button type="button" onClick={() => openInspector({ type: "finding", id: f.id })} className="flex w-full items-center gap-2 rounded-md border border-muted bg-raised px-3 py-2 text-left text-body-sm text-secondary hover:border-default">
                          <span className="tabular text-primary">{f.id}</span>
                          <span className="min-w-0 flex-1 truncate">{f.title}</span>
                          <FindingStateBadge finding={f} />
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-body-sm text-tertiary">This rule passes on the NTL-6157 Use & Care Guide.</p>
              )}
            </div>
          </div>
        </Drawer>
      ) : null}
    </>
  );
}

export default function RulesPage() {
  return (
    <Suspense>
      <RulesInner />
    </Suspense>
  );
}
