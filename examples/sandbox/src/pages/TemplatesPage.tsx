import {
  applyFynnsThemeMode,
  Button,
  Dialog,
  DownloadIcon,
  Input,
  Textarea,
  toast,
  Tooltip,
  TrashIcon,
  UploadIcon,
  type FynnsThemeMode,
} from "@fynns/ui";
import { useCallback, useRef, useState } from "react";
import {
  buildConfigBundle,
  downloadConfigJson,
  readConfigFromFile,
  type SandboxConfigBundle,
  type SandboxTemplate,
} from "../config/sandboxConfig";
import {
  deleteTemplate,
  listTemplates,
  saveTemplateFromBundle,
  updateTemplateMeta,
} from "../state/templateStore";
import { useTokenDraft } from "../state/TokenDraftProvider";

export type TemplatesPageProps = {
  theme: FynnsThemeMode;
  onThemeChange: (theme: FynnsThemeMode) => void;
};

/**
 * Special settings page: export/import full config JSON and manage user templates
 * (same JSON shape). Opened from the nav gear icon.
 */
export function TemplatesPage({ theme, onThemeChange }: TemplatesPageProps) {
  const { draft, loadPreset } = useTokenDraft();
  const fileRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState(() => listTemplates());
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const refresh = useCallback(() => setTemplates(listTemplates()), []);

  const currentBundle = useCallback((): SandboxConfigBundle => {
    return buildConfigBundle({
      overrides: draft.overrides,
      theme,
      baseTokensHash: draft.baseTokensHash,
    });
  }, [draft.overrides, draft.baseTokensHash, theme]);

  const applyBundle = useCallback(
    (bundle: SandboxConfigBundle, label: string) => {
      loadPreset(bundle.overrides);
      applyFynnsThemeMode(bundle.theme);
      onThemeChange(bundle.theme);
      const n = Object.keys(bundle.overrides).length;
      toast.success(`Loaded ${label} (${n} override${n === 1 ? "" : "s"}, ${bundle.theme})`);
    },
    [loadPreset, onThemeChange],
  );

  const exportCurrent = () => {
    downloadConfigJson(currentBundle());
    toast.message("Config JSON downloaded");
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await readConfigFromFile(file);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    applyBundle(result.bundle, file.name);
  };

  const confirmSaveTemplate = () => {
    const name = saveName.trim();
    if (!name) {
      toast.error("Template name is required");
      return;
    }
    saveTemplateFromBundle(currentBundle(), {
      name,
      description: saveDescription,
    });
    setSaveOpen(false);
    setSaveName("");
    setSaveDescription("");
    refresh();
    toast.success(`Template "${name}" saved`);
  };

  const exportTemplate = (tpl: SandboxTemplate) => {
    const { id: _id, name, description: _desc, savedAt: _saved, ...bundle } = tpl;
    downloadConfigJson(bundle, `fynns-template-${slugify(name)}.json`);
    toast.message(`Exported "${name}"`);
  };

  const overrideCount = Object.keys(draft.overrides).length;

  return (
    <div className="sandbox-templates">
      <header className="sandbox-templates-hero">
        <p className="sandbox-templates-lead">
          Export or import the full sandbox configuration as JSON (token overrides + theme).
          Save the same bundle as a named template for reuse.
        </p>
        <div className="sandbox-templates-actions">
          <Tooltip content="Download current overrides and theme as JSON">
            <Button size="sm" variant="primary" onClick={exportCurrent}>
              <DownloadIcon size={14} />
              Export JSON
            </Button>
          </Tooltip>
          <Tooltip content="Import a previously exported config JSON">
            <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
              <UploadIcon size={14} />
              Import JSON
            </Button>
          </Tooltip>
          <Tooltip content="Save the current full configuration as a template">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSaveName("");
                setSaveDescription("");
                setSaveOpen(true);
              }}
            >
              Save as template
            </Button>
          </Tooltip>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sandbox-file-input"
            aria-label="Import config JSON"
            onChange={(event) => {
              const file = event.target.files?.[0];
              void onImportFile(file);
              event.target.value = "";
            }}
          />
        </div>
        <p className="sandbox-muted">
          Current draft: {overrideCount} override{overrideCount === 1 ? "" : "s"} · theme {theme}
        </p>
      </header>

      <section className="sandbox-templates-list" aria-label="Saved templates">
        <h2 className="sandbox-templates-section-title">Saved templates</h2>
        {templates.length === 0 ? (
          <p className="sandbox-muted">
            No templates yet. Tune tokens on Playground / Globals, then Save as template.
          </p>
        ) : (
          <ul className="sandbox-templates-cards">
            {templates.map((tpl) => (
              <li key={tpl.id} className="sandbox-templates-card">
                <div className="sandbox-templates-card-main">
                  <div className="sandbox-templates-card-title">{tpl.name}</div>
                  {tpl.description ? (
                    <p className="sandbox-templates-card-desc">{tpl.description}</p>
                  ) : null}
                  <p className="sandbox-muted">
                    {Object.keys(tpl.overrides).length} override
                    {Object.keys(tpl.overrides).length === 1 ? "" : "s"} · {tpl.theme} ·{" "}
                    {new Date(tpl.savedAt).toLocaleString()}
                  </p>
                </div>
                <div className="sandbox-templates-card-actions">
                  <Button size="sm" variant="primary" onClick={() => applyBundle(tpl, tpl.name)}>
                    Apply
                  </Button>
                  <Tooltip content="Download this template as JSON">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Export ${tpl.name}`}
                      onClick={() => exportTemplate(tpl)}
                    >
                      <DownloadIcon size={14} />
                    </Button>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRenameId(tpl.id);
                      setRenameName(tpl.name);
                    }}
                  >
                    Rename
                  </Button>
                  <Tooltip content="Delete template">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${tpl.name}`}
                      onClick={() => {
                        deleteTemplate(tpl.id);
                        refresh();
                        toast.message(`Deleted "${tpl.name}"`);
                      }}
                    >
                      <TrashIcon size={14} />
                    </Button>
                  </Tooltip>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="Save as template"
        description="Stores the current overrides and theme in this browser (same JSON shape as Export)."
      >
        <div className="sandbox-templates-form">
          <label className="sandbox-templates-field">
            <span>Name</span>
            <Input
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              placeholder="e.g. Amber accent workshop"
              aria-label="Template name"
            />
          </label>
          <label className="sandbox-templates-field">
            <span>Description (optional)</span>
            <Textarea
              value={saveDescription}
              onChange={(event) => setSaveDescription(event.target.value)}
              rows={3}
              aria-label="Template description"
            />
          </label>
          <div className="sandbox-apply-diff-foot">
            <Button size="sm" variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={confirmSaveTemplate}>
              Save template
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={renameId != null}
        onOpenChange={(open) => {
          if (!open) setRenameId(null);
        }}
        title="Rename template"
      >
        <div className="sandbox-templates-form">
          <label className="sandbox-templates-field">
            <span>Name</span>
            <Input
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              aria-label="Template name"
            />
          </label>
          <div className="sandbox-apply-diff-foot">
            <Button size="sm" variant="ghost" onClick={() => setRenameId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (!renameId) return;
                const updated = updateTemplateMeta(renameId, { name: renameName });
                if (!updated) {
                  toast.error("Template not found");
                  return;
                }
                setRenameId(null);
                refresh();
                toast.message("Template renamed");
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "template"
  );
}
