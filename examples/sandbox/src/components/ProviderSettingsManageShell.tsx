import { useMemo, useState } from "react";
import {
  Button,
  Card,
  ControlRow,
  DropdownMenu,
  DropdownMenuItem,
  EyeIcon,
  EyeOffIcon,
  FieldBlock,
  FieldHeader,
  IconButton,
  InfoHint,
  InlineAlert,
  Input,
  List,
  ListItem,
  SaveIcon,
  Tooltip,
} from "@fynns/ui";
import { useLocale } from "../i18n";

type ProviderId = "local" | "cloud" | "cli";

type ProbeState = "idle" | "ok" | "fail";

const PROVIDERS: readonly {
  id: ProviderId;
  needsKey: boolean;
  hasModels: boolean;
  labelKey:
    | "globals.providerSettingsLocal"
    | "globals.providerSettingsCloud"
    | "globals.providerSettingsCli";
}[] = [
  {
    id: "local",
    needsKey: false,
    hasModels: true,
    labelKey: "globals.providerSettingsLocal",
  },
  {
    id: "cloud",
    needsKey: true,
    hasModels: true,
    labelKey: "globals.providerSettingsCloud",
  },
  {
    id: "cli",
    needsKey: false,
    hasModels: false,
    labelKey: "globals.providerSettingsCli",
  },
];

const SAMPLE_MODELS: Record<"local" | "cloud", readonly string[]> = {
  local: ["sample-local-7b", "sample-local-13b"],
  cloud: ["sample-cloud-fast", "sample-cloud-large"],
};

/**
 * Living Manage-surface recipe.
 * Provider preference row → (when needed) password FieldBlock + Save
 * (GSC `GeminiApiKeyField` anatomy) → selectable model List → Verify.
 * Live: Globals `#provider-settings`.
 */
export function ProviderSettingsManageShell() {
  const { t } = useLocale();
  const [provider, setProvider] = useState<ProviderId>("cloud");
  const [model, setModel] = useState(SAMPLE_MODELS.cloud[0]!);
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keySaving, setKeySaving] = useState(false);
  const [probing, setProbing] = useState(false);
  const [probe, setProbe] = useState<ProbeState>("idle");

  const meta = PROVIDERS.find((p) => p.id === provider)!;
  const providerLabel = t(meta.labelKey);
  const models = useMemo(() => {
    if (!meta.hasModels) return [] as string[];
    return [...SAMPLE_MODELS[provider as "local" | "cloud"]];
  }, [meta.hasModels, provider]);

  const selectProvider = (id: ProviderId) => {
    setProvider(id);
    setProbe("idle");
    const next = PROVIDERS.find((p) => p.id === id)!;
    if (next.hasModels) {
      const list = SAMPLE_MODELS[id as "local" | "cloud"];
      setModel(list[0]!);
    }
  };

  const runProbe = () => {
    setProbing(true);
    window.setTimeout(() => {
      setProbing(false);
      // Demo: CLI always "fails" so fail InlineAlert is teachable; others OK.
      setProbe(provider === "cli" ? "fail" : "ok");
    }, 600);
  };

  const saveKey = () => {
    if (!keyDraft.trim()) return;
    setKeySaving(true);
    window.setTimeout(() => {
      setKeySaving(false);
      setKeyConfigured(true);
      setKeyDraft("");
      setKeyVisible(false);
      setProbe("idle");
    }, 500);
  };

  return (
    <div id="sandbox-provider-settings-manage" className="fynns-unit-stack">
      <Card
        className="sandbox-globals-card"
        title={t("globals.providerSettingsTitle")}
        actions={
          <InfoHint
            ariaLabel={t("globals.providerSettingsScopeTip")}
            content={t("globals.providerSettingsScopeTip")}
          />
        }
      >
        <ControlRow label={t("globals.providerSettingsActive")}>
          <DropdownMenu
            className="fynns-control-cluster__grow"
            trigger={providerLabel}
            ariaLabel={t("globals.providerSettingsActive")}
            matchTriggerWidth
          >
            {PROVIDERS.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => selectProvider(p.id)}
              >
                {t(p.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </ControlRow>

        {meta.needsKey ? (
          <FieldBlock label={t("globals.providerSettingsKeyLabel")}>
            {/* GSC GeminiApiKeyField: password Input + eye trailing; Save
                end-aligned under the field (not a Dialog / connection chip). */}
            <div className="fynns-unit-stack">
              <Input
                type={keyVisible ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                value={keyDraft}
                onChange={(event) => setKeyDraft(event.target.value)}
                placeholder={
                  keyConfigured
                    ? t("globals.providerSettingsKeyPlaceholderConfigured")
                    : t("globals.providerSettingsKeyPlaceholder")
                }
                aria-label={t("globals.providerSettingsKeyLabel")}
                trailing={
                  <Tooltip
                    content={
                      keyVisible
                        ? t("globals.providerSettingsKeyHide")
                        : t("globals.providerSettingsKeyShow")
                    }
                  >
                    <IconButton
                      size="sm"
                      aria-label={
                        keyVisible
                          ? t("globals.providerSettingsKeyHide")
                          : t("globals.providerSettingsKeyShow")
                      }
                      disabled={keySaving}
                      onClick={() => setKeyVisible((v) => !v)}
                    >
                      {keyVisible ? (
                        <EyeOffIcon size={16} aria-hidden />
                      ) : (
                        <EyeIcon size={16} aria-hidden />
                      )}
                    </IconButton>
                  </Tooltip>
                }
              />
              <div className="fynns-control-cluster fynns-control-cluster--end-align">
                <Tooltip
                  content={
                    keySaving
                      ? t("globals.providerSettingsKeySaving")
                      : t("globals.providerSettingsKeySave")
                  }
                >
                  <IconButton
                    type="button"
                    variant="tonal"
                    loading={keySaving}
                    disabled={keySaving || !keyDraft.trim()}
                    aria-label={
                      keySaving
                        ? t("globals.providerSettingsKeySaving")
                        : t("globals.providerSettingsKeySave")
                    }
                    onClick={saveKey}
                  >
                    <SaveIcon aria-hidden />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </FieldBlock>
        ) : null}

        {meta.hasModels ? (
          <div className="fynns-unit-stack">
            <FieldHeader label={t("globals.providerSettingsModel")} />
            <List aria-label={t("globals.providerSettingsModel")}>
              {models.map((m) => (
                <ListItem
                  key={m}
                  headline={m}
                  selected={model === m}
                  onClick={() => setModel(m)}
                />
              ))}
            </List>
          </div>
        ) : null}

        {probe === "fail" ? (
          <InlineAlert
            severity="error"
            message={t("globals.providerSettingsFailTip")}
          />
        ) : null}

        <div className="fynns-control-cluster fynns-control-cluster--end-align">
          {provider === "cli" ? (
            <Button variant="ghost" disabled={probing} onClick={() => undefined}>
              {t("globals.providerSettingsSecondary")}
            </Button>
          ) : null}
          <Button loading={probing} onClick={runProbe}>
            {t("globals.providerSettingsProbe")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
