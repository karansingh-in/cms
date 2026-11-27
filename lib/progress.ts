import type { Subject } from "./content";

export type Coverage = {
  totalMinutes: number;
  doneMinutes: number;
  sections: number;
  doneSections: number;
  /** 0–1 of the study minutes marked done. */
  share: number;
};

/** A section's identity across subjects. */
export function sectionKey(code: string, sectionId: string): string {
  return `${code}:${sectionId}`;
}

/**
 * Progress by minutes rather than by section count: a five-minute intro and a
 * forty-minute case study are not equal progress.
 */
export function coverage(subject: Subject, done: Set<string>): Coverage {
  let totalMinutes = 0;
  let doneMinutes = 0;
  let sections = 0;
  let doneSections = 0;

  for (const m of subject.modules) {
    for (const section of m.sections) {
      totalMinutes += section.minutes;
      sections += 1;
      if (done.has(sectionKey(subject.code, section.id))) {
        doneMinutes += section.minutes;
        doneSections += 1;
      }
    }
  }

  return {
    totalMinutes,
    doneMinutes,
    sections,
    doneSections,
    share: totalMinutes > 0 ? doneMinutes / totalMinutes : 0,
  };
}
