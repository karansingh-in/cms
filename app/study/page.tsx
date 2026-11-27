import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { addSelfCourse, bumpSelfCourse, removeSelfCourse, startSession, stopSession } from "@/app/actions";
import ConfirmSubmit from "@/components/confirm-submit";
import PrintButton from "@/components/print-button";
import RunningClock from "@/components/running-clock";
import SubjectSheet from "@/components/subject-sheet";
import { listSubjects } from "@/lib/content";
import { formatDuration, ROMAN, studyDay } from "@/lib/day";
import { coverage } from "@/lib/progress";
import { minutesOn, store } from "@/lib/store";
import { buildTriage } from "@/lib/triage";

export const dynamic = "force-dynamic";

const BARS = ["bg-teal", "bg-amber", "bg-peri", "bg-coral"];

export default async function Study() {
  const [subjects, running, todaySessions, done, selfCourses] = await Promise.all([
    listSubjects(),
    store.running(),
    store.sessionsOn(studyDay()),
    store.doneSections(),
    store.listSelfCourses(),
  ]);

  const minutes = minutesOn(todaySessions, studyDay());
  const fallback = subjects[0]?.code;

  return (
    <main className="pt-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Study</h1>
        <SubjectSheet />
      </div>

      <section className="mt-7" aria-labelledby="timer">
        <div className="flex items-baseline justify-between">
          <h2 id="timer" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            {running ? "Running" : "Timer"}
          </h2>
          <span className="tabular text-[12px] text-ink-3">{formatDuration(minutes)} today</span>
        </div>

        {running ? (
          <div className="tile mt-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[13px] text-ink-2">
                {subjects.find((s) => s.code === running.subject)?.name ?? "Unassigned"}
              </p>
              <span className="size-1.5 shrink-0 rounded-full bg-coral" aria-hidden />
            </div>
            <div className="mt-1">
              <RunningClock startedAt={running.startedAt} initialNow={Date.now()} />
            </div>
            <form action={stopSession} className="mt-3">
              <button className="press w-full rounded-[10px] border border-ink py-2.5 text-[14px] font-medium">Stop</button>
            </form>
          </div>
        ) : (
          <form action={startSession} className="tile mt-2 flex gap-2 p-2">
            <label htmlFor="subject" className="sr-only">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              defaultValue={fallback}
              className="min-w-0 flex-1 rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name}
                </option>
              ))}
              <option value="">Unassigned</option>
            </select>
            <button className="press rounded-[10px] bg-ink px-5 text-[14px] font-medium text-paper">Start</button>
          </form>
        )}
      </section>

      <section className="mt-8" aria-labelledby="self">
        <div className="flex items-baseline justify-between">
          <h2 id="self" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            Self-study
          </h2>
          <span className="flex items-baseline gap-3 text-[11px] text-ink-3">
            <a href="/api/log/export" className="underline underline-offset-4">
              Markdown
            </a>
            <PrintButton>PDF</PrintButton>
          </span>
        </div>

        {selfCourses.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-2">Nothing here yet. Add a course you are working through.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {selfCourses.map((c, i) => (
              <li key={c.id} className="tile p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px]">{c.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-3">
                      {c.code} · {c.source}
                      {c.link && (
                        <>
                          {" · "}
                          <a href={c.link} className="underline underline-offset-2" rel="noreferrer noopener">
                            open
                          </a>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <form action={bumpSelfCourse}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="by" value="-1" />
                      <button
                        aria-label={`Remove one from ${c.title}`}
                        disabled={c.done <= 0}
                        className="press grid size-9 place-items-center rounded-[9px] border border-rule disabled:opacity-35"
                      >
                        <Minus size={15} strokeWidth={2} aria-hidden />
                      </button>
                    </form>
                    <form action={bumpSelfCourse}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="by" value="1" />
                      <button
                        aria-label={`Add one to ${c.title}`}
                        disabled={c.done >= c.units}
                        className="press grid size-9 place-items-center rounded-[9px] bg-ink text-paper disabled:opacity-35"
                      >
                        <Plus size={15} strokeWidth={2.2} aria-hidden />
                      </button>
                    </form>
                    <form action={removeSelfCourse}>
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmSubmit
                        label={`Delete ${c.title}`}
                        message={`Delete "${c.title}"? Its progress goes with it.`}
                        className="press grid size-9 place-items-center text-ink-3"
                      >
                        <Trash2 size={14} strokeWidth={1.6} aria-hidden />
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <span className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-rule" aria-hidden>
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full ${BARS[i % BARS.length]}`}
                      style={{ width: `${Math.round((c.done / c.units) * 100)}%` }}
                    />
                  </span>
                  <span className="tabular shrink-0 text-[11px] text-ink-3">
                    {c.done}/{c.units}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <details className="tile mt-3">
          <summary className="press flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[14px] font-medium">
            <Plus size={16} strokeWidth={1.8} aria-hidden />
            Add course
          </summary>
          <form action={addSelfCourse} className="space-y-2 px-4 pb-4">
            <input
              name="title"
              required
              placeholder="Course title"
              aria-label="Course title"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="code"
                placeholder="CS161"
                aria-label="Course code"
                className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
              <input
                name="units"
                type="number"
                min={1}
                defaultValue={10}
                aria-label="Units"
                className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
            </div>
            <input
              name="source"
              placeholder="Stanford · lectures"
              aria-label="Source"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <input
              name="link"
              type="url"
              placeholder="Link (optional)"
              aria-label="Link"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <button className="press w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">Add</button>
          </form>
        </details>
      </section>

      <section className="mt-9" aria-labelledby="subjects">
        <h2 id="subjects" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Papers
        </h2>
        {subjects.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-2">No subjects yet. Use + above.</p>
        ) : (
          <ul className="mt-1">
            {subjects.map((s) => {
              const cov = coverage(s, done);
              return (
                <li key={s.id}>
                  <Link href={`/study/${s.code}`} className="press flex items-baseline justify-between gap-4 border-b border-rule py-4">
                    <span className="min-w-0">
                      <span className="block truncate text-[15px]">{s.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-ink-3">
                        {s.code}
                        {s.year && ` · ${s.year}`}
                        {s.sem > 0 && ` · Sem ${ROMAN[s.sem]}`}
                        {` · ${formatDuration(buildTriage(s.modules.flatMap((m) => m.sections)).totalMinutes)}`}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-[12px] text-ink-3">{Math.round(cov.share * 100)}%</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
