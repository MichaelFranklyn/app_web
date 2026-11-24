"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { useState } from "react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { plural } from "@/utils/format/plural";

import {
  HISTORY_IMPORT_BATCHES_QUERY,
  IMPORT_ORDER_HISTORY_MUTATION,
} from "./gql";
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
  createMissingClients: boolean;
  createMissingProducts: boolean;
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
  const client = useApolloClient();
  const { execute, isLoading } = useAsyncAction();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [preview, setPreview] = useState<HistoryResult | null>(null);
  const [imported, setImported] = useState<HistoryResult | null>(null);
  const [localProblems, setLocalProblems] = useState<RowProblem[]>([]);

  const run = async (
    {
      rows,
      quantityUnit,
      createMissingClients,
      createMissingProducts,
    }: RunInput,
    dryRun: boolean
  ) => {
    const chunks = chunkByOrder(rows);
    const results: HistoryResult[] = [];
    // Os pedaços da mesma planilha formam UM lote: o servidor devolve o id no
    // primeiro e ele vai junto nos seguintes, para desfazer tudo de uma vez.
    let batchId: string | null = null;
    setProgress({ done: 0, total: chunks.length });
    for (const [index, chunk] of chunks.entries()) {
      const res = await mutate({
        variables: {
          input: {
            rows: chunk,
            quantityUnit,
            createMissingClients,
            createMissingProducts,
            dryRun,
            ...(batchId ? { batchId } : {}),
          },
        },
      });
      const payload = res.data?.importOrderHistory;
      if (!payload?.status || !payload.data) {
        throw new Error(
          payload?.message ?? "Não foi possível importar o histórico."
        );
      }
      batchId ??= payload.data.batchId ?? null;
      results.push(payload.data);
      setProgress({ done: index + 1, total: chunks.length });
    }
    return { ...mergeResults(results), batchId };
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
    execute(
      async () => {
        try {
          return await run(input, false);
        } finally {
          // Inteira ou parada no meio, o lote aparece em "Importações feitas"
          // já com o Desfazer.
          void client.refetchQueries({
            include: [HISTORY_IMPORT_BATCHES_QUERY],
          });
        }
      },
      {
        errorMessage:
          'A importação parou no meio. O que já entrou ficou gravado: desfaça-a em "Importações feitas", abaixo, antes de tentar de novo.',
        successMessage: (result) =>
          `${plural(result.ordersCreated, "pedido importado", "pedidos importados")}.`,
        onSuccess: setImported,
      }
    );

  return {
    check,
    confirm,
    running: isLoading,
    progress,
    preview,
    imported,
    localProblems,
    resetPreview: () => setPreview(null),
    /** Volta ao começo: some a prévia e o resultado da última importação. */
    reset: () => {
      setPreview(null);
      setImported(null);
    },
  };
}
