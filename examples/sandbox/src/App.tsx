import { TokenDraftProvider } from "./state/TokenDraftProvider";
import { LocaleProvider } from "./i18n";
import { SandboxShell } from "./shell/SandboxShell";
import "./sandbox.css";

export function App() {
  return (
    <LocaleProvider>
      <TokenDraftProvider>
        <SandboxShell />
      </TokenDraftProvider>
    </LocaleProvider>
  );
}
