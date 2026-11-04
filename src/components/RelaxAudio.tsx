import { useEffect, useRef, useState } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RelaxAudio({ src, title, autoPlay = false }: { src: string; title: string; autoPlay?: boolean }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const player = audio.current;
    if (autoPlay && player) {
      void player.play().catch(() => {
        // Native controls remain available if the browser blocks autoplay.
      });
    }
    return () => { player?.pause(); };
  }, [autoPlay]);

  return (
    <div>
    <div className="mt-4 flex min-w-0 items-center gap-2">
      <audio
        ref={audio}
        data-relax-audio
        controls
        autoPlay={autoPlay}
        preload="none"
        src={src}
        aria-label={`${title} music playback`}
        className="h-12 min-w-0 flex-1"
        onError={() => setError(true)}
        onPlay={(event) => {
          document.querySelectorAll<HTMLAudioElement>("audio[data-relax-audio]").forEach((other) => {
            if (other !== event.currentTarget) other.pause();
          });
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Stop ${title} music`}
        title="Stop music"
        onClick={() => {
          const player = audio.current;
          if (!player) return;
          player.pause();
          player.currentTime = 0;
        }}
      >
        <Square />
      </Button>
    </div>
    {error && <p role="status" className="mt-2 text-sm text-muted-foreground">Music couldn't load. You can still continue the practice.</p>}
    </div>
  );
}