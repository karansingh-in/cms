import { describe, expect, it } from "vitest";
import { addDays } from "./day";
import { schedule, FIRST_EASE } from "./srs";

const fresh = { interval: 0, ease: FIRST_EASE };

describe("schedule", () => {
  it("brings a lapsed card back the same day", () => {
    expect(schedule({ interval: 12, ease: 2.5 }, "again").interval).toBe(0);
  });

  it("gives a new card one day on good", () => {
    expect(schedule(fresh, "good")).toEqual({ interval: 1, ease: 2.5 });
  });

  it("gives a new card three days on easy", () => {
    expect(schedule(fresh, "easy")).toEqual({ interval: 3, ease: 2.65 });
  });

  it("multiplies by ease on later reviews", () => {
    expect(schedule({ interval: 10, ease: 2.5 }, "good").interval).toBe(25);
  });

  it("never drops ease below 1.3", () => {
    let s = { interval: 5, ease: 1.4 };
    for (let i = 0; i < 10; i++) s = schedule(s, "again");
    expect(s.ease).toBe(1.3);
  });
});

describe("addDays", () => {
  it("crosses a month boundary", () => {
    expect(addDays("2026-11-28", 5)).toBe("2026-12-03");
  });

  it("crosses a year boundary", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
