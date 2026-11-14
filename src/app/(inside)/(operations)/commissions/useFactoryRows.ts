"use client";

import { useHeldResult } from "@/hooks/useHeldResult";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { COMMISSIONS_FACTORY_ROWS_QUERY } from "./gql";
import {
  CommissionFactoryRowsData,
  CommissionMonthInput,
  CommissionsFactoryRowsResponse,
} from "./interface";
import { COMMISSIONS_PAGE_SIZE } from "./useCommissionsQuery";

interface Params {
  /** O recorte da tela — o MESMO do resumo. */
  input: CommissionMonthInput;
  factoryId: string;
  /** Cartão fechado não busca: as linhas só vêm quando alguém vai lê-las. */
  enabled: boolean;
  /**
   * A primeira página deste cartão, quando ela já veio junto do resumo (o
   * cartão que a tela abre sozinha). Evita a segunda ida ao servidor na
   * abertura.
   */
  seed?: CommissionFactoryRowsData;
}

/**
 * As parcelas de UMA fábrica, uma página por vez, filtradas e ordenadas no
 * servidor.
 *
 * A página é estado do cartão, e vale para UM recorte: trocar de mês, aba,
 * filtro ou ordem volta para a primeira — a página 3 de outro recorte não quer
 * dizer nada neste.
 */
export const useFactoryRows = ({ input, factoryId, enabled, seed }: Params) => {
  const [position, setPosition] = useState({ input, page: 1 });
  const page = position.input === input ? position.page : 1;
  const setPage = (next: number) => setPosition({ input, page: next });

  const usesSeed = page === 1 && seed?.factoryId === factoryId;
  const variables = {
    input,
    factoryId,
    first: COMMISSIONS_PAGE_SIZE,
    offset: (page - 1) * COMMISSIONS_PAGE_SIZE,
  };
  const query = useQuery<CommissionsFactoryRowsResponse>(
    COMMISSIONS_FACTORY_ROWS_QUERY,
    {
      variables,
      fetchPolicy: "cache-and-network",
      skip: !enabled || usesSeed,
    }
  );
  const { loading, error, refetch } = query;
  const held = useHeldResult(query, variables);

  // Trocar de página mantém a anterior na tela até a nova chegar (e a falha
  // de uma página nova não deixa a anterior fingindo ser ela).
  const fetched = held.shown?.commission_month_rows;
  const current = usesSeed ? seed : fetched;
  const totalCount = current?.totalCount ?? 0;

  return {
    rows: current?.rows,
    totalCount,
    page,
    setPage,
    totalPages: Math.max(1, Math.ceil(totalCount / COMMISSIONS_PAGE_SIZE)),
    showSkeleton: enabled && !current && !error,
    isRefreshing: loading && Boolean(current),
    hasFailed: !usesSeed && held.failed,
    retry: () => void refetch(),
  };
};
