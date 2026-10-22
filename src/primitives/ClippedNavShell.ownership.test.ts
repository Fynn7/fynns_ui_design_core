import { expect, it } from "vitest";
import { wouldClippedNavDrawerCrowd } from "./ClippedNavShell";

it("nested inspector panes do not consume the outer shell's aside floor", () => {
  const host = document.createElement("div");
  host.className = "fynns-clipped-nav-shell";
  host.innerHTML = '<div class="fynns-clipped-nav-shell-main"><div class="fynns-clipped-nav-shell"><div class="fynns-clipped-nav-shell-main"><div class="fynns-end-aside-track"></div></div></div></div>';
  Object.defineProperty(host, "clientWidth", { value: 500 });
  document.body.appendChild(host);
  try {
    // 280 drawer + 160 main fits; a falsely attributed 280 aside would not.
    expect(wouldClippedNavDrawerCrowd(host, 280)).toBe(false);
    const own = document.createElement("div");
    own.className = "fynns-end-aside-track";
    host.firstElementChild!.appendChild(own);
    expect(wouldClippedNavDrawerCrowd(host, 280)).toBe(true);
    own.setAttribute("data-state", "closing");
    expect(wouldClippedNavDrawerCrowd(host, 280)).toBe(false);
  } finally { host.remove(); }
});
