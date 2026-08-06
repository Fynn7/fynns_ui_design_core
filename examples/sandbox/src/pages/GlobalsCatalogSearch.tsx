import { SearchBar, SearchBarResult } from "@fynns/ui";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n";
import {
  GLOBALS_CATEGORY_TITLE_KEY,
  filterGlobalsDemos,
  findDemoById,
  type GlobalsCategoryId,
} from "../catalog/globalsCatalog";

export type GlobalsCatalogSearchProps = {
  /** Increment from shell topbar Search to focus this field. */
  searchFocusTick?: number;
  /** Parent opens the category Collapsible, scrolls, and flashes the demo. */
  onFocusDemo: (demoId: string) => void;
};

/**
 * Owns catalog search state so keystrokes do not re-render the giant
 * `GlobalsPage` demo tree.
 */
export function GlobalsCatalogSearch({
  searchFocusTick = 0,
  onFocusDemo,
}: GlobalsCatalogSearchProps) {
  const { t } = useLocale();
  const catalogSearchRef = useRef<HTMLInputElement>(null);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [catalogActive, setCatalogActive] = useState(0);

  useEffect(() => {
    if (!searchFocusTick) return;
    // Defer past the IconButton click focus so the catalog field wins.
    const timer = window.setTimeout(() => {
      catalogSearchRef.current?.focus();
      setCatalogExpanded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [searchFocusTick]);

  const categoryLabel = (categoryId: GlobalsCategoryId) =>
    t(GLOBALS_CATEGORY_TITLE_KEY[categoryId]);

  const catalogMatches = filterGlobalsDemos(catalogQuery, categoryLabel);

  useEffect(() => {
    setCatalogActive(0);
  }, [catalogQuery]);

  const selectDemo = (demoId: string) => {
    const entry = findDemoById(demoId);
    if (!entry) return;
    setCatalogExpanded(false);
    setCatalogQuery(entry.label);
    onFocusDemo(demoId);
  };

  return (
    <div className="sandbox-globals-search">
      <SearchBar
        ref={catalogSearchRef}
        value={catalogQuery}
        onChange={(value) => {
          setCatalogQuery(value);
          setCatalogExpanded(value.trim().length > 0);
        }}
        ariaLabel={t("globals.searchAria")}
        placeholder={t("globals.searchPlaceholder")}
        clearAriaLabel={t("globals.searchClear")}
        expanded={catalogExpanded && catalogQuery.trim().length > 0}
        onExpandedChange={setCatalogExpanded}
        aria-activedescendant={
          catalogExpanded && catalogMatches[catalogActive]
            ? `globals-search-result-${catalogMatches[catalogActive].id}`
            : undefined
        }
        onSearch={() => {
          const hit = catalogMatches[catalogActive] ?? catalogMatches[0];
          if (hit) selectDemo(hit.id);
        }}
        onKeyDown={(event) => {
          if (!catalogMatches.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setCatalogExpanded(true);
            setCatalogActive((i) => (i + 1) % catalogMatches.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setCatalogExpanded(true);
            setCatalogActive(
              (i) => (i - 1 + catalogMatches.length) % catalogMatches.length,
            );
          }
        }}
        onFocus={() => {
          if (catalogQuery.trim()) setCatalogExpanded(true);
        }}
      >
        {catalogMatches.length === 0 ? (
          <p className="sandbox-globals-search-empty" role="status">
            {t("globals.searchEmpty")}
          </p>
        ) : (
          catalogMatches.map((entry, index) => (
            <SearchBarResult
              key={entry.id}
              id={`globals-search-result-${entry.id}`}
              active={index === catalogActive}
              aria-selected={index === catalogActive}
              onClick={() => selectDemo(entry.id)}
            >
              <span className="sandbox-globals-search-result-label">
                {entry.label}
              </span>
              <span className="sandbox-globals-search-result-cat">
                {categoryLabel(entry.categoryId)}
              </span>
            </SearchBarResult>
          ))
        )}
      </SearchBar>
    </div>
  );
}
