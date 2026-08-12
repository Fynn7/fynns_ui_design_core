import {
  applyFynnsThemeMode,
  Button,
  DownloadIcon,
  FullscreenDialog,
  Input,
  snackbar,
  Tooltip,
  TrashIcon,
  UploadIcon,
  type FynnsThemeMode,
} from "@fynns/ui";
import { useCallback, useRef, useState } from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  buildConfigBundle,
  downloadConfigJson,
  readConfigFromFile,
  type SandboxConfigBundle,
  type SandboxTemplate,
} from "../config/sandboxConfig";
import { useLocale } from "../i18n";
import {
  deleteTemplate,
  listTemplates,
  saveTemplateFromBundle,
  updateTemplateMeta,
} from "../state/templateStore";
import { useTokenDraft } from "../state/TokenDraftProvider";

function defaultTemplateName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `design_template_${y}_${m}_${d}_${h}_${min}_${s}`;
}

export type TemplatesPageProps = {
  theme: FynnsThemeMode;
  onThemeChange: (theme: FynnsThemeMode) => void;
};

/**
 * Special settings page: language, export/import full config JSON, and user templates
 * (same JSON shape). Opened from the nav gear icon.
 */
export function TemplatesPage({ theme, onThemeChange }: TemplatesPageProps) {
  const { t, plural, locale } = useLocale();
  const { draft, loadPreset } = useTokenDraft();
  const fileRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState(() => listTemplates());
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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
      setStatus(
        t("templates.toastLoaded", {
          label,
          count: n,
          plural: plural(n),
          theme: bundle.theme,
        }),
      );
    },
    [loadPreset, onThemeChange, t, plural],
  );

  const exportCurrent = () => {
    downloadConfigJson(currentBundle());
    snackbar(t("templates.toastDownloaded"), {
      dismissAriaLabel: t("globals.snackbarDismiss"),
    });
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await readConfigFromFile(file);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    applyBundle(result.bundle, file.name);
  };

  const confirmSaveTemplate = () => {
    const name = saveName.trim();
    if (!name) {
      setStatus(t("templates.toastNameRequired"));
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
    snackbar(t("templates.toastSaved", { name }), {
      dismissAriaLabel: t("globals.snackbarDismiss"),
    });
  };

  const exportTemplate = (tpl: SandboxTemplate) => {
    const bundle: SandboxConfigBundle = {
      kind: tpl.kind,
      version: tpl.version,
      exportedAt: tpl.exportedAt,
      theme: tpl.theme,
      overrides: tpl.overrides,
      baseTokensHash: tpl.baseTokensHash,
    };
    downloadConfigJson(bundle, `fynns-template-${slugify(tpl.name)}.json`);
    setStatus(t("templates.toastExported", { name: tpl.name }));
  };

  const overrideCount = Object.keys(draft.overrides).length;

  return (
    <div className="sandbox-templates">
      <section className="sandbox-templates-hero" aria-labelledby="sandbox-settings-language">
        <h2 id="sandbox-settings-language" className="sandbox-templates-section-title">
          {t("settings.languageTitle")}
        </h2>
        <p className="sandbox-templates-lead">{t("settings.languageLead")}</p>
        <LanguageSwitcher />
      </section>

      <header className="sandbox-templates-hero">
        <p className="sandbox-templates-lead">{t("templates.lead")}</p>
        <div className="sandbox-templates-actions">
          <Tooltip content={t("templates.exportTip")}>
            <Button size="sm" variant="primary" onClick={exportCurrent}>
              <DownloadIcon size={14} />
              {t("templates.export")}
            </Button>
          </Tooltip>
          <Tooltip content={t("templates.importTip")}>
            <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
              <UploadIcon size={14} />
              {t("templates.import")}
            </Button>
          </Tooltip>
          <Tooltip content={t("templates.saveAsTip")}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSaveName(defaultTemplateName());
                setSaveDescription("");
                setSaveOpen(true);
              }}
            >
              {t("templates.saveAs")}
            </Button>
          </Tooltip>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sandbox-file-input"
            aria-label={t("templates.importAria")}
            onChange={(event) => {
              const file = event.target.files?.[0];
              void onImportFile(file);
              event.target.value = "";
            }}
          />
        </div>
        <p className="sandbox-muted">
          {t("templates.currentDraft", {
            count: overrideCount,
            plural: plural(overrideCount),
            theme,
          })}
        </p>
        {status ? <p className="sandbox-muted" role="status">{status}</p> : null}
      </header>

      <section className="sandbox-templates-list" aria-label={t("templates.savedAria")}>
        <h2 className="sandbox-templates-section-title">{t("templates.savedTitle")}</h2>
        {templates.length === 0 ? (
          <p className="sandbox-muted">{t("templates.empty")}</p>
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
                    {t("templates.cardMeta", {
                      count: Object.keys(tpl.overrides).length,
                      plural: plural(Object.keys(tpl.overrides).length),
                      theme: tpl.theme,
                      when: new Date(tpl.savedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en"),
                    })}
                  </p>
                </div>
                <div className="sandbox-templates-card-actions">
                  <Button size="sm" variant="primary" onClick={() => applyBundle(tpl, tpl.name)}>
                    {t("templates.apply")}
                  </Button>
                  <Tooltip content={t("templates.exportOneTip")}>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t("templates.exportOneAria", { name: tpl.name })}
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
                    {t("templates.rename")}
                  </Button>
                  <Tooltip content={t("templates.deleteTip")}>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t("templates.deleteAria", { name: tpl.name })}
                      onClick={() => {
                        deleteTemplate(tpl.id);
                        refresh();
                        setStatus(t("templates.toastDeleted", { name: tpl.name }));
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

      <FullscreenDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title={t("templates.saveDialogTitle")}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setSaveOpen(false)}>
              {t("templates.cancel")}
            </Button>
            <Button size="sm" variant="primary" onClick={confirmSaveTemplate}>
              {t("templates.saveTemplate")}
            </Button>
          </>
        }
      >
        <p className="sandbox-muted">{t("templates.saveDialogDesc")}</p>
        <div className="sandbox-templates-form">
          <label className="sandbox-templates-field">
            <span>{t("templates.name")}</span>
            <Input
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              placeholder={t("templates.namePlaceholder")}
              aria-label={t("templates.nameAria")}
            />
          </label>
          <label className="sandbox-templates-field">
            <span>{t("templates.description")}</span>
            <Input
              value={saveDescription}
              onChange={(event) => setSaveDescription(event.target.value)}
              aria-label={t("templates.descriptionAria")}
            />
          </label>
        </div>
      </FullscreenDialog>

      <FullscreenDialog
        open={renameId != null}
        onOpenChange={(open) => {
          if (!open) setRenameId(null);
        }}
        title={t("templates.renameTitle")}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setRenameId(null)}>
              {t("templates.cancel")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (!renameId) return;
                const updated = updateTemplateMeta(renameId, { name: renameName });
                if (!updated) {
                  setStatus(t("templates.toastNotFound"));
                  return;
                }
                setRenameId(null);
                refresh();
                setStatus(t("templates.toastRenamed"));
              }}
            >
              {t("templates.save")}
            </Button>
          </>
        }
      >
        <div className="sandbox-templates-form">
          <label className="sandbox-templates-field">
            <span>{t("templates.name")}</span>
            <Input
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              aria-label={t("templates.nameAria")}
            />
          </label>
        </div>
      </FullscreenDialog>
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
