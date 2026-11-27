export type Semester = { id: string; number: number; credits: number; sgpa: number | null };

export type StandingStatus = "none" | "no-target" | "complete" | "secured" | "unreachable" | "reachable";

export type Standing = {
  /** Credits-weighted GPA so far. null until one semester is marked. */
  cgpa: number | null;
  completedCredits: number;
  earnedPoints: number;
  remainingCredits: number;
  semestersLeft: number;
  /** SGPA needed in each remaining semester to finish on `target`. */
  requiredSgpa: number | null;
  status: StandingStatus;
};

export const MAX_SGPA = 10;

/**
 * CGPA across eight semesters. Future semesters carry their planned credits, so the
 * required SGPA is a single number you can hold yourself to rather than a range.
 */
export function standing(semesters: Semester[], target: number | null): Standing {
  let completedCredits = 0;
  let earnedPoints = 0;
  let remainingCredits = 0;
  let semestersLeft = 0;

  for (const s of semesters) {
    if (s.sgpa === null) {
      remainingCredits += Math.max(0, s.credits);
      semestersLeft += 1;
    } else if (s.credits > 0) {
      completedCredits += s.credits;
      earnedPoints += s.credits * s.sgpa;
    }
  }

  const base = {
    cgpa: completedCredits > 0 ? earnedPoints / completedCredits : null,
    completedCredits,
    earnedPoints,
    remainingCredits,
    semestersLeft,
  };

  if (completedCredits === 0 && remainingCredits === 0) return { ...base, requiredSgpa: null, status: "none" };
  if (target === null) return { ...base, requiredSgpa: null, status: "no-target" };
  if (remainingCredits === 0) return { ...base, requiredSgpa: null, status: "complete" };

  const totalCredits = completedCredits + remainingCredits;
  const requiredSgpa = (target * totalCredits - earnedPoints) / remainingCredits;
  const status: StandingStatus =
    requiredSgpa <= 0 ? "secured" : requiredSgpa > MAX_SGPA ? "unreachable" : "reachable";

  return { ...base, requiredSgpa, status };
}

/** "8.75" — two decimals, because a CGPA is quoted that way. */
export function formatGpa(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/** The best possible finish: everything left comes in at 10. */
export function ceiling(s: Standing): number | null {
  if (s.completedCredits + s.remainingCredits === 0) return null;
  return (s.earnedPoints + s.remainingCredits * MAX_SGPA) / (s.completedCredits + s.remainingCredits);
}
