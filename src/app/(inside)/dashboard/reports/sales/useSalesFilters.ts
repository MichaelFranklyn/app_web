"use client";

import { ORDER_STATUS_LABELS } from "@/app/(inside)/_shared/orderStatus";
import { FilterField } from "@/components/Filters";
import { useMemo } from "react";

/**
 * Campos do painel de filtros da aba de vendas.
 *
 * Só duas situações: a aba é o que a fábrica FATUROU, e faturado que ainda não
 * chegou (`INVOICED`) × faturado e entregue (`DELIVERED`) é a única distinção
 * que existe aqui. Oferecer "confirmado" devolveria a tabela vazia.
 *
 * O recorte vai para a QUERY (a tabela pagina no servidor), diferente das abas
 * que filtram em memória — ver `SALES_TABLE_FIELDS`.
 */
export const useSalesFilters = (): FilterField[] =>
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
        placeholder: "Faturados e entregues",
        options: [
          { value: "INVOICED", label: ORDER_STATUS_LABELS.INVOICED },
          { value: "DELIVERED", label: ORDER_STATUS_LABELS.DELIVERED },
        ],
      },
    ],
    []
  );
