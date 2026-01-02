import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { HotkeyContext } from "./HotkeyContext";
import { HotkeyRegistry } from "../HotkeyRegistry";
import type { HotkeyProviderProps } from "../types/hotkey/provider/HotkeyProviderProps";

export function HotkeyProvider({
  children,
  sequenceTimeout,
}: PropsWithChildren<HotkeyProviderProps>) {
  const [registry] = useState(new HotkeyRegistry(sequenceTimeout));

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) =>
      registry.handleKeydown(event);
    addEventListener("keydown", handleKeydown);

    return () => removeEventListener("keydown", handleKeydown);
  }, [registry, registry.handleKeydown]);

  return (
    <HotkeyContext.Provider value={{ registry: registry }}>
      {children}
    </HotkeyContext.Provider>
  );
}
