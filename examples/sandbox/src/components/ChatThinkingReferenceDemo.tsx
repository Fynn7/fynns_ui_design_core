import { useState } from "react";
import { applyFynnsThemeMode, getFynnsThemeMode, Button, ChatThinking, BrainIcon, FileIcon, FolderOpenIcon, SearchIcon, type ChatThinkingDetail } from "@fynns/ui";

/** Reference fixture: the supplied Copilot anatomy, with generic sample names and the reference paragraph breaks.
 * 2× review magnification matches the reference image; production density is 1×. */
export function ChatThinkingReferenceDemo() {
  const [scale, setScale] = useState(2);
  const [theme, setTheme] = useState(getFynnsThemeMode);
  const details: ChatThinkingDetail[] = [
    { id: "developed", label: "Developed UI style system", summary: "and discovered style patterns", icon: <BrainIcon />, defaultOpen: true, details: [
      { id: "developing", label: "Developing UI Style System", defaultOpen: true, details: [
        { id: "developing-body", text: ["I'm focusing on identifying and defining the core elements of our preferred \"UI style\" from\nexisting projects like ", { code: "sample style explorer" }, ". The goal is to distill this into a flexible,\nbottom-layer format. This could manifest as design tokens, cursor rules, or even prompt-\nbased generation strategies for consistent application across future endeavors."] },
      ] },
      { id: "discovering", label: "Discovering Style Patterns", defaultOpen: true, details: [
        { id: "discovering-body", text: ["My current focus is on examining the ", { code: "sample_style_workspace" }, " project's frontend assets,\nparticularly within ", { code: "tools/sample-preview/" }, ", to identify recurring UI patterns. This is a\ncritical step to then abstract our preferred aesthetic into a digestible format for future AI\ndevelopment."] },
      ] },
    ] },
    { id: "package", label: "Read", icon: <FileIcon />, artifact: { label: "package.json", icon: <FileIcon /> } },
    { id: "investigating", label: "Investigating", summary: "Stack Details", icon: <BrainIcon /> },
    { id: "directory", label: "Read", icon: <SearchIcon />, artifact: { label: "sample-preview", icon: <FolderOpenIcon /> } },
  ];
  return <div className="fynns-scroll" style={{ height: "100dvh", overflowY: "auto" }}>
    <div style={{ paddingBlock: "calc(var(--fynns-chatmessage-thinking-reference-block-inset) * " + scale + ")", paddingInlineStart: "calc(var(--fynns-chatmessage-thinking-reference-inset) * " + scale + ")", minWidth: 0 }}>
      <div data-thinking-reference-preview style={{ zoom: scale }}>
        <ChatThinking label="Completed 23 steps in 1m 31s" defaultOpen details={details} />
      </div>
      <div className="fynns-control-cluster" style={{ marginBlockStart: "var(--fynns-chatmessage-thinking-group-gap)" }}>
        <Button variant="ghost" onClick={() => setScale(value => value === 2 ? 1 : 2)}>{scale === 2 ? "Normal density (1×)" : "Reference scale (2×)"}</Button>
        <Button variant="ghost" onClick={() => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); applyFynnsThemeMode(next, { persist: false }); }}>{theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}</Button>
      </div>
    </div>
  </div>;
}
