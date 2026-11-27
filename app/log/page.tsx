import Link from "next/link";
import { Trash2 } from "lucide-react";
import { addLog, removeLog } from "@/app/actions";
import Heatmap from "@/components/heatmap";
import PrintButton from "@/components/print-button";
import { dayLabel, studyDay } from "@/lib/day";
import { logCounts, store } from "@/lib/store";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Course", "Self-study", "Project", "Reading", "Practice", "Talk"];
const DOT: Record<string, string> = {
  Course: "bg-teal",
  "Self-study": "bg-peri",
  Project: "bg-amber",
  Reading: "bg-teal",
  Practice: "bg-coral",
  Talk: "bg-peri",
};

function monthKey(day: string): string {
  return day.slice(0, 7);
}

function monthLabel(key: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(`${key}-15T12:00:00Z`),
  );
}

export default async function Log() {
  const logs = await store.listLogs();
  const today = studyDay();
  const counts = logCounts(logs);

  const months = new Map<string, typeof logs>();
  for (const entry of logs) {
    const key = monthKey(entry.day);
    months.set(key, [...(months.get(key) ?? []), entry]);
  }

  return (
    <main className="pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Log</h1>
        <div className="flex gap-4">
          <Link href="/api/log/export" className="text-[12px] text-ink-3 underline underline-offset-4">
            Markdown
          </Link>
          <PrintButton>PDF</PrintButton>
        </div>
      </div>
      <p className="mt-2 text-[13px] text-ink-2">What you actually did, one line at a time.</p>

      <section className="tile mt-6 p-4">
        <Heatmap counts={counts} today={today} weeks={26} />
      </section>

      <form action={addLog} className="tile mt-4 space-y-2 p-4">
        <textarea
          name="text"
          required
          rows={2}
          placeholder="What did you do?"
          aria-label="Entry"
          className="w-full resize-none rounded-[12px] border border-rule bg-paper px-3 py-2.5 text-[15px]"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="category"
            placeholder="Category"
            aria-label="Category"
            list="log-categories"
            className="w-full rounded-[12px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
          />
          <input
            name="day"
            type="date"
            defaultValue={today}
            aria-label="Date"
            className="tabular w-full rounded-[12px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
          />
        </div>
        <input
          name="link"
          type="url"
          placeholder="Link (optional)"
          aria-label="Link"
          className="w-full rounded-[12px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
        />
        <datalist id="log-categories">
          {CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button className="press w-full rounded-[12px] bg-ink py-3 text-[14px] font-medium text-paper">
          Add entry
        </button>
      </form>

      {logs.length === 0 && <p className="mt-6 text-[13px] text-ink-2">Nothing logged yet.</p>}

      {[...months.entries()].map(([key, entries]) => (
        <section key={key} className="mt-9">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[10px] uppercase tracking-[0.16em] text-ink-3">{monthLabel(key)}</h2>
            <span className="tabular text-[11px] text-ink-3">{entries.length}</span>
          </div>
          <ul className="mt-1">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 border-b border-rule py-3.5">
                <span className={`mt-2 size-1.5 shrink-0 rounded-full ${DOT[entry.category] ?? "bg-ink-3"}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug">{entry.text}</p>
                  <p className="tabular mt-1 text-[11px] text-ink-3">
                    {dayLabel(entry.day)} · {entry.category}
                    {entry.link && (
                      <>
                        {" · "}
                        <a href={entry.link} className="underline underline-offset-2" rel="noreferrer noopener">
                          link
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <form action={removeLog}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button aria-label="Delete entry" className="press grid size-9 place-items-center text-ink-3">
                    <Trash2 size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
