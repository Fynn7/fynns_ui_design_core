import { Toaster } from "@fynns/ui";
import { ControlsPanel } from "./ControlsPanel";
import { PreviewStage } from "./PreviewStage";
import { useAestheticPreset } from "./useAestheticPreset";

export function App() {
  const controller = useAestheticPreset();

  return (
    <div className="fynns-sandbox-app">
      <aside className="fynns-sandbox-sidebar" aria-label="Aesthetic controls">
        <ControlsPanel controller={controller} />
      </aside>
      <PreviewStage controller={controller} />
      <Toaster />
    </div>
  );
}
