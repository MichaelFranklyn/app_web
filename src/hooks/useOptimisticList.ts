"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseOptimisticListOptions<T> {
  initialData: T[];
  onAddItem?: (item: T) => void;
  onRemoveItem?: (id: string) => void;
}

export interface UseOptimisticListReturn<T> {
  items: T[];
  setItems: (items: T[]) => void;
  addOptimistic: (item: T) => void;
  updateOptimistic: (id: string, updates: Partial<T>) => void;
  removeOptimistic: (id: string) => void;
  rollback: () => void;
  commit: () => void;
}

export const useOptimisticList = <T extends { id: string }>(
  options: UseOptimisticListOptions<T>
): UseOptimisticListReturn<T> => {
  const { initialData, onAddItem, onRemoveItem } = options;

  const [items, setItems] = useState<T[]>(initialData);
  const [previousItems, setPreviousItems] = useState<T[]>(initialData);
  const lastSyncedData = useRef<string>(JSON.stringify(initialData));

  // Sincroniza internamente quando os dados iniciais mudam (ex: refetch do Apollo)
  useEffect(() => {
    const dataString = JSON.stringify(initialData);
    if (dataString !== lastSyncedData.current) {
      setItems(initialData);
      setPreviousItems(initialData);
      lastSyncedData.current = dataString;
    }
  }, [initialData]);

  const addOptimistic = useCallback(
    (item: T) => {
      setPreviousItems(items);
      setItems((prev) => [item, ...prev]);
      onAddItem?.(item);
    },
    [items, onAddItem]
  );

  const updateOptimistic = useCallback(
    (id: string, updates: Partial<T>) => {
      setPreviousItems(items);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [items]
  );

  const removeOptimistic = useCallback(
    (id: string) => {
      setPreviousItems(items);
      setItems((prev) => prev.filter((item) => item.id !== id));
      onRemoveItem?.(id);
    },
    [items, onRemoveItem]
  );

  const rollback = useCallback(() => {
    setItems(previousItems);
  }, [previousItems]);

  const commit = useCallback(() => {
    setPreviousItems(items);
  }, [items]);

  return useMemo(
    () => ({
      items,
      setItems,
      addOptimistic,
      updateOptimistic,
      removeOptimistic,
      rollback,
      commit,
    }),
    [
      items,
      addOptimistic,
      updateOptimistic,
      removeOptimistic,
      rollback,
      commit,
    ]
  );
};
