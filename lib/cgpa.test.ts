import { describe, expect, it } from "vitest";
import { ceiling, formatGpa, standing, type Semester } from "./cgpa";

const s = (number: number, credits: number, sgpa: number | null): Semester => ({
  id: `s${number}`,
  number,
  credits,
  sgpa,
});

describe("standing", () => {
  it("has nothing to say with no semesters", () => {
    expect(standing([], 8.5).status).toBe("none");
  });

  it("weights semesters by credits", () => {
    const st = standing([s(1, 20, 8), s(2, 24, 9)], null);
    expect(st.cgpa).toBeCloseTo((160 + 216) / 44);
    expect(st.completedCredits).toBe(44);
  });

  it("asks for the target itself before any semester is marked", () => {
    const st = standing([s(1, 20, null), s(2, 20, null)], 9);
    expect(st.status).toBe("reachable");
    expect(st.requiredSgpa).toBeCloseTo(9);
  });

  it("lowers the ask when the semesters so far are strong", () => {
    const st = standing([s(1, 20, 9.5), s(2, 20, null)], 9);
    expect(st.requiredSgpa).toBeCloseTo(8.5);
  });

  it("calls a target out of reach above a 10", () => {
    const st = standing([s(1, 20, 6), s(2, 20, null)], 9.5);
    expect(st.status).toBe("unreachable");
    expect(st.requiredSgpa!).toBeGreaterThan(10);
  });

  it("says the target is already secured", () => {
    // 196 points banked, one credit left, target 8 needs 168 in total.
    const st = standing([s(1, 20, 9.8), s(2, 1, null)], 8);
    expect(st.status).toBe("secured");
  });

  it("reports a finished degree", () => {
    const st = standing([s(1, 20, 8), s(2, 20, 9)], 8.5);
    expect(st.status).toBe("complete");
    expect(st.requiredSgpa).toBeNull();
  });

  it("survives a semester with no credits", () => {
    const st = standing([s(1, 0, 9), s(2, 20, null)], 9);
    expect(st.cgpa).toBeNull();
    expect(st.requiredSgpa).toBeCloseTo(9);
  });
});

describe("ceiling", () => {
  it("is 10 when nothing is marked", () => {
    expect(ceiling(standing([s(1, 20, null)], 9))).toBeCloseTo(10);
  });

  it("drops with a weak semester", () => {
    expect(ceiling(standing([s(1, 20, 5), s(2, 20, null)], 9))).toBeCloseTo(7.5);
  });
});

it("formats to two decimals", () => {
  expect(formatGpa(8.666)).toBe("8.67");
  expect(formatGpa(10)).toBe("10.00");
});
