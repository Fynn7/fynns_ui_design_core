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
 * (identity FieldBlocks; Radio/Checkbox/Slider choice FieldBlocks;
 * Preference ControlBlocks; …). Do not leave a flat
 * Card-body list of FieldBlocks / ControlBlocks across topics.
 *
 * Gap base is `--fynns-layout-field-stack-gap` (**12dp**). Plain **FieldBlock**s
 * stay at 12dp. **FieldBlock**s with a trailing description/error (and no
 * choice cluster) open the next sibling to `--fynns-layout-unit-stack-gap`
 * (**16dp**). **FieldBlock**s that host a `.fynns-control-cluster` open to
 * `--fynns-layout-form-cluster-gap` (**32dp**). Sibling **ControlBlock**s
 * open to unit-stack (16dp) so Switch+note units breathe.
 *
 * **Header band max (hard):** when **any** sibling `FieldBlock` hosts label-row
 * `FieldHeader` actions (Textarea expand / reset), **every** header in the
 * stack uses `field-header-action-row-min-height` (32dp); label→control
 * stays on `field-hint-gap` (8dp). In-field icons → `Input` / `Select`
 * `trailing`, not label-row actions.
 *
 * **Strongly recommended between FieldStacks:** insert a horizontal `Divider`
 * on kind jumps (identity → choices → preferences). Card / Collapsible /
 * Dialog body `unit-stack-gap` on both sides of the rule already ≈ the
 * cluster step; keep the adjacent-stack margin rule when no Divider is used
 * so the visual total stays 32dp. Other host siblings stay on
 * `--fynns-layout-unit-stack-gap` (16dp).
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
