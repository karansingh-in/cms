import { addDays } from "@/lib/day";

const LEVEL = ["heat", "heat-2", "heat-3", "heat-4"];

function level(count: number): string {
  return LEVEL[Math.min(count, 3)];
}

/**
 * Just the grid. No legend, no counts, no month rail: it is a glance, not a report.
 * Counts what you wrote down, because time on a timer says nothing about learning.
 */
export default function Heatmap({
  counts,
  today,
  weeks = 26,
}: {
  counts: Map<string, number>;
  today: string;
  weeks?: number;
}) {
  const lastSunday = addDays(today, -new Date(`${today}T12:00:00Z`).getUTCDay());
  const firstSunday = addDays(lastSunday, -(weeks - 1) * 7);
  const total = [...counts.values()].reduce((a, b) => a + b, 0);

  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(firstSunday, i));

  return (
    <div
      role="img"
      aria-label={`${total} ${total === 1 ? "entry" : "entries"} over the last ${weeks} weeks`}
      className="grid max-w-[340px] auto-cols-fr grid-flow-col grid-rows-7 gap-[3px]"
    >
      {days.map((day) => {
        if (day > today)
          return <span key={day} className="aspect-square w-full" aria-hidden />;

        const n = counts.get(day) ?? 0;
        return (
          <span
            key={day}
            title={day}
            className={`aspect-square w-full rounded-[2px] ${level(n)}`}
          />
        );
      })}
    </div>
  );
}
