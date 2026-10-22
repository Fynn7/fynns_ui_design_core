import { useId, useState } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, ChevronDownIcon, ChevronRightIcon, CloseIcon, InfoIcon } from "./icons";
import type { InlineAlertSeverity } from "./InlineAlert";

export type SectionNoticeAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export type SectionNoticeProps = {
  severity: InlineAlertSeverity;
  message: string;
  heading?: string;
  /** Plain text only. Core owns disclosure, layout and keyboard behavior. */
  details?: { text: string; showLabel: string; hideLabel: string };
  /** At most two lightweight actions, separate from message and details. */
  actions?: readonly [SectionNoticeAction, SectionNoticeAction?];
  /** Hide presentation only; never clear unresolved business state. */
  onDismiss?: () => void;
  dismissAriaLabel?: string;
};

/** In-flow actionable section feedback. No children/ReactNode slots: never nest
 * controls, lists or a Collapsible inside InlineAlert to recreate this pattern.
 * Transient feedback uses snackbar; canvas overlays use WorkspaceNoticeStack.
 */
export function SectionNotice({ severity, message, heading, details, actions, onDismiss, dismissAriaLabel = "Dismiss" }: SectionNoticeProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const Icon = severity === "error" ? AlertCircleIcon : severity === "warning" ? AlertTriangleIcon : severity === "success" ? CheckCircleIcon : InfoIcon;
  return <div className={`fynns-section-notice fynns-section-notice--${severity}`}>
    <div className="fynns-section-notice__summary" role={severity === "error" ? "alert" : "status"}>
      <span className="fynns-section-notice__icon" aria-hidden><Icon size={20} /></span>
      <div className="fynns-section-notice__copy">
        {heading && <strong className="fynns-section-notice__heading">{heading}</strong>}
        <p className="fynns-section-notice__message">{message}</p>
      </div>
    </div>
    {onDismiss && <IconButton className="fynns-section-notice__dismiss" variant="ghost" size="sm" aria-label={dismissAriaLabel} onClick={onDismiss}><CloseIcon aria-hidden /></IconButton>}
    {(details || actions?.length) && <div className="fynns-section-notice__actions fynns-control-cluster fynns-control-cluster--start-align">
      {details && <Button size="sm" variant="ghost" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(value => !value)}>
        {expanded ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}{expanded ? details.hideLabel : details.showLabel}
      </Button>}
      {actions?.map(action => action && <Button key={action.label} size="sm" variant="ghost" disabled={action.disabled} onClick={action.onClick}>{action.label}</Button>)}
    </div>}
    {details && <div id={detailsId} className="fynns-section-notice__details" hidden={!expanded}>{details.text}</div>}
  </div>;
}
