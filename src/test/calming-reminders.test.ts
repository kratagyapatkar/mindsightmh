import { describe, expect, it } from "vitest";
import { completeCalmingReminder, dueCalmingReminders, setCalmingReminder, upsertMood, type MoodEntry } from "@/lib/store";

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
  it("records explicit completion and prevents the reminder appearing again", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    const completed = completeCalmingReminder(scheduled, "2026-10-22", "calming", now + 3600000);
    expect(completed[0]?.guidance?.[0]?.reminderCompletedAt).toBe("2026-10-22T19:22:00.000Z");
    expect(completed[0]?.guidance?.[0]?.text).toBe("Notice the support beneath you.");
    expect(dueCalmingReminders(completed, now + 7200000)).toEqual([]);
  });
  it("dismissal does not count as completion", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    expect(setCalmingReminder(scheduled, "2026-10-22", "calming")[0]?.guidance?.[0]?.reminderCompletedAt).toBeUndefined();
  });
  it("starts a fresh pending reminder when rescheduled after completion", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    const completed = completeCalmingReminder(scheduled, "2026-10-22", "calming", now + 3600000);
    const again = setCalmingReminder(completed, "2026-10-22", "calming", "2026-10-22T20:22:00Z", now + 3600000);
    expect(again[0]?.guidance?.[0]?.reminderCompletedAt).toBeUndefined();
    expect(dueCalmingReminders(again, now + 7200000)).toHaveLength(1);
  });
  it("keeps completion when the check-in mood changes", () => {
    const scheduled = setCalmingReminder(list, "2026-10-22", "calming", "2026-10-22T19:22:00Z", now);
    const completed = completeCalmingReminder(scheduled, "2026-10-22", "calming", now + 3600000);
    expect(upsertMood(completed, { date: "2026-10-22", value: 5 })[0]?.guidance?.[0]?.reminderCompletedAt).toBe("2026-10-22T19:22:00.000Z");
  });
  it("cannot mark an unscheduled step completed", () => {
    expect(completeCalmingReminder(list, "2026-10-22", "calming", now)[0]?.guidance?.[0]?.reminderCompletedAt).toBeUndefined();
  });
});