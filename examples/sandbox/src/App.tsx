import { TokenDraftProvider } from "./state/TokenDraftProvider";
import { SandboxShell } from "./shell/SandboxShell";
import "./sandbox.css";

export function App() {
  return (
    <TokenDraftProvider>
      <SandboxShell />
    </TokenDraftProvider>
  );
}
