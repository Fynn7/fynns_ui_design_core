/**
 * Overlay scrollbars for `.fynns-scroll`.
 *
 * Classic Windows / forced-WebKit bars steal content width and squeeze trailing
 * badges / chevrons. Native bars on `.fynns-scroll` are hidden in `theme.css`;
 * this module paints token-skinned thumbs as **fixed** overlays (not in-scroll
 * abspos children — those inflate scrollWidth and falsely enable horizontal
 * bars). Portal stays `pointer-events: none`; rails opt in so thumbs can be
 * dragged / track-clicked without covering the page. Textarea / input: native
 * bar hidden only (no overlay rail).
 *
 * Auto-starts when `@fynns/ui` is imported. Idempotent.
 */

const HOST_ATTR = "data-fynns-overlay-scroll";
const RAIL_CLASS = "fynns-scroll-rail";
const THUMB_CLASS = "fynns-scroll-thumb";
const MIN_THUMB_PX = 24;

type Axis = "y" | "x";

type HostState = {
  railY: HTMLDivElement;
  thumbY: HTMLDivElement;
  railX: HTMLDivElement;
  thumbX: HTMLDivElement;
  ro: ResizeObserver | null;
  mo: MutationObserver | null;
  onScroll: () => void;
  onEnter: () => void;
  onLeave: (e: PointerEvent) => void;
  onFocusIn: () => void;
  onFocusOut: () => void;
  onRailYEnter: () => void;
  onRailYLeave: (e: PointerEvent) => void;
  onRailXEnter: () => void;
  onRailXLeave: (e: PointerEvent) => void;
  onRailYDown: (e: PointerEvent) => void;
  onRailXDown: (e: PointerEvent) => void;
  hover: boolean;
  focus: boolean;
  dragging: boolean;
  allowX: boolean;
  raf: number;
};

const states = new WeakMap<HTMLElement, HostState>();
let started = false;
let finePointer = false;
let portal: HTMLDivElement | null = null;

function readScrollbarSizePx(): number {
  if (typeof document === "undefined") return 10;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--fynns-scrollbar-size")
    .trim();
  const px = Number.parseFloat(raw);
  return Number.isFinite(px) && px > 0 ? px : 10;
}

function readRootTokenPx(token: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  if (raw.endsWith("rem")) {
    const rootFs =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
      16;
    return n * rootFs;
  }
  return n;
}

/** Plain / headless CodeBlock: rail lives in the copy reserve column, not over glyphs. */
function codeBlockCopyFloatRoot(host: HTMLElement): HTMLElement | null {
  if (
    !host.classList.contains("fynns-code-block-pre") &&
    !host.classList.contains("fynns-code-block-input")
  ) {
    return null;
  }
  const root = host.closest(".fynns-code-block--copy-float");
  return root instanceof HTMLElement ? root : null;
}

function copyFloatVerticalRailGeometry(
  root: HTMLElement,
  hostRect: DOMRect,
  sb: number,
): { top: number; height: number; left: number } {
  const rootRect = root.getBoundingClientRect();
  const edgeInset = readRootTokenPx("--fynns-space-sm", 8);
  const left = rootRect.right - sb - edgeInset;

  const copy = root.querySelector(".fynns-code-block-copy");
  if (copy instanceof HTMLElement) {
    const copyRect = copy.getBoundingClientRect();
    const gap = readRootTokenPx("--fynns-space-xs", 4);
    const top = Math.min(
      hostRect.bottom,
      Math.max(hostRect.top, copyRect.bottom + gap),
    );
    return { top, height: Math.max(0, hostRect.bottom - top), left };
  }

  return { top: hostRect.top, height: hostRect.height, left };
}

function prefersFineHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function canHostOverlay(el: Element): el is HTMLElement {
  return (
    el instanceof HTMLElement &&
    !(el instanceof HTMLTextAreaElement) &&
    !(el instanceof HTMLInputElement) &&
    el.classList.contains("fynns-scroll")
  );
}

/** Vertical-only hosts (`overflow-x: clip|hidden`) must never get an X thumb. */
function allowsHorizontalOverlay(host: HTMLElement): boolean {
  const { overflowX } = getComputedStyle(host);
  return overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay";
}

function ensurePortal(): HTMLDivElement {
  if (portal && portal.isConnected) return portal;
  portal = document.createElement("div");
  portal.className = "fynns-scroll-overlay-portal";
  portal.setAttribute("aria-hidden", "true");
  document.body.appendChild(portal);
  return portal;
}

