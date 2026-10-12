"use client";

/** Settings: systems of record, rule thresholds, who may sign what, appearance. */

import { useState } from "react";

import { Btn, GMark, LABEL_CLASS, LinkBtn, SELECT_CLASS } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel, Select, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-context";
import { APP } from "@/lib/app";
import { useGrantha } from "@/lib/grantha/context";
import { PEOPLE } from "@/lib/grantha/data";
import type { Person } from "@/lib/grantha/types";

const SYSTEMS = [
  { id: "plm", name: "Windchill PLM", feeds: "Item attribute reports, engineering change notices", sync: "12 Oct 2026, 09:40", state: "Connected" },
  { id: "erp", name: "SAP S/4HANA", feeds: "Indented BOM, part supersessions", sync: "12 Oct 2026, 09:38", state: "Connected" },
  { id: "lims", name: "Test lab LIMS", feeds: "DVP&R, EMC and radio test reports", sync: "12 Oct 2026, 06:00", state: "Connected" },
  { id: "cmp", name: "Compliance register", feeds: "Compliance matrices, market obligations", sync: "11 Oct 2026, 22:15", state: "Connected" },
  { id: "tms", name: "Translation management system", feeds: "Translation memory NF-TM, glossary NF-GL", sync: "12 Oct 2026, 08:05", state: "Connected" },
  { id: "ccms", name: "Component content management", feeds: "Topic masters, published documents", sync: "10 Oct 2026, 18:30", state: "Sync delayed" },
];

const THRESHOLDS: { id: string; label: string; rule: string; options: string[]; initial: string }[] = [
  { id: "leverage", label: "Exact-match leverage on a successor document", rule: "GRN-LOC-005", options: ["70%", "75%", "80%"], initial: "75%" },
  { id: "grade", label: "Reading grade, consumer documents", rule: "GRN-RDB-001", options: ["7.0", "8.0", "9.0"], initial: "8.0" },
  { id: "step", label: "Words in a procedural step", rule: "GRN-RDB-004", options: ["18", "20", "22"], initial: "20" },
  { id: "sentence", label: "Words in a descriptive sentence", rule: "GRN-RDB-002", options: ["22", "25", "28"], initial: "25" },
  { id: "auto", label: "Confidence needed to offer a one-click fix", rule: "All rules", options: ["95%", "97%", "99%"], initial: "97%" },
];

const AUTHORITY: Record<string, string> = {
  ivarga: "Use & Care, Installation, Quick Start: Laundry",
  dokafor: "Use & Care, Installation, Quick Start: Laundry",
  smirza: "Use & Care, Installation, Quick Start: Kitchen",
  obrandt: "Use & Care, Installation, Quick Start: Refrigeration",
  msolheim: "Any document, as deputy. Rule library changes",
  pnambiar: "Energy label, Warranty. Waivers on DANGER findings",
  rquintero: "Release of fr-CA and es-MX renderings",
  haalto: "Tech Sheet, Service Manual, Illustrated Parts Catalog",
  cfortin: "fr-CA post-edit",
  lbarrera: "es-MX post-edit",
};

