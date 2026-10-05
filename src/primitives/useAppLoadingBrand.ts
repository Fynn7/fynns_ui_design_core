import { useEffect, useMemo, useState } from "react";

function configuredBrand() {
  if (typeof document === "undefined") return { icons: [] as string[], manifest: "", name: "" };
  const links = Array.from(document.head.querySelectorAll<HTMLLinkElement>("link[rel][href]"));
  const hasRel = (link: HTMLLinkElement, token: string) => link.rel.toLowerCase().split(/\s+/).includes(token);
  return {
    icons: [
      ...links.filter(link => hasRel(link, "icon")),
      ...links.filter(link => hasRel(link, "apple-touch-icon")),
    ].map(link => link.href),
    manifest: links.find(link => hasRel(link, "manifest"))?.href ?? "",
    name: document.head.querySelector<HTMLMetaElement>('meta[name="application-name"]')?.content.trim()
      || document.title.trim(),
  };
}

/** Project configuration wins; image failures advance through the configured sources. */
export function useAppLoadingBrand(open: boolean, logoSrc?: string, name?: string) {
  const [brand, setBrand] = useState(configuredBrand);
  const [manifestIcons, setManifestIcons] = useState<{ manifest: string; icons: string[] }>({ manifest: "", icons: [] });
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string>();
  useEffect(() => {
    if (!open) return;
    setFailed([]);
    const sync = () => setBrand(configuredBrand());
    sync();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(sync);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ["href", "rel", "content"] });
    return () => observer.disconnect();
  }, [open]);
  useEffect(() => {
    if (!open || !brand.manifest) return;
    const abort = new AbortController();
    const manifest = brand.manifest;
    void fetch(manifest, { signal: abort.signal }).then(async response => {
      if (!response.ok) return;
      const data = await response.json() as { icons?: Array<{ src?: unknown }> };
      const icons = Array.isArray(data.icons) ? data.icons.flatMap(icon => {
        if (typeof icon?.src !== "string" || !icon.src.trim()) return [];
        try { return [new URL(icon.src, response.url || manifest).href]; }
        catch { return []; }
      }) : [];
      if (!abort.signal.aborted) setManifestIcons({ manifest, icons });
    }).catch(() => { /* Unavailable project metadata falls through to initials. */ });
    return () => abort.abort();
  }, [open, brand.manifest]);
  const candidates = useMemo(() => Array.from(new Set([
    ...(logoSrc?.trim() ? [logoSrc.trim()] : []), ...brand.icons,
    ...(manifestIcons.manifest === brand.manifest ? manifestIcons.icons : []),
  ])), [logoSrc, brand.icons, brand.manifest, manifestIcons]);
  const candidate = candidates.find(source => !failed.includes(source));
  useEffect(() => {
    if (!open || !candidate || loaded === candidate) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setLoaded(candidate);
    image.onerror = () => setFailed(current => current.includes(candidate) ? current : [...current, candidate]);
    image.src = candidate;
    return () => { image.onload = null; image.onerror = null; };
  }, [open, candidate, loaded]);
  return { logo: candidate && candidate === loaded ? candidate : undefined,
    name: name === undefined ? brand.name : name.trim() };
}
