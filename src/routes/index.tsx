import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MoodSlider } from "@/components/MoodSlider";
import { BrainIcon, CalendarIcon, LungsIcon } from "@/components/Icons";
import { greeting, useName, useOnboarded } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindSight — Mood check-ins and gentle guidance" },
      { name: "description", content: "Check in, breathe, reflect and relax with on-device storage and optional personalized AI guidance." },
      { property: "og:title", content: "MindSight — Mood check-ins and gentle guidance" },
      { property: "og:description", content: "A calm mental wellness space with local-only saved data and optional AI support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const tools = [
  { to: "/breathe", label: "Breathe", Icon: LungsIcon },
  { to: "/reflect", label: "Reflect", Icon: CalendarIcon },
  { to: "/relax", label: "Relax", Icon: BrainIcon },
] as const;

function Onboarding({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl">
        <p className="font-display text-2xl font-semibold text-primary">Welcome to MindSight 🌿</p>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li><span className="font-semibold text-primary">What it is:</span> a quiet place to notice how you feel, then choose a supportive activity — breathing, reflecting or relaxing.</li>
          <li><span className="font-semibold text-primary">What it isn't:</span> a medical or diagnostic tool, and never a replacement for professional care.</li>
          <li><span className="font-semibold text-primary">Your data:</span> saved records stay in this browser on this device. Optional AI guidance shares only a selected mood and optional note when you agree. No account is needed.</li>
          <li><span className="font-semibold text-primary">Your pace:</span> everything here is optional. Skip, pause or leave anything at any time.</li>
        </ul>
        <button onClick={onDone} className="mt-6 w-full rounded-2xl bg-primary py-3.5 font-display text-lg font-semibold text-primary-foreground">
          Get started
        </button>
      </div>
    </div>
  );
}

function Home() {
  const [name] = useName();
  const [onboarded, setOnboarded] = useOnboarded();
  const [hello, setHello] = useState("Hello");
  useEffect(() => setHello(greeting()), []);
  return (
    <AppShell>
      {!onboarded && <Onboarding onDone={() => setOnboarded(true)} />}
      <div className="px-6 pt-4">
        <h1 className="text-4xl font-bold leading-tight text-primary">{hello},<br />{name}</h1>
        <p className="mt-3 text-muted-foreground">Take a deep breath. You're doing great.</p>
      </div>
      <div className="mt-8 px-6"><MoodSlider /></div>
      <div className="mt-10 grid grid-cols-3 gap-4 px-6">
        {tools.map(({ to, label, Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-3 rounded-2xl py-3 text-primary transition hover:bg-card">
            <Icon className="h-16 w-16 text-primary" />
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-8 px-6">
        <Link to="/explore" className="block rounded-2xl bg-card py-4 text-center font-display text-lg font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
          Choose a practice
        </Link>
        <Link to="/insights" className="mt-3 block text-center text-sm font-semibold text-accent">See your mood trends →</Link>
      </div>
    </AppShell>
  );
}
