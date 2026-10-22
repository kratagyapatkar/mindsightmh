import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MoodSlider } from "@/components/MoodSlider";
import { BrainIcon, CalendarIcon, LungsIcon } from "@/components/Icons";
import { greeting, useName } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindSight — Private, offline mindfulness" },
      { name: "description", content: "Check in with your mood, breathe, reflect and relax. Everything stays on your device." },
      { property: "og:title", content: "MindSight — Private, offline mindfulness" },
      { property: "og:description", content: "A calm, privacy-first mental wellness space that works offline." },
    ],
  }),
  component: Home,
});

const tools = [
  { to: "/breathe", label: "Breathe", Icon: LungsIcon },
  { to: "/reflect", label: "Reflect", Icon: CalendarIcon },
  { to: "/relax", label: "Relax", Icon: BrainIcon },
] as const;

function Home() {
  const [name] = useName();
  const [hello, setHello] = useState("Hello");
  useEffect(() => setHello(greeting()), []);
  return (
    <AppShell>
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
        <Link to="/breathe" className="block rounded-2xl bg-card py-4 text-center font-display text-lg font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
          Get Started
        </Link>
        <Link to="/insights" className="mt-3 block text-center text-sm font-semibold text-accent">See your mood trends →</Link>
      </div>
    </AppShell>
  );
}
