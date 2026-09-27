"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { useAsyncAction } from "@/hooks/useAsyncAction";

import { IMPORT_ORDER_HISTORY_MUTATION } from "./gql";
import {
  HistoryResult,
  HistoryRowInput,
  ImportOrderHistoryResponse,
  QuantityUnit,
  RowProblem,
} from "./interface";
import { chunkByOrder, mergeResults } from "./utils";

interface RunInput {
  rows: HistoryRowInput[];
  problems: RowProblem[];
  quantityUnit: QuantityUnit;
}

/**
 * Manda a planilha ao servidor em lotes, primeiro como prévia (nada é gravado)
 * e depois de verdade. O resultado dos lotes é somado num resumo só; os
 * problemas vistos já na tela (data ilegível, fábrica sem par) entram junto.
 */
export function useHistoryRun() {
  const [mutate] = useMutation<ImportOrderHistoryResponse>(
    IMPORT_ORDER_HISTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [preview, setPreview] = useState<HistoryResult | null>(null);
  const [imported, setImported] = useState<HistoryResult | null>(null);
  const [localProblems, setLocalProblems] = useState<RowProblem[]>([]);

  const run = async ({ rows, quantityUnit }: RunInput, dryRun: boolean) => {
    const chunks = chunkByOrder(rows);
    const results: HistoryResult[] = [];
    setProgress({ done: 0, total: chunks.length });
    for (const [index, chunk] of chunks.entries()) {
      const res = await mutate({
        variables: { input: { rows: chunk, quantityUnit, dryRun } },
      });
      const payload = res.data?.importOrderHistory;
      if (!payload?.status || !payload.data) {
        throw new Error(
          payload?.message ?? "Não foi possível importar o histórico."
        );
      }
      results.push(payload.data);
      setProgress({ done: index + 1, total: chunks.length });
    }
    return mergeResults(results);
  };

  const check = (input: RunInput) =>
    execute(() => run(input, true), {
      errorMessage: "Não foi possível conferir a planilha.",
      onSuccess: (result) => {
        setLocalProblems(input.problems);
        setPreview(result);
      },
    });

  const confirm = (input: RunInput) =>
    execute(() => run(input, false), {
      errorMessage:
        "A importação parou no meio. O que já entrou ficou gravado: confira em Pedidos antes de tentar de novo.",
      successMessage: (result) =>
        `${result.ordersCreated} pedido(s) importado(s).`,
      onSuccess: setImported,
    });

  return {
    check,
    confirm,
    running: isLoading,
    progress,
    preview,
    imported,
    localProblems,
    resetPreview: () => setPreview(null),
  };
}
