import { TokenDraftProvider } from "./state/TokenDraftProvider";
import { RecipeDraftProvider } from "./state/RecipeDraftProvider";
import { PlaygroundTargetProvider } from "./state/PlaygroundTargetProvider";
import { LocaleProvider } from "./i18n";
import { SandboxShell } from "./shell/SandboxShell";
import "./sandbox.css";

export function App() {
  return (
    <LocaleProvider>
      <TokenDraftProvider>
        <RecipeDraftProvider>
          <PlaygroundTargetProvider>
            <SandboxShell />
          </PlaygroundTargetProvider>
        </RecipeDraftProvider>
      </TokenDraftProvider>
    </LocaleProvider>
  );
}
