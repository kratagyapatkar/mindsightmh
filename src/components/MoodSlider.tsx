import { MOODS, MOOD_LABELS, upsertMood, useMoods, today } from "@/lib/store";

export function MoodSlider() {
  const [moods, setMoods] = useMoods();
  const current = moods.find((m) => m.date === today())?.value ?? 2;
  return (
    <div className="rounded-3xl bg-card px-8 py-8 text-center">
      <p className="font-semibold text-primary">How are you feeling today?</p>
      <div className="my-3 text-5xl" aria-live="polite">{MOODS[current]}</div>
      <input type="range" min={0} max={4} step={1} value={current} aria-label="Mood"
        onChange={(e) => setMoods(upsertMood(moods, Number(e.target.value)))}
        className="mood w-full" />
      <p className="mt-3 text-sm text-muted-foreground">{MOOD_LABELS[current]}</p>
    </div>
  );
}
