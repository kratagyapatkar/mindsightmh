import { MOODS, MOOD_LABELS, upsertMood, useMoods, today } from "@/lib/store";

export function MoodSlider() {
  const [moods, setMoods] = useMoods();
  const current = moods.find((m) => m.date === today())?.value ?? 3;
  return (
    <div className="rounded-3xl bg-card px-6 py-8 text-center">
      <p className="font-semibold text-primary">How are you feeling today?</p>
      <div className="mt-5 flex items-end justify-between" role="radiogroup" aria-label="Mood">
        {MOODS.map((emoji, i) => {
          const selected = i === current;
          return (
            <button
              key={emoji}
              role="radio"
              aria-checked={selected}
              aria-label={MOOD_LABELS[i]}
              onClick={() => setMoods(upsertMood(moods, i))}
              className="flex flex-col items-center outline-none"
            >
              <span
                key={selected ? `sel-${current}` : `idle-${i}`}
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
      <p className="mt-4 text-sm font-semibold text-muted-foreground" aria-live="polite">{MOOD_LABELS[current]}</p>
    </div>
  );
}
