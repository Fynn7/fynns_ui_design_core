import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Input, Slider, Tooltip } from "@fynns/ui";
import { useLocale, type MessageKey } from "../i18n";
import {
  approxHueFromHex,
  hexToRgb,
  hslToHex,
  hueFromPointer,
  normalizeHex,
} from "../theme/colorUtils";
import { useTokenDraft } from "../state/TokenDraftProvider";

/** Quick-pick hues kept on-brand (teal family + a few complementary accents). */
const HUE_PRESETS: Array<{ labelKey: MessageKey; hue: number }> = [
  { labelKey: "hue.teal", hue: 168 },
  { labelKey: "hue.cyan", hue: 190 },
  { labelKey: "hue.blue", hue: 210 },
  { labelKey: "hue.violet", hue: 270 },
  { labelKey: "hue.rose", hue: 340 },
  { labelKey: "hue.amber", hue: 38 },
];

/**
 * Linear hue slider / aria max. 360° ≡ 0° on the circle; a range input with
 * `max={360}` snaps the thumb from the far right back to 0 when the value
 * wraps — use 359 so the rightmost stop stays put (matches disk End key).
 */
const HUE_DEGREE_MAX = 359;

const ACCENT_INLINE_KEYS = [
  "--fynns-color-accent",
  "--fynns-color-accent-dim",
  "--fynns-color-accent-hover",
  "--fynns-color-accent-active",
  "--fynns-color-accent-soft",
  "--fynns-color-accent-mid",
  "--fynns-color-accent-24",
  "--fynns-color-accent-42",
  "--fynns-color-accent-ring",
  "--fynns-color-focus",
] as const;

function buildAccentPatch(accent: string): Record<string, string> | null {
  const rgb = hexToRgb(accent);
  if (!rgb) return null;
  const h = approxHueFromHex(accent) ?? 168;
  const [r, g, b] = rgb;
  return {
    "--fynns-color-accent": accent,
    "--fynns-color-accent-dim": hslToHex(h, 62, 40),
    "--fynns-color-accent-hover": hslToHex(h, 64, 54),
    "--fynns-color-accent-active": hslToHex(h, 60, 46),
    "--fynns-color-accent-soft": `rgba(${r}, ${g}, ${b}, 0.18)`,
    "--fynns-color-accent-mid": `rgba(${r}, ${g}, ${b}, 0.5)`,
    "--fynns-color-accent-24": `rgba(${r}, ${g}, ${b}, 0.24)`,
    "--fynns-color-accent-42": `rgba(${r}, ${g}, ${b}, 0.42)`,
    "--fynns-color-accent-ring": `rgba(${r}, ${g}, ${b}, 0.18)`,
    "--fynns-color-focus": `rgba(${r}, ${g}, ${b}, 0.22)`,
  };
}

function paintAccentInline(patch: Record<string, string>) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(patch)) {
    root.style.setProperty(key, value);
  }
}

function clearAccentInline() {
  const root = document.documentElement;
  for (const key of ACCENT_INLINE_KEYS) {
    root.style.removeProperty(key);
  }
}

/**
 * Accent hue controls: preset chips stay on the inspector; the full hue ring
 * opens from a rainbow trigger chip (inline panel). Degree and hex fields edit
 * independently. One coalesced undo step per gesture.
 *
 * Continuous gestures (disk / slider) paint via `documentElement.style` so
 * `#fynns-sandbox-overrides` is not rewritten every pointermove; draft commit
 * happens on pointerup / after a short slider debounce.
 */
