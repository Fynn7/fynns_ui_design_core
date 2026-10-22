/**
 * autoGrow height measurement that does not move the page.
 *
 * autoGrow fields (editable `CodeBlock`, `Textarea`) measure their content
 * height by collapsing the field to `height: 0px` and reading `scrollHeight`.
 * That transient collapse shrinks the scroll range of every ancestor, so the
 * browser clamps their scroll offsets: a page scroll snaps back to the top on
 * every keystroke, and a capped field loses its own scroll position.
 *
 * `measureCollapsedHeight` keeps the probe, but restores the previous height
 * and the captured scroll offsets before it returns — measuring must never
 * move anything the user can see.
 */

/**
 * Capture the scroll offsets of `el` and its ancestors.
 *
 * Returns a restorer that puts every captured offset back. Offsets that are
 * already `0` are skipped: a collapsed probe only clamps what was scrolled.
 */
export function captureScrollOffsets(el: HTMLElement): () => void {
  const saved: Array<{ node: HTMLElement; top: number; left: number }> = [];
  let node: HTMLElement | null = el;
  while (node) {
    const top = node.scrollTop;
    const left = node.scrollLeft;
    if (top !== 0 || left !== 0) saved.push({ node, top, left });
    node = node.parentElement;
  }
  return () => {
    for (const item of saved) {
      if (item.node.scrollTop !== item.top) item.node.scrollTop = item.top;
      if (item.node.scrollLeft !== item.left) item.node.scrollLeft = item.left;
    }
  };
}

/**
 * Read the collapsed content height of `el` without letting the probe move
 * the page.
 *
 * `read` runs while the field is collapsed to `height: 0px` (the only way to
 * read the intrinsic content height of a textarea). The previous inline
 * height and every captured scroll offset are restored before this returns,
 * so the caller can apply the measured height without the page jumping.
 */
export function measureCollapsedHeight(
  el: HTMLElement,
  read: (el: HTMLElement) => number,
): number {
  const restoreScroll = captureScrollOffsets(el);
  const previousHeight = el.style.height;
  el.style.height = "0px";
  const measured = read(el);
  el.style.height = previousHeight;
  restoreScroll();
  return measured;
}
