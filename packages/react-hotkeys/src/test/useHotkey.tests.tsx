import type { TestFunction } from "vitest";
import { vi, expect } from "vitest";
import { act, render } from "@testing-library/react";
import type { ReactHotkeys } from "./utils/hotkeyRenderer";
import { HotkeyHarness } from "./utils/hotkeyRenderer";
import { createKeyboardEvent } from "./utils/event";

export type Test = {
  name: string;
  fn: (RH: ReactHotkeys) => TestFunction<object>;
};

export const tests: Test[] = [
  {
    name: "should trigger when escape is pressed",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("esc", "Escape");
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.Escape}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    },
  },
  {
    name: "should trigger when code 'KeyA' is pressed with 'Shift' and 'Alt'",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("a", "KeyA", {
        shiftKey: true,
        altKey: true,
      });
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.Shift.Alt.A}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    },
  },
  {
    name: "should not trigger when code 'KeyA' is pressed with 'Shift' and 'Alt' but also 'Ctrl'",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("a", "KeyA", {
        shiftKey: true,
        altKey: true,
        ctrlKey: true,
      });
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.Shift.Alt.A}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();
    },
  },
  {
    name: "should not trigger when code 'KeyA' is pressed with 'Shift' but missing 'Alt'",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("a", "KeyA", {
        shiftKey: true,
        altKey: true,
      });
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.Shift.A}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();
    },
  },
  {
    name: "should not trigger when code 'KeyA' is pressed with 'Alt' but missing 'Shift'",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("a", "KeyA", {
        shiftKey: true,
        altKey: true,
      });
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.Alt.A}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();
    },
  },
  {
    name: "should trigger when value 'z' / code 'KeyZ' is pressed",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("z", "KeyZ");
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.KeyZ}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    },
  },
  {
    name: "should not trigger when value 'y' / code 'KeyZ' is pressed",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("y", "KeyZ");
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.KeyZ}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();
    },
  },
  {
    name: "should trigger code 'KeyK' is pressed and 'Control' follows after",
    fn: (RH) => async () => {
      const { Hotkey } = RH;
      const event = createKeyboardEvent("k", "KeyK");
      const modifierEvent = createKeyboardEvent("Control", "ControlLeft", {
        ctrlKey: true,
      });
      const callback = vi.fn();

      render(
        <HotkeyHarness
          RH={RH}
          hotkey={Hotkey.Chord.Control.K}
          callback={callback}
        />,
      );

      act(() => {
        window.dispatchEvent(event);

        window.dispatchEvent(modifierEvent);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    },
  },
];
