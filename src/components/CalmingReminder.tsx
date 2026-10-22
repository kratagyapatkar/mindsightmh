import { useState } from "react";
import { Bell, BellOff, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedGuidance } from "@/lib/store";

export function CalmingReminder({ guidance, onChange, onComplete }: { guidance: SavedGuidance; onChange: (time?: string) => void; onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  function schedule(at: string) {
    try { onChange(at); setOpen(false); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save this reminder on your device."); }
  }
  return <div className="mt-3 space-y-2">
    {guidance.reminderCompletedAt && <p role="status" className="flex items-start gap-2 text-xs font-semibold text-primary"><Check className="size-4 shrink-0" aria-hidden="true" /><span>Reminder completed · {new Date(guidance.reminderCompletedAt).toLocaleString()}</span></p>}
    {guidance.reminderAt && <p className="flex items-start gap-2 text-xs text-muted-foreground"><Clock className="size-4 shrink-0" aria-hidden="true" /><span>Private reminder: {new Date(guidance.reminderAt).toLocaleString()}</span></p>}
    <div className="flex flex-wrap gap-1">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} aria-expanded={open}><Bell />{guidance.reminderCompletedAt ? "Remind me again" : guidance.reminderAt ? "Change reminder" : "Remind me later"}</Button>
      {guidance.reminderAt && !guidance.reminderCompletedAt && <>
        <Button variant="secondary" size="sm" onClick={() => { try { onComplete(); setOpen(false); setError(""); } catch { setError("Could not save completion on your device."); } }}><Check />Mark completed</Button>
        <Button variant="ghost" size="sm" onClick={() => { try { onChange(); setError(""); } catch { setError("Could not cancel this reminder on your device."); } }}><BellOff />Cancel reminder</Button>
      </>}
    </div>
    {open && <div className="space-y-3 border-t border-border pt-3">
      <p className="text-xs text-muted-foreground">Only appears inside MindSight while it’s open, or when you return after this time. No device notifications, emails, or sharing.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => schedule(new Date(Date.now() + 3600000).toISOString())}>In 1 hour</Button>
        <Button variant="secondary" size="sm" onClick={() => schedule(new Date(Date.now() + 86400000).toISOString())}>In 24 hours</Button>
      </div>
      <label className="block text-xs font-semibold text-primary">Choose a time
        <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} className="mt-2 block min-w-0 w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </label>
      <Button size="sm" disabled={!time} onClick={() => { const at = new Date(time); if (Number.isNaN(at.getTime())) { setError("Choose a valid time."); return; } schedule(at.toISOString()); }}><Bell />Set private reminder</Button>
    </div>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}