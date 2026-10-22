import { useEffect, useState } from "react";
import { EMOTION_TAGS, ENERGY_LEVELS, MOODS, MOOD_LABELS, today, upsertMood, useMoods } from "@/lib/store";

export function MoodSlider() {
  const [moods, setMoods] = useMoods();
  const saved = moods.find((m) => m.date === today());
  const [value, setValue] = useState(saved?.value ?? 3);
  const [energy, setEnergy] = useState<number | undefined>(saved?.energy);
  const [tags, setTags] = useState<string[]>(saved?.tags ?? []);
  const [note, setNote] = useState(saved?.note ?? "");
  const [justSaved, setJustSaved] = useState(false);

  // Sync the draft once today's saved entry loads (or changes elsewhere).
  const savedKey = JSON.stringify(saved ?? null);
  useEffect(() => {
    setValue(saved?.value ?? 3);
    setEnergy(saved?.energy);
    setTags(saved?.tags ?? []);
    setNote(saved?.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedKey]);

  const toggleTag = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const save = () => {
    setMoods(
      upsertMood(moods, {
        date: today(),
        value,
        energy,
        tags: tags.length ? tags : undefined,
        note: note.trim() ? note.trim() : undefined,
      }),
    );
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="rounded-3xl bg-card px-6 py-8">
      <p className="text-center font-semibold text-primary">How are you feeling right now?</p>
      <div className="mt-5 flex items-end justify-between" role="radiogroup" aria-label="Mood">
        {MOODS.map((emoji, i) => {
          const selected = i === value;
          return (
            <button
              key={emoji}
              role="radio"
              aria-checked={selected}
              aria-label={MOOD_LABELS[i]}
              onClick={() => setValue(i)}
              className="flex flex-col items-center outline-none"
            >
              <span
                key={selected ? `sel-${value}` : `idle-${i}`}
                className={`text-3xl transition ${selected ? "animate-emoji-pop" : "animate-emoji-bob opacity-70 hover:opacity-100"}`}
                style={selected ? undefined : { animationDelay: `${i * 0.18}s` }}
              >
                {emoji}
              </span>
              <span className={`mt-2 h-1.5 w-1.5 rounded-full transition ${selected ? "bg-accent" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{MOOD_LABELS[0]}</span>
        <span>{MOOD_LABELS[MOOD_LABELS.length - 1]}</span>
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-muted-foreground" aria-live="polite">
        {MOODS[value]} {MOOD_LABELS[value]}
      </p>

      <p className="mt-6 text-sm font-semibold text-primary">Anything else in the mix? <span className="font-normal text-muted-foreground">(optional)</span></p>
      <div className="mt-2 flex flex-wrap gap-2">
        {EMOTION_TAGS.map((t) => {
          const on = tags.includes(t);
          return (
            <button
              key={t}
              aria-pressed={on}
              onClick={() => toggleTag(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-surface text-primary hover:bg-background"}`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm font-semibold text-primary">Energy level <span className="font-normal text-muted-foreground">(optional — energy and mood aren't the same)</span></p>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Energy level">
        {ENERGY_LEVELS.map((label, i) => {
          const on = energy === i;
          return (
            <button
              key={label}
              role="radio"
              aria-checked={on}
              onClick={() => setEnergy(on ? undefined : i)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-surface text-primary hover:bg-background"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <label className="mt-6 block text-sm font-semibold text-primary" htmlFor="mood-note">
        A note to yourself <span className="font-normal text-muted-foreground">(optional, stays on this device)</span>
      </label>
      <textarea
        id="mood-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="A few words about today…"
        className="mt-2 w-full resize-none rounded-2xl bg-surface p-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />

      <button
        onClick={save}
        className="mt-4 w-full rounded-2xl bg-primary py-3.5 font-display text-lg font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {justSaved ? "Saved ✓" : saved ? "Update check-in" : "Save check-in"}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        This is self-reflection, not a diagnosis — one emoji can't capture everything you feel.
      </p>
    </div>
  );
}
