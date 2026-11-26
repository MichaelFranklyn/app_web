"use client";

import { SORT_DIR_PARAM, SORT_KEY_PARAM } from "@/hooks/useTableData";
import { formatDateDMY } from "@/utils/format/masks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ORDER_TABLE_FIELDS, PENDING_ORDER_TABLE_FIELDS } from "./utils";

export type OrdersTab = "all" | "pending" | "delivery";

/**
 * O recorte de cada aba é um filtro que o backend entende (ver
 * `_scope_order_filters`): o cliente não precisa saber o valor do enum nem a
 * conta do prazo de entrega, que usa o dia do negócio.
 */
const TAB_FILTERS: Record<
  OrdersTab,
  { field: string; value: string }[] | undefined
> = {
  all: undefined,
  pending: [{ field: "pending_invoice", value: "true" }],
  delivery: [{ field: "awaiting_delivery", value: "true" }],
};

const TAB_SCOPE_LABEL: Record<OrdersTab, string | null> = {
  all: null,
  pending: "Somente: esperando faturamento",
  delivery: "Somente: esperando entrega",
};

const parseTab = (value: string | null): OrdersTab =>
  value === "pending" || value === "delivery" ? value : "all";

/** Parâmetro de "Ver pedidos" em Configurações › Importar: um lote do histórico. */
export const IMPORT_BATCH_PARAM = "importBatch";
/** Quando o lote foi importado (ISO), só para o texto do recorte. */
export const IMPORT_DATE_PARAM = "importedAt";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Só um id válido vira filtro: lixo na URL viraria erro do banco na tela. */
export const parseImportBatch = (value: string | null): string | null =>
  value && UUID_RE.test(value) ? value : null;

/** "pedidos da importação de 17/11/2026"; sem data legível, o genérico. */
export const importScopeText = (importDate: string) =>
  importDate
    ? `pedidos da importação de ${importDate}`
    : "pedidos de uma importação";

/** Junta o recorte da aba com o do lote: "Somente: esperando entrega · pedidos da importação de 17/11/2026". */
export function joinScopeLabel(
  tabLabel: string | null,
  importBatchId: string | null,
  importDate = ""
): string | null {
  if (!importBatchId) return tabLabel;
  const text = importScopeText(importDate);
  return tabLabel ? `${tabLabel} · ${text}` : `Somente: ${text}`;
}

/** A aba ativa (na URL) e o que muda com ela. */
export function useOrdersTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const importBatchId = parseImportBatch(searchParams.get(IMPORT_BATCH_PARAM));
  // Data inválida na URL sai vazia e o texto cai no genérico.
  const importDate = importBatchId
    ? formatDateDMY(searchParams.get(IMPORT_DATE_PARAM) ?? undefined)
    : "";

  // Trocar de aba volta para a página 1: a paginação é a mesma da URL, e ficar
  // na página 3 de uma lista que agora tem 5 pedidos mostraria a lista vazia.
  // A ordenação também sai: cada aba tem a sua (ver `_default_order_ordering`).
  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = parseTab(value);
    if (next === "all") params.delete("tab");
    else params.set("tab", next);
    params.delete("page");
    params.delete(SORT_KEY_PARAM);
    params.delete(SORT_DIR_PARAM);
    router.push(`${pathname}?${params.toString()}`);
  };

  // O lote vale em todas as abas (trocar de aba o mantém na URL); sair dele
  // também volta à página 1, pela mesma razão da troca de aba.
  const clearImportBatch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(IMPORT_BATCH_PARAM);
    params.delete(IMPORT_DATE_PARAM);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const importFilters = importBatchFilters(importBatchId);
  const tabFilters = TAB_FILTERS[tab];

  return {
    tab,
    setTab,
    importBatchId,
    importDate,
    clearImportBatch,
    /** Só o do lote: a contagem das abas soma a fila DENTRO do lote. */
    importFilters,
    baseFilters:
      tabFilters || importFilters.length > 0
        ? [...(tabFilters ?? []), ...importFilters]
        : undefined,
    // A situação é o próprio recorte das duas abas filtradas.
    tableFields:
      tab === "all" ? ORDER_TABLE_FIELDS : PENDING_ORDER_TABLE_FIELDS,
    scopeLabel: joinScopeLabel(TAB_SCOPE_LABEL[tab], importBatchId, importDate),
  };
}

export const importBatchFilters = (importBatchId: string | null) =>
  importBatchId
    ? [{ field: "import_batch_id", value: importBatchId, operator: "eq" }]
    : [];
