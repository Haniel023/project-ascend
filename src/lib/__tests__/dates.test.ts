import { describe, expect, it } from "vitest";
import { getWeekStartDate, getWeekStartDateFromDateString } from "../dates";

describe("getWeekStartDate", () => {
  it("returns the same Monday for every day within that week", () => {
    // 2026-01-05 is a Monday; 2026-01-11 is the following Sunday.
    const days = ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11"];
    for (const day of days) {
      expect(getWeekStartDate("UTC", new Date(`${day}T12:00:00Z`))).toBe("2026-01-05");
    }
  });

  it("rolls over to the next Monday once the week ends", () => {
    expect(getWeekStartDate("UTC", new Date("2026-01-12T12:00:00Z"))).toBe("2026-01-12");
  });
});

describe("getWeekStartDateFromDateString", () => {
  it("is a pure calendar computation with no timezone dependency", () => {
    const days = ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11"];
    for (const day of days) {
      expect(getWeekStartDateFromDateString(day)).toBe("2026-01-05");
    }
  });

  it("agrees with getWeekStartDate for the same calendar day", () => {
    const dateString = "2026-03-17";
    expect(getWeekStartDateFromDateString(dateString)).toBe(
      getWeekStartDate("UTC", new Date(`${dateString}T12:00:00Z`))
    );
  });
});
