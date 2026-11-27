import { addDays } from "@/lib/day";

const LEVEL = ["heat", "heat-1", "heat-2", "heat-3", "heat-4"];

function level(count: number): string {
  return LEVEL[Math.min(count, 4)];
}

function monthOf(day: string): number {
  return Number(day.slice(5, 7));
}

/**
 * GitHub's contribution grid, but it counts what you actually wrote down.
 * Time on a timer says nothing about learning; a log entry does.
 */
export default function Heatmap({
  counts,
  today,
  weeks = 24,
}: {
  counts: Map<string, number>;
  today: string;
  weeks?: number;
}) {
  const lastSunday = addDays(today, -new Date(`${today}T12:00:00Z`).getUTCDay());
  const firstSunday = addDays(lastSunday, -(weeks - 1) * 7);
  const columns = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(firstSunday, w * 7 + d)),
  );

  return (
    <div>
      <div className="flex gap-[3px] pl-[1px]" aria-hidden>
        {columns.map((week) => (
          <span key={week[0]} className="w-[10px] shrink-0 text-[8px] uppercase tracking-[0.04em] text-ink-3">
            {monthOf(week[0]) !== monthOf(addDays(week[0], -7)) ? monthName(week[0]) : ""}
          </span>
        ))}
      </div>

      <div className="mt-1 flex gap-[3px]">
        {columns.map((week) => (
          <div key={week[0]} className="flex flex-col gap-[3px]">
            {week.map((day) => {
              if (day > today) return <span key={day} className="size-[10px] rounded-[2px] bg-transparent" />;
              const n = counts.get(day) ?? 0;
              return (
                <span
                  key={day}
                  title={`${day} · ${n} ${n === 1 ? "entry" : "entries"}`}
                  className={`size-[10px] rounded-[2px] ${level(n)} ${
                    day === today ? "ring-1 ring-amber" : ""
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-ink-3">
        <span>Less</span>
        {LEVEL.map((l) => (
          <span key={l} className={`size-[9px] rounded-[2px] ${l}`} />
        ))}
        <span>More</span>
        <span className="ml-auto">
          {[...counts.values()].reduce((a, b) => a + b, 0)}{" "}
          {[...counts.values()].reduce((a, b) => a + b, 0) === 1 ? "entry" : "entries"}
        </span>
      </div>
    </div>
  );
}

function monthName(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(`${day}T12:00:00Z`));
}
