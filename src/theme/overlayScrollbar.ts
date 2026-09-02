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
 * Y rails are clamped to the straight vertical edge of rounded
 * `overflow: hidden|clip` ancestors (e.g. centered Dialog `radius-3xl`) so the
 * thumb does not paint through the bottom/top corner curves. Rails inside a
 * `.fynns-dialog-panel` are also inset below the panel `.fynns-dialog-head` so
 * nested scroll hosts (e.g. CodeBlock inside a scrolling Drawer body) never
 * paint above the title chrome — portal z-index stays above modal. The same
 * clamp applies to shell TopAppBar, Card/Collapsible heads, and nav drawer
 * headlines so rails never paint through higher chrome (e.g. ClippedNavShell
 * LLM column scroll under the app bar).
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
  /** Modal centered Dialog enter — hide thumb until panel transition settles. */
  dialogEnterSuppressed: boolean;
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

function parseCssLengthPx(raw: string, el: Element): number {
  const t = raw.trim().split(/\s+/)[0] ?? "";
  if (!t || t === "0") return 0;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (t.endsWith("%")) {
    const box = (el as HTMLElement).getBoundingClientRect?.();
    const basis = box ? Math.min(box.width, box.height) : 0;
    return (n / 100) * basis;
  }
  if (t.endsWith("rem")) {
    const rootFs =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
      16;
    return n * rootFs;
  }
  if (t.endsWith("em")) {
    const fs = Number.parseFloat(getComputedStyle(el).fontSize) || 16;
    return n * fs;
  }
  return n;
}

function readCornerRadii(el: HTMLElement): {
  tl: number;
  tr: number;
  br: number;
  bl: number;
} {
  const cs = getComputedStyle(el);
  return {
    tl: parseCssLengthPx(cs.borderTopLeftRadius, el),
    tr: parseCssLengthPx(cs.borderTopRightRadius, el),
    br: parseCssLengthPx(cs.borderBottomRightRadius, el),
    bl: parseCssLengthPx(cs.borderBottomLeftRadius, el),
  };
}

function clipsDescendants(cs: CSSStyleDeclaration): boolean {
  const clip = (v: string) => v === "hidden" || v === "clip";
  return (
    clip(cs.overflow) ||
    clip(cs.overflowX) ||
    clip(cs.overflowY)
  );
}

/**
 * Fixed portal rails ignore ancestor `overflow` + `border-radius`. When a
 * scroll host sits in a rounded clip shell (centered Dialog `radius-3xl`),
 * shrink the Y rail to the straight vertical edge so the thumb bottom is
 * tangent to the start of the bottom corner — never paints through the curve.
 */
function clampVerticalRailToRoundedClip(
  host: HTMLElement,
  railTop: number,
  railHeight: number,
  railLeft: number,
  sb: number,
): { top: number; height: number } {
  let top = railTop;
  let bottom = railTop + railHeight;
  const railRight = railLeft + sb;
  const hostRect = host.getBoundingClientRect();
  let el: HTMLElement | null = host.parentElement;
  while (el && el !== document.documentElement) {
    if (el.classList.contains("fynns-dialog-overlay")) break;
    const cs = getComputedStyle(el);
    if (clipsDescendants(cs)) {
      const er = el.getBoundingClientRect();
      const r = readCornerRadii(el);
      const nearRight = railRight >= er.right - 1;
      const nearLeft = railLeft <= er.left + 1;
      const topR = nearRight ? r.tr : nearLeft ? r.tl : Math.max(r.tl, r.tr);
      const botR = nearRight ? r.br : nearLeft ? r.bl : Math.max(r.bl, r.br);
      const straightTop = er.top + topR;
      const straightBottom = er.bottom - botR;
      /* Only inset when the scroll host actually spans into the corner band. */
      if (hostRect.top < straightTop) {
        top = Math.max(top, straightTop);
      }
      if (hostRect.bottom > straightBottom) {
        bottom = Math.min(bottom, straightBottom);
      }
    }
    el = el.parentElement;
  }
  return { top, height: Math.max(0, bottom - top) };
}

