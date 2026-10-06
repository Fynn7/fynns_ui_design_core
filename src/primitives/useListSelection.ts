import { useEffect, useRef, useState } from "react";

export type ListSelectionItem = { id: string; disabled?: boolean };
export type UseListSelectionOptions = {
  /** Full ordered dataset, including rows hidden by progressive reveal. IDs must be unique. */
  items: readonly ListSelectionItem[];
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Clear selection and range anchor when switching source / filter / workspace. */
  resetKey?: string | number;
};

export type ListSelection = {
  selectedIds: readonly string[];
  allSelected: boolean;
  /** Ctrl+A uses the bulk path even when only one selectable item exists. */
  multiple: boolean;
  isSelected: (id: string) => boolean;
  isSelectable: (id: string) => boolean;
  /** Normalize an externally supplied selection to current selectable dataset order. */
  replace: (ids: readonly string[]) => string[];
  selectOnly: (id: string) => string[];
  toggle: (id: string) => string[];
  selectRange: (id: string, additive?: boolean) => string[];
  selectAll: () => string[];
  clear: () => void;
};

function equalIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/** Shared selection state for lists, session drawers and grouped catalogs. */
export function useListSelection({
  items, selectedIds: controlled, defaultSelectedIds = [], onSelectionChange, resetKey,
}: UseListSelectionOptions): ListSelection {
  const [internal, setInternal] = useState<readonly string[]>(defaultSelectedIds);
  const [allRequested, setAllRequested] = useState(false);
  const anchor = useRef<string | null>(null);
  const previousReset = useRef(resetKey);
  const lastPrune = useRef<string | null>(null);
  const raw = controlled ?? internal;
  const order = [...new Set(items.filter((item) => !item.disabled).map((item) => item.id))];
  const allowed = new Set(order);
  const selected = new Set(raw.filter((id) => allowed.has(id)));
  const selectedIds = order.filter((id) => selected.has(id));
  const allSelected = order.length > 0 && selectedIds.length === order.length;

  const commit = (ids: readonly string[], all = false) => {
    const requested = new Set(ids);
    const next = order.filter((id) => requested.has(id));
    setAllRequested(all);
    if (controlled === undefined) setInternal(next);
    if (!equalIds(raw, next)) onSelectionChange?.(next);
    return next;
  };

  // Prune removed / disabled IDs in controlled and uncontrolled modes alike.
  useEffect(() => {
    const signature = JSON.stringify([raw, selectedIds]);
    if (!equalIds(raw, selectedIds) && lastPrune.current !== signature) {
      lastPrune.current = signature;
      commit(selectedIds, allRequested);
    } else if (equalIds(raw, selectedIds)) lastPrune.current = null;
    if (anchor.current != null && !allowed.has(anchor.current)) anchor.current = null;
  });
  useEffect(() => {
    if (previousReset.current === resetKey) return;
    previousReset.current = resetKey;
    anchor.current = null;
    commit([]);
  });

  return {
    selectedIds, allSelected,
    multiple: selectedIds.length > 1 || (allRequested && allSelected),
    isSelected: (id) => selected.has(id),
    isSelectable: (id) => allowed.has(id),
    replace: (ids) => commit(ids),
    selectOnly: (id) => {
      if (!allowed.has(id)) return [...selectedIds];
      anchor.current = id;
      return commit([id]);
    },
    toggle: (id) => {
      if (!allowed.has(id)) return [...selectedIds];
      anchor.current = id;
      return commit(selected.has(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
    },
    selectRange: (id, additive = false) => {
      if (!allowed.has(id)) return [...selectedIds];
      const start = anchor.current == null ? -1 : order.indexOf(anchor.current);
      const end = order.indexOf(id);
      if (start < 0) anchor.current = id;
      const range = start < 0 ? [id] : order.slice(Math.min(start, end), Math.max(start, end) + 1);
      return commit(additive ? [...selectedIds, ...range] : range);
    },
    selectAll: () => commit(order, true),
    clear: () => { anchor.current = null; commit([]); },
  };
}
