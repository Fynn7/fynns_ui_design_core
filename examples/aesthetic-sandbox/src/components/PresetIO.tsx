import { useEffect, useState } from "react";
import {
  Button,
  ClipboardIcon,
  DownloadIcon,
  Input,
  Textarea,
  toast,
} from "@fynns/ui";
import {
  normalizeAestheticPreset,
  type AestheticPreset,
} from "../presetSchema";

type PresetIOProps = {
  preset: AestheticPreset;
  replacePreset: (preset: AestheticPreset) => void;
  snapshotPreset: (label?: string) => AestheticPreset;
};

function parsePreset(json: string) {
  return normalizeAestheticPreset(JSON.parse(json));
}

export function PresetIO({ preset, replacePreset, snapshotPreset }: PresetIOProps) {
  const [json, setJson] = useState("");

  useEffect(() => {
    setJson(JSON.stringify(snapshotPreset(preset.label), null, 2));
  }, [preset, snapshotPreset]);

  const importJson = (source: string) => {
    try {
      const nextPreset = parsePreset(source);
      replacePreset(nextPreset);
      setJson(JSON.stringify(nextPreset, null, 2));
      toast.success(`Imported "${nextPreset.label}"`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid preset JSON.");
    }
  };

  const copyJson = async () => {
    const source = JSON.stringify(snapshotPreset(preset.label), null, 2);
    try {
      await navigator.clipboard.writeText(source);
      setJson(source);
      toast.success("Preset copied");
    } catch {
      toast.error("Clipboard access was not available.");
    }
  };

  const downloadJson = () => {
    const source = JSON.stringify(snapshotPreset(preset.label), null, 2);
    const blob = new Blob([source], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${preset.label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "fynns-card-preset"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setJson(source);
  };

  return (
    <div className="fynns-sandbox-control-stack">
      <div className="fynns-sandbox-preset-actions">
        <Button size="sm" onClick={copyJson}>
          <ClipboardIcon size={14} />
          Copy
        </Button>
        <Button size="sm" onClick={downloadJson}>
          <DownloadIcon size={14} />
          Download
        </Button>
        <Button variant="primary" size="sm" onClick={() => importJson(json)}>
          Apply JSON
        </Button>
      </div>
      <Input
        type="file"
        accept="application/json,.json"
        aria-label="Import preset JSON file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          void file.text().then(importJson);
          event.currentTarget.value = "";
        }}
      />
      <Textarea
        className="fynns-sandbox-preset-json fynns-scroll"
        value={json}
        aria-label="Preset JSON"
        spellCheck={false}
        onChange={(event) => setJson(event.currentTarget.value)}
      />
    </div>
  );
}
