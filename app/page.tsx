import Link from "next/link";
import { ArrowUpRight, Check, Flame, Settings } from "lucide-react";
import { toggleTask } from "@/app/actions";
import Heatmap from "@/components/heatmap";
import { ceiling, formatGpa, standing } from "@/lib/cgpa";
import { addDays, daysUntil, greeting, ROMAN, streak, studyDay } from "@/lib/day";
import { logCounts, store, type Project } from "@/lib/store";

export const dynamic = "force-dynamic";

const HORIZON_DAYS = 10;
const MAX_ROWS = 6;
const BARS = ["bg-teal", "bg-amber", "bg-peri"];

const STATUS: Record<Project["status"], string> = {
  idea: "Idea",
  building: "Building",
  shipped: "Shipped",
};

type Row = { key: string; id: string; title: string; meta: string; day: string; kind: "task" | "assessment" };

function when(day: string): string {
  const d = daysUntil(day);
  if (d < 0) return "late";
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  return `${d}d`;
}

export default async function Today() {
  const today = studyDay();
  const horizon = addDays(today, HORIZON_DAYS);

  const [logs, tasks, assessments, courses, semesters, target, selfCourses, projects, name] = await Promise.all([
    store.listLogs(),
    store.listTasks(),
    store.listAssessments(),
    store.listCourses(),
    store.listSemesters(),
    store.cgpaTarget(),
    store.listSelfCourses(),
    store.listProjects(),
    store.name(),
  ]);

  const counts = logCounts(logs);
  const todayCount = counts.get(today) ?? 0;
  const streakDays = streak(new Set(counts.keys()), today);

  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "Course";

  const rows: Row[] = [
    ...tasks
      .filter((t) => !t.done && t.dueDay && t.dueDay <= horizon)
      .map((t) => ({ key: t.id, id: t.id, title: t.title, meta: t.course ?? "Personal", day: t.dueDay!, kind: "task" as const })),
    ...assessments
      .filter((a) => a.score === null && a.dueDay && a.dueDay <= horizon)
      .map((a) => ({
        key: a.id,
        id: a.id,
        title: a.title,
        meta: `${courseName(a.courseId)} · ${a.weight}%`,
        day: a.dueDay!,
        kind: "assessment" as const,
      })),
  ].sort((a, b) => a.day.localeCompare(b.day) || a.title.localeCompare(b.title));

  const shown = rows.slice(0, MAX_ROWS);

  const st = standing(semesters, target);
  const best = ceiling(st);
  const pending = semesters.filter((s) => s.sgpa === null);
  const firstLeft = pending[0]?.number;
  const lastLeft = pending[pending.length - 1]?.number;
  const range =
    firstLeft === undefined
      ? ""
      : firstLeft === lastLeft
        ? `Sem ${ROMAN[firstLeft]}`
        : `Sem ${ROMAN[firstLeft]}–${ROMAN[lastLeft]}`;

  const degree = (() => {
    if (st.status === "none") return "Add your SGPAs in Grades.";
    if (st.status === "no-target") return "Set a target in Grades.";
    if (st.status === "complete") return "Degree complete.";
    if (st.status === "secured") return `${formatGpa(target!)} secured.`;
    if (st.status === "unreachable") return `${formatGpa(target!)} is out of reach. Best ${formatGpa(best!)}.`;
    return `Need ${formatGpa(st.requiredSgpa!)} in ${range}.`;
  })();

  const project =
    projects.find((p) => p.status === "building") ?? projects.find((p) => p.status === "idea") ?? projects[0];
  const studying = [...selfCourses].sort((a, b) => Number(a.done >= a.units) - Number(b.done >= b.units)).slice(0, 3);

  return (
    <main className="pt-6">
      <div className="flex items-start justify-between gap-4">
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-3">{longDate(today)}</p>
        <Link
          href="/settings"
          aria-label="Settings"
          className="press glass grid size-11 shrink-0 place-items-center rounded-full text-ink-2"
        >
          <Settings size={18} strokeWidth={1.7} aria-hidden />
        </Link>
      </div>

      <h1 className="mt-2 font-display text-[40px] leading-[1.03] tracking-[-0.025em]">
        {greeting()}
        {name && (
          <>
            , <span className="text-teal">{name[0].toUpperCase() + name.slice(1)}</span>
          </>
        )}
        .
      </h1>

      <section className="tile mt-6 p-4" aria-labelledby="activity">
        <div className="flex items-baseline justify-between">
          <h2 id="activity" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            Logged
          </h2>
          <Link href="/log" className="text-[12px] text-ink-3 underline underline-offset-4">
            Journal
          </Link>
        </div>

        <div className="mt-3">
          <Heatmap counts={counts} today={today} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-rule pt-3">
          {streakDays > 1 && (
            <span className="flex items-center gap-1 rounded-full bg-amber/15 px-2.5 py-1 text-[11px] text-amber">
              <Flame size={12} strokeWidth={2} aria-hidden />
              {streakDays} day streak
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-[11px] ${todayCount ? "bg-teal/15 text-teal" : "bg-ink/[0.06] text-ink-3"}`}>
            {todayCount ? `${todayCount} logged today` : "Nothing logged today"}
          </span>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="studying">
        <div className="flex items-baseline justify-between">
          <h2 id="studying" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            Self-study
          </h2>
          <Link href="/study" className="text-[12px] text-ink-3 underline underline-offset-4">
            All
          </Link>
        </div>

        {studying.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-2">
            <Link href="/study" className="underline underline-offset-4">
              Add a course
            </Link>{" "}
            you are working through.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {studying.map((c, i) => (
              <li key={c.id}>
                <Link href="/study" className="press tile block p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[15px]">{c.title}</span>
                    <span className="tabular shrink-0 text-[12px] text-ink-3">
                      {c.done}/{c.units}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-rule" aria-hidden>
                      <span
                        className={`absolute inset-y-0 left-0 rounded-full ${BARS[i % BARS.length]}`}
                        style={{ width: `${Math.round((c.done / c.units) * 100)}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-3">{c.source}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="due">
        <div className="flex items-baseline justify-between">
          <h2 id="due" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            Due in ten days
          </h2>
          <Link href="/tasks" className="text-[12px] text-ink-3 underline underline-offset-4">
            All
          </Link>
        </div>

        <div className="tile mt-2 px-4 py-1">
          {shown.length === 0 ? (
            <p className="py-4 text-[14px] text-ink-2">Nothing due. Capture one with +.</p>
          ) : (
            <ul>
              {shown.map((row) => {
                const label = when(row.day);
                return (
                  <li key={row.key} className="flex items-center gap-3 border-b border-rule py-3 last:border-0">
                    {row.kind === "task" ? (
                      <form action={toggleTask} className="shrink-0">
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="done" value="1" />
                        <button aria-label={`Mark ${row.title} done`} className="press -my-2 grid size-9 place-items-center">
                          <span className="grid size-[22px] place-items-center rounded-[7px] border border-ink-3/60">
                            <Check size={13} strokeWidth={2.4} className="text-transparent" aria-hidden />
                          </span>
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={`/grades/${assessments.find((a) => a.id === row.id)?.courseId ?? ""}`}
                        aria-label={`Open ${row.title}`}
                        className="press -my-2 grid size-9 shrink-0 place-items-center"
                      >
                        <span className="size-[22px] rounded-[7px] border border-peri/70 bg-peri/15" aria-hidden />
                      </Link>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px]">{row.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-ink-3">{row.meta}</p>
                    </div>

                    <span
                      className={`tabular shrink-0 text-[12px] ${
                        label === "today"
                          ? "rounded-full bg-teal px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-paper"
                          : "text-ink-3"
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {rows.length > shown.length && (
          <Link href="/tasks" className="press mt-2 inline-block text-[13px] text-ink-2 underline underline-offset-4">
            {rows.length - shown.length} more
          </Link>
        )}
      </section>

      {project && (
        <Link href="/library" className="press tile mt-8 flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-3">Building</p>
            <p className="mt-1 truncate text-[15px]">{project.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-2">
              <span className={`size-1.5 rounded-full ${project.status === "shipped" ? "bg-ink-3" : "bg-amber"}`} aria-hidden />
              {STATUS[project.status]}
            </p>
          </div>
          <ArrowUpRight size={18} strokeWidth={1.6} className="shrink-0 text-ink-3" aria-hidden />
        </Link>
      )}

      <section className="mt-8 flex items-end justify-between gap-4 border-t border-rule pt-4" aria-labelledby="degree">
        <div>
          <h2 id="degree" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            CGPA
          </h2>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="tabular font-display text-[26px] leading-none tracking-[-0.02em]">
              {st.cgpa === null ? "—" : formatGpa(st.cgpa)}
            </span>
            <span className="text-[11px] text-ink-3">/10</span>
          </p>
        </div>
        <p className="max-w-[62%] text-right text-[12px] leading-snug text-ink-2">{degree}</p>
      </section>
    </main>
  );
}

function longDate(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(`${day}T12:00:00Z`),
  );
}
