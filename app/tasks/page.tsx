import { Check, Trash2 } from "lucide-react";
import { removeTask, toggleTask } from "@/app/actions";
import { dayLabel, daysUntil } from "@/lib/day";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Tasks() {
  const tasks = await store.listTasks();
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <main className="pt-7">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Tasks</h1>
      <p className="mt-2 text-[13px] text-ink-2">{open.length === 0 ? "Clear." : `${open.length} open.`}</p>

      <ul className="rows mt-6">
        {open.map((t) => {
          const left = t.dueDay ? daysUntil(t.dueDay) : null;
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <form action={toggleTask} className="shrink-0">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="done" value="1" />
                <button
                  aria-label={`Mark ${t.title} done`}
                  className="press -my-2 grid size-9 place-items-center text-ink-3 hover:text-accent"
                >
                  <span className="grid size-[18px] place-items-center rounded-[4px] border border-current">
                    <Check size={11} strokeWidth={2.6} className="opacity-0" aria-hidden />
                  </span>
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
                <span
                  className={`tabular shrink-0 text-[12px] ${
                    left === 0 ? "font-medium text-accent" : "text-ink-3"
                  }`}
                >
                  {left < 0 ? "late" : left === 0 ? "today" : left === 1 ? "tomorrow" : `${left}d`}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {open.length === 0 && <p className="mt-3 text-[14px] text-ink-2">Nothing open.</p>}

      {done.length > 0 && (
        <section className="mt-10" aria-labelledby="done">
          <h2 id="done" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            Done
          </h2>
          <ul className="rows mt-1">
            {done.slice(0, 20).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <form action={toggleTask} className="shrink-0">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value="0" />
                  <button
                    aria-label={`Unmark ${t.title}`}
                    className="press -my-2 grid size-9 place-items-center text-accent"
                  >
                    <span className="grid size-[18px] place-items-center rounded-[4px] bg-accent text-paper">
                      <Check size={11} strokeWidth={2.8} aria-hidden />
                    </span>
                  </button>
                </form>
                <span className="min-w-0 flex-1 truncate text-[14px] text-ink-3 line-through">{t.title}</span>
                <form action={removeTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button aria-label={`Delete ${t.title}`} className="press grid size-9 place-items-center text-ink-3 hover:text-ink">
                    <Trash2 size={15} strokeWidth={1.5} aria-hidden />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
