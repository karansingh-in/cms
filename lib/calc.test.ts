import { describe, expect, it } from "vitest";
import { targetScore, weightedAverage, type Weighted } from "./calc";

const w = (weight: number, score: number | null = null, max = 100): Weighted => ({ weight, score, max });

describe("targetScore", () => {
  it("asks for the target itself when nothing is marked", () => {
    const t = targetScore([w(40), w(60)], 75);
    expect(t.need).toBeCloseTo(75);
    expect(t.status).toBe("reachable");
  });

  it("accounts for marks already banked", () => {
    // 30/50 on a 40% assessment = 24 points banked, 60% of the course left
    const t = targetScore([w(40, 30, 50), w(60)], 80);
    expect(t.earned).toBeCloseTo(24);
    expect(t.remainingWeight).toBe(60);
    expect(t.need).toBeCloseTo(93.33, 1);
  });

  it("calls out an unreachable target", () => {
    const t = targetScore([w(80, 40, 100), w(20)], 95);
    expect(t.need).toBeGreaterThan(100);
    expect(t.status).toBe("unreachable");
  });

  it("says when the target is already secured", () => {
    const t = targetScore([w(90, 90, 100), w(10)], 80);
    expect(t.need).toBeLessThan(0);
    expect(t.status).toBe("secured");
  });

  it("reports no remaining weight when everything is marked", () => {
    const t = targetScore([w(50, 40, 50), w(50, 30, 50)], 70);
    expect(t.status).toBe("no-remaining");
    expect(t.need).toBeNull();
  });

  it("exposes a weight total that does not add to 100", () => {
    const t = targetScore([w(30), w(25)], 70);
    expect(t.weightTotal).toBe(55);
  });

  it("handles an empty course", () => {
    expect(targetScore([], 70).status).toBe("none");
  });
});

describe("weightedAverage", () => {
  it("ignores unmarked assessments", () => {
    expect(weightedAverage([w(40, 30, 50), w(60)])).toBeCloseTo(60);
  });

  it("is null with nothing marked", () => {
    expect(weightedAverage([w(40)])).toBeNull();
  });
});
