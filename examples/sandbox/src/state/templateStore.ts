import {
  bundleToTemplate,
  type SandboxConfigBundle,
  type SandboxTemplate,
} from "../config/sandboxConfig";

export const TEMPLATES_STORAGE_KEY = "fynns-sandbox-templates";

function readAll(): SandboxTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SandboxTemplate =>
        !!item &&
        typeof item === "object" &&
        typeof (item as SandboxTemplate).id === "string" &&
        typeof (item as SandboxTemplate).name === "string" &&
        typeof (item as SandboxTemplate).overrides === "object",
    );
  } catch {
    return [];
  }
}

function writeAll(templates: SandboxTemplate[]): void {
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

export function listTemplates(): SandboxTemplate[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveTemplateFromBundle(
  bundle: SandboxConfigBundle,
  args: { name: string; description?: string },
): SandboxTemplate {
  const template = bundleToTemplate(bundle, args);
  const next = [template, ...readAll().filter((t) => t.id !== template.id)];
  writeAll(next);
  return template;
}

export function updateTemplateMeta(
  id: string,
  patch: { name?: string; description?: string },
): SandboxTemplate | null {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const current = all[idx];
  const updated: SandboxTemplate = {
    ...current,
    name: patch.name?.trim() || current.name,
    description:
      patch.description !== undefined ? patch.description.trim() : current.description,
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function deleteTemplate(id: string): boolean {
  const all = readAll();
  const next = all.filter((t) => t.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}

export function getTemplate(id: string): SandboxTemplate | null {
  return readAll().find((t) => t.id === id) ?? null;
}
