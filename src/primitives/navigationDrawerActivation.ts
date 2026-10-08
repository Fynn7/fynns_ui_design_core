/** Navigation actions only; search, disclosure and menu controls keep the drawer open. */
export function isNavigationDrawerActivation(target: EventTarget | null, drawer: Element): boolean {
  if (!(target instanceof Element)) return false;
  const action = target.closest<HTMLElement>("button, a[href], [role='button']");
  if (!action || !drawer.contains(action)) return false;
  if (action.matches(":disabled, [aria-disabled='true']")) return false;
  if (action.matches(".fynns-nav-drawer-item, .fynns-nav-drawer-new-chat-trigger")) return true;
  if (action.matches("[aria-haspopup], [aria-expanded]")) return false;
  return action.matches("a[href]") || action.closest(".fynns-nav-drawer-footer") != null;
}

/** Read the actual layout so consumer overlay styles and wide docked columns both work. */
export function isClippedNavDrawerOverlay(root: Element): boolean {
  const nav = root.querySelector(":scope > .fynns-clipped-nav-shell-body > .fynns-clipped-nav-shell-nav");
  if (!nav) return false;
  const position = getComputedStyle(nav).position;
  return position === "absolute" || position === "fixed";
}
