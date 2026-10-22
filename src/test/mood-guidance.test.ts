import { describe, expect, it } from "vitest";
import { guidanceInputSchema, safeGatewayError } from "@/lib/mood-guidance";

describe("optional mood AI sharing", () => {
  it("requires explicit consent", () => {
    expect(guidanceInputSchema.safeParse({ mood: 3, kind: "reflection", consent: false }).success).toBe(false);
  });
  it("accepts a mood without a note", () => {
    expect(guidanceInputSchema.parse({ mood: 6, kind: "calming", consent: true }).note).toBe("");
  });
  it("accepts only the seven-point mood scale", () => {
    expect(guidanceInputSchema.safeParse({ mood: 7, kind: "calming", consent: true }).success).toBe(false);
    expect(guidanceInputSchema.safeParse({ mood: -1, kind: "calming", consent: true }).success).toBe(false);
  });
  it("never accepts journal or history data", () => {
    expect(guidanceInputSchema.safeParse({ mood: 3, kind: "reflection", consent: true, journal: "private" }).success).toBe(false);
  });
  it("preserves the safe gateway denial reason", () => {
    expect(safeGatewayError({ error: { message: "Provider access denied." } }, 403)).toBe("Provider access denied.");
  });
});