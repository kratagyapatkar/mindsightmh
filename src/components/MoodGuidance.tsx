import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, MessageCircle, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MOOD_LABELS, MOODS } from "@/lib/store";
import { safeGatewayError, type GuidanceEvent } from "@/lib/mood-guidance";

export function MoodGuidance({ mood, note }: { mood: number; note: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"reflection" | "calming">("reflection");
  const [consent, setConsent] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  // Changed inputs require a fresh sharing decision; old results are never relabeled.
  useEffect(() => { controller.current?.abort(); setConsent(false); setText(""); setError(""); setStopped(false); }, [mood, note, kind, includeNote]);

  async function generate() {
    if (!consent || loading) return;
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true); setStopped(false); setText(""); setError("");
    try {
      const response = await fetch("/api/mood-guidance", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: abort.signal,
        body: JSON.stringify({ mood, note: includeNote ? note.trim() : "", kind, consent: true }),
      });
      if (!response.ok) {
        let body: unknown;
        try { body = await response.json(); } catch { body = null; }
        throw new Error(safeGatewayError(body, response.status));
      }
      if (!response.body) throw new Error("No guidance was returned.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      let finished = false;
      const consume = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as GuidanceEvent;
        if (event.type === "text") setText((prev) => prev + event.text);
        if (event.type === "error") throw new Error(event.message);
        if (event.type === "done") finished = true;
      };
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        pending += decoder.decode(chunk.value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        lines.forEach(consume);
      }
      pending += decoder.decode();
      consume(pending);
      if (!finished) throw new Error("AI guidance ended before completing. Your check-in has not been changed.");
    } catch (e) {
      if (abort.signal.aborted) setStopped(true);
      else setError(e instanceof Error ? e.message : "AI guidance is unavailable. Check your connection.");
    } finally {
      if (controller.current === abort) { controller.current = null; setLoading(false); setConsent(false); }
    }
  }

  return (
    <section className="mt-5 border-t border-border pt-5" aria-label="Personalized AI guidance">
      <Button variant="ghost" onClick={() => { if (open) controller.current?.abort(); setOpen(!open); }} aria-expanded={open} className="h-auto w-full justify-between whitespace-normal text-primary">
        <span className="flex items-center gap-2"><Sparkles aria-hidden="true" /> A little support</span>
        <span className="text-xs text-muted-foreground">{open ? "Close" : "Optional AI"}</span>
      </Button>
      {open && <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Guidance type">
          <Button variant={kind === "reflection" ? "default" : "secondary"} aria-pressed={kind === "reflection"} onClick={() => setKind("reflection")} className="h-auto min-h-10 whitespace-normal"><MessageCircle /> Reflection</Button>
          <Button variant={kind === "calming" ? "default" : "secondary"} aria-pressed={kind === "calming"} onClick={() => setKind("calming")} className="h-auto min-h-10 whitespace-normal"><Leaf /> Calming step</Button>
        </div>
        <p className="text-sm font-semibold text-primary">Sharing: {MOODS[mood]} {MOOD_LABELS[mood]}</p>
        {note.trim() && <>
          <label className="flex items-center gap-3 text-sm"><Checkbox checked={includeNote} onCheckedChange={(value) => setIncludeNote(value === true)} /> Include my note</label>
          {includeNote && <p className="max-h-32 overflow-auto whitespace-pre-wrap break-words border-l-2 border-border pl-3 text-sm text-muted-foreground">{note}</p>}
        </>}
        <p className="text-xs leading-relaxed text-muted-foreground">AI needs internet. Only the mood and any note selected above go to Lovable AI for this request. MindSight does not save them on its server. Your journal, history and name are not shared. Avoid identifying details.</p>
        <label className="flex items-start gap-3 text-sm"><Checkbox className="mt-0.5" checked={consent} onCheckedChange={(value) => setConsent(value === true)} disabled={loading} /><span>I agree to share this check-in with AI.</span></label>
        {includeNote && note.trim().length > 2000 && <p role="alert" className="text-sm text-destructive">Shorten your note to 2,000 characters, or leave it out.</p>}
        <div className="flex gap-2">
          <Button onClick={generate} disabled={!consent || loading || (includeNote && note.trim().length > 2000)} className="h-auto min-h-10 flex-1 whitespace-normal"><Sparkles /> {loading ? "Finding a gentle next step…" : "Get my suggestion"}</Button>
          {loading && <Button variant="outline" aria-label="Stop AI guidance" title="Stop AI guidance" onClick={() => controller.current?.abort()}><Square /> Stop</Button>}
        </div>
        <p role="status" className="sr-only">{loading ? "AI guidance is being prepared." : stopped ? "AI guidance stopped." : error ? "AI guidance failed." : text ? "Your personalized suggestion is ready." : ""}</p>
        {text && <div className="border-l-2 border-primary pl-4"><h3 className="text-sm font-semibold text-primary">{kind === "reflection" ? "Your reflection prompt" : "Your calming next step"}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</p></div>}
        {stopped && <p className="text-xs text-muted-foreground">Stopped. Any partial suggestion is incomplete.</p>}
        {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">AI can be wrong. This is not medical advice or crisis support. If you are in immediate danger, contact local emergency services or a trusted person now.</p>
        {(text || error || stopped) && <Button variant="link" asChild><Link to={kind === "reflection" ? "/reflect" : "/relax"}>{kind === "reflection" ? "Open my journal" : "Choose an on-device practice"}</Link></Button>}
      </div>}
    </section>
  );
}