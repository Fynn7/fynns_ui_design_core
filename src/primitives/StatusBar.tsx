import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

export type StatusBarProps = HTMLAttributes<HTMLElement> & {
  /**
   * Start-aligned status chips (branch, language, path…). Prefer
   * `StatusBarItem` children.
   */
  leading?: ReactNode;
  /**
   * End-aligned status chips (diagnostics, encoding, line:col…). Prefer
   * `StatusBarItem` children.
   */
  trailing?: ReactNode;
  /**
   * Freeform body when not using `leading` / `trailing`. Ignored when either
   * slot is provided.
   */
  children?: ReactNode;
};

type StatusBarItemShared = {
  children: ReactNode;
  className?: string;
};

export type StatusBarItemProps = StatusBarItemShared &
  (
    | ({
        onClick: NonNullable<
          ButtonHTMLAttributes<HTMLButtonElement>["onClick"]
        >;
      } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "type" | "children" | "className" | "onClick"
      >)
    | ({
        onClick?: undefined;
      } & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className">)
  );

/**
 * IDE-style status strip (Cursor / VS Code bottom bar) — ~22dp, edge-flush,
 * muted caption type. Put at the **bottom of the app shell** (under main /
 * EndAside), not inside a Card.
 *
 * **Not** `BottomAppBar` (56dp actions + optional FAB) and **not** `Banner`
 * (severity messaging). Sticky positioning is left to the caller.
 *
 * @example
 * ```tsx
 * <StatusBar
 *   leading={<StatusBarItem>main</StatusBarItem>}
 *   trailing={
 *     <>
 *       <StatusBarItem onClick={openProblems}>3 problems</StatusBarItem>
 *       <StatusBarItem>UTF-8</StatusBarItem>
 *     </>
 *   }
 * />
 * ```
 */
export function StatusBar({
  leading,
  trailing,
  children,
  className,
  ...rest
}: StatusBarProps) {
  const useSlots = leading != null || trailing != null;
  const rootClass = ["fynns-status-bar", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <footer {...rest} className={rootClass}>
      {useSlots ? (
        <>
          <div className="fynns-status-bar-leading">{leading}</div>
          <div className="fynns-status-bar-trailing">{trailing}</div>
        </>
      ) : (
        children
      )}
    </footer>
  );
}

/**
 * One status chip inside `StatusBar`. Interactive when `onClick` is set
 * (opens problems panel, switches encoding, …).
 */
export function StatusBarItem(props: StatusBarItemProps) {
  const { children, className, onClick, ...rest } = props;
  const interactive = onClick != null;
  const itemClass = [
    "fynns-status-bar-item",
    interactive ? "fynns-status-bar-item--interactive" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!interactive) {
    return (
      <span
        className={itemClass}
        {...(rest as HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      className={itemClass}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
