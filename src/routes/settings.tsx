import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { clearAll, exportAll, useName } from "@/lib/store";
import { Download, FolderDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { savePhoneBackup } from "@/lib/phone-backup";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MindSight" },
      { name: "description", content: "Manage your name, your privacy and your private on-device data." },
      { property: "og:title", content: "Settings — MindSight" },
      { property: "og:description", content: "You own your data. Export or erase it anytime." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [name, setName] = useName();
  const [draft, setDraft] = useState(name);
  const [backupStatus, setBackupStatus] = useState("");
  const [savingBackup, setSavingBackup] = useState(false);
  useEffect(() => setDraft(name), [name]);

  async function saveBackup() {
    setSavingBackup(true);
    setBackupStatus("");
    try {
      const result = await savePhoneBackup();
      setBackupStatus(result === "cancelled" ? "Backup cancelled." : result === "shared" ? "Backup handed to your phone’s save or share option." : "Backup download started. Extract the ZIP to get your Mindsight folder.");
    } catch {
      setBackupStatus("Could not create the backup. Please try again; your saved data has not changed.");
    } finally {
      setSavingBackup(false);
    }
  }

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
            <li><span className="font-semibold text-primary">What's stored:</span> your mood check-ins, any AI suggestions you choose to save, journal entries, practice sessions and name.</li>
            <li><span className="font-semibold text-primary">Where:</span> saved check-ins, journals, sessions and your name stay only in this browser, on this device. No account is needed.</li>
            <li><span className="font-semibold text-primary">Optional AI:</span> only when you agree, your selected mood and optionally your note are sent to Lovable AI to generate guidance. Internet is required. MindSight does not store these requests on its server; AI service processing is separate from on-device storage. Your journal, history and name are never included.</li>
            <li><span className="font-semibold text-primary">Your choice:</span> saving a check-in never sends it to AI. Suggestions are temporary unless you choose to save them to check-in history on this device. Saved suggestions are included in exports and removed when you delete their check-in or erase all data.</li>
            <li><span className="font-semibold text-primary">Private reminders:</span> optional calming-step reminders stay on this device. They appear only inside MindSight while it’s open or when you return after the chosen time, never as device notifications or emails. Cancelling a reminder keeps your saved step.</li>
            <li><span className="font-semibold text-primary">Deletion:</span> erasing below removes everything from this browser permanently. Downloaded backups must be deleted separately in your phone’s Files app.</li>
            <li><span className="font-semibold text-primary">Backups:</span> if your browser syncs data or your device backs up browser storage, copies may be included there — that's controlled by your browser and device settings, not by MindSight.</li>
          </ul>
          <div className="mt-4 border-t pt-4">
            <p className="font-semibold text-primary">Mindsight phone backup</p>
            <p className="mt-2 text-sm text-muted-foreground">All saved data is included in a ZIP containing a Mindsight folder. Save it with your phone’s Files app, then extract it into main storage. Phone browsers cannot create that folder automatically. This is a manual, unencrypted copy; keep it private.</p>
            <Button onClick={saveBackup} disabled={savingBackup} className="mt-3 w-full"><FolderDown />{savingBackup ? "Preparing backup…" : "Save phone backup"}</Button>
            <p role="status" className="mt-2 text-sm text-muted-foreground">{backupStatus}</p>
          </div>
          <Button onClick={exportAll} variant="secondary" className="mt-4 w-full"><Download />Export my data</Button>
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
