/**
 * Agent bridge stub (Phase 4).
 *
 * GUI and Agent are equal clients of the token draft store — both emit
 * TokenOperation payloads. This module defines the tool schema and a local
 * adapter interface without binding a model backend yet.
 */

import type { TokenGroup, TokenScope } from "../state/tokenDraft";
import { SANDBOX_LAYOUT_AGENT_CATALOG } from "../state/baseline";

export const ADJUST_TOKEN_TOOL = {
  name: "adjust_token",
  description:
    "Adjust one design token in the current sandbox draft. Applies immediately to the live preview after user confirmation. For gaps use layout unit-stack-gap / control-*-gap or sandbox (row-gap, section-gap, chrome-bar-height) — see SANDBOX_LAYOUT_AGENT_CATALOG; prefer .sandbox-stack / ControlStack; never invent ad-hoc gaps.",
  input_schema: {
    type: "object",
    properties: {
      group: {
        type: "string",
        enum: [
          "radius",
          "color",
          "elevation",
          "stateLayer",
          "spacing",
          "typography",
          "shadow",
          "layout",
          "sandbox",
        ],
      },
      key: {
        type: "string",
        description:
          "Token key within the group, e.g. 'md', 'accent', 'control-cluster-gap', or 'row-gap'.",
      },
      value: {
        type: "string",
        description: "New value, same unit/format as the existing token.",
      },
      scope: {
        type: "string",
        enum: ["global", "card-elevated", "card-filled", "card-outlined"],
      },
      reasoning: {
        type: "string",
        description: "One sentence explaining why this change matches the user request.",
      },
    },
    required: ["group", "key", "value", "scope", "reasoning"],
  },
} as const;

export const READ_CURRENT_TOKENS_TOOL = {
  name: "read_current_tokens",
  description:
    "Read the current resolved token values (baseline + draft overrides). Pass group sandbox or layout for chrome / unit-stack / toolbar rhythm gaps.",
  input_schema: {
    type: "object",
    properties: {
      group: {
        type: "string",
        enum: [
          "radius",
          "color",
          "elevation",
          "stateLayer",
          "spacing",
          "typography",
          "shadow",
          "layout",
          "sandbox",
        ],
      },
    },
    required: [],
  },
} as const;

/** Authoritative gap catalog for agents (re-exported). */
export { SANDBOX_LAYOUT_AGENT_CATALOG };

export const LIST_RECENT_OPERATIONS_TOOL = {
  name: "list_recent_operations",
  description: "List recent manual / agent token operations in the draft history.",
  input_schema: {
    type: "object",
    properties: {
      limit: { type: "number", description: "Max operations to return (default 20)." },
    },
    required: [],
  },
} as const;

export type AdjustTokenArgs = {
  group: TokenGroup;
  key: string;
  value: string;
  scope: TokenScope;
  reasoning: string;
};

export type PendingAgentProposal = AdjustTokenArgs & {
  id: string;
  createdAt: number;
};

/** Parse a natural-language intent into zero or more proposals (local heuristic stub). */
export function proposeFromPrompt(prompt: string): PendingAgentProposal[] {
  const lower = prompt.toLowerCase();
  const proposals: PendingAgentProposal[] = [];
  const now = Date.now();

  if (/rounder|more round|larger radius|bigger corner/.test(lower)) {
    proposals.push({
      id: `p-${now}-radius`,
      createdAt: now,
      group: "radius",
      key: "md",
      value: "12px",
      scope: "global",
      reasoning: "Increase global shape radius-md toward the M3 medium (12dp) default.",
    });
  }
  if (/sharper|less round|smaller radius|tighter corner/.test(lower)) {
    proposals.push({
      id: `p-${now}-radius-sm`,
      createdAt: now,
      group: "radius",
      key: "md",
      value: "6px",
      scope: "global",
      reasoning: "Reduce global shape radius-md for a more restrained silhouette.",
    });
  }
  if (/softer|gentler hover|less hover/.test(lower)) {
    proposals.push({
      id: `p-${now}-hover`,
      createdAt: now,
      group: "stateLayer",
      key: "hover",
      value: "6%",
      scope: "global",
      reasoning: "Lower hover state-layer opacity for a softer interactive feedback.",
    });
  }
  if (/stronger|more hover|punchier/.test(lower)) {
    proposals.push({
      id: `p-${now}-hover-up`,
      createdAt: now,
      group: "stateLayer",
      key: "hover",
      value: "12%",
      scope: "global",
      reasoning: "Raise hover state-layer opacity for clearer interactive feedback.",
    });
  }
  if (/more (row )?space|looser rows|larger row gap|easing.*(gap|space)/.test(lower)) {
    proposals.push({
      id: `p-${now}-row-gap`,
      createdAt: now,
      group: "sandbox",
      key: "row-gap",
      value: "1.5rem",
      scope: "global",
      reasoning: "Increase --sandbox-row-gap so wrapped demo rows (e.g. Motion easing) separate clearly.",
    });
  }

  return proposals;
}
