import type { ReactNode } from "react";

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

/** Horizontal tab strip. `.fynns-tabs` / `.fynns-tab`. */
export function Tabs<Id extends string>({
  tabs,
  activeId,
  onChange,
  ariaLabel,
  className,
  size = "md",
  fullWidth = false,
}: TabsProps<Id>) {
  return (
    <div
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
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
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
