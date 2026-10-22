// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { clearAll, saveMoodGuidance, upsertMood, type MoodEntry, type SavedGuidance } from "@/lib/store";

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

describe("saved AI guidance", () => {
  const reflection: SavedGuidance = { id: "reflection-1", kind: "reflection", text: "What do you need today?", savedAt: "2026-10-22T18:20:00Z", mood: 2 };
  const entry: MoodEntry = { date: "2026-10-22", value: 2, note: "Long day" };
  it("saves a reflection with its check-in without changing other days", () => {
    const next = saveMoodGuidance([{ date: "2026-10-21", value: 4 }], entry, reflection);
    expect(next.find((m) => m.date === entry.date)?.guidance).toEqual([reflection]);
    expect(next.find((m) => m.date === "2026-10-21")?.value).toBe(4);
  });
  it("keeps both reflection and calming suggestions and does not duplicate a saved result", () => {
    const first = saveMoodGuidance([], entry, reflection);
    const calming: SavedGuidance = { ...reflection, id: "calming-1", kind: "calming", text: "Notice the support beneath your feet." };
    const next = saveMoodGuidance(first, entry, calming);
    expect(saveMoodGuidance(next, entry, calming)[0]?.guidance).toEqual([reflection, calming]);
  });
  it("preserves saved suggestions and their original mood when a check-in is updated", () => {
    const first = saveMoodGuidance([], entry, reflection);
    const next = upsertMood(first, { ...entry, value: 5, note: "Better now" });
    expect(next[0]?.guidance?.[0]?.mood).toBe(2);
    expect(next[0]?.guidance?.[0]?.text).toBe(reflection.text);
    expect(next[0]?.value).toBe(5);
  });
  it("can remove guidance without removing its check-in", () => {
    const first = saveMoodGuidance([], entry, reflection);
    expect(upsertMood(first, { ...entry, guidance: [] })[0]).toMatchObject({ value: 2, guidance: [] });
  });
  it("erases saved suggestions with all local records", () => {
    localStorage.setItem("ms_moods", JSON.stringify(saveMoodGuidance([], entry, reflection)));
    clearAll();
    expect(localStorage.getItem("ms_moods")).toBeNull();
  });
});
