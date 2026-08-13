/**
 * Overlay scrollbars for `.fynns-scroll`.
 *
 * Classic Windows / forced-WebKit bars steal content width and squeeze trailing
 * badges / chevrons. Native bars on `.fynns-scroll` are hidden in `theme.css`;
 * this module paints token-skinned thumbs as **fixed** overlays (not in-scroll
 * abspos children — those inflate scrollWidth and falsely enable horizontal
 * bars). Textarea / input: native bar hidden only (no overlay rail).
 *
 * Auto-starts when `@fynns/ui` is imported. Idempotent.
 */

const HOST_ATTR = "data-fynns-overlay-scroll";
const RAIL_CLASS = "fynns-scroll-rail";
const THUMB_CLASS = "fynns-scroll-thumb";
const MIN_THUMB_PX = 24;

type HostState = {
  railY: HTMLDivElement;
  thumbY: HTMLDivElement;
  railX: HTMLDivElement;
  thumbX: HTMLDivElement;
  ro: ResizeObserver | null;
  mo: MutationObserver | null;
  onScroll: () => void;
  onEnter: () => void;
  onLeave: () => void;
  onFocusIn: () => void;
  onFocusOut: () => void;
  hover: boolean;
  focus: boolean;
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

function makeRail(axis: "y" | "x"): { rail: HTMLDivElement; thumb: HTMLDivElement } {
  const rail = document.createElement("div");
  rail.className = RAIL_CLASS;
  rail.dataset.axis = axis;
  rail.setAttribute("aria-hidden", "true");
  const thumb = document.createElement("div");
  thumb.className = THUMB_CLASS;
  rail.appendChild(thumb);
  return { rail, thumb };
}

function syncThumbVisibility(state: HostState, host: HTMLElement) {
  const show =
    !finePointer || state.hover || state.focus || host.matches(":focus-within");
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
  const xOverflow =
    state.allowX && scrollWidth - clientWidth > 1;

  state.railY.hidden = !yOverflow;
  state.railX.hidden = !xOverflow;

  if (yOverflow) {
    const thumbH = Math.max(
      MIN_THUMB_PX,
      (clientHeight / scrollHeight) * clientHeight,
    );
    const maxTop = Math.max(0, clientHeight - thumbH);
    const range = Math.max(1, scrollHeight - clientHeight);
    const thumbTop = (scrollTop / range) * maxTop;
    state.railY.style.top = `${rect.top}px`;
    state.railY.style.left = `${rect.right - sb}px`;
    state.railY.style.width = `${sb}px`;
    state.railY.style.height = `${rect.height}px`;
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
    allowX: allowsHorizontalOverlay(host),
    raf: 0,
    onScroll: () => scheduleUpdate(host, state),
    onEnter: () => {
      state.hover = true;
      syncThumbVisibility(state, host);
    },
    onLeave: () => {
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
  };

  host.addEventListener("scroll", state.onScroll, { passive: true });
  host.addEventListener("pointerenter", state.onEnter);
  host.addEventListener("pointerleave", state.onLeave);
  host.addEventListener("focusin", state.onFocusIn);
  host.addEventListener("focusout", state.onFocusOut);

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
