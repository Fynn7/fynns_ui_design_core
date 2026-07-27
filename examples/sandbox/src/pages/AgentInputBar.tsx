import { useState } from "react";
import { BotIcon, Button, Input, toast } from "@fynns/ui";
import { proposeFromPrompt, type PendingAgentProposal } from "../agent/bridge";
import { useLocale } from "../i18n";
import { useTokenDraft } from "../state/TokenDraftProvider";

/**
 * Phase 4 stub: natural-language proposals become TokenOperations after
 * explicit user confirmation. No model backend is wired yet — a local
 * heuristic parser demos the confirmation UX.
 */
export function AgentInputBar() {
  const { t } = useLocale();
  const { apply } = useTokenDraft();
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState<PendingAgentProposal[]>([]);

  const run = () => {
    const proposals = proposeFromPrompt(prompt);
    if (proposals.length === 0) {
      toast.warning(t("agent.toastNone"));
      return;
    }
    setPending(proposals);
    toast.info(t("agent.toastReady", { count: proposals.length }));
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
    toast.success(t("agent.toastApplied"));
    setPending([]);
    setPrompt("");
  };

  return (
    <div className="sandbox-agent-bar">
      <div className="sandbox-agent-row">
        <BotIcon size={18} aria-hidden />
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
        <p className="sandbox-help">{t("agent.help")}</p>
      )}
    </div>
  );
}
