import Link from "next/link";
import { buildTriage } from "@/lib/triage";
import { addDays, dayLabel, daysUntil, formatDuration, greeting, studyDay } from "@/lib/day";
import { nextExam } from "@/lib/content";
import { minutesOn, store } from "@/lib/store";

export const dynamic = "force-dynamic";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

type Row = { key: string; kind: string; title: string; sub?: string; day: string | null; href?: string };

function rel(day: string | null): { text: string; tone: string } {
  if (!day) return { text: "", tone: "text-ink-3" };
  const d = daysUntil(day);
  // Late work is not red. It is just late, and it is still on the list.
  if (d < 0) return { text: "late", tone: "text-ink-3" };
  if (d === 0) return { text: "today", tone: "text-ink" };
  if (d === 1) return { text: "tomorrow", tone: "text-ink-2" };
  return { text: `${d}d`, tone: "text-ink-3" };
}

export default async function Today() {
  const today = studyDay();
  const horizon = addDays(today, 7);
  const subject = nextExam();

  const [sessions, tasks, assessments, cards, courses] = await Promise.all([
    store.sessionsOn(today),
    store.listTasks(),
    store.listAssessments(),
    store.listCards(),
    store.listCourses(),
  ]);

  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "";
  const cardsDue = cards.filter((c) => c.dueDay <= today).length;

  const rows: Row[] = [
    ...tasks
      .filter((t) => !t.done && t.dueDay && t.dueDay <= horizon)
      .map((t) => ({ key: t.id, kind: "Task", title: t.title, sub: t.course ?? undefined, day: t.dueDay, href: "/tasks" })),
    ...assessments
      .filter((a) => a.score === null && a.dueDay && a.dueDay <= horizon)
      .map((a) => ({
        key: a.id,
        kind: "Assessment",
        title: a.title,
        sub: `${courseName(a.courseId)} · ${a.weight}%`,
        day: a.dueDay,
        href: `/grades/${a.courseId}`,
      })),
    ...(cardsDue > 0
      ? [{ key: "cards", kind: "Review", title: `${cardsDue} ${cardsDue === 1 ? "card" : "cards"} due`, day: today, href: "/review" }]
      : []),
  ].sort((a, b) => (a.day ?? "9999").localeCompare(b.day ?? "9999"));

  const visible = rows.slice(0, 10);
  const minutes = minutesOn(sessions, today);

  return (
    <main className="pt-6">
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">{dayLabel(today)}</p>
      <h1 className="mt-2 font-display text-[40px] leading-[1.05] tracking-[-0.02em]">{greeting()}</h1>

      {subject && (
        <Link href={`/study/${subject.code}`} className="press mt-8 flex items-end justify-between gap-4 border-y border-rule py-4">
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-[0.14em] text-ink-3">Next paper</span>
            <span className="mt-1 block truncate font-display text-[22px] leading-tight tracking-[-0.01em]">
              {subject.name}
            </span>
            <span className="mt-1 block text-[12px] text-ink-2">
              {subject.year} · Sem {ROMAN[subject.sem]} · {dayLabel(subject.examDate)}
            </span>
          </span>
          <span className="tabular shrink-0 font-display text-[36px] leading-none">
            {Math.max(0, daysUntil(subject.examDate))}
            <span className="ml-0.5 text-[13px] text-ink-3">d</span>
          </span>
        </Link>
      )}

      <section className="mt-6 flex items-end justify-between gap-4" aria-labelledby="focused">
        <div>
          <h2 id="focused" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Focused today
          </h2>
          <p className="tabular mt-1 font-display text-[28px] leading-none">{formatDuration(minutes)}</p>
        </div>
        <Link href="/study" className="press rounded-[10px] bg-ink px-5 py-2.5 text-[14px] font-medium text-paper">
          Start
        </Link>
      </section>

      <section className="mt-10" aria-labelledby="upnext">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="upnext" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Next seven days
          </h2>
          <Link href="/tasks" className="text-[12px] text-ink-3 underline underline-offset-4">
            All tasks
          </Link>
        </div>

        {visible.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-2">Nothing due. Capture something with + or start a session.</p>
        ) : (
          <ul className="mt-1">
            {visible.map((row) => {
              const when = rel(row.day);
              const body = (
                <>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px]">{row.title}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-3">
                      {row.kind}
                      {row.sub ? ` · ${row.sub}` : ""}
                    </span>
                  </span>
                  <span className={`tabular shrink-0 text-[13px] ${when.tone}`}>{when.text}</span>
                </>
              );
              return (
                <li key={row.key} className="border-b border-rule">
                  {row.href ? (
                    <Link href={row.href} className="press flex items-baseline justify-between gap-4 py-3.5">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-baseline justify-between gap-4 py-3.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {rows.length > visible.length && (
          <Link href="/tasks" className="press mt-4 block text-[13px] text-ink-2 underline underline-offset-4">
            Show all {rows.length}
          </Link>
        )}
      </section>

      {subject && (
        <p className="mt-10 text-[12px] text-ink-3">
          {formatDuration(buildTriage(subject.modules.flatMap((m) => m.sections)).totalMinutes)} of material across{" "}
          {subject.modules.length} modules.
        </p>
      )}
    </main>
  );
}
