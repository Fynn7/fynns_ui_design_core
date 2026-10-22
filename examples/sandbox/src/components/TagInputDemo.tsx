import { useState } from "react";
import { FieldBlock, TagInput } from "@fynns/ui";
import { useLocale } from "../i18n";

const copy = {
  zh: { label: "标签", placeholder: "输入标签，回车添加", hint: "回车或失焦添加；英文、中文逗号可分隔多项，重复项自动忽略。", remove: (tag: string) => `移除 ${tag}`, disabled: "禁用", readOnly: "只读", error: "校验错误", errorText: "请检查标签内容。" },
  en: { label: "Tags", placeholder: "Enter a tag, then press Enter", hint: "Enter or blur adds tags. English and Chinese commas separate entries; duplicates are ignored.", remove: (tag: string) => `Remove ${tag}`, disabled: "Disabled", readOnly: "Read only", error: "Validation error", errorText: "Check the tag contents." },
};

export function TagInputDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [tags, setTags] = useState(["React"]);
  const [invalidTags, setInvalidTags] = useState<string[]>([]);
  return <div className="fynns-unit-stack" id="sandbox-tag-input">
    <FieldBlock label={c.label} htmlFor="sandbox-tag-input-field">
      <TagInput id="sandbox-tag-input-field" value={tags} onValueChange={setTags}
        tagsAriaLabel={c.label} removeAriaLabel={c.remove} placeholder={c.placeholder} supportingText={c.hint} />
    </FieldBlock>
    <FieldBlock label={c.error} htmlFor="sandbox-tag-input-error">
      <TagInput id="sandbox-tag-input-error" value={invalidTags} onValueChange={setInvalidTags}
        tagsAriaLabel={c.label} removeAriaLabel={c.remove} placeholder={c.placeholder} errorText={c.errorText} />
    </FieldBlock>
    <FieldBlock label={c.disabled} htmlFor="sandbox-tag-input-disabled">
      <TagInput id="sandbox-tag-input-disabled" value={["React"]} onValueChange={() => {}}
        tagsAriaLabel={c.label} removeAriaLabel={c.remove} placeholder={c.placeholder} disabled />
    </FieldBlock>
    <FieldBlock label={c.readOnly} htmlFor="sandbox-tag-input-readonly">
      <TagInput id="sandbox-tag-input-readonly" value={["TypeScript"]} onValueChange={() => {}}
        tagsAriaLabel={c.label} removeAriaLabel={c.remove} readOnly />
    </FieldBlock>
  </div>;
}
