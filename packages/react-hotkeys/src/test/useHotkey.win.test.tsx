import { describe, it, vi, expect } from "vitest";
import { WIN_UA, withUserAgent } from "./utils/userAgent";
import { act, render } from "@testing-library/react";
import { HotkeyHarness } from "./utils/hotkeyRenderer";
import { createKeyboardEvent } from "./utils/event";
import { tests } from "./useHotkey.tests";

const RH = await withUserAgent(WIN_UA);
const { Hotkey, detectOS } = RH;

describe("useHotkey", () => {
  // platform independent tests
  tests.forEach((test) => it(test.name, test.fn(RH)));

  it("respects OS-specific modifiers by distinguishing resolving 'Mod' to Ctrl for Windows", async () => {
    const callback = vi.fn();

    const macLikeEvent = createKeyboardEvent("k", "KeyK", { metaKey: true });
    const winLikeEvent = createKeyboardEvent("k", "KeyK", { ctrlKey: true });

    render(
      <HotkeyHarness RH={RH} hotkey={Hotkey.Chord.Mod.K} callback={callback} />,
    );

    expect(detectOS()).toBe("Windows");

    act(() => {
      window.dispatchEvent(macLikeEvent);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(winLikeEvent);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(winLikeEvent.defaultPrevented).toBe(true);
  });
});
