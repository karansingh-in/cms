export type Grade = "again" | "good" | "easy";
export type Schedule = { interval: number; ease: number };

export const FIRST_EASE = 2.5;

/**
 * SM-2 in three buttons. Interval is in days; ease never drops below 1.3.
 * Deliberately not the full algorithm: three grades is what people actually press.
 */
export function schedule(current: Schedule, grade: Grade): Schedule {
  if (grade === "again") {
    return { interval: 0, ease: Math.max(1.3, current.ease - 0.2) };
  }

  const ease = grade === "easy" ? current.ease + 0.15 : current.ease;

  if (current.interval === 0) {
    return { interval: grade === "easy" ? 3 : 1, ease };
  }

  const factor = grade === "easy" ? ease * 1.3 : ease;
  return { interval: Math.max(1, Math.round(current.interval * factor)), ease };
}
