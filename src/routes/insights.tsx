import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { ENERGY_LEVELS, MOODS, MOOD_LABELS, upsertMood, useJournal, useMoods, useSessions } from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — MindSight" },
      { name: "description", content: "Your private mood history and mindful minutes." },
      { property: "og:title", content: "Insights — MindSight" },
      { property: "og:description", content: "Review your mood history privately." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Insights,
});

function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function Insights() {
  const [moods, setMoods] = useMoods();
  const [journal] = useJournal();
  const [sessions] = useSessions();
  const [editing, setEditing] = useState<string | null>(null);
  const days = lastDays(7);
  const map = new Map(moods.map((m) => [m.date, m]));
  const week = moods.filter((m) => days.includes(m.date));
  const avg = week.length ? week.reduce((s, m) => s + m.value, 0) / week.length : null;
  const minutes = sessions.reduce((s, x) => s + x.minutes, 0);
  const history = [...moods].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell>
      <PageTitle title="Insights" sub="Only you can see this." />
      <div className="px-6">
        <p className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground" aria-live="polite">
          {week.length
            ? `You recorded your mood on ${week.length} day${week.length === 1 ? "" : "s"} this week.`
            : "No check-ins this week — that's completely fine. The record is here whenever you want it."}
        </p>
        <div className="mt-4 rounded-3xl bg-card p-5">
          <p className="font-semibold text-primary">Last 7 days</p>
          <div className="mt-4 flex h-40 items-end justify-between gap-2">
            {days.map((d) => {
              const v = map.get(d)?.value;
              return (
                <div key={d} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-sm">{v !== undefined ? MOODS[v] : ""}</span>
                  <div className="w-full rounded-t-lg bg-accent" style={{ height: v !== undefined ? `${(v + 1) * 18}px` : "4px", opacity: v !== undefined ? 1 : 0.25 }} />
                  <span className="text-xs text-muted-foreground">{new Date(d).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Faded bars are simply days without a check-in — not missed goals.</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Average mood this week" value={avg !== null ? (MOODS[Math.round(avg)] ?? "—") : "—"} />
          <Stat label="Days checked in" value={`${week.length} / 7`} />
          <Stat label="Mindful minutes" value={String(minutes)} />
          <Stat label="Journal entries" value={String(journal.length)} />
        </div>

        <h2 className="mt-8 mb-3 text-lg font-semibold text-primary">Mood history</h2>
        {history.length === 0 && <p className="text-sm text-muted-foreground">Nothing recorded yet. Your check-ins will appear here.</p>}
        <ul className="space-y-3">
          {history.map((m) => (
            <li key={m.date} className="rounded-2xl border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">
                  {new Date(`${m.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <button onClick={() => setEditing(editing === m.date ? null : m.date)} className="text-accent">Edit</button>
                  <button
                    onClick={() => { if (confirm("Delete this check-in? This can't be undone.")) setMoods(moods.filter((x) => x.date !== m.date)); }}
                    className="text-destructive">
                    Delete
                  </button>
                </span>
              </div>
              {editing === m.date ? (
                <div className="mt-3">
                  <div className="flex justify-between" role="radiogroup" aria-label="Change mood">
                    {MOODS.map((emoji, i) => (
                      <button key={emoji} role="radio" aria-checked={i === m.value} aria-label={MOOD_LABELS[i]}
                        onClick={() => { setMoods(upsertMood(moods, { ...m, value: i })); setEditing(null); }}
                        className={`text-2xl transition ${i === m.value ? "scale-125" : "opacity-50 hover:opacity-100"}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">Tap an emoji to update this day.</p>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl">{MOODS[m.value]}</span>
                  <div className="text-sm">
                    <p className="font-semibold text-primary">{MOOD_LABELS[m.value]}</p>
                    {m.energy !== undefined && <p className="text-muted-foreground">Energy: {ENERGY_LEVELS[m.energy]}</p>}
                  </div>
                </div>
              )}
              {m.tags && m.tags.length > 0 && editing !== m.date && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.tags.map((t) => <span key={t} className="rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-primary">{t}</span>)}
                </div>
              )}
              {m.note && editing !== m.date && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.note}</p>}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          These summaries only describe what you've recorded — they aren't a diagnosis or a measure of how well you're doing.
        </p>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}
