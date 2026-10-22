// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import { createPhoneBackup } from "@/lib/phone-backup";

async function readArchive(file: File) {
  const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Invalid backup"));
    reader.onerror = () => reject(new Error("Could not read backup"));
    reader.readAsArrayBuffer(file);
  });
  return unzipSync(new Uint8Array(bytes));
}

describe("phone backup", () => {
  beforeEach(() => localStorage.clear());
  it("places the complete data file inside the exact Mindsight folder", async () => {
    const files = await readArchive(createPhoneBackup(new Date("2026-10-22T18:42:00Z")));
    expect(Object.keys(files)).toEqual(["Mindsight/data.json"]);
  });
  it("includes profile, check-ins, notes, saved guidance, reminders, journals, sessions and preferences", async () => {
    const data = {
      name: "Backup tester",
      moods: [{ date: "2026-10-22", value: 4, note: "Feeling steady", energy: 2, tags: ["Calm"], guidance: [{ id: "step", kind: "calming", text: "Rest", mood: 3, savedAt: "2026-10-22T17:00:00Z", reminderAt: "2026-10-22T18:00:00Z", reminderCompletedAt: "2026-10-22T18:30:00Z" }] }],
      journal: [{ id: "journal", text: "Private reflection", prompt: "What do I need?", date: "2026-10-22", mood: 4 }],
      sessions: [{ date: "2026-10-22", kind: "breathe", minutes: 3, completed: true }],
      onboarded: true,
    };
    Object.entries(data).forEach(([key, value]) => localStorage.setItem(`ms_${key}`, JSON.stringify(value)));
    localStorage.setItem("ms_scale_v2", "1");
    const files = await readArchive(createPhoneBackup());
    const file = files["Mindsight/data.json"];
    expect(file).toBeDefined();
    if (!file) throw new Error("Missing backup data");
    expect(JSON.parse(strFromU8(file))).toMatchObject({ ...data, moodScaleVersion: "1", formatVersion: 1 });
  });
  it("never changes stored data or resizes mood values during a backup", async () => {
    const raw = JSON.stringify([{ date: "2026-10-22", value: 4 }]);
    localStorage.setItem("ms_moods", raw);
    const files = await readArchive(createPhoneBackup());
    const file = files["Mindsight/data.json"];
    if (!file) throw new Error("Missing backup data");
    expect(JSON.parse(strFromU8(file)).moods[0].value).toBe(4);
    expect(localStorage.getItem("ms_moods")).toBe(raw);
    expect(localStorage.getItem("ms_scale_v2")).toBeNull();
  });
});