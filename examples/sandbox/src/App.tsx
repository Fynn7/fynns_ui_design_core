import { TokenDraftProvider } from "./state/TokenDraftProvider";
import { PlaygroundTargetProvider } from "./state/PlaygroundTargetProvider";
import { LocaleProvider } from "./i18n";
import { SandboxShell } from "./shell/SandboxShell";
import "./sandbox.css";

export function App() {
  return (
    <LocaleProvider>
      <TokenDraftProvider>
        <PlaygroundTargetProvider>
          <SandboxShell />
        </PlaygroundTargetProvider>
      </TokenDraftProvider>
    </LocaleProvider>
  );
}