export function HueWheel() {
  const { t } = useLocale();
  const { mergeOverrides, resolved } = useTokenDraft();
  const diskRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);
  const pendingAccentRef = useRef<string | null>(null);
  const sliderCommitTimerRef = useRef<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hueDraft, setHueDraft] = useState<string | null>(null);
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  /** Local accent while a continuous gesture is in flight (inline CSS). */
  const [gestureAccent, setGestureAccent] = useState<string | null>(null);

  const draftAccentHex = useMemo(() => {
    const raw = resolved("--fynns-color-accent");
    return normalizeHex(raw) ?? "#2dd4bf";
  }, [resolved]);

  const accentHex = gestureAccent ?? draftAccentHex;
  const hue = useMemo(() => approxHueFromHex(accentHex) ?? 168, [accentHex]);

  useEffect(() => {
    setHueDraft(null);
    setHexDraft(null);
  }, [draftAccentHex]);

  /** Clear inline paint once the stylesheet owns the committed accent. */
  useEffect(() => {
    if (!gestureAccent) return;
    if (normalizeHex(draftAccentHex) !== normalizeHex(gestureAccent)) return;
    clearAccentInline();
    setGestureAccent(null);
    pendingAccentRef.current = null;
  }, [draftAccentHex, gestureAccent]);

  useEffect(
    () => () => {
      if (sliderCommitTimerRef.current != null) {
        window.clearTimeout(sliderCommitTimerRef.current);
      }
      clearAccentInline();
    },
    [],
  );

  const commitAccentHex = useCallback(
    (accent: string) => {
      const patch = buildAccentPatch(accent);
      if (!patch) return;
      mergeOverrides(patch, {
        source: "colorwheel",
        coalesce: true,
        group: "color",
      });
      pendingAccentRef.current = accent;
      setGestureAccent(accent);
      // Inline stays until draftAccentHex catches up (avoids flash).
      paintAccentInline(patch);
    },
    [mergeOverrides],
  );

  const previewAccentHex = useCallback((accent: string) => {
    const patch = buildAccentPatch(accent);
    if (!patch) return;
    paintAccentInline(patch);
    pendingAccentRef.current = accent;
    setGestureAccent(accent);
  }, []);

  const flushPendingCommit = useCallback(() => {
    const accent = pendingAccentRef.current;
    if (!accent) return;
    commitAccentHex(accent);
  }, [commitAccentHex]);

  const setHue = useCallback(
    (nextHue: number, mode: "preview" | "commit" = "commit") => {
      const h = ((nextHue % 360) + 360) % 360;
      const accent = hslToHex(h, 62, 50);
      if (mode === "preview") previewAccentHex(accent);
      else commitAccentHex(accent);
    },
    [commitAccentHex, previewAccentHex],
  );

  const commitHueDraft = () => {
    if (hueDraft == null) return;
    const cleaned = hueDraft.replace(/°/g, "").trim();
    const n = Number.parseFloat(cleaned);
    if (!Number.isFinite(n)) {
      setHueDraft(null);
      return;
    }
    setHue(n, "commit");
    setHueDraft(null);
  };

  const commitHexDraft = () => {
    if (hexDraft == null) return;
    const normalized = normalizeHex(hexDraft);
    if (!normalized) {
      setHexDraft(null);
      return;
    }
    commitAccentHex(normalized);
    setHexDraft(null);
  };

  const pickFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const el = diskRef.current;
    if (!el) return;
    setHue(
      hueFromPointer(event.clientX, event.clientY, el.getBoundingClientRect()),
      "preview",
    );
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
    flushPendingCommit();
  };

  const onDiskKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setHue(hue + step, "commit");
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setHue(hue - step, "commit");
    } else if (event.key === "Home") {
      event.preventDefault();
      setHue(0, "commit");
    } else if (event.key === "End") {
      event.preventDefault();
      setHue(HUE_DEGREE_MAX, "commit");
    }
  };

  const onSliderChange = (next: number) => {
    setHue(next, "preview");
    if (sliderCommitTimerRef.current != null) {
      window.clearTimeout(sliderCommitTimerRef.current);
    }
    sliderCommitTimerRef.current = window.setTimeout(() => {
      sliderCommitTimerRef.current = null;
      flushPendingCommit();
    }, 80);
  };

  return (
    <div className="sandbox-hue-wheel">
      <div className="sandbox-hue-meta">
        <span>{t("hue.slider")}</span>
        <div className="sandbox-hue-fields">
          <label className="sandbox-hue-field">
            <span className="fynns-sr-only">{t("hue.degreeField")}</span>
            <Input
              className="sandbox-hue-input sandbox-hue-input--deg"
              inputMode="numeric"
              spellCheck={false}
              aria-label={t("hue.degreeField")}
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
            <span className="fynns-sr-only">{t("hue.hexField")}</span>
            <Input
              className="sandbox-hue-input sandbox-hue-input--hex"
              spellCheck={false}
              aria-label={t("hue.hexField")}
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

      <div className="sandbox-hue-presets" role="group" aria-label={t("hue.presetsAria")}>
        {HUE_PRESETS.map((preset) => {
          const label = t(preset.labelKey);
          const active = Math.abs(((hue - preset.hue + 540) % 360) - 180) < 8;
          const swatch = hslToHex(preset.hue, 62, 50);
          return (
            <Tooltip key={preset.labelKey} content={label} side="top">
              <button
                type="button"
                className={[
                  "sandbox-hue-preset",
                  active ? "sandbox-hue-preset--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`${label} (${preset.hue}°)`}
                aria-pressed={active}
                style={{ background: swatch }}
                onClick={() => setHue(preset.hue, "commit")}
              />
            </Tooltip>
          );
        })}
        <Tooltip content={t("hue.openPalette")} side="top">
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
            aria-label={t("hue.openPalette")}
            aria-haspopup="true"
            aria-expanded={paletteOpen}
            onClick={() => setPaletteOpen((wasOpen) => !wasOpen)}
          />
        </Tooltip>
      </div>

      {paletteOpen ? (
        <div
          className="sandbox-hue-popover sandbox-hue-popover--inline"
          role="region"
          aria-label={t("hue.paletteAria")}
        >
          <div
            ref={diskRef}
            className="sandbox-hue-disk"
            role="slider"
            tabIndex={0}
            aria-label={t("hue.paletteAria")}
            aria-valuemin={0}
            aria-valuemax={HUE_DEGREE_MAX}
            aria-valuenow={Math.min(HUE_DEGREE_MAX, Math.round(hue) % 360)}
            aria-valuetext={t("hue.degrees", { n: Math.round(hue) })}
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
              <span
                className="sandbox-hue-disk-marker"
                style={{ background: accentHex }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <Slider
        value={Math.min(HUE_DEGREE_MAX, ((Math.round(hue) % 360) + 360) % 360)}
        min={0}
        max={HUE_DEGREE_MAX}
        step={1}
        ariaLabel={t("hue.slider")}
        onChange={onSliderChange}
      />
    </div>
  );
}
