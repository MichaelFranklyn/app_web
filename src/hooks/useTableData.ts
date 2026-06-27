"use client";

import { getNestedValue } from "@/utils/format/object";
import { sortObjectsInArray } from "@/utils/format/sort";
import { pageToAfter } from "@/utils/pagination";
import { DocumentNode } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAsyncQuery } from "./useAsyncQuery";
import { FieldConfig, useTableFilters } from "./useTableFilters";

export type SortDirection = "asc" | "desc" | "none";

export interface SortState {
  key: string;
  direction: SortDirection;
  customOrder?: (string | number)[];
  secondaryKey?: string;
  secondaryDirection?: SortDirection;
  secondaryCustomOrder?: (string | number)[];
}

export interface QueryFilter {
  field: string;
  operator?: string;
  value: string | number | boolean;
}

export interface UseTableDataOptions<TData, TItem> {
  query: DocumentNode;
  fields: Record<string, FieldConfig>;
  getConnection: (data: TData) => {
    edges: { node: TItem }[];
    totalCount: number;
  };
  itemsPerPage?: number;
  initialSort?: SortState;
  /**
   * Filtros fixos sempre aplicados, mesclados antes dos filtros de busca.
   * Use para listas escopadas a um pai (ex: `company_factory_id`, `product_id`).
   */
  baseFilters?: QueryFilter[];
}