function makeRail(axis: Axis): { rail: HTMLDivElement; thumb: HTMLDivElement } {
  const rail = document.createElement("div");
  rail.className = RAIL_CLASS;
  rail.dataset.axis = axis;
  rail.setAttribute("aria-hidden", "true");
  const thumb = document.createElement("div");
  thumb.className = THUMB_CLASS;
  rail.appendChild(thumb);
  return { rail, thumb };
}

function isRailNode(state: HostState, node: EventTarget | null): boolean {
  return (
    node instanceof Node &&
    (state.railY.contains(node) || state.railX.contains(node))
  );
}

function syncThumbVisibility(state: HostState, host: HTMLElement) {
  const show =
    !finePointer ||
    state.hover ||
    state.focus ||
    state.dragging ||
    host.matches(":focus-within");
  state.railY.dataset.visible = show ? "true" : "false";
  state.railX.dataset.visible = show ? "true" : "false";
}

function scheduleUpdate(host: HTMLElement, state: HostState) {
  if (state.raf) return;
  state.raf = requestAnimationFrame(() => {
    state.raf = 0;
    updateHost(host, state);
  });
}

function axisMetrics(host: HTMLElement, axis: Axis) {
  if (axis === "y") {
    const { scrollHeight, clientHeight, scrollTop } = host;
    const thumbSize = Math.max(
      MIN_THUMB_PX,
      (clientHeight / Math.max(1, scrollHeight)) * clientHeight,
    );
    const thumbTravel = Math.max(0, clientHeight - thumbSize);
    const scrollRange = Math.max(1, scrollHeight - clientHeight);
    return { thumbSize, thumbTravel, scrollRange, scrollPos: scrollTop };
  }
  const { scrollWidth, clientWidth, scrollLeft } = host;
  const thumbSize = Math.max(
    MIN_THUMB_PX,
    (clientWidth / Math.max(1, scrollWidth)) * clientWidth,
  );
  const thumbTravel = Math.max(0, clientWidth - thumbSize);
  const scrollRange = Math.max(1, scrollWidth - clientWidth);
  return { thumbSize, thumbTravel, scrollRange, scrollPos: scrollLeft };
}

function setScrollPos(host: HTMLElement, axis: Axis, value: number) {
  if (axis === "y") host.scrollTop = value;
  else host.scrollLeft = value;
}

function beginDrag(
  host: HTMLElement,
  state: HostState,
  axis: Axis,
  rail: HTMLDivElement,
  thumb: HTMLDivElement,
  e: PointerEvent,
) {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  e.preventDefault();
  e.stopPropagation();

  const onThumb = e.target === thumb || thumb.contains(e.target as Node);
  let metrics = axisMetrics(host, axis);

  if (!onThumb) {
    const railRect = rail.getBoundingClientRect();
    const pointer = axis === "y" ? e.clientY : e.clientX;
    const railStart = axis === "y" ? railRect.top : railRect.left;
    const offset = pointer - railStart - metrics.thumbSize / 2;
    const ratio =
      metrics.thumbTravel > 0
        ? Math.min(1, Math.max(0, offset / metrics.thumbTravel))
        : 0;
    setScrollPos(host, axis, ratio * metrics.scrollRange);
    metrics = axisMetrics(host, axis);
    updateHost(host, state);
  }

  const startClient = axis === "y" ? e.clientY : e.clientX;
  const startScroll = metrics.scrollPos;
  const { thumbTravel, scrollRange } = metrics;

  state.dragging = true;
  state.hover = true;
  rail.dataset.dragging = "true";
  syncThumbVisibility(state, host);

  const pointerId = e.pointerId;
  /* Capture can throw for synthetic / inactive pointers — keep window listeners. */
  try {
    rail.setPointerCapture(pointerId);
  } catch {
    /* ignore */
  }

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    const client = axis === "y" ? ev.clientY : ev.clientX;
    const delta = client - startClient;
    const scrollDelta =
      thumbTravel > 0 ? (delta / thumbTravel) * scrollRange : 0;
    setScrollPos(host, axis, startScroll + scrollDelta);
  };

  const onUp = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    state.dragging = false;
    delete rail.dataset.dragging;
    try {
      if (rail.hasPointerCapture(pointerId)) {
        rail.releasePointerCapture(pointerId);
      }
    } catch {
      /* ignore */
    }
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    syncThumbVisibility(state, host);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
}

