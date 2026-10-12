import { useState } from "react";
import { Button, SectionNotice } from "@fynns/ui";
import { useLocale } from "../i18n";

const copy = {
  zh: {
    message: "列表来自缓存，尚未实时刷新。", show: "查看详情", hide: "收起详情", refresh: "刷新列表",
    details: "上次请求未能连接到服务，当前保留已缓存的内容。你仍可查看已有项目；刷新成功后将自动替换为最新列表。",
    narrow: "窄面板 · 长文字自动换行", error: "连接暂时不可用", errorBody: "已保留当前内容，请检查连接后重试。",
    retry: "重试连接", dismiss: "关闭提示", restored: "列表已更新。", reset: "重置示例",
    help: "文字、详情与操作分别传入 core。详情在原位展开；关闭只隐藏提示，不清除业务错误。",
  },
  en: {
    message: "Showing a cached list. Live updates are unavailable.", show: "View details", hide: "Hide details", refresh: "Refresh list",
    details: "The last request could not reach the service. Cached content is still available for browsing. A successful refresh will replace it with the latest list.",
    narrow: "Narrow panel · wrapped text", error: "Connection unavailable", errorBody: "Your content is preserved. Check the connection and try again.",
    retry: "Retry connection", dismiss: "Dismiss notice", restored: "The list is up to date.", reset: "Reset examples",
    help: "Pass text, details and actions separately. Core owns the disclosure and layout. Dismissal hides the notice without clearing the underlying error.",
  },
};

export function SectionNoticeDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [refreshed, setRefreshed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [generation, setGeneration] = useState(0);
  return <div className="fynns-unit-stack" id="sandbox-section-notice" style={{ maxWidth: "40rem" }}>
    <SectionNotice key={generation} severity={refreshed ? "success" : "warning"} message={refreshed ? c.restored : c.message}
      details={refreshed ? undefined : { text: c.details, showLabel: c.show, hideLabel: c.hide }}
      actions={refreshed ? undefined : [{ label: c.refresh, onClick: () => setRefreshed(true) }]} />
    <div className="fynns-unit-stack" style={{ maxWidth: "18rem" }}>
      <span>{c.narrow}</span>
      <SectionNotice key={generation} severity="warning" message={`${c.message} ${c.errorBody}`} details={{ text: c.details, showLabel: c.show, hideLabel: c.hide }} />
    </div>
    {!dismissed && <SectionNotice severity={recovered ? "success" : "error"} heading={recovered ? undefined : c.error} message={recovered ? c.restored : c.errorBody}
      actions={recovered ? undefined : [{ label: c.retry, onClick: () => setRecovered(true) }]}
      onDismiss={() => setDismissed(true)} dismissAriaLabel={c.dismiss} />}
    <p style={{ margin: 0, lineHeight: "var(--fynns-line-height-body)" }}>{c.help}</p>
    <div className="fynns-control-cluster fynns-control-cluster--start-align"><Button variant="ghost" size="sm" onClick={() => {
      setRefreshed(false); setDismissed(false); setRecovered(false); setGeneration(value => value + 1);
    }}>{c.reset}</Button></div>
  </div>;
}