function railHorizontallyOverlaps(
  railLeft: number,
  railRight: number,
  boxLeft: number,
  boxRight: number,
): boolean {
  return railRight > boxLeft + 0.5 && railLeft < boxRight - 0.5;
}

/**
 * Portal rails sit at `--fynns-z-toast` (above modal). Collect chrome bands that
 * must occlude overlay Y rails (shell TopAppBar, dialog head, section heads).
 */
function overlayChromeHeadsForHost(host: HTMLElement): HTMLElement[] {
  const heads = new Set<HTMLElement>();

  const shell = host.closest(
    ".fynns-clipped-nav-shell, .fynns-destination-app-shell",
  );
  if (shell instanceof HTMLElement) {
    const bar = shell.querySelector(":scope > .fynns-top-app-bar");
    if (bar instanceof HTMLElement) heads.add(bar);
  }

  const panel = host.closest(".fynns-dialog-panel");
  if (panel instanceof HTMLElement) {
    const head = panel.querySelector(":scope > .fynns-dialog-head");
    if (head instanceof HTMLElement) heads.add(head);
  }

  let el: HTMLElement | null = host.parentElement;
  while (el) {
    if (el.classList.contains("fynns-card") || el.classList.contains("fynns-collapsible")) {
      const cardHead = el.querySelector(":scope > .fynns-card-head");
      if (cardHead instanceof HTMLElement) heads.add(cardHead);
      const collapsibleHead = el.querySelector(":scope > .fynns-collapsible-head");
      if (collapsibleHead instanceof HTMLElement) heads.add(collapsibleHead);
    }
    if (el.classList.contains("fynns-nav-drawer")) {
      const headline = el.querySelector(":scope > .fynns-nav-drawer-headline");
      if (headline instanceof HTMLElement) heads.add(headline);
    }
    el = el.parentElement;
  }

  return [...heads];
}

/**
 * Shrink the Y rail below every overlapping overlay-chrome head so portal thumbs
 * (z-toast) never paint through TopAppBar / dialog / Card / Collapsible titles.
 */
function clampVerticalRailBelowOverlayChrome(
  host: HTMLElement,
  railTop: number,
  railHeight: number,
  railLeft: number,
  sb: number,
): { top: number; height: number } {
  let top = railTop;
  const bottom = railTop + railHeight;
  const railRight = railLeft + sb;

  for (const head of overlayChromeHeadsForHost(host)) {
    const headRect = head.getBoundingClientRect();
    if (headRect.height < 0.5 || headRect.width < 0.5) continue;
    if (
      !railHorizontallyOverlaps(
        railLeft,
        railRight,
        headRect.left,
        headRect.right,
      )
    ) {
      continue;
    }
    if (headRect.bottom > top && headRect.top < bottom) {
      top = Math.max(top, headRect.bottom);
    }
  }

  return { top, height: Math.max(0, bottom - top) };
}

function prefersFineHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

/**
 * When a modal overlay is open, only paint rails for scroll hosts inside that
 * layer. Otherwise PageScroll / shell canvas rails stay visible behind Dialog
 * and the idle thumb at scrollTop=0 reads as a jump when the dialog body scrolls.
 */
