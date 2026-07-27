import { useMemo, useRef, useState } from "react";
import {
  BotIcon,
  Button,
  IconButton,
  Input,
  Popover,
  toast,
  Tooltip,
} from "@fynns/ui";
import { proposeFromPrompt, type PendingAgentProposal } from "../agent/bridge";
import { useTokenDraft } from "../state/TokenDraftProvider";

/**
 * Phase 4 stub: natural-language proposals become TokenOperations after
 * explicit user confirmation. Top-bar icon opens a popover; no model backend
 * yet — local heuristics only.
 */
export function AgentInputBar() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { apply } = useTokenDraft();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState<PendingAgentProposal[]>([]);

  const hint = useMemo(
    () => 'Try: "make corners rounder" or "softer hover"',
    [],
  );

  const run = () => {
    const proposals = proposeFromPrompt(prompt);
    if (proposals.length === 0) {
      toast.warning("No structured proposals yet — refine the request or wait for a model backend.");
      return;
    }
    setPending(proposals);
    setOpen(true);
    toast.info(`${proposals.length} proposal(s) ready — confirm to apply.`);
  };

  const confirmAll = () => {
    for (const p of pending) {
      apply({
        group: p.group,
        key: p.key,
        value: p.value,
        scope: p.scope,
        source: "agent",
        reasoning: p.reasoning,
      });
    }
    toast.success("Agent proposals applied");
    setPending([]);
    setPrompt("");
    setOpen(false);
  };

  const tooltip =
    pending.length > 0
      ? `${pending.length} proposal(s) awaiting confirmation`
      : "Natural-language token proposals (local heuristics)";

  return (
    <>
      <Tooltip content={tooltip}>
        <IconButton
          ref={triggerRef}
          aria-label="Agent proposals"
          aria-haspopup="dialog"
          aria-expanded={open}
          className={
            pending.length > 0 ? "sandbox-agent-trigger sandbox-agent-trigger--pending" : "sandbox-agent-trigger"
          }
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          <BotIcon size={16} aria-hidden />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={triggerRef}
        side="bottom"
        align="end"
        className="sandbox-agent-popover"
      >
        <div className="sandbox-agent-panel">
          <div className="sandbox-agent-row">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={hint}
              aria-label="Agent prompt"
              onKeyDown={(e) => {
                if (e.key === "Enter") run();
              }}
            />
            <Button size="sm" onClick={run}>
              Propose
            </Button>
          </div>
          {pending.length > 0 ? (
            <div className="sandbox-agent-pending">
              {pending.map((p) => (
                <div key={p.id} className="sandbox-agent-proposal">
                  <code>
                    {p.group}.{p.key} → {p.value}
                  </code>
                  <span>{p.reasoning}</span>
                </div>
              ))}
              <div className="sandbox-agent-pending-actions">
                <Button size="sm" variant="ghost" onClick={() => setPending([])}>
                  Dismiss
                </Button>
                <Button size="sm" variant="primary" onClick={confirmAll}>
                  Confirm apply
                </Button>
              </div>
            </div>
          ) : (
            <p className="sandbox-help">
              Agent proposals require confirmation before they change tokens. Model backend
              is not wired yet — local heuristics only.
            </p>
          )}
        </div>
      </Popover>
    </>
  );
}
