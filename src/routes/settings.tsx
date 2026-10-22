import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { clearAll, exportAll, useName } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MindSight" },
      { name: "description", content: "Manage your name, your privacy and your private on-device data." },
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
          <p className="font-semibold text-primary">Your privacy, in plain words</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li><span className="font-semibold text-primary">What's stored:</span> your mood check-ins, journal entries, practice sessions and name.</li>
            <li><span className="font-semibold text-primary">Where:</span> only in this browser, on this device. There is no account and no server.</li>
            <li><span className="font-semibold text-primary">What's shared:</span> nothing. Your words and moods are never sent anywhere or used for analytics or ads.</li>
            <li><span className="font-semibold text-primary">Deletion:</span> erasing below removes everything from this browser permanently.</li>
            <li><span className="font-semibold text-primary">Backups:</span> if your browser syncs data or your device backs up browser storage, copies may be included there — that's controlled by your browser and device settings, not by MindSight.</li>
          </ul>
          <button onClick={exportAll} className="mt-4 w-full rounded-xl bg-card py-3 font-semibold text-primary">Export my data</button>
          <button onClick={() => { if (confirm("Erase all your MindSight data from this device? This can't be undone.")) clearAll(); }}
            className="mt-2 w-full rounded-xl py-3 font-semibold text-destructive">Erase all data</button>
        </div>

        <div className="rounded-3xl border bg-surface p-5">
          <p className="font-semibold text-primary">About MindSight</p>
          <p className="mt-1 text-sm text-muted-foreground">
            MindSight is a wellbeing and self-reflection tool. It is not a medical or diagnostic service and doesn't replace professional care.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            If self-guided activities don't feel like enough, please consider reaching out to a mental-health professional or a helpline in your area — support is a sign of strength, not failure.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
