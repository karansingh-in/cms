import { describe, expect, it } from "vitest";
import { coverage, sectionKey } from "./progress";
import type { Subject } from "./content";

const subject: Subject = {
  id: "es201",
  code: "ES201",
  name: "Environmental Studies",
  year: "SY",
  sem: 2,
  credits: 4,
  examDate: "2026-12-05",
  modules: [
    {
      no: 1,
      title: "Foundations",
      sections: [
        { id: "a", title: "Intro", minutes: 10, marks: 4, papers: 8 },
        { id: "b", title: "Deep", minutes: 40, marks: 10, papers: 9 },
      ],
    },
    {
      no: 2,
      title: "Applications",
      sections: [{ id: "c", title: "Case", minutes: 50, marks: 10, papers: 6 }],
    },
  ],
};

describe("coverage", () => {
  it("is zero with nothing marked", () => {
    const c = coverage(subject, new Set());
    expect(c.share).toBe(0);
    expect(c.totalMinutes).toBe(100);
    expect(c.sections).toBe(3);
  });

  it("weights by minutes, not sections", () => {
    const c = coverage(subject, new Set([sectionKey("ES201", "a")]));
    expect(c.doneMinutes).toBe(10);
    expect(c.share).toBeCloseTo(0.1);
  });

  it("counts a full sweep as everything", () => {
    const c = coverage(subject, new Set([sectionKey("ES201", "a"), sectionKey("ES201", "b"), sectionKey("ES201", "c")]));
    expect(c.share).toBe(1);
    expect(c.doneSections).toBe(3);
  });

  it("ignores keys from another subject", () => {
    expect(coverage(subject, new Set([sectionKey("CS161", "a")])).doneMinutes).toBe(0);
  });
});
