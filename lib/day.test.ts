import { describe, expect, it } from "vitest";
import { daysUntil, formatDuration, greeting, streak, studyDay } from "./day";

const TZ = "Asia/Kolkata";

describe("studyDay", () => {
  it("keeps 01:29 on the day before", () => {
    // 2026-11-23T19:59Z is 2026-11-24 01:29 in IST
    expect(studyDay(new Date("2026-11-23T19:59:00Z"), TZ)).toBe("2026-11-23");
  });

  it("rolls over at 01:30 local", () => {
    // 2026-11-23T20:00Z is 2026-11-24 01:30 in IST
    expect(studyDay(new Date("2026-11-23T20:00:00Z"), TZ)).toBe("2026-11-24");
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

describe("greeting", () => {
  it("knows the hour", () => {
    expect(greeting(new Date("2026-11-24T04:00:00Z"))).toBe("Good morning");
    expect(greeting(new Date("2026-11-24T10:00:00Z"))).toBe("Good afternoon");
    expect(greeting(new Date("2026-11-24T15:00:00Z"))).toBe("Good evening");
    expect(greeting(new Date("2026-11-24T20:00:00Z"))).toBe("Still up");
  });
});

describe("streak", () => {
  const days = new Set(["2026-11-24", "2026-11-25", "2026-11-26"]);

  it("counts back from today", () => {
    expect(streak(days, "2026-11-26")).toBe(3);
  });

  it("still counts yesterday when today is untouched", () => {
    expect(streak(days, "2026-11-27")).toBe(3);
  });

  it("breaks on a missed day", () => {
    expect(streak(new Set(["2026-11-22", "2026-11-23"]), "2026-11-26")).toBe(0);
  });

  it("is zero with nothing logged", () => {
    expect(streak(new Set(), "2026-11-26")).toBe(0);
  });
});
