export const getNestedValue = (obj: unknown, path: string): unknown => {
  if (!path || !obj) return undefined;

  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
};
