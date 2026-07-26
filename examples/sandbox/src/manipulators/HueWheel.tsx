import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Input, Popover, Slider, Tooltip } from "@fynns/ui";
import {
  approxHueFromHex,
  hexToRgb,
  hslToHex,
  hueFromPointer,
  normalizeHex,
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
 * Linear hue slider / aria max. 360° ≡ 0° on the circle; a range input with
 * `max={360}` snaps the thumb from the far right back to 0 when the value
 * wraps — use 359 so the rightmost stop stays put (matches disk End key).
 */
const HUE_DEGREE_MAX = 359;

/**
 * Accent hue controls: preset chips stay on the inspector; the full hue ring
 * opens from a rainbow trigger chip (Popover). Degree and hex fields edit
 * independently. One coalesced undo step per gesture.
 */
export function HueWheel() {
  const { mergeOverrides, resolved } = useTokenDraft();
  const diskRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hueDraft, setHueDraft] = useState<string | null>(null);
  const [hexDraft, setHexDraft] = useState<string | null>(null);

  const accentHex = useMemo(() => {
    const raw = resolved("--fynns-color-accent");
    return normalizeHex(raw) ?? "#2dd4bf";
  }, [resolved]);

  const hue = useMemo(() => approxHueFromHex(accentHex) ?? 168, [accentHex]);

  useEffect(() => {
    setHueDraft(null);
    setHexDraft(null);
  }, [accentHex]);

  const applyAccentHex = useCallback(
    (accent: string) => {
      const rgb = hexToRgb(accent);
      if (!rgb) return;
      const h = approxHueFromHex(accent) ?? 168;
      const [r, g, b] = rgb;
      mergeOverrides(
        {
          "--fynns-color-accent": accent,
          "--fynns-color-accent-dim": hslToHex(h, 62, 40),
          "--fynns-color-accent-hover": hslToHex(h, 64, 54),
          "--fynns-color-accent-active": hslToHex(h, 60, 46),
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

  const setHue = useCallback(
    (nextHue: number) => {
      // Hue is a circle: 360° ≡ 0°. Keep the stored angle in [0, 360).
      const h = ((nextHue % 360) + 360) % 360;
      applyAccentHex(hslToHex(h, 62, 50));
    },
    [applyAccentHex],
  );

  const commitHueDraft = () => {
    if (hueDraft == null) return;
    const cleaned = hueDraft.replace(/°/g, "").trim();
    const n = Number.parseFloat(cleaned);
    if (!Number.isFinite(n)) {
      setHueDraft(null);
      return;
    }
    setHue(n);
    setHueDraft(null);
  };

  const commitHexDraft = () => {
    if (hexDraft == null) return;
    const normalized = normalizeHex(hexDraft);
    if (!normalized) {
      setHexDraft(null);
      return;
    }
    applyAccentHex(normalized);
    setHexDraft(null);
  };

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

  const onDiskKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
      setHue(HUE_DEGREE_MAX);
    }
  };

  return (
    <div className="sandbox-hue-wheel">
      <div className="sandbox-hue-meta">
        <span>Accent hue</span>
        <div className="sandbox-hue-fields">
          <label className="sandbox-hue-field">
            <span className="fynns-sr-only">Hue degrees</span>
            <Input
              className="sandbox-hue-input sandbox-hue-input--deg"
              inputMode="numeric"
              spellCheck={false}
              aria-label="Hue degrees"
              value={hueDraft ?? `${Math.round(hue)}°`}
              onChange={(event) => setHueDraft(event.target.value)}
              onFocus={(event) => {
                if (hueDraft == null) setHueDraft(String(Math.round(hue)));
                event.target.select();
              }}
              onBlur={commitHueDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  (event.target as HTMLInputElement).blur();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setHueDraft(null);
                  (event.target as HTMLInputElement).blur();
                }
              }}
            />
          </label>
          <label className="sandbox-hue-field">
            <span className="fynns-sr-only">Accent hex</span>
            <Input
              className="sandbox-hue-input sandbox-hue-input--hex"
              spellCheck={false}
              aria-label="Accent hex"
              value={hexDraft ?? accentHex}
              onChange={(event) => setHexDraft(event.target.value)}
              onFocus={(event) => {
                if (hexDraft == null) setHexDraft(accentHex);
                event.target.select();
              }}
              onBlur={commitHexDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  (event.target as HTMLInputElement).blur();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setHexDraft(null);
                  (event.target as HTMLInputElement).blur();
                }
              }}
            />
          </label>
        </div>
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
          aria-valuemax={HUE_DEGREE_MAX}
          aria-valuenow={Math.min(HUE_DEGREE_MAX, Math.round(hue) % 360)}
          aria-valuetext={`${Math.round(hue)} degrees`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onDiskKeyDown}
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
        value={Math.min(HUE_DEGREE_MAX, ((Math.round(hue) % 360) + 360) % 360)}
        min={0}
        max={HUE_DEGREE_MAX}
        step={1}
        ariaLabel="Accent hue"
        onChange={setHue}
      />
    </div>
  );
}
