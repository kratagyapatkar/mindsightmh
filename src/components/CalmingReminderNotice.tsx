import { useEffect, useState } from "react";
import { Bell, Check, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dueCalmingReminders, setCalmingReminder, useMoods } from "@/lib/store";

export function CalmingReminderNotice() {
  const [moods, setMoods] = useMoods();
  const [now, setNow] = useState(0);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, []);
  const due = dueCalmingReminders(moods, now)[0];
  if (!due) return null;
  const key = `${due.date}:${due.guidance.id}`;
  function dismiss() {
    if (!due) return;
    try { setMoods(setCalmingReminder(moods, due.date, due.guidance.id)); setRevealed(null); setError(""); }
    catch { setError("Could not dismiss this reminder on your device."); }
  }
  return <aside aria-label="Private calming reminder" className="mx-6 mt-3 mb-4 border-y border-border py-4">
    <p role="status" className="flex items-center gap-2 text-sm font-semibold text-primary"><Bell className="size-4" aria-hidden="true" />A moment for yourself</p>
    <p className="mt-2 text-xs text-muted-foreground">You asked to revisit a saved calming step.</p>
    {revealed === key && <div className="mt-3 border-l-2 border-primary pl-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-primary"><Leaf className="size-4" aria-hidden="true" />Saved calming step · {new Date(`${due.date}T12:00:00`).toLocaleDateString()}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{due.guidance.text}</p>
      <p className="mt-2 text-xs text-muted-foreground">AI suggestions are not medical advice.</p>
    </div>}
    <div className="mt-3 flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" aria-expanded={revealed === key} onClick={() => setRevealed(revealed === key ? null : key)}><Leaf />{revealed === key ? "Hide step" : "Revisit calming step"}</Button>
      <Button variant="ghost" size="sm" onClick={dismiss}><Check />{revealed === key ? "Done" : "Dismiss"}</Button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
  </aside>;
}