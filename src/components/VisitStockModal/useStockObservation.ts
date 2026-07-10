"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION,
  VISIT_STOCK_CANDIDATES_QUERY,
  VISIT_STOCK_OBSERVATIONS_QUERY,
} from "./gql";

export interface StockCandidateProduct {
  id: string;
  name: string;
  sku: string | null;
}

export interface StockCandidateGroup {
  sellerClientFactoryId: string;
  /** Vendedor e cliente do vínculo — o pedido desta fábrica nasce deles. */
  sellerId: string;
  clientId: string;
  isFocus: boolean;
  /** `NO_PRODUCTS`: fábrica sem nada a observar; só serve para lançar pedido. */
  source: "LAST_ORDER" | "TRACKED" | "NO_PRODUCTS";
  lastOrderDate: string | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  products: StockCandidateProduct[];
}

interface CandidatesData {
  visitStockCandidates: StockCandidateGroup[];
}
interface ObsData {
  visitStockObservations: {
    edges: {
      node: {
        id: string;
        productId: string;
        daysRemaining: number | null;
        observation: string;
      };
    }[];
  };
}

/**
 * Queries que dependem da previsão de esgotamento e ficam desatualizadas depois
 * de registrar o estoque. Elas vivem em OUTRAS abas (Estoque, Score) e não estão
 * montadas agora, então evict é o certo — refazem o fetch ao remontar.
 * Ver a convenção em `useInvalidateQueries`.
 */
const STALE_AFTER_SAVE = [
  "clientProductInsights", // aba Estoque: tabela de produtos da fábrica
  "companyClient", // factoryStockSummaries (cards de estoque) e topVisitScore
  "clientVisitScores", // histórico de score no modal da aba Score
];

/**
 * Observação de estoque de uma visita, para TODAS as fábricas do cliente.
 *
 * O vendedor vai à loja e pergunta pelo estoque de vários catálogos: pode ter
 * sido orientado a ir por causa da fábrica X, mas aproveita para levantar Y e Z.
 *
 * O que ele marca aqui corrige, no backend, a data estimada de esgotamento de
 * cada produto — que é a fonte da urgência do próximo score.
 */
export function useStockObservation(itemId: string, onSaved?: () => void) {
  const { data: candidatesData, loading: loadingCandidates } =
    useQuery<CandidatesData>(VISIT_STOCK_CANDIDATES_QUERY, {
      variables: { itemId },
      skip: !itemId,
    });

  const {
    data: obsData,
    loading: loadingObs,
    refetch: refetchObs,
  } = useQuery<ObsData>(VISIT_STOCK_OBSERVATIONS_QUERY, {
    variables: { itemId, input: { first: 100 } },
    skip: !itemId,
  });

  const groups = useMemo(
    () => candidatesData?.visitStockCandidates ?? [],
    [candidatesData]
  );

  const allProducts = useMemo(
    () => groups.flatMap((group) => group.products),
    [groups]
  );

  // productId → dias que o produto ainda dura, segundo o cliente. `null` = não
  // perguntado. Observações antigas (sem o número) entram como `null`.
  const [daysMap, setDaysMap] = useState<Record<string, number | null>>({});
  useEffect(() => {
    const init: Record<string, number | null> = {};
    for (const edge of obsData?.visitStockObservations.edges ?? []) {
      init[edge.node.productId] = edge.node.daysRemaining;
    }
    setDaysMap(init);
  }, [obsData]);

  const [save] = useMutation(SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  /** Tocar de novo no mesmo atalho desmarca o produto. */
  const setDays = (productId: string, days: number | null) => {
    setDaysMap((prev) => ({
      ...prev,
      [productId]: prev[productId] === days ? null : days,
    }));
  };

  const selectedCount = Object.values(daysMap).filter((d) => d !== null).length;

  const handleSave = async () => {
    const observations = allProducts
      .filter((p) => daysMap[p.id] !== null && daysMap[p.id] !== undefined)
      .map((p) => ({ productId: p.id, daysRemaining: daysMap[p.id] }));

    await execute(
      async () => {
        const res = await save({ variables: { itemId, observations } });
        const payload = (
          res.data as {
            saveVisitStockObservations?: { status: boolean; message: string };
          }
        )?.saveVisitStockObservations;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao salvar observações");
        }
        return payload;
      },
      {
        successMessage: "Estoque registrado",
        onSuccess: async () => {
          refetchObs();
          // O backend acabou de corrigir a previsão de esgotamento: as abas
          // Estoque e Score mostrariam o valor antigo do cache.
          await invalidateClient(STALE_AFTER_SAVE);
          onSaved?.();
        },
      }
    );
  };

  return {
    loading: loadingCandidates || loadingObs,
    groups,
    totalProducts: allProducts.length,
    daysMap,
    setDays,
    selectedCount,
    handleSave,
    isLoading,
  };
}
