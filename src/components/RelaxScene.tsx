import { Pause, Play } from "lucide-react";
import { useState } from "react";
import lake from "@/assets/relax-lake.jpg";
import { Button } from "@/components/ui/button";

export function RelaxScene({ title }: { title: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <div data-relax-scene className={`relax-scene relative isolate overflow-hidden ${paused ? "relax-scene-paused" : ""}`}>
      <img src={lake} alt="Lotus flowers beside a still lake surrounded by green trees and mountains" width={1536} height={1024} className="relax-landscape absolute inset-0 h-full w-full object-cover" />
      <div className="relax-water absolute inset-x-0 bottom-0 h-1/3 overflow-hidden" aria-hidden="true">
        <span className="relax-ripple" /><span className="relax-ripple" /><span className="relax-ripple" />
      </div>
      <span className="sr-only">Calming lake scene for {title}</span>
      <Button variant="secondary" size="icon" className="absolute right-4 top-4" onClick={() => setPaused(!paused)} aria-label={paused ? "Resume animation" : "Pause animation"} title={paused ? "Resume animation" : "Pause animation"}>
        {paused ? <Play /> : <Pause />}
      </Button>
    </div>
  );
}