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
 * Observe `host` and `input` size and refresh ellipsis, rAF-coalesced so
 * continuous gestures (drawer seam drag) do not thrash layout every frame.
 * Observing the input catches trailing chrome (Clear / affixes) that change
 * the field width without resizing the host border box.
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
  ro.observe(input);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
  };
}
