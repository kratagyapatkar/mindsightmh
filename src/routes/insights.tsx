import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/AppShell";
import { MOODS, useJournal, useMoods, useSessions } from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — MindSight" },
      { name: "description", content: "Your private mood trends and mindful minutes." },
      { property: "og:title", content: "Insights — MindSight" },
      { property: "og:description", content: "Track your mood trends privately." },
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
  const [moods] = useMoods();
  const [journal] = useJournal();
  const [sessions] = useSessions();
  const days = lastDays(7);
  const map = new Map(moods.map((m) => [m.date, m.value]));
  const week = moods.filter((m) => days.includes(m.date));
  const avg = week.length ? week.reduce((s, m) => s + m.value, 0) / week.length : null;
  const minutes = sessions.reduce((s, x) => s + x.minutes, 0);

  let streak = 0;
  for (const d of [...lastDays(365)].reverse()) { if (map.has(d)) streak++; else break; }

  return (
    <AppShell>
      <PageTitle title="Insights" sub="Only you can see this." />
      <div className="px-6">
        <div className="rounded-3xl bg-card p-5">
          <p className="font-semibold text-primary">Last 7 days</p>
          <div className="mt-4 flex h-40 items-end justify-between gap-2">
            {days.map((d) => {
              const v = map.get(d);
              return (
                <div key={d} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-sm">{v !== undefined ? MOODS[v] : ""}</span>
                  <div className="w-full rounded-t-lg bg-accent" style={{ height: v !== undefined ? `${(v + 1) * 18}px` : "4px", opacity: v !== undefined ? 1 : 0.25 }} />
                  <span className="text-xs text-muted-foreground">{new Date(d).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Average mood" value={avg !== null ? (MOODS[Math.round(avg)] ?? "—") : "—"} />
          <Stat label="Check-in streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
          <Stat label="Mindful minutes" value={String(minutes)} />
          <Stat label="Journal entries" value={String(journal.length)} />
        </div>
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
