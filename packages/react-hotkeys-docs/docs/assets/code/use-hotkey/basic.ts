import { Hotkey, useHotkey } from "@selokhq/react-hotkeys";

//@ts-expect-error 'Comp' is declared but its value is never read.
const Comp = () => {
  useHotkey(Hotkey.Chord.Mod.K, () => {
    console.log("CMD+K pressed!");
  });
};
