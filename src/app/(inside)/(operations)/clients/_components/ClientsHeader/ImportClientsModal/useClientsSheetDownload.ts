"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useCallback } from "react";

import { useToast } from "@/components/Toast";

import { COMPANY_CLIENTS_IMPORT_SHEET_QUERY } from "./gql";
import { CompanyClientsImportSheetResponse } from "./interface";
import { downloadClientsSheet } from "./sheetFile";

/**
 * Baixa a planilha já com a carteira da empresa (sem cliente, sai o exemplo).
 * A query só vai ao servidor no clique.
 */
export const useClientsSheetDownload = () => {
  const { toast } = useToast();
  const [fetchSheet] = useLazyQuery<CompanyClientsImportSheetResponse>(
    COMPANY_CLIENTS_IMPORT_SHEET_QUERY,
    { fetchPolicy: "network-only" }
  );

  return useCallback(async () => {
    try {
      const { data, error } = await fetchSheet();
      const payload = data?.companyClientsImportSheet;
      if (error || !payload?.status) {
        throw new Error(
          payload?.message ?? "Não foi possível baixar a planilha."
        );
      }
      await downloadClientsSheet({
        rows: payload.data?.rows ?? [],
        sellerEmails: payload.data?.sellerEmails ?? [],
        factoryNames: payload.data?.factoryNames ?? [],
      });
    } catch (err) {
      toast({
        variant: "error",
        title: "Planilha não baixada",
        description:
          err instanceof Error ? err.message : "Tente de novo em instantes.",
      });
    }
  }, [fetchSheet, toast]);
};
