import { useEffect, useRef, useState } from "react";
import { useTokenDraft } from "../state/TokenDraftProvider";

function parsePx(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 8;
}

type CornerRadiusHandleProps = {
  /** CSS variable key within the radius group, default md. */
  radiusKey?: string;
  min?: number;
  max?: number;
};

/**
 * Drag handle overlaid on the preview card's bottom-right corner.
 * Dragging changes `--fynns-radius-<key>` live; a floating readout shows dp/px.
 */
export function CornerRadiusHandle({ radiusKey = "md", min = 0, max = 28 }: CornerRadiusHandleProps) {
  const { apply, resolved } = useTokenDraft();
  const cssVar = `--fynns-radius-${radiusKey}`;
  const valuePx = parsePx(resolved(cssVar));
  const [dragging, setDragging] = useState(false);
  const [live, setLive] = useState(valuePx);
  const startRef = useRef({ x: 0, y: 0, value: valuePx });

  useEffect(() => {
    if (!dragging) setLive(valuePx);
  }, [valuePx, dragging]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      // Dragging outward (down-right) increases radius.
      const next = Math.round(
        Math.min(max, Math.max(min, startRef.current.value + (dx + dy) * 0.25)),
      );
      setLive(next);
      apply({
        group: "radius",
        key: radiusKey,
        value: `${next}px`,
        source: "drag",
      });
    };

    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, apply, radiusKey, min, max]);

  return (
    <div className="sandbox-corner-handle-wrap" aria-hidden={false}>
      <button
        type="button"
        className={["sandbox-corner-handle", dragging ? "sandbox-corner-handle--active" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-label={`Corner radius ${live} pixels. Drag to adjust.`}
        style={{
          // Visual cue: handle sits on the corner arc.
          borderBottomRightRadius: `${live}px`,
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          startRef.current = { x: event.clientX, y: event.clientY, value: live };
          setDragging(true);
        }}
      />
      <span className="sandbox-corner-readout" role="status">
        {live}px
      </span>
    </div>
  );
}
