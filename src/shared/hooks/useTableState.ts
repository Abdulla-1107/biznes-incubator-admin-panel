import { useState, useMemo } from "react";

type SortOrder = "asc" | "desc" | null;

interface UseTableStateOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  filterField?: keyof T;
  filterValue?: string;
}

export function useTableState<T extends { id: string }>({
  items,
  searchFields,
  filterField,
  filterValue,
}: UseTableStateOptions<T>) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSort = (field: keyof T) => {
    if (sortBy === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") { setSortBy(null); setSortOrder(null); }
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...items];

    // Filter by enum
    if (filterField && filterValue && filterValue !== "ALL") {
      result = result.filter((item) => String(item[filterField]) === filterValue);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return val && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortBy && sortOrder) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [items, search, searchFields, filterField, filterValue, sortBy, sortOrder]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    search, setSearch,
    sortBy, sortOrder, toggleSort,
    selectedIds, toggleSelect, toggleSelectAll, clearSelection,
    filtered,
    allSelected: filtered.length > 0 && selectedIds.size === filtered.length,
  };
}
