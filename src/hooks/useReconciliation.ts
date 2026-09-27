"use client";

import { useEffect, useState } from "react";

import { suggestMatch } from "@/utils/import/similarity";

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
