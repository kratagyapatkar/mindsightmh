import { createFileRoute, Link } from "@tanstack/react-router";
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
type Phase = "idle" | "running" | "paused" | "done";

function Breathe() {
  const [minutes, setMinutes] = useState(3);
  const [left, setLeft] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessions, setSessions] = useSessions();

  useEffect(() => {
    if (phase !== "running") return;
    if (left <= 0) {
      setSessions([...sessions, { date: today(), kind: "breathe", minutes, practice: "Breathing", completed: true }]);
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left]);

  const elapsed = minutes * 60 - left;
  const running = phase === "running" || phase === "paused";
  const breath = phase === "running" ? (elapsed % 8 < 4 ? "Breathe in" : "Breathe out") : null;

  const recordPartial = () => {
    if (elapsed >= 30) setSessions([...sessions, { date: today(), kind: "breathe", minutes: Math.max(1, Math.round(elapsed / 60)), practice: "Breathing", completed: false }]);
  };

  const stop = () => {
    recordPartial();
    setPhase("idle");
    setLeft(0);
  };

  return (
    <AppShell>
      <PageTitle title="Breathe" sub="Inhale for 4, exhale for 4. Follow the circle. No breath holds needed." />
      <div className="flex h-72 items-center justify-center">
        {phase === "done" ? (
          <div className="mx-6 rounded-3xl bg-card p-8 text-center">
            <p className="text-4xl">🌿</p>
            <p className="mt-3 font-display text-xl font-semibold text-primary">Session complete</p>
            <p className="mt-2 text-sm text-muted-foreground">You spent {minutes} minute{minutes === 1 ? "" : "s"} breathing. Notice how you feel — there's no right way to feel.</p>
          </div>
        ) : (
          <div className="relative flex h-64 w-64 items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-card ${phase === "running" ? "animate-breathe" : "scale-75"}`} />
            <div className="relative text-center">
              <p className="font-display text-2xl font-semibold text-primary">
                {phase === "paused" ? "Paused" : (breath ?? "Ready")}
              </p>
              {running && <p className="mt-1 text-muted-foreground">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="px-6">
        {phase === "idle" && (
          <div className="mb-4 flex justify-center gap-2">
            {DURATIONS.map((d) => (
              <button key={d} onClick={() => setMinutes(d)}
                className={`rounded-full px-5 py-2 text-sm font-semibold ${d === minutes ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}>
                {d} min
              </button>
            ))}
          </div>
        )}
        {phase === "done" ? (
          <button onClick={() => { setPhase("idle"); setLeft(0); }}
            className="w-full rounded-2xl bg-card py-4 font-display text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
            Done
          </button>
        ) : (
          <div className="space-y-2">
            {running && (
              <button onClick={() => setPhase(phase === "running" ? "paused" : "running")}
                className="w-full rounded-2xl bg-card py-4 font-display text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                {phase === "running" ? "Pause" : "Resume"}
              </button>
            )}
            <button
              onClick={() => { if (running) { stop(); } else { setLeft(minutes * 60); setPhase("running"); } }}
              className={`w-full rounded-2xl py-4 font-display text-lg font-semibold ${running ? "bg-surface text-destructive" : "bg-card text-primary hover:bg-primary hover:text-primary-foreground"}`}>
              {running ? "Stop" : "Start"}
            </button>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          If you feel dizzy or uncomfortable, stop and return to normal breathing. You can leave anytime.
        </p>
        <Link to="/" className="mt-2 block text-center text-sm font-semibold text-accent">← Exit to home</Link>
      </div>
    </AppShell>
  );
}
