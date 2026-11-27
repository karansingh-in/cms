export type Weighted = {
  /** Percent of the final grade. */
  weight: number;
  /** null until the score is known. */
  score: number | null;
  max: number;
};

export type TargetStatus = "none" | "no-remaining" | "secured" | "unreachable" | "reachable";

export type Target = {
  /** Percent needed across everything still unscored. null when undefined. */
  need: number | null;
  status: TargetStatus;
  /** Sum of every weight, so the UI can warn when it is not 100. */
  weightTotal: number;
  remainingWeight: number;
  earned: number;
};

/**
 * The score needed on the outstanding assessments to finish on `target`.
 * Weights are percentages; `earned` is the weighted contribution so far.
 */
export function targetScore(items: Weighted[], target: number): Target {
  const weightTotal = items.reduce((n, i) => n + i.weight, 0);

  let scoredWeight = 0;
  let earned = 0;
  for (const item of items) {
    if (item.score === null || item.max <= 0) continue;
    scoredWeight += item.weight;
    earned += item.weight * (item.score / item.max);
  }

  const remainingWeight = weightTotal - scoredWeight;
  const base = { weightTotal, remainingWeight, earned };

  if (items.length === 0) return { ...base, need: null, status: "none" };
  if (remainingWeight <= 0) return { ...base, need: null, status: "no-remaining" };

  const need = ((target - earned) / remainingWeight) * 100;
  const status: TargetStatus = need <= 0 ? "secured" : need > 100 ? "unreachable" : "reachable";
  return { ...base, need, status };
}

/** Current standing, counting only what has been marked. */
export function weightedAverage(items: Weighted[]): number | null {
  let weight = 0;
  let earned = 0;
  for (const item of items) {
    if (item.score === null || item.max <= 0) continue;
    weight += item.weight;
    earned += item.weight * (item.score / item.max);
  }
  return weight > 0 ? (earned / weight) * 100 : null;
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 10) / 10}%`;
}
