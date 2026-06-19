"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FieldConfig, useTableFilters } from "./useTableFilters";

export type { FieldConfig } from "./useTableFilters";

export interface ServerConnection<T> {
  edges: { node: T }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  totalCount: number;
}

export interface UseTableStateReturn<TItem> {
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  clearFilters: () => void;
  items: TItem[];
  loading: boolean;
  isFirstLoad: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  paginationRange: (number | "...")[];
  setPage: (page: number) => void;
}

export const useTableState = <TItem>(
  options: {
    fields: Record<string, FieldConfig>;
    data: ServerConnection<TItem> | null | undefined;
    loading: boolean;
    first?: number;
  }
): UseTableStateReturn<TItem> => {
  const { fields, data, loading, first = 20 } = options;
  const searchParams = useSearchParams();

  const filters = useTableFilters(fields);
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const items = useMemo(
    () => data?.edges?.map(({ node }) => node) ?? [],
    [data]
  );

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / first));
  const safePage = Math.min(currentPage, totalPages);

  const paginationRange = useMemo((): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const range: (number | "...")[] = [1];
    if (safePage > 3) range.push("...");
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) range.push(i);
    if (safePage < totalPages - 2) range.push("...");
    range.push(totalPages);
    return range;
  }, [safePage, totalPages]);

  return {
    inputValues: filters.inputValues,
    setFilter: filters.setFilter,
    clearFilters: filters.clearFilters,
    items,
    loading,
    isFirstLoad: loading && !data,
    totalCount,
    currentPage: safePage,
    totalPages,
    paginationRange,
    setPage: filters.setPage,
  };
};
