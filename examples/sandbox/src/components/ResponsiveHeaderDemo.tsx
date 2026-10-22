import { useState } from "react";
import {
  Button, Card, Collapsible, DownloadIcon, DropdownMenu, DropdownMenuItem,
  FieldHint, IconButton, ToggleGroup, Tooltip,
} from "@fynns/ui";

/** Dense header actions must adapt to the host, including nested helper groups. */
export function ResponsiveHeaderDemo() {
  const [mode, setMode] = useState("preview");
  const [version, setVersion] = useState("v2 | 2026.10.16 21:11:52");
  const [reviewed, setReviewed] = useState(false);
  const actions = (
    <div className="fynns-control-cluster">
      <ToggleGroup size="compact" showCheck={false} ariaLabel="Document view" value={mode}
        options={[{ value: "preview", label: "Preview" }, { value: "source", label: "Source" }]}
        onChange={setMode} />
      <div className="fynns-control-cluster">
        <DropdownMenu trigger={version} ariaLabel="Document version">
          <DropdownMenuItem onClick={() => setVersion("Current version")}>Current version</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setVersion("v2 | 2026.10.16 21:11:52")}>Saved version</DropdownMenuItem>
        </DropdownMenu>
        <Tooltip content="Download document">
          <IconButton size="sm" aria-label="Download document"><DownloadIcon aria-hidden /></IconButton>
        </Tooltip>
        <Button size="sm" onClick={() => setReviewed(true)}>Review this version</Button>
      </div>
    </div>
  );
  return (
    <div id="sandbox-header-actions-responsive" className="fynns-unit-stack">
      <Card title="Document history" actions={actions}>
        <FieldHint>{reviewed ? "Version ready for review." : "Narrow headers keep every action available."}</FieldHint>
      </Card>
      <Collapsible title="Review details" actions={actions} defaultOpen>
        <FieldHint>Actions remain separate from the disclosure trigger.</FieldHint>
      </Collapsible>
    </div>
  );
}
