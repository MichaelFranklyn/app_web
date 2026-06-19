"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface TextFieldConfig {
  type: "text";
  queryField: string;
  operator?: string;
  debounce?: number;
}

export interface SelectFieldConfig {
  type: "select";
  queryField: string;
  operator?: string;
}

export type FieldConfig = TextFieldConfig | SelectFieldConfig;

export interface UseTableFiltersReturn {
  inputValues: Record<string, string>;
  queryValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
}

function omitKey(obj: Record<string, string>, key: string): Record<string, string> {
  const next = { ...obj };
  delete next[key];
  return next;
}

export const useTableFilters = (
  fields: Record<string, FieldConfig>
): UseTableFiltersReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const textDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFilterRef = useRef<{ key: string; value: string | undefined } | null>(null);
  const clearingRef = useRef(false);

  const getFiltersFromUrl = useCallback(
    (sp: ReturnType<typeof useSearchParams>): Record<string, string> => {
      const result: Record<string, string> = {};
      sp.forEach((value, key) => {
        if (key in fields) result[key] = value;
      });
      return result;
    },
    [fields]
  );

  const [inputValues, setInputValues] = useState<Record<string, string>>(
    () => getFiltersFromUrl(searchParams)
  );
  const [queryValues, setQueryValues] = useState<Record<string, string>>(
    () => getFiltersFromUrl(searchParams)
  );

  useEffect(() => {
    if (textDebounceRef.current !== null) return;

    if (pendingFilterRef.current !== null) {
      const { key, value } = pendingFilterRef.current;
      const committed = value ? searchParams.get(key) === value : !searchParams.has(key);
      if (!committed) return;
      pendingFilterRef.current = null;
    }

    if (clearingRef.current) {
      const hasAnyField = Object.keys(fields).some((k) => searchParams.has(k));
      if (hasAnyField) return;
      clearingRef.current = false;
    }

    const fromUrl = getFiltersFromUrl(searchParams);
    setInputValues((prev) =>
      JSON.stringify(prev) !== JSON.stringify(fromUrl) ? fromUrl : prev
    );
    setQueryValues((prev) =>
      JSON.stringify(prev) !== JSON.stringify(fromUrl) ? fromUrl : prev
    );
  }, [searchParams, getFiltersFromUrl, fields]);

  useEffect(() => {
    return () => {
      if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
    };
  }, []);

  const updateUrl = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const config = fields[key];

      setInputValues((prev) =>
        value ? { ...prev, [key]: value } : omitKey(prev, key)
      );

      const delay = config?.type === "text" ? (config.debounce ?? 300) : 0;

      if (delay > 0) {
        if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
        textDebounceRef.current = setTimeout(() => {
          textDebounceRef.current = null;
          pendingFilterRef.current = { key, value };
          setQueryValues((prev) =>
            value ? { ...prev, [key]: value } : omitKey(prev, key)
          );
          updateUrl(key, value);
        }, delay);
      } else {
        setQueryValues((prev) =>
          value ? { ...prev, [key]: value } : omitKey(prev, key)
        );
        updateUrl(key, value);
      }
    },
    [fields, updateUrl]
  );

  const clearFilters = useCallback(() => {
    if (textDebounceRef.current) {
      clearTimeout(textDebounceRef.current);
      textDebounceRef.current = null;
    }
    pendingFilterRef.current = null;
    clearingRef.current = true;
    setInputValues({});
    setQueryValues({});
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(fields).forEach((key) => params.delete(key));
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [fields, searchParams, pathname, router]);

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, searchParams, router]
  );

  return {
    inputValues,
    queryValues,
    setFilter,
    clearFilters,
    setPage,
  };
};
