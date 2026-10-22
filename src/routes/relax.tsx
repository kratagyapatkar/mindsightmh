import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { today, useSessions } from "@/lib/store";

export const Route = createFileRoute("/relax")({
  head: () => ({
    meta: [
      { title: "Relax — MindSight" },
      { name: "description", content: "Guided grounding, body scan, muscle relaxation and a calming pause — all offline." },
      { property: "og:title", content: "Relax — MindSight" },
      { property: "og:description", content: "Unwind with short guided practices that run entirely on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Relax,
});

type Practice = { id: string; name: string; desc: string; stepSeconds: number; steps: string[]; note?: string };

const PRACTICES: Practice[] = [
  {
    id: "grounding",
    name: "Grounding",
    desc: "A sensory-awareness exercise that anchors you in the present, one step at a time.",
    stepSeconds: 20,
    steps: [
      "Look around and name 5 things you can see.",
      "Notice 4 things you can touch right now.",
      "Listen for 3 things you can hear.",
      "Notice 2 things you can smell.",
      "Notice 1 thing you can taste.",
      "Take one slow breath. You're here, and that's enough.",
    ],
  },
  {
    id: "body-scan",
    name: "Body scan",
    desc: "A short guided attention exercise, moving gently through the body at a comfortable pace.",
    stepSeconds: 25,
    steps: [
      "Settle in. Let your shoulders drop.",
      "Notice your feet. Let them feel heavy.",
      "Soften your legs and hips.",
      "Relax your belly. Let your breath slow.",
      "Release your hands, arms and shoulders.",
      "Unclench your jaw. Soften your forehead.",
      "Rest here. You're doing great.",
    ],
    note: "Stop anytime — there's no finishing line.",
  },
  {
    id: "muscle",
    name: "Muscle relaxation",
    desc: "Gently tense and release each muscle group. Skip any movement that doesn't feel right for you.",
    stepSeconds: 20,
    steps: [
      "Gently tense your feet… and release.",
      "Tense your legs… and let them go loose.",
      "Lift your shoulders slightly… and drop them.",
      "Softly clench your fists… and open your hands.",
      "Let your whole body feel heavy and comfortable.",
    ],
    note: "Prefer stillness? Simply breathe along instead of tensing.",
  },
  {
    id: "calming-pause",
    name: "Calming pause",
    desc: "A quiet visual pause with optional soft sound. No timer pressure — stay as long as you like.",
    stepSeconds: 25,
    steps: [
      "Let your eyes rest on something soft or still.",
      "There's nothing you need to do right now.",
      "Breathe at your own pace.",
      "Stay here as long as it feels good.",
    ],
  },
];

const minutesOf = (p: Practice) => Math.max(1, Math.round((p.steps.length * p.stepSeconds) / 60));

// Soft brown noise generated in the browser — no downloads, works offline.
function useNoise() {
  const ctx = useRef<AudioContext | null>(null);
  const start = () => {
    const ac = new AudioContext();
    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3;
    }
    const src = ac.createBufferSource();
    src.buffer = buf; src.loop = true;
    const gain = ac.createGain(); gain.gain.value = 0.25;
    src.connect(gain).connect(ac.destination); src.start();
    ctx.current = ac;
  };
  const stop = () => { ctx.current?.close(); ctx.current = null; };
  return { start, stop };
}

function Relax() {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState(true);
  const [sessions, setSessions] = useSessions();
  const noise = useNoise();

  useEffect(() => {
    if (!practice || done) return;
    if (step >= practice.steps.length) {
      noise.stop();
      setSessions([...sessions, { date: today(), kind: "relax", minutes: minutesOf(practice), practice: practice.name, completed: true }]);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setStep(step + 1), practice.stepSeconds * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, step, done]);

  useEffect(() => () => noise.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = (p: Practice) => {
    setPractice(p);
    setStep(0);
    setDone(false);
    if (sound) noise.start();
  };

  const exit = () => {
    if (practice && !done && step > 0)
      setSessions([...sessions, { date: today(), kind: "relax", minutes: Math.max(1, Math.round((step * practice.stepSeconds) / 60)), practice: practice.name, completed: false }]);
    noise.stop();
    setPractice(null);
    setDone(false);
  };

  if (!practice) {
    return (
      <AppShell>
        <PageTitle title="Relax" sub="Short guided practices to unwind. Every one can be paused or left at any time." />
        <div className="space-y-4 px-6">
          <label className="flex items-center justify-between rounded-2xl border bg-surface px-4 py-3">
            <span className="font-semibold text-primary">Soft background sound</span>
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="h-5 w-5 accent-[var(--calm)]" />
          </label>
          {PRACTICES.map((p) => (
            <button key={p.id} onClick={() => begin(p)} className="w-full rounded-3xl bg-card p-5 text-left transition hover:bg-surface">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-primary">{p.name}</p>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">~{minutesOf(p)} min</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </button>
          ))}
          <p className="text-center text-xs text-muted-foreground">These practices support relaxation; they don't treat medical conditions.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageTitle title={practice.name} sub="One step at a time. Skip anything that doesn't feel right." />
      <div className="px-6">
        <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl bg-card p-8 text-center">
          {done ? (
            <>
              <p className="text-4xl">🌿</p>
              <p className="mt-3 font-display text-xl font-semibold text-primary">Practice complete</p>
              <p className="mt-2 text-sm text-muted-foreground">Take a moment before you go. However you feel now is okay.</p>
            </>
          ) : (
            <>
              <p className="font-display text-xl font-semibold text-primary">{practice.steps[Math.min(step, practice.steps.length - 1)]}</p>
              <div className="mt-6 flex gap-1.5">
                {practice.steps.map((_, i) => <span key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-primary" : "bg-surface"}`} />)}
              </div>
            </>
          )}
        </div>
        {practice.note && !done && <p className="mt-3 text-center text-xs text-muted-foreground">{practice.note}</p>}
        <div className="mt-5 space-y-2">
          {!done && step < practice.steps.length - 1 && (
            <button onClick={() => setStep(step + 1)} className="w-full rounded-2xl bg-card py-4 font-display text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
              Skip to next step
            </button>
          )}
          <button onClick={exit} className={`w-full rounded-2xl py-4 font-display text-lg font-semibold ${done ? "bg-card text-primary hover:bg-primary hover:text-primary-foreground" : "bg-surface text-destructive"}`}>
            {done ? "Back to practices" : "End practice"}
          </button>
        </div>
        <Link to="/" onClick={() => noise.stop()} className="mt-2 block text-center text-sm font-semibold text-accent">← Exit to home</Link>
      </div>
    </AppShell>
  );
}
