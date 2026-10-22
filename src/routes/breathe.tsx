import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { today, useSessions } from "@/lib/store";

export const Route = createFileRoute("/breathe")({
  head: () => ({
    meta: [
      { title: "Breathe — MindSight" },
      { name: "description", content: "A guided breathing exercise to calm down in minutes." },
      { property: "og:title", content: "Breathe — MindSight" },
      { property: "og:description", content: "Calm down quickly with guided breathing." },
    ],
  }),
  component: Breathe,
});

const DURATIONS = [1, 3, 5];

function Breathe() {
  const [minutes, setMinutes] = useState(3);
  const [left, setLeft] = useState<number | null>(null);
  const [sessions, setSessions] = useSessions();

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      setSessions([...sessions, { date: today(), kind: "breathe", minutes }]);
      setLeft(null);
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const running = left !== null;
  const phase = running ? ((minutes * 60 - left!) % 8 < 4 ? "Breathe in" : "Breathe out") : "Ready";

  return (
    <AppShell>
      <PageTitle title="Breathe" sub="Inhale for 4, exhale for 4. Follow the circle." />
      <div className="flex h-72 items-center justify-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-card ${running ? "animate-breathe" : "scale-75"}`} />
          <div className="relative text-center">
            <p className="font-display text-2xl font-semibold text-primary">{phase}</p>
            {running && <p className="mt-1 text-muted-foreground">{Math.floor(left! / 60)}:{String(left! % 60).padStart(2, "0")}</p>}
          </div>
        </div>
      </div>
      <div className="px-6">
        {!running && (
          <div className="mb-4 flex justify-center gap-2">
            {DURATIONS.map((d) => (
              <button key={d} onClick={() => setMinutes(d)}
                className={`rounded-full px-5 py-2 text-sm font-semibold ${d === minutes ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}>
                {d} min
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setLeft(running ? null : minutes * 60)}
          className="w-full rounded-2xl bg-card py-4 font-display text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
          {running ? "Stop" : "Start"}
        </button>
      </div>
    </AppShell>
  );
}
