"use client";

/**
 * Generate: records on the left, the pipeline and the drafted document in the
 * middle, the rule checks on the right. The model proposes wording; the
 * checks on the right decide whether the draft may go to sign-off.
 */

import { Check, CircleCheck, CircleDashed, LoaderCircle, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { DocumentLegend, ManualDocument } from "@/components/grantha/manual-document";
import { Btn, GMark, LABEL_CLASS, LinkBtn, Tabs } from "@/components/grantha/ui";
import { CheckList, ModelSelect, VerdictBanner } from "@/components/grantha/widgets";
import { PageHeader } from "@/components/layout/page-header";
import { InfoPopover } from "@/components/ui/info-popover";
import { StatusBadge } from "@/components/ui/primitives";
import { useGrantha } from "@/lib/grantha/context";
import { CATALOGUE, LIVE_MODEL, modelById, seed } from "@/lib/grantha/data";
import { CONSTRAINTS, FACTS, recordsForModel } from "@/lib/grantha/records";
import { inputChecks } from "@/lib/grantha/selectors";
import type { RSection } from "@/lib/grantha/types";
import type { MarkId } from "@/lib/marks";

type Tab = "pipeline" | "document" | "facts";

function StepIcon({ state }: { state: "done" | "running" | "pending" }) {
  if (state === "done") return <CircleCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-success" />;
  if (state === "running") return <LoaderCircle size={16} strokeWidth={1.75} aria-hidden className="shrink-0 animate-spin text-info" />;
  return <CircleDashed size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-quaternary" />;
}

function PipelineStep({ mark, title, state, summary, children }: { mark: MarkId; title: string; state: "done" | "running" | "pending"; summary: string; children?: ReactNode }) {
  return (
    <div className={`rounded-lg border bg-container p-3.5 transition-opacity duration-[180ms] ${state === "pending" ? "border-muted opacity-55" : "border-muted"}`}>
      <div className="flex items-start gap-3">
        <GMark id={mark} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-body-md font-medium text-primary">{title}</p>
            <StepIcon state={state} />
          </div>
          <p className="mt-0.5 text-body-sm text-tertiary">{state === "pending" ? "Waiting" : state === "running" ? "Running" : summary}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function GeneratePage() {
  const { st, sections, checks, verdict, findings, startRun, openInspector } = useGrantha();
  const [typeId, setTypeId] = useState(st.run.typeId);
  const [tab, setTab] = useState<Tab>("document");
  const [unchecked, setUnchecked] = useState<string[]>([]);

  const model = modelById(st.modelId);
  const type = CATALOGUE.find((c) => c.id === typeId) ?? CATALOGUE[0];
  const records = recordsForModel(model.id);
  const full = model.id === LIVE_MODEL && type.id === "UCG";
  const input = inputChecks(st, model.id);
  const inputPass = input.filter((c) => c.status === "pass").length;
  const inputWarn = input.filter((c) => c.status === "warn").length;
  const inputFail = input.filter((c) => c.status === "fail").length;
  const missing = records.filter((r) => unchecked.includes(r.id));

  // The run belongs to one type. Showing another type shows its last state: not yet run.
  const mine = st.run.typeId === type.id && st.run.modelId === model.id;
  const running = mine && st.run.status === "running";
  const step = mine ? st.run.step : 0;
  const done = mine && st.run.status === "done";

  const outline: RSection[] = (() => {
    const pool = model.id === LIVE_MODEL ? FACTS : [];
    return type.sections.map((title, i) => {
      const n = 2 + (seed(`${model.id}${type.id}${title}`) % 4);
      const start = (seed(`${type.id}${i}`) % Math.max(1, pool.length - n)) | 0;
      const picked = pool.slice(start, start + n);
      const specs = model.specs.slice(i % 4, (i % 4) + 3);
      return {
        id: `O${i + 1}`,
        title,
        factCount: picked.length || specs.length,
        blocks: [
          {
            t: "list" as const,
            topic: `Section plan ${i + 1}`,
            items: picked.length
              ? picked.map((f) => [
                  { text: `${f.label}: `, kind: "plain" as const },
                  { text: `${f.value} ${f.unit}`.trim(), kind: "fact" as const, factId: f.id },
                ])
              : specs.map(([label, value, unit]) => [{ text: `${label}: ${value} ${unit}`.trim(), kind: "plain" as const }]),
          },
        ],
      };
    });
  })();

  const shown = full ? sections : outline;
  const written = running ? Math.max(0, Math.min(shown.length, step - 2)) : done ? shown.length : 0;
  const authorState = step >= 2 + shown.length || done ? "done" : step >= 2 && running ? "running" : "pending";
  const stepState = (n: number): "done" | "running" | "pending" => (done || step > n ? "done" : running && step === n ? "running" : "pending");

  const sectionSeconds = (s: RSection) => (1.1 + s.factCount * 0.28 + (seed(s.id + s.title) % 9) / 10).toFixed(1);
  const openCount = findings.filter((f) => f.active).length;
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;

  function run() {
    setTab("pipeline");
    startRun(type.id);
  }

  return (
    <>
      <PageHeader
        title="Generate"
        description="Pick a document type, confirm its source records, and run the pipeline. Every figure in the draft links back to the record line it came from."
        mark={<GMark id="mark-generate" size={44} />}
        info={
          <InfoPopover label="How generation works">
            <p className="text-body-sm text-secondary">
              The input check confirms the records are released and agree with each other. The extractor builds the fact base. The author writes each section from those facts only. The verifier then runs deterministic rules
              on the draft. A model reviewing its own text catches a minority of errors, so pass or fail is decided by rules, and a named technical author signs.
            </p>
          </InfoPopover>
        }
        actions={
          <>
            <ModelSelect />
            <StatusBadge tone={model.status === "In production" ? "success" : "info"}>{model.status}</StatusBadge>
            <span className="text-caption text-quaternary">supersedes {model.supersedes}</span>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
        {/* Records */}
        <aside className="flex min-w-0 shrink-0 flex-col gap-4 border-b border-muted p-4 xl:w-[17.5rem] xl:overflow-y-auto xl:border-r xl:border-b-0">
          <div>
            <p className={`${LABEL_CLASS} mb-1.5`}>Document type</p>
            <div className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-lg border border-muted bg-container p-2 xl:max-h-72">
              {(["Technical literature", "Engineering records"] as const).map((group) => (
                <div key={group}>
                  <p className="px-2 pb-1 text-caption text-quaternary">{group}</p>
                  {CATALOGUE.filter((c) => c.group === group).map((c) => {
                    const active = c.id === type.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setTypeId(c.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-body-sm outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active ${
                          active ? "bg-action text-primary" : "text-tertiary hover:bg-raised hover:text-secondary"
                        }`}
                      >
                        <span className="min-w-0 truncate">{c.name}</span>
                        <span className="shrink-0 text-caption tabular text-quaternary">{c.sections.length}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="mt-2 text-body-sm text-secondary">
              {type.audience}, {type.sections.length} sections.
            </p>
            <p className="mt-0.5 text-caption text-tertiary">{type.rules}</p>
          </div>

          <div>
            <p className={`${LABEL_CLASS} mb-1.5`}>Source records · {records.length - missing.length} of {records.length}</p>
            <ul className="flex flex-col gap-1">
              {records.map((record) => {
                const on = !unchecked.includes(record.id);
                return (
                  <li key={record.id} className="flex items-start gap-2 rounded-md border border-muted bg-container px-2.5 py-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`Use ${record.name}`}
                      onClick={() => setUnchecked((list) => (on ? [...list, record.id] : list.filter((id) => id !== record.id)))}
                      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active ${
                        on ? "border-transparent bg-action-primary text-on-color" : "border-default bg-action"
                      }`}
                    >
                      {on ? <Check size={10} strokeWidth={3} aria-hidden /> : null}
                    </button>
                    <Link href={`/records?record=${record.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm text-primary">{record.name}</span>
                      <span className="block truncate text-caption tabular text-quaternary">
                        {record.ref} · rev {record.rev}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-muted bg-container p-3">
            <div className="flex items-center justify-between gap-2">
              <p className={LABEL_CLASS}>Input check</p>
              <Link href="/records" className="text-caption text-tertiary underline underline-offset-2 hover:text-primary">
                Records
              </Link>
            </div>
            <p className="mt-1.5 text-body-md text-primary">
              <span className="tabular">{inputPass}</span> passed, <span className={`tabular ${inputWarn ? "text-warning" : ""}`}>{inputWarn}</span> warning{inputWarn === 1 ? "" : "s"}
              {inputFail ? (
                <>
                  , <span className="tabular text-error">{inputFail} failed</span>
                </>
              ) : null}
            </p>
            {input
              .filter((c) => c.status !== "pass")
              .map((c) => (
                <p key={c.id} className={`mt-1 text-caption ${c.status === "fail" ? "text-error" : "text-tertiary"}`}>
                  {c.label}: {c.detail}
                </p>
              ))}
          </div>

          <div className="flex flex-col gap-2">
            <Btn variant="primary" className="h-11 w-full" onClick={run} disabled={running || missing.length > 0 || inputFail > 0}>
              {running ? <LoaderCircle size={15} strokeWidth={1.75} aria-hidden className="animate-spin" /> : done ? <RotateCcw size={15} strokeWidth={1.75} aria-hidden /> : <Play size={15} strokeWidth={1.75} aria-hidden />}
              {running ? "Generating" : done ? "Generate again" : "Generate document"}
            </Btn>
            {missing.length ? (
              <p className="text-caption text-error">
                {missing.map((r) => r.name).join(", ")} not selected. Facts that cite {missing.length === 1 ? "it" : "them"} would have no source, so the run is held.
              </p>
            ) : inputFail ? (
              <p className="text-caption text-error">The input check fails. Reload the released revision on the records page before drafting.</p>
            ) : done && full ? (
              <p className="text-caption text-tertiary">Applied fixes are held as author constraints, so a new run does not bring them back.</p>
            ) : null}
          </div>
        </aside>

        {/* Pipeline and document */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-raised max-xl:flex-none">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-muted bg-page px-4 py-2">
            <Tabs
              tabs={[
                { id: "pipeline", label: "Pipeline" },
                { id: "document", label: "Document", count: written || undefined },
                { id: "facts", label: "Facts", count: model.id === LIVE_MODEL ? FACTS.length : model.specs.length },
              ]}
              value={tab}
              onChange={setTab}
            />
            <span className="truncate text-caption text-quaternary">
              {type.name} · {model.id}
            </span>
          </div>
          <div className="min-h-0 flex-1 p-4 xl:overflow-y-auto">
            {tab === "pipeline" ? (
              <div className="mx-auto flex max-w-[46rem] flex-col gap-3">
                {!mine ? (
                  <p className="rounded-lg border border-muted bg-container px-4 py-3 text-body-sm text-tertiary">No run yet for this document type. Select Generate document to start one.</p>
                ) : null}
                <PipelineStep mark="mark-flow-records" title="Input check" state={stepState(0)} summary={`${inputPass} passed, ${inputWarn} warnings. Records are released and agree with each other.`} />
                <PipelineStep
                  mark="mark-flow-extracted"
                  title="Extractor"
                  state={stepState(1)}
                  summary={
                    model.id === LIVE_MODEL
                      ? `${FACTS.length} facts, ${CONSTRAINTS.filter((c) => c.kind === "prohibition").length} prohibitions and ${CONSTRAINTS.filter((c) => c.kind === "required").length} required statements from ${records.length} records.`
                      : `${model.specs.length * 4 + 9} facts from ${records.length} records.`
                  }
                />
                <PipelineStep mark="mark-flow-drafted" title="Author" state={authorState} summary={`${shown.length} sections written from the fact base. No figure is written that the fact base does not hold.`}>
                  {mine ? (
                    <ul className="mt-3 flex flex-col border-t border-muted pt-1">
                      {shown.map((s, i) => {
                        const state = done || step > 2 + i ? "done" : running && step === 2 + i ? "running" : "pending";
                        return (
                          <li key={s.id} className={`flex items-center gap-2.5 border-b border-muted py-1.5 text-body-sm last:border-b-0 ${state === "pending" ? "opacity-50" : ""}`}>
                            <StepIcon state={state} />
                            <span className="min-w-0 flex-1 truncate text-secondary">{s.title}</span>
                            <span className="shrink-0 text-caption tabular text-quaternary">{state === "done" ? `${sectionSeconds(s)} s` : ""}</span>
                            <span className="w-16 shrink-0 text-right text-caption tabular text-tertiary">{state === "done" ? `${s.factCount} facts` : ""}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </PipelineStep>
                <PipelineStep
                  mark="mark-flow-verified"
                  title="Verifier"
                  state={done ? "done" : running && step >= st.run.total - 1 ? "running" : "pending"}
                  summary={full ? `${checks.length} checks run. ${fails} fail, ${warns} warn. ${openCount} findings open.` : `${input.length} input checks run. Output rules run once the draft carries full text.`}
                />
                {done ? (
                  <div className="flex flex-wrap gap-2">
                    <Btn variant="primary" onClick={() => setTab("document")}>
                      Open the document
                    </Btn>
                    {full ? <LinkBtn href="/findings">Work the {openCount} findings</LinkBtn> : null}
                  </div>
                ) : null}
              </div>
            ) : tab === "document" ? (
              <div className="flex flex-col gap-3">
                {full ? (
                  <div className="mx-auto w-full max-w-[46rem]">
                    <DocumentLegend />
                  </div>
                ) : (
                  <p className="mx-auto w-full max-w-[46rem] rounded-lg border border-info-stroke bg-info-surface px-4 py-2.5 text-body-sm text-secondary">
                    Section plan. This dataset carries full text for the NTL-6157 Use & Care Guide. Other types are drafted to section level, with the facts each section will cite.
                  </p>
                )}
                {written === 0 ? (
                  <div className="mx-auto flex w-full max-w-[46rem] flex-col items-center gap-2 rounded-lg border border-muted bg-container px-6 py-12 text-center">
                    <GMark id="mark-empty" size={56} />
                    <p className="text-body-md text-tertiary">{running ? "The author has not finished a section yet." : "No draft for this document type yet."}</p>
                    <p className="text-body-sm text-quaternary">Run the pipeline to draft it from the selected records.</p>
                  </div>
                ) : (
                  <ManualDocument
                    sections={shown}
                    showTopics={full}
                    limit={written}
                    title={{
                      product: model.id === LIVE_MODEL ? "Northfield 5.3 cu ft Top Load Washer" : `Northfield ${model.name}`,
                      docName: type.name,
                      model: model.id,
                      docNumber: full ? "N11789021 Rev. A" : "Draft, not numbered",
                      language: "en-US",
                      issued: "12 Oct 2026",
                    }}
                    footer={running ? <p className="text-body-sm text-info">Writing section {Math.min(shown.length, written + 1)} of {shown.length}</p> : undefined}
                  />
                )}
              </div>
            ) : (
              <div className="mx-auto flex max-w-[46rem] flex-col gap-3">
                {model.id === LIVE_MODEL ? (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {FACTS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => openInspector({ type: "fact", id: f.id })}
                          className="flex min-w-0 items-baseline justify-between gap-3 rounded-md border border-muted bg-container px-3 py-2 text-left outline-none transition-colors duration-[150ms] hover:border-default focus-visible:ring-2 focus-visible:ring-active"
                        >
                          <span className="min-w-0">
                            <span className="block text-caption tabular text-quaternary">{f.id}</span>
                            <span className="block truncate text-body-sm text-secondary">{f.label}</span>
                          </span>
                          <span className="shrink-0 text-body-sm tabular text-primary">
                            {f.value} {f.unit}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {CONSTRAINTS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => openInspector({ type: "constraint", id: c.id })}
                          className="rounded-md border border-muted bg-container px-3 py-2 text-left outline-none transition-colors duration-[150ms] hover:border-default focus-visible:ring-2 focus-visible:ring-active"
                        >
                          <span className="block text-caption text-quaternary">
                            <span className="tabular">{c.id}</span> · {c.kind === "prohibition" ? "Prohibition" : "Required statement"}
                          </span>
                          <span className="block text-body-sm text-secondary">{c.title}</span>
                        </button>
                      ))}
                    </div>
                    <LinkBtn href="/facts" className="self-start">
                      Open the fact base
                    </LinkBtn>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {model.specs.map(([label, value, unit]) => (
                      <div key={label} className="flex items-baseline justify-between gap-3 rounded-md border border-muted bg-container px-3 py-2">
                        <span className="min-w-0 truncate text-body-sm text-secondary">{label}</span>
                        <span className="shrink-0 text-body-sm tabular text-primary">
                          {value} {unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Validation */}
        <aside className="flex min-w-0 shrink-0 flex-col gap-4 border-t border-muted p-4 xl:w-[20rem] xl:overflow-y-auto xl:border-t-0 xl:border-l">
          <p className={LABEL_CLASS}>Validation</p>
          {full ? (
            <>
              <VerdictBanner compact action={verdict.ready ? <LinkBtn href="/signoff" variant="primary">Go to sign-off</LinkBtn> : <LinkBtn href="/findings" variant="primary">Open findings</LinkBtn>} />
              {running ? <p className="text-body-sm text-info">Checks shown are from the last completed run.</p> : null}
              <CheckList checks={checks} />
            </>
          ) : (
            <>
              <p className="rounded-lg border border-muted bg-container px-3 py-2.5 text-body-sm text-tertiary">
                Input checks for {model.id}. Extraction and output rules run once this document type has a full-text draft.
              </p>
              <CheckList checks={input} />
            </>
          )}
        </aside>
      </div>
    </>
  );
}