export interface UseTableDataReturn<TItem> {
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  clearFilters: () => void;
  displayedData: TItem[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  handleSort: (key: string) => void;
  sortState: SortState;
  refetch: (variables?: Record<string, unknown>) => Promise<void>;
}

function buildQueryFilters(
  fields: Record<string, FieldConfig>,
  values: Record<string, string>
) {
  return Object.entries(fields).flatMap(([key, config]) => {
    const value = values[key];
    if (!value) return [];
    return [
      {
        field: config.queryField,
        operator: config.operator ?? (config.type === "text" ? "like" : "eq"),
        value,
      },
    ];
  });
}

export const useTableData = <TData, TItem extends object>(
  options: UseTableDataOptions<TData, TItem>
): UseTableDataReturn<TItem> => {
  const {
    query,
    fields,
    getConnection,
    itemsPerPage = 10,
    initialSort = { key: "", direction: "none" },
    baseFilters,
  } = options;

  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters = useTableFilters(fields);

  const queryFilters = useMemo(
    () => buildQueryFilters(fields, filters.queryValues),
    [filters.queryValues, fields]
  );

  const queryFiltersString = useMemo(
    () => JSON.stringify(queryFilters),
    [queryFilters]
  );

  const baseFiltersString = JSON.stringify(baseFilters ?? []);

  // Filtros fixos (escopo) + filtros de busca. baseFilters tem `operator` opcional → default "eq".
  const allFilters = useMemo(
    () => [
      ...(baseFilters ?? []).map((f) => ({
        field: f.field,
        operator: f.operator ?? "eq",
        value: f.value,
      })),
      ...queryFilters,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseFiltersString, queryFiltersString]
  );

  const variables = useMemo(
    () => ({
      input: {
        first: itemsPerPage,
        after: pageToAfter(currentPage, itemsPerPage),
        ...(allFilters.length > 0 && { filters: allFilters }),
      },
    }),
    [currentPage, itemsPerPage, allFilters]
  );

  const { data, loading, refetch } = useAsyncQuery<TData>(query, {
    variables,
    skip: false,
  });

  const connection = data ? getConnection(data) : null;

  const allItems = useMemo(
    () => connection?.edges?.map(({ node }) => node) ?? [],
    [connection]
  );

  const totalItems = useMemo(() => connection?.totalCount ?? 0, [connection]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const sortState: SortState = useMemo(() => {
    const urlKey = searchParams.get("sortKey");
    const activeKey = urlKey || initialSort.key;

    return {
      key: activeKey,
      direction:
        (searchParams.get("sortDir") as SortDirection) || initialSort.direction,
      customOrder:
        activeKey === initialSort.key ? initialSort.customOrder : undefined,
      secondaryKey: initialSort.secondaryKey,
      secondaryDirection: initialSort.secondaryDirection || "asc",
      secondaryCustomOrder: initialSort.secondaryCustomOrder,
    };
  }, [
    initialSort.key,
    initialSort.direction,
    initialSort.customOrder,
    initialSort.secondaryKey,
    initialSort.secondaryDirection,
    initialSort.secondaryCustomOrder,
    searchParams,
  ]);

  const sortedData = useMemo(() => {
    if (!sortState.key || sortState.direction === "none") return allItems;

    const normalize = (str: unknown) =>
      String(str || "indefinido")
        .normalize("NFD")
        .trim()
        .toLowerCase();

    if (sortState.customOrder && sortState.customOrder.length > 0) {
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
      });

      const createOrderMap = (orderArray: (string | number)[]) => {
        const map = new Map<string, number>();
        orderArray.forEach((item, index) => {
          const normalizedItem = normalize(item);
          if (!map.has(normalizedItem)) {
            map.set(normalizedItem, index);
          }
        });
        return map;
      };

      const primaryOrderMap = createOrderMap(sortState.customOrder);
      const secondaryOrderMap =
        sortState.secondaryCustomOrder &&
        sortState.secondaryCustomOrder.length > 0
          ? createOrderMap(sortState.secondaryCustomOrder)
          : null;

      const getCustomOrderPosition = (
        rawValue: unknown,
        orderMap: Map<string, number>
      ) => {
        const val =
          rawValue !== undefined && rawValue !== null
            ? normalize(rawValue)
            : normalize("indefinido");
        const index = orderMap.get(val);
        return index !== undefined ? index : 9999;
      };

      return [...allItems].sort((a, b) => {
        const rawValA = getNestedValue(a, sortState.key);
        const rawValB = getNestedValue(b, sortState.key);

        const posA = getCustomOrderPosition(rawValA, primaryOrderMap);
        const posB = getCustomOrderPosition(rawValB, primaryOrderMap);

        if (posA !== posB) {
          return sortState.direction === "asc" ? posA - posB : posB - posA;
        }

        if (sortState.secondaryKey) {
          const rawSecValA = getNestedValue(a, sortState.secondaryKey);
          const rawSecValB = getNestedValue(b, sortState.secondaryKey);

          if (secondaryOrderMap) {
            const posSecA = getCustomOrderPosition(
              rawSecValA,
              secondaryOrderMap
            );
            const posSecB = getCustomOrderPosition(
              rawSecValB,
              secondaryOrderMap
            );

            if (posSecA !== posSecB) {
              return sortState.secondaryDirection === "desc"
                ? posSecB - posSecA
                : posSecA - posSecB;
            }
            return 0;
          }

          const secValStrA = String(rawSecValA || "");
          const secValStrB = String(rawSecValB || "");
          const secCompare = collator.compare(secValStrA, secValStrB);

          return sortState.secondaryDirection === "desc"
            ? -secCompare
            : secCompare;
        }

        return 0;
      });
    }

    const keys = sortState.key.split(".");
    const [rootKey, ...nestedKeys] = keys;
    if (!rootKey) return allItems;

    const sorter = sortObjectsInArray(allItems).byKey(rootKey);
    nestedKeys.forEach((k) => sorter.inKey(k));

    const result = sortState.direction === "asc" ? sorter.asc() : sorter.desc();
    return Array.isArray(result) ? result : [];
  }, [
    allItems,
    sortState.key,
    sortState.direction,
    sortState.customOrder,
    sortState.secondaryKey,
    sortState.secondaryDirection,
    sortState.secondaryCustomOrder,
  ]);

  const displayedData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  const handleSort = useCallback(
    (key: string) => {
      const currentKey = searchParams.get("sortKey");
      const currentDir = searchParams.get("sortDir") as SortDirection;

      let nextDir: SortDirection = "asc";
      if (currentKey === key) {
        nextDir = currentDir === "asc" ? "desc" : "asc";
      }

      filters.setFilter("_sort", JSON.stringify({ key, direction: nextDir }));
    },
    [filters, searchParams]
  );

  return {
    inputValues: filters.inputValues,
    setFilter: filters.setFilter,
    clearFilters: filters.clearFilters,
    displayedData,
    currentPage: Math.min(currentPage, totalPages),
    setCurrentPage: filters.setPage,
    totalPages,
    totalItems,
    loading,
    handleSort,
    sortState,
    refetch,
  };
};
