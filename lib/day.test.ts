import { describe, expect, it } from "vitest";
import { daysUntil, formatDuration, studyDay } from "./day";

const TZ = "Asia/Kolkata";

describe("studyDay", () => {
  it("counts 01:30 as the previous day", () => {
    // 2026-11-23T20:00Z is 2026-11-24 01:30 in IST
    expect(studyDay(new Date("2026-11-23T20:00:00Z"), TZ)).toBe("2026-11-23");
  });

  it("rolls over at 03:00 local", () => {
    // 2026-11-23T22:30Z is 2026-11-24 04:00 in IST
    expect(studyDay(new Date("2026-11-23T22:30:00Z"), TZ)).toBe("2026-11-24");
  });

  it("treats the rest of the day normally", () => {
    expect(studyDay(new Date("2026-11-24T12:00:00Z"), TZ)).toBe("2026-11-24");
  });
});

describe("daysUntil", () => {
  it("counts calendar days to the exam", () => {
    expect(daysUntil("2026-12-05", new Date("2026-11-24T10:00:00Z"))).toBe(11);
  });

  it("goes negative once the exam has passed", () => {
    expect(daysUntil("2026-11-20", new Date("2026-11-24T10:00:00Z"))).toBe(-4);
  });
});

describe("formatDuration", () => {
  it("drops the hour part under an hour", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(160)).toBe("2h 40m");
  });
});
