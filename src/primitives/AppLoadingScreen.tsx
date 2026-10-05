import { useId, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useBlockingLoading } from "./useBlockingLoading";
import { useAppLoadingBrand } from "./useAppLoadingBrand";
import { Avatar, initialsFromName } from "./Avatar";

// Neutral core monogram; applications can provide their own transparent logo.
const DEFAULT_LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 52V12h32M16 32h26" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
)}`;

export type AppLoadingScreenProps = {
  /** Show only while the application starts or reinitializes. */
  open: boolean;
  /** Accessible-only startup status; no visible loading copy. */
  label: string;
  /** Configured project logo URL; omission detects page icons / manifest automatically. */
  logoSrc?: string;
  /** Initials-avatar identity. Omit to use application-name / document title. */
  name?: string;
};

/** Opaque application startup screen with a centered, alpha-masked logo sweep. */
export function AppLoadingScreen({ open, label, logoSrc, name }: AppLoadingScreenProps) {
  const labelId = useId();
  const { rootRef, onKeyDown } = useBlockingLoading(open);
  const brand = useAppLoadingBrand(open, logoSrc, name);
  if (!open || typeof document === "undefined") return null;
  const style = {
    "--fynns-app-loading-logo-source": `url(${JSON.stringify(brand.logo || DEFAULT_LOGO)})`,
  } as CSSProperties;
  const initials = !brand.logo && initialsFromName(brand.name);
  return createPortal(
    <div
      ref={rootRef}
      className="fynns-busy-scrim fynns-app-loading-screen"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby={labelId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      data-loading-logo-source={brand.logo ? "configured" : initials ? "initials" : "core"}
    >
      {initials ? <span aria-hidden="true">
        <Avatar name={brand.name} size="lg" className="fynns-app-loading-avatar" />
      </span> : <span className="fynns-app-loading-logo" style={style} aria-hidden="true" />}
      <span className="fynns-sr-only" id={labelId} role="status">{label}</span>
    </div>,
    document.body,
  );
}
