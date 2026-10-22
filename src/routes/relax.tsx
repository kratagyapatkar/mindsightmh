import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { today, useSessions } from "@/lib/store";

export const Route = createFileRoute("/relax")({
  head: () => ({
    meta: [
      { title: "Relax — MindSight" },
      { name: "description", content: "Unwind after work with a body scan and calming offline sounds." },
      { property: "og:title", content: "Relax — MindSight" },
      { property: "og:description", content: "Unwind with a short body scan and soft sound." },
    ],
  }),
  component: Relax,
});

const STEPS = [
  "Settle in. Let your shoulders drop.",
  "Notice your feet. Let them feel heavy.",
  "Soften your legs and hips.",
  "Relax your belly. Let your breath slow.",
  "Release your hands, arms and shoulders.",
  "Unclench your jaw. Soften your forehead.",
  "Rest here. You're doing great.",
];
const STEP_SECONDS = 25;

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
  const [step, setStep] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [sessions, setSessions] = useSessions();
  const noise = useNoise();

  useEffect(() => {
    if (step === null) return;
    if (step >= STEPS.length) {
      noise.stop();
      setSessions([...sessions, { date: today(), kind: "relax", minutes: Math.round((STEPS.length * STEP_SECONDS) / 60) }]);
      setStep(null);
      return;
    }
    const t = setTimeout(() => setStep(step + 1), STEP_SECONDS * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => () => noise.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    if (step !== null) { noise.stop(); setStep(null); }
    else { if (sound) noise.start(); setStep(0); }
  };

  return (
    <AppShell>
      <PageTitle title="Relax" sub="A 3-minute body scan to unwind after work." />
      <div className="px-6">
        <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl bg-card p-8 text-center">
          <p className="font-display text-xl font-semibold text-primary">{step === null ? "Find a comfortable spot." : STEPS[Math.min(step, STEPS.length - 1)]}</p>
          {step !== null && (
            <div className="mt-6 flex gap-1.5">
              {STEPS.map((_, i) => <span key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-primary" : "bg-surface"}`} />)}
            </div>
          )}
        </div>
        <label className="mt-5 flex items-center justify-between rounded-2xl border bg-surface px-4 py-3">
          <span className="font-semibold text-primary">Soft background sound</span>
          <input type="checkbox" checked={sound} disabled={step !== null} onChange={(e) => setSound(e.target.checked)} className="h-5 w-5 accent-[var(--calm)]" />
        </label>
        <button onClick={toggle} className="mt-5 w-full rounded-2xl bg-card py-4 font-display text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
          {step === null ? "Begin" : "Stop"}
        </button>
      </div>
    </AppShell>
  );
}
