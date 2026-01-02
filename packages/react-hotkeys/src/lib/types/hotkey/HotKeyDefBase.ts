import type { HotkeyOptions } from "./HotkeyOptions";

export type HotKeyDefBase = {
  id: string;
  callback: () => void;
  options: HotkeyOptions;
};
