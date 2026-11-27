import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { startSession, toggleSection } from "@/app/actions";
import { getModule } from "@/lib/content";
import { daysUntil, formatDuration } from "@/lib/day";
import { sectionKey } from "@/lib/progress";
import { store } from "@/lib/store";
import { buildTriage, type Priority } from "@/lib/triage";

export const dynamic = "force-dynamic";

const SPINE: Record<Priority, string> = {
  high: "border-oxblood",
  medium: "border-ochre",
  // The tail carries no spine at all: it is already named in the skip block.
  low: "border-transparent",
};

const FILL: Record<Priority, string> = {
  high: "bg-oxblood",
  medium: "bg-ochre",
  low: "bg-stone",
};

export default async function ModulePage({ params }: { params: Promise<{ code: string; module: string }> }) {
  const { code, module: raw } = await params;
  const found = await getModule(code, Number(raw));
  if (!found) notFound();

  const { subject, module } = found;
  const triage = buildTriage(module.sections);
  const skip = triage.rows.filter((r) => r.priority === "low");
  const top = triage.rows[0];
  const [running, done] = await Promise.all([store.running(), store.doneSections()]);
  const days = Math.max(0, daysUntil(subject.examDate));

  const doneMinutes = module.sections
    .filter((s) => done.has(sectionKey(subject.code, s.id)))
    .reduce((sum, s) => sum + s.minutes, 0);
  const share = triage.totalMinutes > 0 ? doneMinutes / triage.totalMinutes : 0;

  return (
    <main className="pt-6">
      <Link href={`/study/${subject.code}`} className="text-[13px] text-ink-3">
        {subject.name}
      </Link>

      <h1 className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em]">
        <span className="tabular mr-2 text-ink-3">{module.no}</span>
        {module.title}
      </h1>
      <p className="tabular mt-2 text-[13px] text-ink-3">
        {days} days to the paper · {formatDuration(triage.totalMinutes)} · {Math.round(share * 100)}% covered
      </p>

      <p className="mt-6 font-display text-[21px] leading-[1.4] tracking-[-0.01em]">{triage.verdict}</p>

      <div className="mt-5 flex h-1.5 overflow-hidden rounded-full bg-rule" aria-hidden>
        {triage.rows.map((r) => (
          <div key={r.id} className={FILL[r.priority]} style={{ width: `${(r.minutes / triage.totalMinutes) * 100}%` }} />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-ink-3">How the study time splits across sections</p>

      <ol className="mt-8">
        {triage.rows.map((r, i) => {
          const isDone = done.has(sectionKey(subject.code, r.id));
          return (
            <li key={r.id} className={`border-b border-rule border-l-2 py-4 pl-4 ${SPINE[r.priority]}`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className={`min-w-0 text-[15px] ${isDone ? "text-ink-3" : ""}`}>
                  <span className="tabular mr-2 text-ink-3">{i + 1}</span>
                  {r.title}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular text-[13px] text-ink-3">{r.minutes}m</span>
                  <form action={toggleSection}>
                    <input type="hidden" name="key" value={sectionKey(subject.code, r.id)} />
                    <input type="hidden" name="done" value={isDone ? "0" : "1"} />
                    <button
                      aria-label={isDone ? `Mark ${r.title} not done` : `Mark ${r.title} done`}
                      aria-pressed={isDone}
                      className="press -my-2 grid size-10 place-items-center"
                    >
                      <span
                        className={`grid size-6 place-items-center rounded-[6px] border ${
                          isDone ? "border-ink bg-ink" : "border-rule"
                        }`}
                      >
                        <Check
                          size={14}
                          strokeWidth={2}
                          className={isDone ? "text-paper" : "text-transparent"}
                          aria-hidden
                        />
                      </span>
                    </button>
                  </form>
                </div>
              </div>
              {r.note && <p className="mt-0.5 text-[12px] text-ink-2">{r.note}</p>}
              <p className="tabular mt-1.5 text-[11px] text-ink-3">
                {r.papers} of 10 papers · {Math.round(r.share * 100)}% of the paper
              </p>
            </li>
          );
        })}
      </ol>

      {skip.length > 0 && (
        <section className="mt-8 rounded-[12px] bg-ash p-4" aria-labelledby="skip">
          <h2 id="skip" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Do not study these
          </h2>
          <ul className="mt-2 space-y-1">
            {skip.map((r) => (
              <li key={r.id} className="flex items-baseline justify-between gap-3 text-[13px] text-ink-2">
                <span className="min-w-0">{r.title}</span>
                <span className="tabular shrink-0 text-ink-3">{r.minutes}m</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-ink-3">
            Saves {formatDuration(skip.reduce((s, r) => s + r.minutes, 0))} and risks at most{" "}
            {Math.round(skip.reduce((s, r) => s + r.expectedMarks, 0))} marks.
          </p>
        </section>
      )}

      <div className="mt-8">
        {running ? (
          <Link href="/study" className="press block rounded-[10px] border border-rule py-3 text-center text-[14px]">
            A session is running
          </Link>
        ) : (
          <form action={startSession}>
            <input type="hidden" name="subject" value={subject.code} />
            <button className="press w-full rounded-[10px] bg-ink py-3.5 text-[14px] font-medium text-paper">
              Start on {top.title}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
