"use client";

import { SORT_DIR_PARAM, SORT_KEY_PARAM } from "@/hooks/useTableData";
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

/** A aba ativa (na URL) e o que muda com ela. */
export function useOrdersTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

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

  return {
    tab,
    setTab,
    baseFilters: TAB_FILTERS[tab],
    // A situação é o próprio recorte das duas abas filtradas.
    tableFields:
      tab === "all" ? ORDER_TABLE_FIELDS : PENDING_ORDER_TABLE_FIELDS,
    scopeLabel: TAB_SCOPE_LABEL[tab],
  };
}
