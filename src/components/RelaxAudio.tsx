import { useRef } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RelaxAudio({ src, title }: { src: string; title: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="mt-4 flex min-w-0 items-center gap-2">
      <audio
        ref={audio}
        data-relax-audio
        controls
        preload="none"
        src={src}
        aria-label={`${title} music playback`}
        className="h-12 min-w-0 flex-1"
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
  );
}