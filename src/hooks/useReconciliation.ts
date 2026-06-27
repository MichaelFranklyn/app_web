"use client";

import { useEffect, useState } from "react";

/** Normaliza para comparação: sem acento, minúsculo, espaços colapsados. */
const normalize = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const similarity = (a: string, b: string): number => {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  return 1 - levenshtein(na, nb) / Math.max(na.length, nb.length);
};

/** Sugere o rótulo existente mais parecido (>= 70% de similaridade) ou null. */
const suggestMatch = (value: string, options: string[]): string | null => {
  let best: string | null = null;
  let bestScore = 0;
  for (const option of options) {
    const score = similarity(value, option);
    if (score > bestScore) {
      bestScore = score;
      best = option;
    }
  }
  return bestScore >= 0.7 ? best : null;
};

/**
 * Mantém um mapa `valorDaPlanilha -> rótuloFinal`. Para cada valor distinto,
 * pré-seleciona o existente mais parecido (ou o próprio valor = criar novo),
 * preservando ajustes manuais já feitos.
 */
export const useReconciliation = (
  values: string[],
  existingLabels: string[]
) => {
  const [recon, setRecon] = useState<Record<string, string>>({});
  const valuesKey = values.join("");
  const optionsKey = existingLabels.join("");

  useEffect(() => {
    setRecon((prev) => {
      const next: Record<string, string> = {};
      for (const value of values) {
        next[value] =
          prev[value] ?? suggestMatch(value, existingLabels) ?? value;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey, optionsKey]);

  const setFinal = (value: string, final: string) =>
    setRecon((prev) => ({ ...prev, [value]: final }));

  return { recon, setFinal };
};
