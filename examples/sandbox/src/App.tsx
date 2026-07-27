import { TokenDraftProvider } from "./state/TokenDraftProvider";
import { RecipeDraftProvider } from "./state/RecipeDraftProvider";
import { PlaygroundTargetProvider } from "./state/PlaygroundTargetProvider";
import { SandboxShell } from "./shell/SandboxShell";
import "./sandbox.css";

export function App() {
  return (
    <TokenDraftProvider>
      <RecipeDraftProvider>
        <PlaygroundTargetProvider>
          <SandboxShell />
        </PlaygroundTargetProvider>
      </RecipeDraftProvider>
    </TokenDraftProvider>
  );
}
