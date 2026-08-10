/**
 * Chromium can keep a stale ellipsis paint after a flex host grows
 * (e.g. ClippedNavShell drawer drag). Force a text-overflow reflow.
 */
export function refreshInputEllipsis(input: HTMLInputElement) {
  const prev = input.style.textOverflow;
  input.style.textOverflow = "clip";
  void input.offsetWidth;
  input.style.textOverflow = prev;
}

/**
 * Observe `host` size and refresh ellipsis on `input`, rAF-coalesced so
 * continuous gestures (drawer seam drag) do not thrash layout every frame.
 */
export function observeInputEllipsisRefresh(
  host: Element,
  input: HTMLInputElement,
): () => void {
  if (typeof ResizeObserver === "undefined") return () => {};
  let raf = 0;
  const ro = new ResizeObserver(() => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      refreshInputEllipsis(input);
    });
  });
  ro.observe(host);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
  };
}
