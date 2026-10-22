import { z } from "zod";

export const guidanceInputSchema = z.object({
  mood: z.number().int().min(0).max(6),
  note: z.string().trim().max(2000).optional().default(""),
  kind: z.enum(["reflection", "calming"]),
  consent: z.literal(true),
}).strict();

export type GuidanceInput = z.infer<typeof guidanceInputSchema>;
export type GuidanceEvent =
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export function safeGatewayError(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const value = body as { message?: unknown; error?: { message?: unknown } };
    const message = value.error?.message ?? value.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return status === 401 ? "AI guidance is not configured. Please ask the app owner to check AI access." : "AI guidance is unavailable right now. Your check-in has not been changed.";
}