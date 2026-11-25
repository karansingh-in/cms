import Link from "next/link";
import { startSession, stopSession } from "@/app/actions";
import RunningClock from "@/components/running-clock";
import { getSubject, listSubjects, nextExam } from "@/lib/content";
import { formatDuration, studyDay } from "@/lib/day";
import { minutesOn, store } from "@/lib/store";
import { buildTriage } from "@/lib/triage";

export const dynamic = "force-dynamic";

export default async function Study() {
  const subjects = listSubjects();
  const running = await store.running();
  const today = studyDay();
  const minutes = minutesOn(await store.sessionsOn(today), today);
  const cardsDue = (await store.listCards()).filter((c) => c.dueDay <= today).length;
  const fallback = nextExam()?.code ?? subjects[0]?.code;

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Study</h1>

      <section className="mt-8" aria-labelledby="timer">
        <div className="flex items-baseline justify-between">
          <h2 id="timer" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            {running ? "Running" : "Timer"}
          </h2>
          <span className="tabular text-[13px] text-ink-3">{formatDuration(minutes)} today</span>
        </div>

        {running ? (
          <div className="mt-3 rounded-[12px] bg-ash p-5">
            <p className="text-[13px] text-ink-2">
              {running.subject ? (getSubject(running.subject)?.name ?? running.subject) : "Unassigned"}
            </p>
            <div className="mt-2">
              <RunningClock startedAt={running.startedAt} initialNow={Date.now()} />
            </div>
            <form action={stopSession} className="mt-5">
              <button className="press w-full rounded-[10px] border border-ink py-3 text-[14px] font-medium">Stop</button>
            </form>
          </div>
        ) : (
          <form action={startSession} className="mt-3 rounded-[12px] bg-ash p-5">
            <label htmlFor="subject" className="sr-only">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              defaultValue={fallback}
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
              <option value="">Unassigned</option>
            </select>
            <button className="press mt-3 w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">
              Start
            </button>
          </form>
        )}
      </section>

      <section className="mt-10" aria-labelledby="review">
        <h2 id="review" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Review
        </h2>
        <Link href="/review" className="press flex items-baseline justify-between gap-4 border-b border-rule py-4">
          <span className="min-w-0">
            <span className="block text-[15px]">Cards</span>
            <span className="mt-0.5 block text-[12px] text-ink-3">Practice testing, spaced</span>
          </span>
          <span className="tabular shrink-0 text-[13px] text-ink-3">
            {cardsDue === 0 ? "none due" : `${cardsDue} due`}
          </span>
        </Link>
      </section>

      <section className="mt-10" aria-labelledby="subjects">
        <h2 id="subjects" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Subjects
        </h2>
        <ul className="mt-1">
          {subjects.map((s) => (
            <li key={s.code}>
              <Link
                href={`/study/${s.code}`}
                className="press flex items-baseline justify-between gap-4 border-b border-rule py-4"
              >
                <span className="min-w-0">
                  <span className="block text-[15px]">{s.name}</span>
                  <span className="mt-0.5 block text-[12px] text-ink-3">
                    {s.year} · Sem {["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][s.sem]} · {s.modules.length} modules
                  </span>
                </span>
                <span className="tabular shrink-0 text-[13px] text-ink-3">
                  {formatDuration(buildTriage(s.modules.flatMap((m) => m.sections)).totalMinutes)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
