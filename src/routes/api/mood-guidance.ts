import { createFileRoute } from "@tanstack/react-router";
import { handleMoodGuidance } from "@/lib/ai/mood-guidance.server";

export const Route = createFileRoute("/api/mood-guidance")({
  server: { handlers: { POST: ({ request }) => handleMoodGuidance(request) } },
});