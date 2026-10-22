import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { MOODS, today, useJournal, useMoods } from "@/lib/store";

export const Route = createFileRoute("/reflect")({
  head: () => ({
    meta: [
      { title: "Reflect — MindSight" },
      { name: "description", content: "A private journal with gentle prompts, stored only on your device." },
      { property: "og:title", content: "Reflect — MindSight" },
      { property: "og:description", content: "Think about your feelings in a private journal." },
    ],
  }),
  component: Reflect,
});

const PROMPTS = [
  "What's one thing that went well today?",
  "What's weighing on your mind right now?",
  "Who or what are you grateful for?",
  "What would make tomorrow a little easier?",
  "How did your body feel today?",
];

function Reflect() {
  const [journal, setJournal] = useJournal();
  const [moods] = useMoods();
  const [i, setI] = useState(0);
  const [text, setText] = useState("");

  const save = () => {
    if (!text.trim()) return;
    setJournal([
      { id: crypto.randomUUID(), date: new Date().toISOString(), prompt: PROMPTS[i] ?? "", text: text.trim(), mood: moods.find((m) => m.date === today())?.value },
      ...journal,
    ]);
    setText("");
    setI((i + 1) % PROMPTS.length);
  };

  return (
    <AppShell>
      <PageTitle title="Reflect" sub="Write freely. Nobody else will ever read this." />
      <div className="px-6">
        <div className="rounded-3xl bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-primary">{PROMPTS[i]}</p>
            <button onClick={() => setI((i + 1) % PROMPTS.length)} className="shrink-0 text-sm font-semibold text-accent">New prompt</button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Start writing…"
            className="mt-4 w-full resize-none rounded-2xl bg-surface p-4 text-foreground outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={save} disabled={!text.trim()}
            className="mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">
            Save entry
          </button>
        </div>
        <h2 className="mt-8 mb-3 text-lg font-semibold text-primary">Past entries</h2>
        {journal.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
        <ul className="space-y-3">
          {journal.map((e) => (
            <li key={e.id} className="rounded-2xl border bg-surface p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(e.date).toLocaleString()}</span>
                <span className="flex items-center gap-2">
                  {e.mood !== undefined && <span className="text-base">{MOODS[e.mood]}</span>}
                  <button onClick={() => setJournal(journal.filter((x) => x.id !== e.id))} className="text-destructive">Delete</button>
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">{e.prompt}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{e.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