export default function SettingsPage() {
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();
  const { log, st } = useGrantha();
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(THRESHOLDS.map((t) => [t.id, t.initial])));
  const [tested, setTested] = useState<string[]>([]);

  const columns: Column<Person>[] = [
    { key: "name", header: "Person", card: "title", value: (p) => p.name, render: (p) => <span className="whitespace-nowrap text-primary">{p.name}</span> },
    { key: "role", header: "Role", value: (p) => p.role, render: (p) => <span className="whitespace-nowrap">{p.role}</span> },
    { key: "authority", header: "May sign or release", value: (p) => AUTHORITY[p.id], render: (p) => <span className="block max-w-[26rem] truncate text-tertiary">{AUTHORITY[p.id]}</span> },
  ];

  return (
    <>
      <PageHeader title="Settings" description={`${APP.scope}. Systems of record, rule thresholds and signing authority.`} mark={<GMark id="mark-settings" size={44} />} actions={<LinkBtn href="/rules">Rule library</LinkBtn>} />
      <PageBody>
        <div className="flex flex-col gap-4">
          <SplitRow ratio="1.4/1">
            <Panel title="Systems of record" action={<span className="text-caption text-quaternary">read-only connections</span>}>
              <ul className="flex flex-col">
                {SYSTEMS.map((s) => {
                  const ok = s.state === "Connected" || tested.includes(s.id);
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 border-b border-muted py-2.5 last:border-b-0">
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="text-body-md text-primary">{s.name}</p>
                        <p className="truncate text-body-sm text-tertiary">{s.feeds}</p>
                      </div>
                      <span className="shrink-0 text-caption tabular text-quaternary">{tested.includes(s.id) ? "12 Oct 2026, 10:02" : s.sync}</span>
                      <StatusBadge tone={ok ? "success" : "warning"}>{ok ? "Connected" : s.state}</StatusBadge>
                      <Btn
                        className="h-7"
                        onClick={() => {
                          setTested((t) => [...new Set([...t, s.id])]);
                          toast(`${s.name} reachable`, { detail: "Read access confirmed. Grantha never writes to a system of record." });
                        }}
                      >
                        Test
                      </Btn>
                    </li>
                  );
                })}
              </ul>
            </Panel>
            <Panel title="Appearance and session">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body-md text-primary">Theme</p>
                    <p className="text-body-sm text-tertiary">{isDark ? "Dark" : "Light"} is on.</p>
                  </div>
                  <Btn onClick={toggleTheme}>Switch to {isDark ? "light" : "dark"}</Btn>
                </div>
                <div className="border-t border-muted pt-3">
                  <p className={LABEL_CLASS}>Tenant</p>
                  <p className="mt-0.5 text-body-md text-secondary">{APP.scope}</p>
                </div>
                <div>
                  <p className={LABEL_CLASS}>Market languages</p>
                  <p className="mt-0.5 text-body-md tabular text-secondary">en-US source · fr-CA · es-MX</p>
                </div>
                <div>
                  <p className={LABEL_CLASS}>This session</p>
                  <p className="mt-0.5 text-body-sm text-tertiary">
                    {st.audit.length} action{st.audit.length === 1 ? "" : "s"} logged, {st.rulesOff.length} rule{st.rulesOff.length === 1 ? "" : "s"} switched off, {Object.keys(st.recordEdits).length} record value
                    {Object.keys(st.recordEdits).length === 1 ? "" : "s"} overtyped. Reloading the page returns the demo to its starting state.
                  </p>
                </div>
              </div>
            </Panel>
          </SplitRow>

          <Panel title="Rule thresholds" action={<span className="text-caption text-quaternary">changes are written to the audit trail</span>}>
            <ul className="flex flex-col">
              {THRESHOLDS.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-muted py-2.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-body-md text-primary">{t.label}</p>
                    <p className="text-caption tabular text-quaternary">{t.rule}</p>
                  </div>
                  <Select
                    aria-label={t.label}
                    value={values[t.id]}
                    onChange={(e) => {
                      const next = e.target.value;
                      setValues((v) => ({ ...v, [t.id]: next }));
                      log(APP.operator.name, "human", "Threshold changed", t.rule, `${t.label}: ${values[t.id]} to ${next}. Applies to the next check run.`, "/settings");
                      toast(`${t.label} set to ${next}`, { detail: "Recorded. It applies from the next check run." });
                    }}
                    className={`${SELECT_CLASS} w-28`}
                  >
                    {t.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={`Signing authority · ${PEOPLE.length}`} padded={false} className="max-h-[480px]">
            <div className="min-h-0 flex-1">
              <DataTable
                rows={PEOPLE}
                columns={columns}
                rowKey={(p) => p.id}
                onRowClick={(p) => toast(`${p.name}: ${p.role}`, { detail: AUTHORITY[p.id], tone: "info" })}
                searchPlaceholder="Search person or role"
                exportName="signing-authority"
                pageSize={20}
              />
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}