function updateHost(host: HTMLElement, state: HostState) {
  if (!host.isConnected) {
    detach(host);
    return;
  }

  const rect = host.getBoundingClientRect();
  const {
    scrollTop,
    scrollLeft,
    scrollHeight,
    scrollWidth,
    clientHeight,
    clientWidth,
  } = host;
  const sb = readScrollbarSizePx();
  const yOverflow = scrollHeight - clientHeight > 1;
  const xOverflow = state.allowX && scrollWidth - clientWidth > 1;

  state.railY.hidden = !yOverflow;
  state.railX.hidden = !xOverflow;

  if (yOverflow) {
    const copyRoot = codeBlockCopyFloatRoot(host);
    let railTop = rect.top;
    let railHeight = rect.height;
    let railLeft = rect.right - sb;
    if (copyRoot) {
      const rail = copyFloatVerticalRailGeometry(copyRoot, rect, sb);
      railTop = rail.top;
      railHeight = rail.height;
      railLeft = rail.left;
    }

    const thumbH = Math.max(
      MIN_THUMB_PX,
      (clientHeight / scrollHeight) * clientHeight,
    );
    const maxTop = Math.max(0, railHeight - thumbH);
    const range = Math.max(1, scrollHeight - clientHeight);
    const thumbTop = (scrollTop / range) * maxTop;
    state.railY.style.top = `${railTop}px`;
    state.railY.style.left = `${railLeft}px`;
    state.railY.style.width = `${sb}px`;
    state.railY.style.height = `${railHeight}px`;
    state.thumbY.style.width = `${sb}px`;
    state.thumbY.style.height = `${thumbH}px`;
    state.thumbY.style.transform = `translateY(${thumbTop}px)`;
  }

  if (xOverflow) {
    const thumbW = Math.max(
      MIN_THUMB_PX,
      (clientWidth / scrollWidth) * clientWidth,
    );
    const maxLeft = Math.max(0, clientWidth - thumbW);
    const range = Math.max(1, scrollWidth - clientWidth);
    const thumbLeft = (scrollLeft / range) * maxLeft;
    state.railX.style.top = `${rect.bottom - sb}px`;
    state.railX.style.left = `${rect.left}px`;
    state.railX.style.width = `${rect.width}px`;
    state.railX.style.height = `${sb}px`;
    state.thumbX.style.height = `${sb}px`;
    state.thumbX.style.width = `${thumbW}px`;
    state.thumbX.style.transform = `translateX(${thumbLeft}px)`;
  }

  syncThumbVisibility(state, host);
}

function attach(host: HTMLElement) {
  if (states.has(host)) return;
  if (!canHostOverlay(host)) return;

  /* Drop in-host rails from the older abspos impl / HMR half-state. */
  host.querySelectorAll(`.${RAIL_CLASS}`).forEach((el) => el.remove());

  host.setAttribute(HOST_ATTR, "");
  const root = ensurePortal();
  const y = makeRail("y");
  const x = makeRail("x");
  root.appendChild(y.rail);
  root.appendChild(x.rail);

  const state: HostState = {
    railY: y.rail,
    thumbY: y.thumb,
    railX: x.rail,
    thumbX: x.thumb,
    ro: null,
    mo: null,
    hover: false,
    focus: false,
    dragging: false,
    allowX: allowsHorizontalOverlay(host),
    raf: 0,
    onScroll: () => scheduleUpdate(host, state),
    onEnter: () => {
      state.hover = true;
      syncThumbVisibility(state, host);
    },
    onLeave: (e) => {
      if (state.dragging || isRailNode(state, e.relatedTarget)) return;
      state.hover = false;
      syncThumbVisibility(state, host);
    },
    onFocusIn: () => {
      state.focus = true;
      syncThumbVisibility(state, host);
    },
    onFocusOut: () => {
      state.focus = host.matches(":focus-within");
      syncThumbVisibility(state, host);
    },
    onRailYEnter: () => {
      state.hover = true;
      syncThumbVisibility(state, host);
    },
    onRailYLeave: (e) => {
      if (state.dragging) return;
      if (e.relatedTarget instanceof Node && host.contains(e.relatedTarget)) {
        return;
      }
      if (isRailNode(state, e.relatedTarget)) return;
      state.hover = false;
      syncThumbVisibility(state, host);
    },
    onRailXEnter: () => {
      state.hover = true;
      syncThumbVisibility(state, host);
    },
    onRailXLeave: (e) => {
      if (state.dragging) return;
      if (e.relatedTarget instanceof Node && host.contains(e.relatedTarget)) {
        return;
      }
      if (isRailNode(state, e.relatedTarget)) return;
      state.hover = false;
      syncThumbVisibility(state, host);
    },
    onRailYDown: (e) => beginDrag(host, state, "y", y.rail, y.thumb, e),
    onRailXDown: (e) => beginDrag(host, state, "x", x.rail, x.thumb, e),
  };

  host.addEventListener("scroll", state.onScroll, { passive: true });
  host.addEventListener("pointerenter", state.onEnter);
  host.addEventListener("pointerleave", state.onLeave);
  host.addEventListener("focusin", state.onFocusIn);
  host.addEventListener("focusout", state.onFocusOut);

  y.rail.addEventListener("pointerenter", state.onRailYEnter);
  y.rail.addEventListener("pointerleave", state.onRailYLeave);
  y.rail.addEventListener("pointerdown", state.onRailYDown);
  x.rail.addEventListener("pointerenter", state.onRailXEnter);
  x.rail.addEventListener("pointerleave", state.onRailXLeave);
  x.rail.addEventListener("pointerdown", state.onRailXDown);

  if (typeof ResizeObserver !== "undefined") {
    state.ro = new ResizeObserver(() => scheduleUpdate(host, state));
    state.ro.observe(host);
  }

  if (typeof MutationObserver !== "undefined") {
    state.mo = new MutationObserver(() => scheduleUpdate(host, state));
    state.mo.observe(host, { childList: true, subtree: true });
  }

  states.set(host, state);
  updateHost(host, state);
}

