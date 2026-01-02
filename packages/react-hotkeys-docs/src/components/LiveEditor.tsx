import type {} from "@docusaurus/theme-live-codeblock";
import { HotkeyProvider } from "@selokhq/react-hotkeys";
import LiveCodeBlock from "@theme/LiveCodeBlock";
import { removeImports } from "../utils/removeImports";

export type LiveEditorProps = {
  code: string;
};

export const LiveEditor = ({ code }: LiveEditorProps) => {
  return (
    <HotkeyProvider>
      <LiveCodeBlock className="language-tsx">
        {removeImports(code)}
      </LiveCodeBlock>
    </HotkeyProvider>
  );
};
