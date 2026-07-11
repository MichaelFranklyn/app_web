/**
 * Desce por uma cadeia de chaves já segmentada, parando em `undefined` no
 * primeiro nível que não for objeto. Base de {@link getNestedValue} (que
 * apenas separa a string por ".") — exposta à parte para quem já tem os
 * segmentos em mãos (ex.: a ordenação em sort.ts), evitando reconstruir e
 * reparsear o caminho.
 */
export const getNestedValueFromSegments = (
  obj: unknown,
  segments: string[]
): unknown => {
  if (segments.length === 0 || obj == null) return undefined;

  return segments.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

export const getNestedValue = (obj: unknown, path: string): unknown => {
  if (!path || !obj) return undefined;
  return getNestedValueFromSegments(obj, path.split("."));
};
