import { useContext, useEffect, useId, useLayoutEffect } from "react";
import { HotkeyContext } from "../context/HotkeyContext";
import type { HotKeyDefChordBase } from "../types/hotkey/HotKeyDefChordBase";
import type { HotKeyDefSequenceBase } from "../types/hotkey/HotKeyDefSequenceBase";
import type { HotkeyOptions } from "../types/hotkey/HotkeyOptions";
import type { HotKeyChordDef } from "../types/hotkey/HotKeyChordDef";
import type { HotKeySequenceDef } from "../types/hotkey/HotKeySequenceDef";

export type KeyValueType = "key" | "code";
// TODO
export type HotkeyCallback = () => void;

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type useHotkeyFn = typeof useHotkey;
export function useHotkey(
  hotkey: HotKeyDefChordBase | HotKeyDefSequenceBase,
  callback: HotkeyCallback,
  dependencies?: unknown[],
  options?: Partial<HotkeyOptions>,
): void {
  const hotkeyContext = useContext(HotkeyContext);
  const id = useId();

  const _options: HotkeyOptions = {
    preventDefault: true,
    ...options,
  };

  useSafeLayoutEffect(() => {
    if (hotkeyContext == null) {
      console.warn(
        "No HotkeyContext provided. Use <HotkeyProvider> to provide a HotkeyContext",
      );
      return;
    }

    if (hotkey.type === "chord") {
      const registryEntry: HotKeyChordDef = {
        id: id,
        options: _options,
        callback: callback,
        ...hotkey,
      };
      hotkeyContext.registry.addChordHotkey(registryEntry);

      return () => hotkeyContext.registry.removeChordHotkey(registryEntry.id);
    } else {
      const registryEntry: HotKeySequenceDef = {
        id: id,
        options: _options,
        callback: callback,
        ...hotkey,
      };
      hotkeyContext.registry.addSequenceHotkey(registryEntry);

      return () =>
        hotkeyContext.registry.removeSequenceHotkey(registryEntry.id);
    }
  }, [...(dependencies ? dependencies : [])]);
}
