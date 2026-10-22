import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { clearAll, exportAll, useName } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MindSight" },
      { name: "description", content: "Manage your name and your private on-device data." },
      { property: "og:title", content: "Settings — MindSight" },
      { property: "og:description", content: "You own your data. Export or erase it anytime." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [name, setName] = useName();
  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);

  return (
    <AppShell>
      <PageTitle title="Settings" sub="You own your data — export or erase it anytime." />
      <div className="space-y-4 px-6">
        <div className="rounded-3xl bg-card p-5">
          <label className="text-sm font-semibold text-primary" htmlFor="name">Your name</label>
          <div className="mt-2 flex gap-2">
            <input id="name" value={draft} onChange={(e) => setDraft(e.target.value)}
              className="flex-1 rounded-xl bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => setName(draft.trim() || "Friend")} className="rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Save</button>
          </div>
        </div>
        <div className="rounded-3xl border bg-surface p-5">
          <p className="font-semibold text-primary">Privacy</p>
          <p className="mt-1 text-sm text-muted-foreground">No account, no servers, no tracking. Everything is stored in this browser only.</p>
          <button onClick={exportAll} className="mt-4 w-full rounded-xl bg-card py-3 font-semibold text-primary">Export my data</button>
          <button onClick={() => { if (confirm("Erase all your MindSight data from this device?")) clearAll(); }}
            className="mt-2 w-full rounded-xl py-3 font-semibold text-destructive">Erase all data</button>
        </div>
      </div>
    </AppShell>
  );
}