function shouldPaintOverlayRail(host: HTMLElement): boolean {
  if (typeof document === "undefined") return true;
  const modalOverlays = document.querySelectorAll<HTMLElement>(
    '.fynns-dialog-overlay[data-state="open"]:not(.fynns-dialog-overlay--nonmodal)',
  );
  if (modalOverlays.length === 0) return true;
  for (const overlay of modalOverlays) {
    if (overlay.contains(host)) return true;
  }
  return false;
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

function isModalDialogOverlay(el: Element | null): el is HTMLElement {
  return (
    el instanceof HTMLElement &&
    el.classList.contains("fynns-dialog-overlay") &&
    !el.classList.contains("fynns-dialog-overlay--nonmodal")
  );
}

function isModalDialogBodyHost(host: HTMLElement): boolean {
  return (
    host.classList.contains("fynns-dialog-body") &&
    !!host.closest(".fynns-dialog-overlay:not(.fynns-dialog-overlay--nonmodal)")
  );
}

function modalDialogBodyEnterHidden(host: HTMLElement, state: HostState): boolean {
  return isModalDialogBodyHost(host) && state.dialogEnterSuppressed;
}

function syncThumbVisibility(state: HostState, host: HTMLElement) {
  const modalDialogBody = isModalDialogBodyHost(host);
  let show: boolean;
  if (!finePointer) {
    show = true;
  } else if (state.dragging) {
    show = true;
  } else if (modalDialogBody && state.dialogEnterSuppressed) {
    show = false;
  } else if (modalDialogBody) {
    /* Focus trap lands in the panel — do not reveal on :focus-within alone. */
    show = state.hover;
  } else {
    show =
      state.hover || state.focus || host.matches(":focus-within");
  }
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
  const paintRail = shouldPaintOverlayRail(host);
  const enterHidden = modalDialogBodyEnterHidden(host, state);

  state.railY.hidden = !paintRail || !yOverflow || enterHidden;
  state.railX.hidden = !paintRail || !xOverflow || enterHidden;

  if (paintRail && yOverflow) {
    const copyRoot = codeBlockCopyFloatRoot(host);
    let railTop = rect.top;
    let railHeight = rect.height;
    let railLeft = rect.right - sb;
    if (copyRoot) {
      const rail = copyFloatVerticalRailGeometry(copyRoot, rect, sb);
      railLeft = rail.left;
      const belowChrome = clampVerticalRailBelowOverlayChrome(
        host,
        rail.top,
        rail.height,
        railLeft,
        sb,
      );
      railTop = belowChrome.top;
      railHeight = belowChrome.height;
    } else {
      const rounded = clampVerticalRailToRoundedClip(
        host,
        railTop,
        railHeight,
        railLeft,
        sb,
      );
      const belowChrome = clampVerticalRailBelowOverlayChrome(
        host,
        rounded.top,
        rounded.height,
        railLeft,
        sb,
      );
      railTop = belowChrome.top;
      railHeight = belowChrome.height;
    }

    const thumbH = Math.max(
      MIN_THUMB_PX,
      Math.min(railHeight, (clientHeight / scrollHeight) * railHeight),
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

  if (paintRail && xOverflow) {
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
      if (modalDialogBodyEnterHidden(host, state)) return;
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
      if (modalDialogBodyEnterHidden(host, state)) return;
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
      if (modalDialogBodyEnterHidden(host, state)) return;
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
    dialogEnterSuppressed: false,
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
  if (isModalDialogBodyHost(host) && modalDialogEnterActive) {
    state.dialogEnterSuppressed = true;
  }
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

/** Dialog panel enter uses `--fynns-duration-base` (240ms) scale/slide — refresh after settle. */
const DIALOG_ENTER_REFRESH_MS = 280;

let dialogEnterReleaseTimer = 0;
let modalDialogEnterActive = false;
let dialogEnterTransitionCleanup: (() => void) | null = null;

function forEachModalDialogBodyHost(
  fn: (host: HTMLElement, state: HostState) => void,
) {
  document
    .querySelectorAll<HTMLElement>(
      ".fynns-dialog-overlay:not(.fynns-dialog-overlay--nonmodal) .fynns-dialog-body.fynns-scroll",
    )
    .forEach((host) => {
      const state = states.get(host);
      if (state) fn(host, state);
    });
}

function setModalDialogEnterSuppressed(suppress: boolean) {
  forEachModalDialogBodyHost((host, state) => {
    state.dialogEnterSuppressed = suppress;
    if (!suppress) {
      /* Ignore pointerenter queued while the panel was still entering. */
      state.hover = host.matches(":hover");
    }
    syncThumbVisibility(state, host);
    scheduleUpdate(host, state);
  });
}

function releaseModalDialogEnterSuppression() {
  if (!modalDialogEnterActive) return;
  modalDialogEnterActive = false;
  if (dialogEnterReleaseTimer) {
    window.clearTimeout(dialogEnterReleaseTimer);
    dialogEnterReleaseTimer = 0;
  }
  if (dialogEnterTransitionCleanup) {
    dialogEnterTransitionCleanup();
    dialogEnterTransitionCleanup = null;
  }
  setModalDialogEnterSuppressed(false);
  onViewportChange();
}

function armModalDialogEnterSuppression(
  overlay: HTMLElement,
  fromOpen: boolean,
) {
  if (overlay.classList.contains("fynns-dialog-overlay--nonmodal")) return;
  modalDialogEnterActive = true;
  setModalDialogEnterSuppressed(true);

  if (dialogEnterReleaseTimer) window.clearTimeout(dialogEnterReleaseTimer);
  if (dialogEnterTransitionCleanup) {
    dialogEnterTransitionCleanup();
    dialogEnterTransitionCleanup = null;
  }

  const panel = overlay.querySelector(".fynns-dialog-panel");
  if (fromOpen && panel instanceof HTMLElement) {
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== panel) return;
      if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;
      releaseModalDialogEnterSuppression();
    };
    panel.addEventListener("transitionend", onEnd);
    dialogEnterTransitionCleanup = () =>
      panel.removeEventListener("transitionend", onEnd);
  }

  dialogEnterReleaseTimer = window.setTimeout(
    releaseModalDialogEnterSuppression,
    fromOpen ? DIALOG_ENTER_REFRESH_MS : DIALOG_ENTER_REFRESH_MS + 80,
  );
}

function clearModalDialogEnterSuppression() {
  releaseModalDialogEnterSuppression();
}

function scheduleOverlayLayerRefresh(options?: { suppressDialogEnter?: boolean }) {
  if (options?.suppressDialogEnter) {
    document
      .querySelectorAll<HTMLElement>(
        '.fynns-dialog-overlay:not(.fynns-dialog-overlay--nonmodal)[data-state="open"]',
      )
      .forEach((overlay) => armModalDialogEnterSuppression(overlay, true));
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(onViewportChange);
  });
  window.setTimeout(onViewportChange, DIALOG_ENTER_REFRESH_MS);
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
    let overlayLayerTouched = false;
    let overlayOpened = false;
    let overlayRemoved = false;
    for (const record of records) {
      if (
        record.type === "attributes" &&
        record.attributeName === "data-state" &&
        record.target instanceof Element &&
        record.target.classList.contains("fynns-dialog-overlay")
      ) {
        if (record.target.getAttribute("data-state") === "open") {
          overlayOpened = true;
        } else {
          overlayLayerTouched = true;
        }
        continue;
      }
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          const overlays: HTMLElement[] = isModalDialogOverlay(node)
            ? [node]
            : [
                ...node.querySelectorAll<HTMLElement>(
                  ".fynns-dialog-overlay:not(.fynns-dialog-overlay--nonmodal)",
                ),
              ];
          for (const overlay of overlays) {
            armModalDialogEnterSuppression(overlay, false);
          }
          scan(node);
          if (
            node.matches(".fynns-dialog-overlay") ||
            node.querySelector(".fynns-dialog-overlay")
          ) {
            overlayLayerTouched = true;
          }
        }
      });
      record.removedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (canHostOverlay(node) && states.has(node)) detach(node);
        node.querySelectorAll?.(`[${HOST_ATTR}]`).forEach((el) => {
          if (el instanceof HTMLElement) detach(el);
        });
        if (
          node.matches(".fynns-dialog-overlay") ||
          node.querySelector(".fynns-dialog-overlay")
        ) {
          overlayRemoved = true;
          overlayLayerTouched = true;
        }
      });
    }
    if (overlayRemoved) clearModalDialogEnterSuppression();
    if (overlayOpened) {
      scheduleOverlayLayerRefresh({ suppressDialogEnter: true });
    } else if (overlayLayerTouched) {
      scheduleOverlayLayerRefresh();
    }
  });
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-state"],
  });

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
