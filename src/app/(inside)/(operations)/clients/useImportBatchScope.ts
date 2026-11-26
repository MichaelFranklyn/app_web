"use client";

import { formatDateDMY } from "@/utils/format/masks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IMPORT_BATCH_PARAM,
  IMPORT_DATE_PARAM,
  importBatchFilters,
  importScopeLabel,
  parseImportBatch,
} from "./utils";

/**
 * O lote de importação na URL (vindo de "Ver clientes novos") e o que muda com
 * ele: o filtro da lista, a linha do recorte no PDF e o "Ver todos".
 */
export function useImportBatchScope() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const importBatchId = parseImportBatch(searchParams.get(IMPORT_BATCH_PARAM));
  // Data inválida na URL sai vazia e o texto cai no genérico.
  const importDate = importBatchId
    ? formatDateDMY(searchParams.get(IMPORT_DATE_PARAM) ?? undefined)
    : "";

  // Sair do lote volta à página 1: ficar na página 3 de uma lista que agora
  // é outra mostraria um pedaço qualquer da carteira.
  const clearImportBatch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(IMPORT_BATCH_PARAM);
    params.delete(IMPORT_DATE_PARAM);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const importFilters = importBatchFilters(importBatchId);

  return {
    importBatchId,
    importDate,
    clearImportBatch,
    baseFilters: importFilters.length > 0 ? importFilters : undefined,
    scopeLabel: importScopeLabel(importBatchId, importDate),
  };
}
