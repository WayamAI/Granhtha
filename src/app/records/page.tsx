"use client";

/**
 * Source Records: the engineering records a model's literature is written
 * from. Readable preview, release state, and whether the records agree with
 * each other. Overtyping a value shows what the input check would catch.
 */

import { CircleAlert, CircleCheck, CircleX, RotateCcw } from "lucide-react";
import { Suspense } from "react";

import { Btn, GMark, LABEL_CLASS, LinkBtn, SELECT_CLASS, useLinkedSelection, useQueryParam } from "@/components/grantha/ui";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { InfoPopover } from "@/components/ui/info-popover";
import { KpiTile, Panel, Select, SplitRow, StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { MODELS, modelById } from "@/lib/grantha/data";
import { shortDate } from "@/lib/grantha/format";
import { RECORDS, recordById, recordsForModel } from "@/lib/grantha/records";
import { agreementChecks, cellValue, editKey, inputChecks, recordEdited } from "@/lib/grantha/selectors";
import type { RecordRow, SourceRecord } from "@/lib/grantha/types";

const FLAG_TONE = { fail: "error", open: "warning", pending: "warning" } as const;

function RecordsInner() {
  const { st, setModel, editRecord, commitRecordEdit, resetRecord } = useGrantha();
  const linkedModel = useQueryParam("model");
  const [recordId, setRecordId] = useLinkedSelection("record");

  const linkedRecord = recordId ? recordById(recordId) : undefined;
  const modelId = linkedRecord?.modelId ?? (linkedModel && MODELS.some((m) => m.id === linkedModel) && !recordId ? linkedModel : st.modelId);
  const model = modelById(modelId);
  const records = recordsForModel(model.id);
  const record = linkedRecord ?? records[0];
  const checks = inputChecks(st, model.id);
  const agree = agreementChecks(st, model.id);
  const pass = checks.filter((c) => c.status === "pass").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const edited = recordEdited(st, record);

  const previewColumns: Column<RecordRow>[] = [
    { key: "line", header: "Line", width: "w-14", card: "title", value: (r) => r.line, render: (r) => <span className="tabular text-quaternary">{r.line}</span> },
    ...record.columns.map(
      (col, i): Column<RecordRow> => ({
        key: `c${i}`,
        header: col,
        value: (r) => (i === record.editCol ? cellValue(st, record, r.line) : r.cells[i]),
        render: (r) => {
          if (i !== record.editCol) {
            const flagged = i === record.columns.length - 1 && r.flag;
            return flagged ? <StatusBadge tone={FLAG_TONE[r.flag!]}>{r.cells[i]}</StatusBadge> : <span className={`${i === 0 ? "text-primary" : ""} ${r.cells[i].length > 44 ? "block max-w-[20rem] truncate" : "whitespace-nowrap"} tabular`}>{r.cells[i]}</span>;
          }
          const changed = st.recordEdits[editKey(record.id, r.line)] !== undefined;
          return (
            <input
              aria-label={`${col}, line ${r.line}`}
              value={cellValue(st, record, r.line)}
              onChange={(e) => editRecord(record.id, r.line, e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== r.cells[i]) commitRecordEdit(record.id, r.line, e.target.value);
              }}
              className={`h-7 w-full min-w-[9rem] rounded-full border bg-action px-2.5 text-body-sm tabular outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active ${
                changed ? "border-error-stroke text-error" : "border-muted text-primary hover:border-default"
              }`}
            />
          );
        },
      }),
    ),
  ];

  const allColumns: Column<SourceRecord>[] = [
    { key: "ref", header: "Record", card: "title", value: (r) => r.ref, render: (r) => <span className="tabular whitespace-nowrap text-primary">{r.ref}</span> },
    { key: "name", header: "Type", value: (r) => r.name, render: (r) => <span className="whitespace-nowrap">{r.name}</span> },
    { key: "model", header: "Model", value: (r) => r.modelId, render: (r) => <span className="tabular">{r.modelId}</span> },
    { key: "system", header: "System", hide: "md", value: (r) => r.system, render: (r) => <span className="whitespace-nowrap text-tertiary">{r.system}</span> },
    { key: "rev", header: "Rev", hide: "md", value: (r) => r.rev, render: (r) => <span className="tabular">{r.rev}</span> },
    { key: "state", header: "State", value: (r) => (recordEdited(st, r) ? "Edited" : r.state), render: (r) => (recordEdited(st, r) ? <StatusBadge tone="error">Edited after release</StatusBadge> : <StatusBadge tone={r.state === "Released" ? "success" : "warning"}>{r.state}</StatusBadge>) },
    { key: "released", header: "Released", align: "right", hide: "lg", value: (r) => r.released, render: (r) => <span className="tabular whitespace-nowrap">{shortDate(r.released)}</span> },
    { key: "owner", header: "Owner", hide: "lg", value: (r) => r.ownerDept, render: (r) => <span className="whitespace-nowrap text-tertiary">{r.ownerDept}</span> },
    { key: "lines", header: "Lines", align: "right", card: "metric", value: (r) => r.rows.length, render: (r) => <span className="tabular">{r.rows.length}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Source Records"
        description={`${model.id}, ${model.name}. The draft may only state what these released records state. Nothing here is edited at source: the systems of record stay the authority.`}
        mark={<GMark id="mark-records" size={44} />}
        info={
          <InfoPopover label="About the preview">
            <p className="text-body-sm text-secondary">
              The preview is a read copy of the released revision. You can overtype the highlighted column to see how the input check reacts: a value that no longer matches the released revision fails the record, and a
              value that disagrees with another record fails the agreement check. Reload to return to the released revision.
            </p>
          </InfoPopover>
        }
        actions={
          <>
            <Select
              aria-label="Model"
              value={model.id}
              onChange={(e) => {
                setModel(e.target.value);
                setRecordId(recordsForModel(e.target.value)[0].id);
              }}
              className={`${SELECT_CLASS} max-w-[16rem]`}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} · {m.family}
                </option>
              ))}
            </Select>
            <LinkBtn href="/facts">Fact base</LinkBtn>
          </>
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Input check" value={`${pass} / ${checks.length}`} hint={`${warn} warning${warn === 1 ? "" : "s"}, ${fail} failed`} tone={fail ? "error" : warn ? "warning" : "success"} delta={fail ? "drafting held" : "may draft"} />
            <KpiTile label="Records released" value={`${records.filter((r) => r.state === "Released" && !recordEdited(st, r)).length} / ${records.length}`} hint="only released records may be cited" tone="info" />
            <KpiTile label="Cross-record agreement" value={`${agree.filter((a) => a.agrees).length} / ${agree.length}`} hint="same value stated in each record" tone={agree.every((a) => a.agrees) ? "success" : "error"} />
            <KpiTile label="Open test or obligation" value={String(records.flatMap((r) => r.rows).filter((r) => r.flag).length)} hint="held as prohibitions until closed" tone="warning" />
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 @5xl:grid-cols-5">
            {records.map((r) => {
              const active = r.id === record.id;
              const isEdited = recordEdited(st, r);
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRecordId(r.id)}
                  className={`flex min-w-0 flex-col gap-1 rounded-lg border bg-container px-3 py-2.5 text-left outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-active ${
                    active ? "border-active" : "border-muted hover:border-default"
                  }`}
                >
                  <span className="truncate text-body-sm text-primary">{r.name}</span>
                  <span className="truncate text-caption tabular text-quaternary">
                    {r.ref} · rev {r.rev}
                  </span>
                  <span>{isEdited ? <StatusBadge tone="error">Edited after release</StatusBadge> : <StatusBadge tone={r.state === "Released" ? "success" : "warning"}>{r.state}</StatusBadge>}</span>
                </button>
              );
            })}
          </div>

          <SplitRow ratio="1.6/1" className="lg:h-[36rem] lg:max-h-[36rem]">
            <Panel
              title={`${record.name} · ${record.ref} · ${record.rows.length} lines`}
              padded={false}
              action={
                edited ? (
                  <Btn className="h-7" onClick={() => resetRecord(record.id)}>
                    <RotateCcw size={12} strokeWidth={1.75} aria-hidden />
                    Reload released revision
                  </Btn>
                ) : (
                  <span className="text-caption text-quaternary">
                    {record.system} · {record.ownerDept}
                  </span>
                )
              }
            >
              <div className="min-h-0 flex-1">
                <DataTable rows={record.rows} columns={previewColumns} rowKey={(r) => String(r.line)} serial={false} reorderable={false} searchPlaceholder="Search this record" exportName={`record-${record.ref}`} pageSize={60} />
              </div>
            </Panel>

            <Panel title="Do the records agree?" action={<span className="text-caption text-quaternary">{agree.length} values stated in more than one record</span>}>
              <ul className="flex flex-col">
                {agree.map((a) => (
                  <li key={a.key} className="border-b border-muted py-2.5 last:border-b-0">
                    <div className="flex items-center gap-2">
                      {a.agrees ? <CircleCheck size={15} strokeWidth={1.75} aria-hidden className="shrink-0 text-success" /> : <CircleX size={15} strokeWidth={1.75} aria-hidden className="shrink-0 text-error" />}
                      <span className="min-w-0 flex-1 truncate text-body-md text-primary">{a.label}</span>
                      <span className={`shrink-0 text-body-sm ${a.agrees ? "text-success" : "text-error"}`}>{a.agrees ? "Agree" : "Disagree"}</span>
                    </div>
                    <ul className="mt-1 flex flex-col gap-0.5 pl-6">
                      {a.values.map((v) => (
                        <li key={`${v.recordId}-${v.line}`} className="flex items-baseline justify-between gap-3 text-body-sm">
                          <button type="button" onClick={() => setRecordId(v.recordId)} className="min-w-0 truncate text-left tabular text-tertiary underline-offset-2 hover:text-primary hover:underline">
                            {v.ref} · line {v.line}
                          </button>
                          <span className="shrink-0 tabular text-secondary">{v.value}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-muted pt-3">
                <p className={LABEL_CLASS}>Input check, not passing</p>
                {checks.filter((c) => c.status !== "pass").length ? (
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {checks
                      .filter((c) => c.status !== "pass")
                      .map((c) => (
                        <li key={c.id} className="flex gap-2 text-body-sm">
                          {c.status === "fail" ? <CircleX size={14} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-error" /> : <CircleAlert size={14} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-warning" />}
                          <span className="min-w-0">
                            <span className="text-primary">{c.label}.</span> <span className="text-tertiary">{c.detail}</span>
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-body-sm text-success">Every input check passes.</p>
                )}
              </div>
            </Panel>
          </SplitRow>

          <Panel title={`All source records · ${RECORDS.length}`} padded={false} className="max-h-[560px]">
            <div className="min-h-0 flex-1">
              <DataTable
                rows={RECORDS}
                columns={allColumns}
                rowKey={(r) => r.id}
                onRowClick={(r) => {
                  setModel(r.modelId);
                  setRecordId(r.id);
                }}
                isRowSelected={(r) => r.id === record.id}
                searchPlaceholder="Search record, model, system"
                exportName="source-records"
                pageSize={40}
              />
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}

export default function RecordsPage() {
  return (
    <Suspense>
      <RecordsInner />
    </Suspense>
  );
}
