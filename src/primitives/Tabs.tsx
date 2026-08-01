import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";

export type TabItem<Id extends string> = {
  id: Id;
  label: ReactNode;
  disabled?: boolean;
};

export type TabsSize = "sm" | "md";

export type TabsProps<Id extends string> = {
  tabs: TabItem<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  ariaLabel?: string;
  className?: string;
  size?: TabsSize;
  fullWidth?: boolean;
};

function enabledIds<Id extends string>(tabs: TabItem<Id>[]): Id[] {
  return tabs.filter((t) => !t.disabled).map((t) => t.id);
}

/** Horizontal M3 primary tab strip. `.fynns-tabs` / `.fynns-tab`. Not a ToggleGroup. */
export function Tabs<Id extends string>({
  tabs,
  activeId,
  onChange,
  ariaLabel,
  className,
  size = "md",
  fullWidth = false,
}: TabsProps<Id>) {
  const listRef = useRef<HTMLDivElement>(null);

  const select = (id: Id) => {
    onChange(id);
    requestAnimationFrame(() => {
      const btn = listRef.current?.querySelector<HTMLElement>(
        `[role="tab"][data-tab-id="${CSS.escape(String(id))}"]`,
      );
      btn?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    const ids = enabledIds(tabs);
    if (ids.length === 0) return;
    const index = ids.indexOf(activeId);
    let next = index;
    if (event.key === "ArrowRight") next = index < 0 ? 0 : (index + 1) % ids.length;
    else if (event.key === "ArrowLeft")
      next = index < 0 ? ids.length - 1 : (index - 1 + ids.length) % ids.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ids.length - 1;
    if (next === index && ids[next] === activeId) return;
    event.preventDefault();
    select(ids[next]);
  };

  return (
    <div
      ref={listRef}
      className={[
        "fynns-tabs",
        size === "sm" ? "fynns-tabs--sm" : "",
        fullWidth ? "fynns-tabs--full" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab-id={tab.id}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={tab.disabled}
            className={["fynns-tab", active ? "fynns-tab--active" : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
