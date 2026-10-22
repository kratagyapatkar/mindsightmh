// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { upsertMood, type MoodEntry } from "@/lib/store";

describe("upsertMood", () => {
  it("keeps one entry per day and replaces the same day's check-in", () => {
    const list: MoodEntry[] = [
      { date: "2026-10-21", value: 4 },
      { date: "2026-10-22", value: 2 },
    ];
    const next = upsertMood(list, { date: "2026-10-22", value: 5, tags: ["Calm"], note: "Better now" });

    expect(next.filter((m) => m.date === "2026-10-22")).toHaveLength(1);
    expect(next.find((m) => m.date === "2026-10-22")).toMatchObject({ value: 5, tags: ["Calm"], note: "Better now" });
    expect(next.find((m) => m.date === "2026-10-21")?.value).toBe(4);
  });

  it("stores optional energy, tags and note on a new check-in", () => {
    const next = upsertMood([], { date: "2026-10-22", value: 3, energy: 1, tags: ["Tired", "Hopeful"], note: "Long day" });

    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ energy: 1, tags: ["Tired", "Hopeful"], note: "Long day" });
  });
});
