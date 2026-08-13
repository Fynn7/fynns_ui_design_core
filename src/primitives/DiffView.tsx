import type { CSSProperties } from "react";

export type DiffLineKind = "add" | "del" | "same" | "meta";

export type DiffViewLine = {
  type: DiffLineKind;
  text: string;
};

export type DiffViewProps = {
  lines: DiffViewLine[];
  /** Scroll host max height. Default `320`. */
  maxHeight?: number | string;
  className?: string;
};

const LINE_CLASS: Record<DiffLineKind, string> = {
  add: "fynns-diff-view-line--add",
  del: "fynns-diff-view-line--del",
  same: "",
  meta: "fynns-diff-view-line--meta",
};

/**
 * Minimal scrollable unified-diff panel: monospace lines colored by
 * add / del / meta. Callers own prefix markers (`+` / `-`) in `text`.
 */
export function DiffView({
  lines,
  maxHeight = 320,
  className,
}: DiffViewProps) {
  const style: CSSProperties = {
    maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
  };

  return (
    <pre
      className={["fynns-diff-view", "fynns-scroll", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {lines.map((line, idx) => (
        <div
          key={idx}
          className={["fynns-diff-view-line", LINE_CLASS[line.type]]
            .filter(Boolean)
            .join(" ")}
        >
          {line.text || " "}
        </div>
      ))}
    </pre>
  );
}
