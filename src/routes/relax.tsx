import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { RelaxAudio } from "@/components/RelaxAudio";
import { RelaxScene } from "@/components/RelaxScene";
import { ArrowLeft, ArrowUpRight, Leaf, ScanLine, Waves, Flower2 } from "lucide-react";
import groundingMusic from "@/assets/atlasaudio-classical-585264.mp3.asset.json";
import bodyScanMusic from "@/assets/jumpingbunny-rock-sitar-indian-310861.mp3.asset.json";
import muscleMusic from "@/assets/leberch-classical-584480.mp3.asset.json";
import calmingMusic from "@/assets/playlistsons-sitar-in-the-temple-of-rats-430832.mp3.asset.json";
import { today, useSessions } from "@/lib/store";

export const Route = createFileRoute("/relax")({
  head: () => ({
    meta: [
      { title: "Relax — MindSight" },
       { name: "description", content: "Guided grounding, body scan, muscle relaxation and a calming pause with optional music playback." },
      { property: "og:title", content: "Relax — MindSight" },
      { property: "og:description", content: "Unwind with short guided practices that run entirely on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Relax,
});

type Practice = { id: string; name: string; desc: string; stepSeconds: number; steps: string[]; note?: string; audio: string };

const PRACTICES: Practice[] = [
  {
    id: "grounding",
    audio: groundingMusic.url,
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
    audio: bodyScanMusic.url,
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
    audio: muscleMusic.url,
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
    audio: calmingMusic.url,
    name: "Calming pause",
    desc: "A quiet visual pause with optional music. No timer pressure — stay as long as you like.",
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
const practiceIcons = [Leaf, ScanLine, Waves, Flower2];

function Relax() {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [sessions, setSessions] = useSessions();

  useEffect(() => {
    if (!practice || done) return;
    if (step >= practice.steps.length) {
      setSessions([...sessions, { date: today(), kind: "relax", minutes: minutesOf(practice), practice: practice.name, completed: true }]);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setStep(step + 1), practice.stepSeconds * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, step, done]);

  const begin = (p: Practice) => {
    setPractice(p);
    setStep(0);
    setDone(false);
  };

  const exit = () => {
    if (practice && !done && step > 0)
      setSessions([...sessions, { date: today(), kind: "relax", minutes: Math.max(1, Math.round((step * practice.stepSeconds) / 60)), practice: practice.name, completed: false }]);
    setPractice(null);
    setDone(false);
  };

  if (!practice) {
    return (
      <AppShell>
        <PageTitle title="Relax" sub="Short guided practices to unwind. Every one can be paused or left at any time." />
        <div className="grid gap-4 px-6">
          <div className="grid gap-4 md:grid-cols-2">
          {PRACTICES.map((p, index) => {
            const Icon = practiceIcons[index] ?? Leaf;
            return (
              <Button key={p.id} variant="ghost" onClick={() => begin(p)} aria-label={`Start ${p.name}`} className="h-auto min-w-0 flex-col items-start gap-4 whitespace-normal rounded-3xl bg-card p-5 text-left hover:bg-secondary">
                <span className="flex w-full items-center justify-between gap-2">
                  <Icon className="size-6 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground">~{minutesOf(p)} min</span>
                </span>
                <span className="flex w-full items-center justify-between gap-2 font-display text-lg font-semibold text-primary">{p.name}<ArrowUpRight /></span>
                <span className="text-sm font-normal text-muted-foreground">{p.desc}</span>
              </Button>
            );
          })}
          </div>
          <p className="text-center text-xs text-muted-foreground">These practices support relaxation; they don't treat medical conditions.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-6 pt-5"><Button variant="ghost" onClick={exit} className="gap-2"><ArrowLeft /> All practices</Button></div>
      <PageTitle title={practice.name} sub="One step at a time. Skip anything that doesn't feel right." />
      {!done && <RelaxScene key={practice.id} title={practice.name} />}
      <div className="px-6">
        {!done && <div className="mb-4"><RelaxAudio key={practice.id} src={practice.audio} title={practice.name} autoPlay /></div>}
        <div className="flex min-h-40 flex-col items-center justify-center py-6 text-center">
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
            <Button variant="ghost" onClick={() => setStep(step + 1)} className="h-auto w-full rounded-2xl bg-card py-4 font-display text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
              Skip to next step
            </Button>
          )}
          <Button variant="ghost" onClick={exit} className={`h-auto w-full rounded-2xl py-4 font-display text-lg font-semibold ${done ? "bg-card text-primary hover:bg-primary hover:text-primary-foreground" : "bg-surface text-destructive"}`}>
            {done ? "Back to practices" : "End practice"}
          </Button>
        </div>
        <Link to="/" className="mt-2 block text-center text-sm font-semibold text-accent">← Exit to home</Link>
      </div>
    </AppShell>
  );
}
