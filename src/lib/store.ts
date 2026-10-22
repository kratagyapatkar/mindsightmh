import { useEffect, useState, useCallback } from "react";

// All data lives in this browser only (privacy-first, offline).
export type MoodEntry = { date: string; value: number; energy?: number | undefined; tags?: string[] | undefined; note?: string | undefined };
export type JournalEntry = { id: string; date: string; prompt: string; text: string; mood?: number | undefined };
export type SessionEntry = { date: string; kind: "breathe" | "relax"; minutes: number; practice?: string | undefined; completed?: boolean | undefined };

const KEYS = { name: "ms_name", moods: "ms_moods", journal: "ms_journal", sessions: "ms_sessions", onboarded: "ms_onboarded" };

export const MOODS = ["😭", "😢", "😟", "😕", "🙂", "😄", "🤩"];
export const MOOD_LABELS = ["Terrible", "Very low", "Low", "Okay", "Good", "Great", "Amazing"];
export const EMOTION_TAGS = ["Calm", "Anxious", "Tired", "Hopeful", "Frustrated", "Excited"];
export const ENERGY_LEVELS = ["Drained", "Low", "Steady", "Energized", "Buzzing"];

const SCALE_V2 = "ms_scale_v2";
// One-time rescale of legacy 0-4 mood values to the 0-6 scale.
function migrateScale() {
  try {
    if (localStorage.getItem(SCALE_V2)) return;
    const moods = read<MoodEntry[]>(KEYS.moods, []);
    if (moods.length) localStorage.setItem(KEYS.moods, JSON.stringify(moods.map((m) => ({ ...m, value: Math.round(m.value * 1.5) }))));
    const journal = read<JournalEntry[]>(KEYS.journal, []);
    if (journal.some((j) => j.mood !== undefined))
      localStorage.setItem(KEYS.journal, JSON.stringify(journal.map((j) => (j.mood === undefined ? j : { ...j, mood: Math.round(j.mood * 1.5) }))));
    localStorage.setItem(SCALE_V2, "1");
  } catch {
    // ignore
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    migrateScale();
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const onChange = () => setValue(read(key, fallback));
    window.addEventListener("ms-store", onChange);
    return () => window.removeEventListener("ms-store", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const save = useCallback(
    (next: T) => {
      localStorage.setItem(key, JSON.stringify(next));
      setValue(next);
      window.dispatchEvent(new Event("ms-store"));
    },
    [key],
  );
  return [value, save] as const;
}

export const useName = () => useLocal<string>(KEYS.name, "Aarav");
export const useMoods = () => useLocal<MoodEntry[]>(KEYS.moods, []);
export const useJournal = () => useLocal<JournalEntry[]>(KEYS.journal, []);
export const useSessions = () => useLocal<SessionEntry[]>(KEYS.sessions, []);
export const useOnboarded = () => useLocal<boolean>(KEYS.onboarded, false);

export const today = () => new Date().toISOString().slice(0, 10);

export function upsertMood(list: MoodEntry[], entry: MoodEntry): MoodEntry[] {
  return [...list.filter((m) => m.date !== entry.date), entry];
}

export function greeting(h = new Date().getHours()) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event("ms-store"));
}

export function exportAll() {
  const data = Object.fromEntries(Object.entries(KEYS).map(([n, k]) => [n, read(k, null)]));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mindsight-${today()}.json`;
  a.click();
}
