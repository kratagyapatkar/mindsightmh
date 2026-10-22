import { describe, expect, it } from "vitest";
import { dueCalmingReminders, setCalmingReminder, type MoodEntry } from "@/lib/store";

const now = Date.parse("2026-10-22T18:22:00Z");
const list: MoodEntry[] = [{ date: "2026-10-22", value: 2, guidance: [
  { id: "calming", kind: "calming", text: "Notice the support beneath you.", mood: 2, savedAt: "2026-10-22T18:20:00Z" },
  { id: "reflection", kind: "reflection", text: "What do you need?", mood: 2, savedAt: "2026-10-22T18:20:00Z" },
] }];
describe("private calming reminders", () => {
  it("is off unless explicitly scheduled", () => { expect(dueCalmingReminders(list, now)).toEqual([]); });
  it("appears only when its scheduled time arrives", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    expect(dueCalmingReminders(scheduled, now)).toEqual([]);
    expect(dueCalmingReminders(scheduled, now + 3600000)[0]?.guidance.id).toBe("calming");
  });
  it("rejects past times", () => { expect(() => setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T18:21:00Z", now)).toThrow(); });
  it("does not schedule reflection prompts", () => {
    expect(setCalmingReminder(list, "2026-10-22", "reflection", "2026-10-22T19:22:00Z", now)[0]?.guidance?.[1]?.reminderAt).toBeUndefined();
  });
  it("cancels without deleting the saved calming step", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    const cancelled = setCalmingReminder(scheduled, "2026-10-22", "calming");
    expect(dueCalmingReminders(cancelled, now + 7200000)).toEqual([]);
    expect(cancelled[0]?.guidance?.[0]?.text).toBe("Notice the support beneath you.");
  });
  it("does not leave a reminder when its saved step is deleted", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    expect(dueCalmingReminders(scheduled.map((m) => ({ ...m, guidance: m.guidance?.filter((g) => g.id !== "calming") })), now + 7200000)).toEqual([]);
  });
});