function detach(host: HTMLElement) {
  const state = states.get(host);
  if (!state) return;
  if (state.raf) cancelAnimationFrame(state.raf);
  host.removeEventListener("scroll", state.onScroll);
  host.removeEventListener("pointerenter", state.onEnter);
  host.removeEventListener("pointerleave", state.onLeave);
  host.removeEventListener("focusin", state.onFocusIn);
  host.removeEventListener("focusout", state.onFocusOut);
  state.railY.removeEventListener("pointerenter", state.onRailYEnter);
  state.railY.removeEventListener("pointerleave", state.onRailYLeave);
  state.railY.removeEventListener("pointerdown", state.onRailYDown);
  state.railX.removeEventListener("pointerenter", state.onRailXEnter);
  state.railX.removeEventListener("pointerleave", state.onRailXLeave);
  state.railX.removeEventListener("pointerdown", state.onRailXDown);
  state.ro?.disconnect();
  state.mo?.disconnect();
  state.railY.remove();
  state.railX.remove();
  host.removeAttribute(HOST_ATTR);
  host.classList.remove("fynns-scroll--overlay-host");
  states.delete(host);
}

function scan(root: ParentNode) {
  if (root instanceof Element && canHostOverlay(root)) {
    attach(root);
  }
  root.querySelectorAll?.(".fynns-scroll").forEach((el) => {
    if (canHostOverlay(el)) attach(el);
  });
}

function onViewportChange() {
  document.querySelectorAll<HTMLElement>(`[${HOST_ATTR}]`).forEach((host) => {
    const state = states.get(host);
    if (state) scheduleUpdate(host, state);
  });
}

/**
 * Start overlay scrollbar observers. Safe to call multiple times.
 * Invoked automatically from the package barrel.
 */
export function ensureOverlayScrollbars(): void {
  if (started || typeof document === "undefined") return;
  started = true;
  finePointer = prefersFineHover();

  scan(document);

  const mo = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
      record.removedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (canHostOverlay(node) && states.has(node)) detach(node);
        node.querySelectorAll?.(`[${HOST_ATTR}]`).forEach((el) => {
          if (el instanceof HTMLElement) detach(el);
        });
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("resize", onViewportChange, { passive: true });
  window.addEventListener("scroll", onViewportChange, {
    passive: true,
    capture: true,
  });

  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const onMq = () => {
    finePointer = mq.matches;
    document.querySelectorAll<HTMLElement>(`[${HOST_ATTR}]`).forEach((host) => {
      const state = states.get(host);
      if (state) syncThumbVisibility(state, host);
    });
  };
  mq.addEventListener?.("change", onMq);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ensureOverlayScrollbars(), {
      once: true,
    });
  } else {
    ensureOverlayScrollbars();
  }
}
