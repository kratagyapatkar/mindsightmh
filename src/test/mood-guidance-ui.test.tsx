// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MoodGuidance } from "@/components/MoodGuidance";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

afterEach(() => vi.unstubAllGlobals());

describe("consented AI sharing flow", () => {
  it("sends only the selected mood until note sharing is explicitly selected", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"message":"AI paused."}', { status: 402 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MoodGuidance mood={2} note="Private note" />);
    fireEvent.click(screen.getByRole("button", { name: /A little support/ }));
    expect(screen.getByRole("button", { name: "Get my suggestion" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "I agree to share this check-in with AI." }));
    fireEvent.click(screen.getByRole("button", { name: "Get my suggestion" }));
    await screen.findByRole("alert");
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body ?? "null")).toEqual({ mood: 2, note: "", kind: "reflection", consent: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("forwards Stop through the request signal without replaying", async () => {
    const fetchMock = vi.fn((_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => reject(new DOMException("Stopped", "AbortError")));
    }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MoodGuidance mood={4} note="" />);
    fireEvent.click(screen.getByRole("button", { name: /A little support/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "I agree to share this check-in with AI." }));
    fireEvent.click(screen.getByRole("button", { name: "Get my suggestion" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Stop AI guidance" })));
    await waitFor(() => expect(fetchMock.mock.calls[0]?.[1]?.signal.aborted).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("saves a completed reflection only after an explicit save", async () => {
    const onSave = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"type":"text","text":"What would help today?"}\n{"type":"done"}\n')));
    render(<MoodGuidance mood={2} note="" onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /A little support/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "I agree to share this check-in with AI." }));
    fireEvent.click(screen.getByRole("button", { name: "Get my suggestion" }));
    const save = await screen.findByRole("button", { name: "Save to check-in history" });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ kind: "reflection", mood: 2, text: "What would help today?" });
    expect(screen.getByRole("button", { name: "Saved to check-in history" })).toBeDisabled();
  });

  it("does not allow saving an incomplete suggestion", async () => {
    const onSave = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"type":"text","text":"Incomplete suggestion"}\n')));
    render(<MoodGuidance mood={2} note="" onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /A little support/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "I agree to share this check-in with AI." }));
    fireEvent.click(screen.getByRole("button", { name: "Get my suggestion" }));
    await screen.findByRole("alert");
    expect(screen.queryByRole("button", { name: "Save to check-in history" })).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});