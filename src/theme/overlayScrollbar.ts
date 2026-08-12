/**
 * Overlay scrollbars for `.fynns-scroll`.
 *
 * Classic Windows / forced-WebKit bars steal content width and squeeze trailing
 * badges / chevrons. Native bars on `.fynns-scroll` are hidden in `theme.css`;
 * this module paints a token-skinned thumb as an absolute overlay that does not
 * affect layout. Textarea / input hosts stay native-hidden only (no child rail).
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
};

const states = new WeakMap<HTMLElement, HostState>();
let started = false;
let finePointer = false;

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

function ensurePositioning(host: HTMLElement) {
  const pos = getComputedStyle(host).position;
  if (pos === "static") {
    host.classList.add("fynns-scroll--overlay-host");
  }
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

function updateHost(host: HTMLElement, state: HostState) {
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
  const xOverflow = scrollWidth - clientWidth > 1;

  state.railY.hidden = !yOverflow;
  state.railX.hidden = !xOverflow;

  if (yOverflow) {
    state.railY.style.height = `${scrollHeight}px`;
    state.railY.style.width = `${sb}px`;
    const thumbH = Math.max(
      MIN_THUMB_PX,
      (clientHeight / scrollHeight) * clientHeight,
    );
    const maxTop = Math.max(0, clientHeight - thumbH);
    const range = Math.max(1, scrollHeight - clientHeight);
    const thumbTop = scrollTop + (scrollTop / range) * maxTop;
    state.thumbY.style.height = `${thumbH}px`;
    state.thumbY.style.width = `${sb}px`;
    state.thumbY.style.top = `${thumbTop}px`;
    state.thumbY.style.left = "0";
  }

  if (xOverflow) {
    state.railX.style.width = `${scrollWidth}px`;
    state.railX.style.height = `${sb}px`;
    const thumbW = Math.max(
      MIN_THUMB_PX,
      (clientWidth / scrollWidth) * clientWidth,
    );
    const maxLeft = Math.max(0, clientWidth - thumbW);
    const range = Math.max(1, scrollWidth - clientWidth);
    const thumbLeft = scrollLeft + (scrollLeft / range) * maxLeft;
    state.thumbX.style.width = `${thumbW}px`;
    state.thumbX.style.height = `${sb}px`;
    state.thumbX.style.left = `${thumbLeft}px`;
    state.thumbX.style.top = "0";
  }

  syncThumbVisibility(state, host);
}

function attach(host: HTMLElement) {
  if (states.has(host) || host.hasAttribute(HOST_ATTR)) return;
  if (!canHostOverlay(host)) return;

  ensurePositioning(host);
  host.setAttribute(HOST_ATTR, "");

  const y = makeRail("y");
  const x = makeRail("x");
  host.appendChild(y.rail);
  host.appendChild(x.rail);

  const state: HostState = {
    railY: y.rail,
    thumbY: y.thumb,
    railX: x.rail,
    thumbX: x.thumb,
    ro: null,
    mo: null,
    hover: false,
    focus: false,
    onScroll: () => updateHost(host, state),
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
    state.ro = new ResizeObserver(() => updateHost(host, state));
    state.ro.observe(host);
  }

  /* Content length changes (nav items, chat turns) without host box resize. */
  if (typeof MutationObserver !== "undefined") {
    state.mo = new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.target === state.railY ||
          record.target === state.railX ||
          record.target === state.thumbY ||
          record.target === state.thumbX
        ) {
          continue;
        }
        for (const node of record.addedNodes) {
          if (
            node === state.railY ||
            node === state.railX ||
            (node instanceof Element &&
              (node.classList.contains(RAIL_CLASS) ||
                node.classList.contains(THUMB_CLASS)))
          ) {
            return;
          }
        }
        updateHost(host, state);
        return;
      }
    });
    state.mo.observe(host, { childList: true, subtree: true });
  }

  states.set(host, state);
  updateHost(host, state);
}

function detach(host: HTMLElement) {
  const state = states.get(host);
  if (!state) return;
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

  if (typeof window !== "undefined") {
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
