"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";

import { IMPORT_PRODUCTS_MUTATION } from "./gql";
import {
  ImportProductRow,
  ImportProductsResponse,
  ImportResult,
} from "./interface";

/**
 * Encapsula a mutation de importação de produtos: dispara, guarda o resumo,
 * mostra o toast contextual e avisa a lista para atualizar. Compartilhado pelos
 * dois modos (modelo pronto e mapeamento da planilha da fábrica).
 */
export const useProductImport = (companyFactoryId: string, onChanged: () => void) => {
  const { toast } = useToast();
  const [importProducts] = useMutation<ImportProductsResponse>(IMPORT_PRODUCTS_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const [result, setResult] = useState<ImportResult | null>(null);

  const runImport = async (rows: ImportProductRow[]) => {
    await execute(
      async () => {
        const res = await importProducts({
          variables: { input: { companyFactoryId, rows } },
        });
        const payload = res.data?.importProducts;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar produtos");
        }
        return { data: payload.data, message: payload.message };
      },
      {
        onSuccess: ({ data, message }) => {
          setResult(data);
          if (data.created > 0) onChanged();

          const allFailed = data.created === 0 && data.skipped === 0;
          toast({
            variant: data.failed > 0 ? "warning" : "success",
            title: allFailed
              ? "Nenhum produto importado"
              : data.failed > 0
                ? "Importação parcial"
                : "Importação concluída",
            description: message,
          });
        },
      }
    );
  };

  return { runImport, result, isLoading, resetResult: () => setResult(null) };
};
