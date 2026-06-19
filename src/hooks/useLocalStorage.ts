import { useCallback, useEffect, useState } from "react";

export const useLocalStorage = <T>(
  keyName: string,
  defaultValue: T
): [T, (newValue: T) => void, () => void] => {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = window.localStorage.getItem(keyName);
      return item && item !== "undefined"
        ? (JSON.parse(item) as T)
        : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${keyName}”:`, error);
      return defaultValue;
    }
  }, [defaultValue, keyName]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T) => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(keyName, JSON.stringify(value));
          setStoredValue(value);

          window.dispatchEvent(new Event("local-storage"));
        }
      } catch (error) {
        console.error(`Error setting localStorage key “${keyName}”:`, error);
      }
    },
    [keyName]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(keyName);
        setStoredValue(defaultValue);
        window.dispatchEvent(new Event("local-storage"));
      }
    } catch (error) {
      console.error(`Error removing localStorage key “${keyName}”:`, error);
    }
  }, [defaultValue, keyName]);

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
};
