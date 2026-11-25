import { describe, expect, it } from "vitest";
import { buildTriage, type Section } from "./triage";

const s = (id: string, marks: number, papers: number, minutes: number): Section => ({
  id,
  title: id,
  marks,
  papers,
  minutes,
});

describe("buildTriage", () => {
  it("weights marks by how often the paper asks", () => {
    const t = buildTriage([s("often", 10, 9, 40), s("rare", 10, 2, 40)]);
    expect(t.rows[0].id).toBe("often");
    expect(t.rows[0].expectedMarks).toBeCloseTo(9);
    expect(t.rows[1].expectedMarks).toBeCloseTo(2);
  });

  it("makes the sections covering the top 60% of marks high priority", () => {
    const t = buildTriage([s("a", 10, 8, 40), s("b", 10, 6, 30), s("c", 5, 3, 15)]);
    expect(t.rows.map((r) => r.priority)).toEqual(["high", "high", "low"]);
  });

  it("never buries a section that is most of the paper", () => {
    const t = buildTriage([s("big", 20, 10, 60), s("small", 2, 2, 10)]);
    expect(t.rows[0].priority).toBe("high");
  });

  it("sums time and reports it in the verdict", () => {
    const t = buildTriage([s("a", 10, 8, 45), s("b", 5, 3, 15)]);
    expect(t.totalMinutes).toBe(60);
    expect(t.verdict).toContain("1h 0m");
  });

  it("survives an empty module", () => {
    const t = buildTriage([]);
    expect(t.rows).toEqual([]);
    expect(t.verdict).not.toContain("NaN");
  });

  it("shares sum to 1", () => {
    const t = buildTriage([s("a", 10, 8, 45), s("b", 10, 6, 35), s("c", 5, 3, 15)]);
    expect(t.rows.reduce((n, r) => n + r.share, 0)).toBeCloseTo(1);
  });
});
