import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DURATION_TOKENS } from "../theme/motionTokens";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Surface } from "./Surface";
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, CloseIcon, InfoIcon } from "./icons";
import type { InlineAlertSeverity } from "./InlineAlert";

export type WorkspaceNoticeAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export type WorkspaceNotice = {
  /** Stable condition/resource key. Updating the same id replaces its content. */
  id: string;
  message: ReactNode;
  severity: InlineAlertSeverity;
  dismissAriaLabel: string;
  /** Recovery stays inside this notice. Core renders only ghost actions. */
  actions?: readonly WorkspaceNoticeAction[];
};

export type WorkspaceNoticeStackProps = {
  notices: readonly WorkspaceNotice[];
  onDismiss: (id: string) => void;
  ariaLabel: string;
};

function severityIcon(severity: InlineAlertSeverity) {
  if (severity === "error") return <AlertCircleIcon />;
  if (severity === "warning") return <AlertTriangleIcon />;
  if (severity === "success") return <CheckCircleIcon />;
  return <InfoIcon />;
}

function NoticeEntry({ notice, open, onDismiss, onExited }: {
  notice: WorkspaceNotice; open: boolean;
  onDismiss: (id: string) => void; onExited: (id: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useLayoutEffect(() => {
    let frame2 = 0;
    if (open) {
      const frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => { cancelAnimationFrame(frame1); cancelAnimationFrame(frame2); };
    }
    setEntered(false);
    // CSS transition-end is primary; token-derived cleanup also works in hidden tabs.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raw = rootRef.current ? getComputedStyle(rootRef.current).transitionDuration : "";
    const durations = raw.split(",").map(value => {
      const number = Number.parseFloat(value) || 0;
      return value.trim().endsWith("ms") ? number : number * 1000;
    });
    const ms = reduced ? 0 : Math.max(...durations, Number.parseFloat(DURATION_TOKENS.base));
    const timer = window.setTimeout(() => onExited(notice.id), ms);
    return () => window.clearTimeout(timer);
  }, [open, notice.id, onExited]);
  return <div ref={rootRef} className="fynns-workspace-notice-entry"
    data-notice-id={notice.id} data-state={!open ? "exiting" : entered ? "open" : "entering"}
    inert={!open} aria-hidden={!open || undefined}
    onTransitionEnd={event => {
      if (!open && event.target === event.currentTarget && event.propertyName === "grid-template-rows") onExited(notice.id);
    }}>
    <div className="fynns-workspace-notice-clip">
      <Surface variant="filled" className={`fynns-workspace-notice fynns-workspace-notice--${notice.severity}`}
        role={notice.severity === "error" ? "alert" : "status"}>
        <div className="fynns-workspace-notice-message">
          <span className="fynns-workspace-notice-icon" aria-hidden>{severityIcon(notice.severity)}</span>
          <span className="fynns-workspace-notice-text">{notice.message}</span>
          <IconButton variant="ghost" size="sm" aria-label={notice.dismissAriaLabel}
            onClick={() => onDismiss(notice.id)}><CloseIcon aria-hidden /></IconButton>
        </div>
        {!!notice.actions?.length && <div className="fynns-control-cluster fynns-control-cluster--start-align">
          {notice.actions.map((action, index) => <Button key={`${action.label}-${index}`} variant="ghost"
            disabled={action.disabled} onClick={action.onClick}>{action.icon}{action.label}</Button>)}
        </div>}
      </Surface>
    </div>
  </div>;
}

/**
 * Persistent workspace feedback only. Mount inside a relative
 * `.fynns-workspace-canvas` and keep mounted when notices is empty.
 * Core owns top/end 16dp inset, content width, independent ghost X/recovery,
 * stable arrival order, duplicate ids, bounded scrolling and enter/exit/reflow.
 * Removing a notice retains its exit frame; reduced motion removes immediately.
 * onDismiss removes presentation only: the app must preserve unresolved errors.
 * Ordinary operation failures still default to snackbar, not this stack.
 */
export function WorkspaceNoticeStack({ notices, onDismiss, ariaLabel }: WorkspaceNoticeStackProps) {
  const unique = useMemo(() => [...new Map(notices.map(notice => [notice.id, notice])).values()], [notices]);
  const active = new Map(unique.map(notice => [notice.id, notice]));
  const activeRef = useRef(active);
  activeRef.current = active;
  const rootRef = useRef<HTMLDivElement>(null);
  const [retained, setRetained] = useState(unique);
  useLayoutEffect(() => {
    setRetained(previous => {
      const ids = new Set(previous.map(notice => notice.id));
      const current = new Map(unique.map(notice => [notice.id, notice]));
      return [...previous.map(notice => current.get(notice.id) ?? notice), ...unique.filter(notice => !ids.has(notice.id))];
    });
  }, [unique]);
  const onExited = useCallback((id: string) => {
    if (!activeRef.current.has(id)) setRetained(previous => previous.filter(notice => notice.id !== id));
  }, []);
  const dismiss = (id: string) => {
    const root = rootRef.current;
    const focusedEntry = document.activeElement?.closest<HTMLElement>(".fynns-workspace-notice-entry");
    if (root && focusedEntry?.dataset.noticeId === id && root.contains(focusedEntry)) {
      const entries = [...root.querySelectorAll<HTMLElement>(".fynns-workspace-notice-entry")];
      const index = entries.indexOf(focusedEntry);
      const next = [...entries.slice(index + 1), ...entries.slice(0, index).reverse()]
        .find(entry => activeRef.current.has(entry.dataset.noticeId ?? ""));
      const canvas = root.closest<HTMLElement>(".fynns-workspace-canvas");
      (next?.querySelector<HTMLButtonElement>(".fynns-workspace-notice-message button") ??
        canvas?.querySelector<HTMLButtonElement>(".fynns-workspace-tools button") ?? canvas)?.focus({ preventScroll: true });
      if (next) next.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    onDismiss(id);
  };
  if (!retained.length) return null;
  return <div ref={rootRef} className="fynns-workspace-notice-stack fynns-scroll"
    role="region" aria-label={ariaLabel}>
    {retained.map(previous => <NoticeEntry key={previous.id} notice={active.get(previous.id) ?? previous}
      open={active.has(previous.id)} onDismiss={dismiss} onExited={onExited} />)}
  </div>;
}
