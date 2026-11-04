import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/AppShell";
import { BrainIcon, CalendarIcon, LungsIcon } from "@/components/Icons";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — MindSight" },
      { name: "description", content: "Explore MindSight's tools: guided breathing, private journaling and relaxation." },
      { property: "og:title", content: "Explore — MindSight" },
      { property: "og:description", content: "Guided breathing, private journaling and relaxation — all on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explore,
});

const tools = [
  { to: "/breathe", label: "Breathe", desc: "Guided breathing with a calm visual timer.", Icon: LungsIcon },
  { to: "/reflect", label: "Reflect", desc: "A private journal with gentle prompts.", Icon: CalendarIcon },
  { to: "/relax", label: "Relax", desc: "Grounding, body scan, muscle relaxation and a calming pause.", Icon: BrainIcon },
] as const;

function Explore() {
  return (
    <AppShell>
      <PageTitle title="Explore" sub="Pick a tool and take a moment for yourself." />
      <div className="grid gap-4 px-6 md:grid-cols-3">
        {tools.map(({ to, label, desc, Icon }) => (
          <Link key={to} to={to}
            className="flex items-center gap-4 rounded-3xl bg-card p-5 transition hover:bg-surface md:flex-col md:items-start">
            <Icon className="h-14 w-14 shrink-0 text-primary" />
            <div>
              <p className="font-display text-lg font-semibold text-primary">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
