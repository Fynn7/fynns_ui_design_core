import { TokenDraftProvider } from "./state/TokenDraftProvider";
import { PlaygroundTargetProvider } from "./state/PlaygroundTargetProvider";
import { LocaleProvider } from "./i18n";
import { ChatThinkingReferenceDemo } from "./components/ChatThinkingReferenceDemo";
import { ChatThinkingDetailsDemo } from "./components/ChatThinkingDetailsDemo";
import { SandboxShell } from "./shell/SandboxShell";
import "./sandbox.css";

export function App() {
  return (
    <LocaleProvider>
      <TokenDraftProvider>
        <PlaygroundTargetProvider>
          {new URLSearchParams(window.location.search).get("demo") === "thinking-reference"
            ? <ChatThinkingReferenceDemo />
            : new URLSearchParams(window.location.search).get("demo") === "thinking-details"
            ? <ChatThinkingDetailsDemo inConversation />
            : <SandboxShell />}
        </PlaygroundTargetProvider>
      </TokenDraftProvider>
    </LocaleProvider>
  );
}
