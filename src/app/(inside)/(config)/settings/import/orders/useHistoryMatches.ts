"use client";

import { useEffect, useMemo, useState } from "react";

import { distinctValues } from "@/utils/import/columns";

import { HistoryMapping, MatchOption } from "./interface";
import { guessMatches } from "./utils";

type Matches = Record<string, string | null>;

/**
 * Qual fábrica e qual vendedor daqui é cada nome da planilha. O palpite
 * (nome mais parecido) entra só para o valor ainda não decidido: a escolha da
 * pessoa nunca é sobrescrita quando as opções terminam de carregar.
 */
function useValueMatches(values: string[], options: MatchOption[]) {
  const [matches, setMatches] = useState<Matches>({});

  useEffect(() => {
    if (options.length === 0) return;
    const guesses = guessMatches(values, options);
    setMatches((prev) => {
      const next: Matches = {};
      for (const value of values)
        next[value] = value in prev ? prev[value] : guesses[value];
      // Mesmo conteúdo, mesmo objeto: sem render à toa.
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.entries(next).every(([k, v]) => prev[k] === v);
      return same ? prev : next;
    });
  }, [values, options]);

  const set = (value: string, id: string | null) =>
    setMatches((prev) => ({ ...prev, [value]: id }));

  return { matches, set };
}

interface Params {
  rows: string[][];
  mapping: HistoryMapping | null;
  factoryOptions: MatchOption[];
  sellerOptions: MatchOption[];
}

export function useHistoryMatches({
  rows,
  mapping,
  factoryOptions,
  sellerOptions,
}: Params) {
  const factoryValues = useMemo(
    () => (mapping ? distinctValues(rows, mapping.factory) : []),
    [rows, mapping]
  );
  const sellerValues = useMemo(
    () => (mapping ? distinctValues(rows, mapping.seller) : []),
    [rows, mapping]
  );
  const factories = useValueMatches(factoryValues, factoryOptions);
  const sellers = useValueMatches(sellerValues, sellerOptions);
  const [defaultSellerId, setDefaultSellerId] = useState<string | null>(null);

  const hasSellerColumn = mapping?.seller.kind !== "none";
  const pending =
    factoryValues.filter((v) => !factories.matches[v]).length +
    (hasSellerColumn
      ? sellerValues.filter((v) => !sellers.matches[v]).length
      : defaultSellerId
        ? 0
        : 1);

  return {
    factoryValues,
    sellerValues,
    factoryMatches: factories.matches,
    setFactoryMatch: factories.set,
    sellerMatches: sellers.matches,
    setSellerMatch: sellers.set,
    hasSellerColumn,
    defaultSellerId,
    setDefaultSellerId,
    /** Valores ainda sem par. Linha sem par fica de fora; a tela avisa. */
    pending,
  };
}
