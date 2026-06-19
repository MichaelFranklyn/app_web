"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseOptimisticObjectOptions<T> {
  initialData: T;
  onUpdate?: (data: T) => void;
}

export interface UseOptimisticObjectReturn<T> {
  data: T;
  updateOptimistic: (updates: Partial<T>) => void;
  rollback: () => void;
  commit: () => void;
}

export const useOptimisticObject = <T extends object>(
  options: UseOptimisticObjectOptions<T>
): UseOptimisticObjectReturn<T> => {
  const { initialData, onUpdate } = options;

  const [data, setData] = useState<T>(initialData);
  const [previousData, setPreviousData] = useState<T>(initialData);
  const lastSyncedData = useRef<string>(JSON.stringify(initialData));

  // Sincroniza internamente quando os dados iniciais mudam (ex: refetch/load do Apollo)
  useEffect(() => {
    const dataString = JSON.stringify(initialData);
    if (dataString !== lastSyncedData.current) {
      setData(initialData);
      setPreviousData(initialData);
      lastSyncedData.current = dataString;
    }
  }, [initialData]);

  const updateOptimistic = useCallback(
    (updates: Partial<T>) => {
      setPreviousData(data);
      const newData = { ...data, ...updates };
      setData(newData);
      onUpdate?.(newData);
    },
    [data, onUpdate]
  );

  const rollback = useCallback(() => {
    setData(previousData);
  }, [previousData]);

  const commit = useCallback(() => {
    setPreviousData(data);
  }, [data]);

  return {
    data,
    updateOptimistic,
    rollback,
    commit,
  };
};
