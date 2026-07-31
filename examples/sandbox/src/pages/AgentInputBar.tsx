import { useState } from "react";
import {
  Button,
  IconButton,
  Input,
  SettingsIcon,
  Tooltip,
} from "@fynns/ui";
import { proposeFromPrompt, type PendingAgentProposal } from "../agent/bridge";
import { useLocale } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import { useTokenDraft } from "../state/TokenDraftProvider";

/**
 * Phase 4 stub: natural-language proposals become TokenOperations after
 * explicit user confirmation. Top-bar icon toggles an inline panel; no model
 * backend yet — local heuristics only.
 */
export function AgentInputBar() {
  const { t } = useLocale();
  const { apply } = useTokenDraft();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState<PendingAgentProposal[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const run = () => {
    const proposals = proposeFromPrompt(prompt);
    if (proposals.length === 0) {
      setStatus(t("agent.toastNone"));
      return;
    }
    setPending(proposals);
    setOpen(true);
    setStatus(t("agent.toastReady", { count: proposals.length }));
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
    setStatus(t("agent.toastApplied"));
    setPending([]);
    setPrompt("");
    setOpen(false);
  };

  const tooltip =
    pending.length > 0
      ? t("agent.tipPending", { count: pending.length })
      : t("agent.tipIdle");

  return (
    <div className="sandbox-agent">
      <Tooltip content={tooltip}>
        <IconButton
          aria-label={t("agent.triggerAria")}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={
            pending.length > 0
              ? "sandbox-agent-trigger sandbox-agent-trigger--pending"
              : "sandbox-agent-trigger"
          }
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          <SettingsIcon size={16} aria-hidden />
        </IconButton>
      </Tooltip>
      {open ? (
        <div className="sandbox-agent-panel sandbox-agent-panel--inline" role="dialog">
          <div className="sandbox-agent-row">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("agent.hint")}
              aria-label={t("agent.promptAria")}
              onKeyDown={(e) => {
                if (e.key === "Enter") run();
              }}
            />
            <Button size="sm" onClick={run}>
              {t("agent.propose")}
            </Button>
          </div>
          {status ? <p className="sandbox-muted">{status}</p> : null}
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
                  {t("agent.dismiss")}
                </Button>
                <Button size="sm" variant="primary" onClick={confirmAll}>
                  {t("agent.confirm")}
                </Button>
              </div>
            </div>
          ) : (
            <SandboxHelp text={t("agent.help")} />
          )}
        </div>
      ) : null}
    </div>
  );
}
