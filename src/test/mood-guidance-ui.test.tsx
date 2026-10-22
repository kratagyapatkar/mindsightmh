// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MoodGuidance } from "@/components/MoodGuidance";

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
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ mood: 2, note: "", kind: "reflection", consent: true });
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
    await waitFor(() => expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});