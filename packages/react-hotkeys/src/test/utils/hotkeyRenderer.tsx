import type { HotKeyDefChordBase } from "@selokhq/react-hotkeys/types/hotkey/HotKeyDefChordBase";
import type { HotKeyDefSequenceBase } from "@selokhq/react-hotkeys/types/hotkey/HotKeyDefSequenceBase";
import type { HotkeyOptions } from "@selokhq/react-hotkeys/types/hotkey/HotkeyOptions";
import type * as _lib from "@selokhq/react-hotkeys";
export type ReactHotkeys = typeof _lib;

type HotkeyHarnessProps = {
  RH: ReactHotkeys;
  hotkey: HotKeyDefChordBase | HotKeyDefSequenceBase;
  callback: () => void;
  dependencies?: unknown[];
  options?: HotkeyOptions;
};

const Wrapper = ({
  RH,
  hotkey,
  callback,
  dependencies,
  options,
}: HotkeyHarnessProps) => {
  const { useHotkey } = RH;

  useHotkey(hotkey, callback, dependencies, options);
  return null;
};

export function HotkeyHarness(props: HotkeyHarnessProps) {
  const { HotkeyProvider } = props.RH;

  return (
    <HotkeyProvider>
      <Wrapper {...props} />
    </HotkeyProvider>
  );
}
