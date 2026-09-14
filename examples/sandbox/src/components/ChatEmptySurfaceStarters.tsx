import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Surface } from "@fynns/ui";

export type ChatStarterItem = { id: string; label: string; prompt: string };

function ChatStarterSurfaceButton({
  item,
  onSelect,
  className,
  tabIndex,
  "aria-hidden": ariaHidden,
}: {
  item: ChatStarterItem;
  onSelect: (prompt: string) => void;
  className?: string;
  tabIndex?: number;
  "aria-hidden"?: boolean;
}) {
  return (
    <button
      type="button"
      className={["sandbox-chat-starter", className].filter(Boolean).join(" ")}
      onClick={() => onSelect(item.prompt)}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
    >
      <Surface variant="soft" padded interactive>
        <span className="sandbox-chat-starter-label">{item.label}</span>
        <span className="sandbox-chat-starter-prompt">{item.prompt}</span>
      </Surface>
    </button>
  );
}

/**
 * Empty-thread starter: full-width `Surface` soft well (app-owned rotate).
 * M3 Shared Axis Y (forward): incoming rises ~40% + fade (slow / ease-out);
 * outgoing absolute overlay exits up + fade (base / emphasized). Incoming
 * stays in-flow — no dual-absolute collapse or track transform snap-back.
 * Live: Globals `#chat`, Layouts `#layouts-demo-chat-product` / `#fill-column`.
 */
export function ChatEmptySurfaceStarters({
  items,
  ariaLabel,
  onSelect,
}: {
  items: ReadonlyArray<ChatStarterItem>;
  ariaLabel: string;
  onSelect: (prompt: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState<ChatStarterItem | null>(null);
  const [phase, setPhase] = useState<"idle" | "prepare" | "run">("idle");
  const [paused, setPaused] = useState(false);
  const inRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const phaseRef = useRef(phase);
  const reduceMotionRef = useRef(false);
  const n = items.length;
  indexRef.current = index;
  phaseRef.current = phase;

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const advance = useCallback(() => {
    if (n < 2 || phaseRef.current !== "idle") return;
    const from = indexRef.current;
    const to = (from + 1) % n;
    const fromItem = items[from]!;
    if (reduceMotionRef.current) {
      setIndex(to);
      return;
    }
    setOutgoing(fromItem);
    setIndex(to);
    setPhase("prepare");
  }, [n, items]);

  useLayoutEffect(() => {
    if (phase !== "prepare" || !outgoing) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPhase("run");
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [phase, outgoing]);

  const finishSlide = useCallback(() => {
    setOutgoing(null);
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (n < 2 || paused) return;
    const id = window.setInterval(() => {
      advance();
    }, 2800);
    return () => window.clearInterval(id);
  }, [n, paused, advance]);

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const onAdvance = () => advance();
    el.addEventListener("sandbox-chat-starter-advance", onAdvance);
    return () => el.removeEventListener("sandbox-chat-starter-advance", onAdvance);
  }, [advance]);

  if (n === 0) return null;
  const active = items[((index % n) + n) % n]!;
  const sliding = phase !== "idle" && outgoing != null;

  return (
    <div
      ref={regionRef}
      className="sandbox-chat-starters"
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className={
          sliding
            ? "sandbox-chat-starters-viewport sandbox-chat-starters-viewport--sliding"
            : "sandbox-chat-starters-viewport"
        }
      >
        {sliding && outgoing ? (
          <div
            className={
              phase === "run"
                ? "sandbox-chat-starters-layer sandbox-chat-starters-layer--out sandbox-chat-starters-layer--out-run"
                : "sandbox-chat-starters-layer sandbox-chat-starters-layer--out"
            }
            onTransitionEnd={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.propertyName !== "transform") return;
              if (phaseRef.current !== "run") return;
              finishSlide();
            }}
          >
            <ChatStarterSurfaceButton
              item={outgoing}
              onSelect={onSelect}
              tabIndex={-1}
              aria-hidden
            />
          </div>
        ) : null}
        <div
          ref={inRef}
          className={
            sliding
              ? phase === "run"
                ? "sandbox-chat-starters-layer sandbox-chat-starters-layer--in sandbox-chat-starters-layer--in-run"
                : "sandbox-chat-starters-layer sandbox-chat-starters-layer--in"
              : "sandbox-chat-starters-layer sandbox-chat-starters-layer--solo"
          }
        >
          <ChatStarterSurfaceButton item={active} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}
