import { formatDuration } from "./day";

export type Priority = "high" | "medium" | "low";

export type Section = {
  id: string;
  title: string;
  note?: string;
  /** Typical marks a question from this section carries. */
  marks: number;
  /** How many of the last 10 papers asked it. */
  papers: number;
  minutes: number;
};

export type TriageRow = Section & {
  expectedMarks: number;
  share: number;
  priority: Priority;
};

export type Triage = {
  rows: TriageRow[];
  totalMinutes: number;
  totalMarks: number;
  verdict: string;
};

/**
 * Priority is arithmetic, not opinion: marks x how often it is asked.
 * The sections covering the first 60% of expected marks are High, the next 30% Medium,
 * the tail Low. Deterministic, testable, and never hallucinated.
 */
export function buildTriage(sections: Section[]): Triage {
  const scored = sections
    .map((s) => ({ ...s, expectedMarks: s.marks * (s.papers / 10) }))
    .sort((a, b) => b.expectedMarks - a.expectedMarks);

  const totalMarks = scored.reduce((sum, s) => sum + s.expectedMarks, 0);
  const totalMinutes = scored.reduce((sum, s) => sum + s.minutes, 0);

  let covered = 0;
  const rows: TriageRow[] = scored.map((s) => {
    // Judged by what came before it, so the biggest section is always High.
    const start = totalMarks ? covered / totalMarks : 0;
    covered += s.expectedMarks;
    return {
      ...s,
      share: totalMarks ? s.expectedMarks / totalMarks : 0,
      priority: start < 0.6 ? "high" : start < 0.9 ? "medium" : "low",
    };
  });

  const high = rows.filter((r) => r.priority === "high");
  const verdict = high.length
    ? `${formatDuration(totalMinutes)} of material. ${high.length === 1 ? "One section decides" : `${high.length} sections decide`} your paper.`
    : "No past-paper weight recorded yet.";

  return { rows, totalMinutes, totalMarks, verdict };
}
