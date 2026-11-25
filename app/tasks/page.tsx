import { Check, Trash2 } from "lucide-react";
import { removeTask, toggleTask } from "@/app/actions";
import { dayLabel, daysUntil, studyDay } from "@/lib/day";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Tasks() {
  const today = studyDay();
  const tasks = await store.listTasks();
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Tasks</h1>
      <p className="mt-2 text-[13px] text-ink-2">
        {open.length === 0 ? "Clear." : `${open.length} open.`}
      </p>

      <ul className="mt-6">
        {open.map((t) => {
          const left = t.dueDay ? daysUntil(t.dueDay) : null;
          return (
            <li key={t.id} className="flex items-start gap-3 border-b border-rule py-4">
              <form action={toggleTask}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="done" value="1" />
                <button
                  aria-label={`Mark ${t.title} done`}
                  className="press mt-0.5 grid size-6 place-items-center rounded-[6px] border border-rule"
                >
                  <Check size={14} strokeWidth={2} className="text-transparent" aria-hidden />
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <p className="text-[15px]">{t.title}</p>
                <p className="tabular mt-0.5 text-[12px] text-ink-3">
                  {t.course ?? "Personal"}
                  {t.dueDay ? ` · ${dayLabel(t.dueDay)}` : ""}
                </p>
              </div>
              {left !== null && (
                <span className={`tabular shrink-0 text-[13px] ${left < 0 ? "text-ink-3" : "text-ink-2"}`}>
                  {left < 0 ? "late" : left === 0 ? "today" : left === 1 ? "tomorrow" : `${left}d`}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {open.length === 0 && (
        <p className="mt-3 text-[14px] text-ink-2">Nothing open. Use + in the bar below.</p>
      )}

      {done.length > 0 && (
        <section className="mt-10" aria-labelledby="done">
          <h2 id="done" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Done
          </h2>
          <ul className="mt-1">
            {done.slice(0, 20).map((t) => (
              <li key={t.id} className="flex items-center gap-3 border-b border-rule py-3">
                <form action={toggleTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value="0" />
                  <button
                    aria-label={`Unmark ${t.title}`}
                    className="press grid size-6 place-items-center rounded-[6px] border border-ink bg-ink"
                  >
                    <Check size={14} strokeWidth={2} className="text-paper" aria-hidden />
                  </button>
                </form>
                <span className="min-w-0 flex-1 truncate text-[14px] text-ink-3 line-through">{t.title}</span>
                <form action={removeTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button aria-label={`Delete ${t.title}`} className="press p-1 text-ink-3">
                    <Trash2 size={15} strokeWidth={1.5} aria-hidden />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-[12px] text-ink-3">Today is {dayLabel(today)}.</p>
    </main>
  );
}
