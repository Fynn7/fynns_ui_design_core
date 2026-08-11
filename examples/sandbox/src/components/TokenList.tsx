import { DURATION_TOKENS, EASING_TOKENS, TOKEN_GROUPS } from "@fynns/ui";
import { Collapsible } from "@fynns/ui";
import { useTokenDraft } from "../state/TokenDraftProvider";

type TokenListProps = {
  /** TOKEN_GROUPS prefix, e.g. `chat`, `navdrawer`, `fab`. */
  group: string;
  /** Optional Collapsible title override. */
  title?: string;
  /** Limit keys when a group is huge (optional). */
  keys?: readonly string[];
};

/**
 * Compact read-only list of `--fynns-<group>-*` for Globals demos.
 * Editable drafts still go through Apply / inspectors — this only makes tokens visible.
 */
export function TokenList({ group, title, keys }: TokenListProps) {
  const { resolved } = useTokenDraft();
  const entry = TOKEN_GROUPS.find(([g]) => g === group);
  if (!entry) return null;
  const [, table] = entry;
  const allKeys = keys ?? Object.keys(table);
  const label = title ?? `Tokens · ${group}`;

  return (
    <Collapsible title={label} defaultOpen={false} className="sandbox-token-list-host">
      <ul className="sandbox-token-list fynns-scroll">
        {allKeys.map((key) => {
          const cssVar = `--fynns-${group}-${key}`;
          const value = resolved(cssVar) || table[key] || "—";
          return (
            <li key={key}>
              <code className="sandbox-token-list-name">{cssVar}</code>
              <code className="sandbox-token-list-value">{value}</code>
            </li>
          );
        })}
      </ul>
    </Collapsible>
  );
}

/** Duration ladder from `DURATION_TOKENS` (Motion page). */
export function DurationTokenTable() {
  return (
    <table className="sandbox-token-table">
      <thead>
        <tr>
          <th scope="col">key</th>
          <th scope="col">value</th>
        </tr>
      </thead>
      <tbody>
        {(Object.keys(DURATION_TOKENS) as Array<keyof typeof DURATION_TOKENS>).map((key) => (
          <tr key={key}>
            <td>
              <code>--fynns-duration-{key}</code>
            </td>
            <td>
              <code>{DURATION_TOKENS[key]}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Ease keys for Motion (includes standard). */
export function easingDemoList(): ReadonlyArray<{ label: string; token: string }> {
  return (Object.keys(EASING_TOKENS) as Array<keyof typeof EASING_TOKENS>).map((key) => ({
    label: `ease-${key}`,
    token: `var(--fynns-ease-${key})`,
  }));
}
