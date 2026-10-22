import { useState } from "react";
import {
  Button, DropdownMenuItem, Input, List, ListItem, NavigationDrawer,
  NavigationDrawerGroup, NavigationDrawerItem, SelectionArea, snackbar,
  useListSelection,
} from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

export function ListSelectionDemo() {
  const { t } = useLocale();
  const [ids, setIds] = useState(["a", "b", "c", "d", "e"]);
  const [epoch, setEpoch] = useState(0);
  const [query, setQuery] = useState("Sample input");
  const items = ids.map((id) => ({ id, disabled: id === "d" }));
  const controlled = useListSelection({ items, resetKey: epoch });
  const rowLabel = (id: string) => `${t("globals.navDrawerSessionEntry")} ${id.toUpperCase()}`;
  return <div id="sandbox-list-selection">
    <Button variant="ghost" onClick={() => {
      setIds(["a", "b", "c", "d", "e"]); setEpoch((prev) => prev + 1);
    }}>{t("globals.navDrawerModeRefreshTip")}</Button>
    <SelectionArea items={items} selectedIds={controlled.selectedIds}
      onSelectionChange={controlled.replace} resetKey={epoch}
      label={t("layouts.selectionList")} moreLabel={t("globals.navDrawerModeEntryMore")}
      renderMenu={(context) => context.kind === "area" ?
        <DropdownMenuItem onClick={controlled.selectAll}>{t("layouts.selectionAll")}</DropdownMenuItem> : <>
          <DropdownMenuItem onClick={() => snackbar(context.selectedIds.map(rowLabel).join(", "))}>
            {context.kind === "selection" ? t("layouts.selectionCopy") : t("layouts.selectionCopyOne")}
          </DropdownMenuItem>
          <DropdownMenuItem tone="danger" onClick={() => setIds((prev) =>
            prev.filter((id) => !context.selectedIds.includes(id)))}>
            {context.kind === "selection" ? t("layouts.selectionDelete") : t("globals.navDrawerModeEntryDelete")}
          </DropdownMenuItem>
        </>}>
      {(scope) => <div {...scope.areaProps}>
        <Input aria-label={t("layouts.selectionInput")} value={query} onChange={(event) => setQuery(event.target.value)} />
        <output data-selection-count aria-live="polite">{t("layouts.selectionCount")}: {scope.selectedIds.length}</output>
        <List>
          {items.map((item) => <ListItem key={item.id} {...scope.getItemProps(item.id)}
            headline={rowLabel(item.id)} disabled={item.disabled} interactive
            trailing={scope.menuTrigger(item.id)} />)}
        </List>
      </div>}
    </SelectionArea>
    <div className="sandbox-chat-product-stage">
      <SelectionArea items={items} label={t("layouts.selectionGroups")}
        resetKey={epoch} moreLabel={t("globals.navDrawerModeEntryMore")}
        renderMenu={(context) => context.kind === "area" ? null :
          <DropdownMenuItem onClick={() => snackbar(context.selectedIds.map(rowLabel).join(", "))}>
            {context.kind === "selection" ? t("layouts.selectionCopy") : t("layouts.selectionCopyOne")}
          </DropdownMenuItem>}>
        {(scope) => <NavigationDrawer variant="standard" bodyProps={scope.areaProps}>
          <NavigationDrawerGroup label={t("layouts.selectionGroupA")}>
            {items.slice(0, 2).map((item) => <NavigationDrawerItem key={item.id}
              {...scope.getItemProps(item.id)} label={rowLabel(item.id)}
              trailing={scope.menuTrigger(item.id)} />)}
          </NavigationDrawerGroup>
          <NavigationDrawerGroup label={t("layouts.selectionGroupB")}>
            {items.slice(2).map((item) => <NavigationDrawerItem key={item.id}
              {...scope.getItemProps(item.id)} label={rowLabel(item.id)} disabled={item.disabled}
              trailing={scope.menuTrigger(item.id)} />)}
          </NavigationDrawerGroup>
        </NavigationDrawer>}
      </SelectionArea>
    </div>
    <SandboxHelp text={t("layouts.selectionHelp")} />
  </div>;
}
