import Link from "next/link";
import Mark from "@/components/mark";
import { addDays, dayLabel, daysUntil, greeting, streak, studyDay } from "@/lib/day";
import { logCounts, store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Widget() {
  const today = studyDay();
  const horizon = addDays(today, 10);
  const [tasks, assessments, logs, name] = await Promise.all([
    store.listTasks(),
    store.listAssessments(),
    store.listLogs(),
    store.name(),
  ]);

  const due = [
    ...tasks.filter((t) => !t.done && t.dueDay && t.dueDay <= horizon).map((t) => ({ title: t.title, day: t.dueDay! })),
    ...assessments
      .filter((a) => a.score === null && a.dueDay && a.dueDay <= horizon)
      .map((a) => ({ title: a.title, day: a.dueDay! })),
  ].sort((a, b) => a.day.localeCompare(b.day));

  const counts = logCounts(logs);
  const streakDays = streak(new Set(counts.keys()), today);
  const next = due[0];

  return (
    <main className="pt-6">
      <Link href="/settings" className="text-[13px] text-ink-3">
        Settings
      </Link>
      <h1 className="mt-4 font-display text-[32px] leading-[1.05] tracking-[-0.02em]">Widget</h1>
      <p className="mt-2 text-[13px] text-ink-2">
        A PWA cannot draw on the OS home screen itself. Keep this page as the design, and rebuild it in
        Scriptable (iOS) or KWGT (Android) with the same numbers.
      </p>

      <div className="mt-8 flex flex-wrap items-start gap-5">
        <div className="relative h-[170px] w-[170px] overflow-hidden rounded-[26px] bg-ash p-4 ring-1 ring-ink/10">
          <Mark size={26} />
          <p className="tabular mt-3 font-display text-[40px] leading-none">{due.length}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-3">due</p>
          <p className="absolute inset-x-4 bottom-3 truncate text-[12px] text-ink-2">
            {next ? next.title : "Clear"}
          </p>
        </div>

        <div className="relative h-[170px] w-[360px] max-w-full overflow-hidden rounded-[26px] bg-ash p-4 ring-1 ring-ink/10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Mark size={20} />
                <span className="text-[13px] font-medium tracking-[-0.01em]">Synesis</span>
              </div>
              <p className="mt-2 font-display text-[19px] leading-tight">
                {greeting()}
                {name ? `, ${name}` : ""}.
              </p>
            </div>
            <div className="text-right">
              <p className="tabular font-display text-[26px] leading-none text-teal">{streakDays}</p>
              <p className="text-[9px] uppercase tracking-[0.12em] text-ink-3">streak</p>
            </div>
          </div>

          <ul className="mt-3 space-y-1">
            {due.slice(0, 2).map((d) => (
              <li key={d.title} className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="min-w-0 truncate">{d.title}</span>
                <span className="tabular shrink-0 text-[11px] text-ink-3">
                  {daysUntil(d.day) === 0 ? "today" : daysUntil(d.day) === 1 ? "tomorrow" : dayLabel(d.day)}
                </span>
              </li>
            ))}
            {due.length === 0 && <li className="text-[12px] text-ink-3">Nothing due.</li>}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-[12px] leading-relaxed text-ink-3">
        2×2 answers one question: how much is left. 4×2 answers the morning question: who am I today, what is the
        streak, and what is next.
      </p>
    </main>
  );
}
