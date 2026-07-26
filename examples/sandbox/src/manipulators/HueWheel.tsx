import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Popover, Slider, Tooltip } from "@fynns/ui";
import {
  approxHueFromHex,
  hexToRgb,
  hslToHex,
  hueFromPointer,
} from "../theme/colorUtils";
import { useTokenDraft } from "../state/TokenDraftProvider";

/** Quick-pick hues kept on-brand (teal family + a few complementary accents). */
const HUE_PRESETS: Array<{ label: string; hue: number }> = [
  { label: "Teal", hue: 168 },
  { label: "Cyan", hue: 190 },
  { label: "Blue", hue: 210 },
  { label: "Violet", hue: 270 },
  { label: "Rose", hue: 340 },
  { label: "Amber", hue: 38 },
];

/**
 * Accent hue controls: preset chips stay on the inspector; the full hue ring
 * opens from a rainbow trigger chip (Popover). One coalesced undo step per gesture.
 */
export function HueWheel() {
  const { mergeOverrides, resolved } = useTokenDraft();
  const diskRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const hue = useMemo(() => {
    const accent = resolved("--fynns-color-accent");
    return approxHueFromHex(accent) ?? 168;
  }, [resolved]);

  const accentHex = useMemo(() => hslToHex(hue, 62, 50), [hue]);

  const setHue = useCallback(
    (nextHue: number) => {
      const h = ((nextHue % 360) + 360) % 360;
      const accent = hslToHex(h, 62, 50);
      const dim = hslToHex(h, 62, 40);
      const hover = hslToHex(h, 64, 54);
      const active = hslToHex(h, 60, 46);
      const rgb = hexToRgb(accent);
      if (!rgb) return;
      const [r, g, b] = rgb;
      mergeOverrides(
        {
          "--fynns-color-accent": accent,
          "--fynns-color-accent-dim": dim,
          "--fynns-color-accent-hover": hover,
          "--fynns-color-accent-active": active,
          "--fynns-color-accent-soft": `rgba(${r}, ${g}, ${b}, 0.18)`,
          "--fynns-color-accent-mid": `rgba(${r}, ${g}, ${b}, 0.5)`,
          "--fynns-color-accent-24": `rgba(${r}, ${g}, ${b}, 0.24)`,
          "--fynns-color-accent-42": `rgba(${r}, ${g}, ${b}, 0.42)`,
          "--fynns-color-accent-ring": `rgba(${r}, ${g}, ${b}, 0.4)`,
          "--fynns-color-focus": `rgba(${r}, ${g}, ${b}, 0.48)`,
        },
        { source: "colorwheel", coalesce: true, group: "color" },
      );
    },
    [mergeOverrides],
  );

  const pickFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const el = diskRef.current;
    if (!el) return;
    setHue(hueFromPointer(event.clientX, event.clientY, el.getBoundingClientRect()));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    pickFromPointer(event);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    pickFromPointer(event);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setHue(hue + step);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setHue(hue - step);
    } else if (event.key === "Home") {
      event.preventDefault();
      setHue(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHue(359);
    }
  };

  return (
    <div className="sandbox-hue-wheel">
      <div className="sandbox-hue-meta">
        <span>Accent hue</span>
        <code>
          {Math.round(hue)}° · {accentHex}
        </code>
      </div>

      <div className="sandbox-hue-presets" role="group" aria-label="Hue presets">
        {HUE_PRESETS.map((preset) => {
          const active = Math.abs(((hue - preset.hue + 540) % 360) - 180) < 8;
          const swatch = hslToHex(preset.hue, 62, 50);
          return (
            <Tooltip key={preset.label} content={preset.label} side="top">
              <button
                type="button"
                className={[
                  "sandbox-hue-preset",
                  active ? "sandbox-hue-preset--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`${preset.label} (${preset.hue}°)`}
                aria-pressed={active}
                style={{ background: swatch }}
                onClick={() => setHue(preset.hue)}
              />
            </Tooltip>
          );
        })}
        <Tooltip content="Open hue palette" side="top">
          <button
            ref={triggerRef}
            type="button"
            className={[
              "sandbox-hue-preset",
              "sandbox-hue-preset--palette",
              paletteOpen ? "sandbox-hue-preset--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="Open hue palette"
            aria-haspopup="dialog"
            aria-expanded={paletteOpen}
            onClick={() => setPaletteOpen((wasOpen) => !wasOpen)}
          />
        </Tooltip>
      </div>

      <Popover
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        anchorRef={triggerRef}
        side="bottom"
        align="start"
        className="sandbox-hue-popover"
      >
        <div
          ref={diskRef}
          className="sandbox-hue-disk"
          role="slider"
          tabIndex={0}
          aria-label="Accent hue palette"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(hue)}
          aria-valuetext={`${Math.round(hue)} degrees`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <div className="sandbox-hue-disk-ring" aria-hidden />
          <div
            className="sandbox-hue-disk-center"
            style={{ background: accentHex }}
            aria-hidden
          />
          <div
            className="sandbox-hue-disk-arm"
            style={{ transform: `rotate(${hue}deg)` }}
            aria-hidden
          >
            <span className="sandbox-hue-disk-marker" style={{ background: accentHex }} />
          </div>
        </div>
      </Popover>

      <Slider
        value={Math.round(hue)}
        min={0}
        max={360}
        step={1}
        ariaLabel="Accent hue"
        onChange={setHue}
      />
    </div>
  );
}
