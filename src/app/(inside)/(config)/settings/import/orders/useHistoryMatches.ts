"use client";

import { useEffect, useMemo, useState } from "react";

import { distinctValues } from "@/utils/import/columns";

import { MatchOption } from "../interface";
import { STATUS_OPTIONS } from "../utils";
import { HistoryMapping } from "./interface";
import { guessMatches, guessStatusMatches } from "./utils";

type Matches = Record<string, string | null>;

type Guess = (values: string[], options: MatchOption[]) => Matches;

/**
 * Qual fábrica, vendedor e status daqui é cada valor da planilha. O palpite
 * entra só para o valor ainda não decidido: a escolha da pessoa nunca é
 * sobrescrita quando as opções terminam de carregar.
 */
function useValueMatches(
  values: string[],
  options: MatchOption[],
  guess: Guess = guessMatches
) {
  const [matches, setMatches] = useState<Matches>({});

  useEffect(() => {
    if (options.length === 0) return;
    const guesses = guess(values, options);
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
  }, [values, options, guess]);

  const set = (value: string, id: string | null) =>
    setMatches((prev) => ({ ...prev, [value]: id }));

  return { matches, set };
}

/** O status se reconhece por palavra ("Faturado parcialmente"), não por semelhança. */
const guessStatusValues: Guess = (values) => guessStatusMatches(values);

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
  const statusValues = useMemo(
    () => (mapping ? distinctValues(rows, mapping.status) : []),
    [rows, mapping]
  );
  const factories = useValueMatches(factoryValues, factoryOptions);
  const sellers = useValueMatches(sellerValues, sellerOptions);
  const statuses = useValueMatches(
    statusValues,
    STATUS_OPTIONS,
    guessStatusValues
  );
  const [defaultSellerId, setDefaultSellerId] = useState<string | null>(null);

  const hasSellerColumn = mapping?.seller.kind !== "none";
  const hasStatusColumn = !!mapping && mapping.status.kind !== "none";
  const pending =
    factoryValues.filter((v) => !factories.matches[v]).length +
    (hasSellerColumn
      ? sellerValues.filter((v) => !sellers.matches[v]).length
      : defaultSellerId
        ? 0
        : 1) +
    (hasStatusColumn
      ? statusValues.filter((v) => !statuses.matches[v]).length
      : 0);

  return {
    factoryValues,
    sellerValues,
    factoryMatches: factories.matches,
    setFactoryMatch: factories.set,
    sellerMatches: sellers.matches,
    setSellerMatch: sellers.set,
    hasSellerColumn,
    statusValues,
    statusMatches: statuses.matches,
    setStatusMatch: statuses.set,
    hasStatusColumn,
    defaultSellerId,
    setDefaultSellerId,
    /** Valores ainda sem par. Linha sem par fica de fora; a tela avisa. */
    pending,
  };
}
