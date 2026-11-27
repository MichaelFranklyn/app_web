"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { CLIENT_CACHE_FIELDS } from "@/utils/cacheFields";

import { IMPORT_COMPANY_CLIENTS_MUTATION } from "./gql";
import {
  ImportClientRow,
  ImportCompanyClientsResponse,
  ImportResult,
} from "./interface";

const changedSomething = (data: ImportResult): boolean =>
  data.created > 0 || data.linksCreated > 0 || data.codesSaved > 0;

const toastTitle = (data: ImportResult): string => {
  if (!changedSomething(data) && data.skipped === 0) {
    return "Nenhum cliente importado";
  }
  return data.failed > 0 ? "Importação parcial" : "Importação concluída";
};

/** Envia as linhas já lidas da planilha e guarda o resumo da importação. */
export function useClientsImport() {
  const [result, setResult] = useState<ImportResult | null>(null);

  const { toast } = useToast();
  const invalidateClient = useInvalidateQueriesClient();
  const [importClients] = useMutation<ImportCompanyClientsResponse>(
    IMPORT_COMPANY_CLIENTS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const runImport = (rows: ImportClientRow[]) =>
    execute(
      async () => {
        const res = await importClients({ variables: { input: { rows } } });
        const payload = res.data?.importCompanyClients;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar clientes");
        }
        return { data: payload.data, message: payload.message };
      },
      {
        onSuccess: async ({ data, message }) => {
          setResult(data);
          if (changedSomething(data)) {
            await invalidateClient(CLIENT_CACHE_FIELDS);
          }
          toast({
            variant: data.failed > 0 ? "warning" : "success",
            title: toastTitle(data),
            description: message,
          });
        },
      }
    );

  return {
    runImport,
    result,
    isLoading,
    resetResult: () => setResult(null),
  };
}
