import type { HTMLAttributes, ReactNode } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type FieldStackProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Consecutive related `FieldBlock`s (Input / Select / Textarea / …), or a
   * same-kind cluster of `ControlBlock`s. Invisible — no border / surface.
   */
  children: ReactNode;
};

/**
 * Invisible cluster for consecutive **related** form units — the agent-facing
 * way to **semantically partition** inspector / settings / Dialog options.
 *
 * **Strongly recommended:** wrap same-kind siblings in one `FieldStack`
 * (identity FieldBlocks; Preference ControlBlocks; …). Do not leave a flat
 * Card-body list of FieldBlocks / ControlBlocks across topics.
 *
 * Gap is `--fynns-layout-field-stack-gap` (8dp — same step as
 * `control-stack-gap`). Sibling **ControlBlock**s inside one stack open to
 * `--fynns-layout-unit-stack-gap` (16dp) via CSS so Switch+note units breathe.
 * Adjacent FieldStacks use `--fynns-layout-form-cluster-gap` (32dp) — full
 * step on bare hosts; Card / Collapsible / Dialog body / `.fynns-unit-stack`
 * subtract the parent `unit-stack-gap` so the visual total stays 32dp. Other
 * host siblings stay on `--fynns-layout-unit-stack-gap` (16dp).
 *
 * Live recipe: sandbox Globals `#form-recipe` (Card / Collapsible / Dialog hosts).
 * Authority: AGENTS.md **FieldStack semantic clusters**.
 */
export function FieldStack({ children, className, ...rest }: FieldStackProps) {
  return (
    <div {...rest} className={join("fynns-field-stack", className)}>
      {children}
    </div>
  );
}
