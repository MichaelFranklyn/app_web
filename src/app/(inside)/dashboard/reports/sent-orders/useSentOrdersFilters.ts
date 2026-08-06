"use client";

import { ORDER_STATUS_LABELS } from "@/app/(inside)/_shared/orderStatus";
import { FilterField } from "@/components/Filters";
import { useMemo } from "react";

import { PLACED_ORDER_STATUSES } from "../utils";

/**
 * Campos do painel de filtros dos pedidos enviados.
 *
 * As situações oferecidas são só as três que a aba cobre (o que virou pedido de
 * verdade): escolher uma delas é como se pergunta "o que a fábrica ainda não
 * faturou" sem ter de ler a coluna linha por linha.
 *
 * O recorte vai para a QUERY (a tabela pagina no servidor) — ver
 * `SENT_ORDERS_TABLE_FIELDS`.
 */
export const useSentOrdersFilters = (): FilterField[] =>
  useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Busca",
        placeholder: "Fábrica, vendedor ou código do pedido",
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: PLACED_ORDER_STATUSES.map((status) => ({
          value: status,
          label: ORDER_STATUS_LABELS[status as "CONFIRMED"],
        })),
      },
    ],
    []
  );
