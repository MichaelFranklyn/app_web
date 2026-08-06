"use client";

import { COMMISSION_STATUS_LABEL } from "@/app/(inside)/_shared/commissions";
import { FilterField } from "@/components/Filters";
import { LocalField } from "@/hooks/useLocalTable";
import { clientName, factoryName } from "@/utils/company";
import { useMemo } from "react";

import { optionsFromRows } from "../rowOptions";
import { CommissionRow } from "./interface";

/**
 * O que cada campo do painel recorta nas parcelas de comissão.
 *
 * "Conferida" é o campo que a conferência mensal usa de verdade: filtrar o que
 * ainda NÃO bateu com a planilha da fábrica é o próprio trabalho — sem ele, a
 * pessoa relê as linhas já conferidas toda vez.
 */
export const COMMISSIONS_FILTER_FIELDS: Record<
  string,
  LocalField<CommissionRow>
> = {
  search: {
    type: "text",
    match: (row, value) =>
      clientName(row.client).toLowerCase().includes(value.toLowerCase()),
  },
  factoryId: {
    type: "select",
    match: (row, value) => row.factory?.id === value,
  },
  sellerId: {
    type: "select",
    match: (row, value) => row.seller?.id === value,
  },
  status: {
    type: "select",
    match: (row, value) => row.status === value,
  },
  reconciled: {
    type: "select",
    match: (row, value) =>
      value === "yes" ? row.isReconciled : !row.isReconciled,
  },
};

/** Campos do painel: cliente, fábrica, vendedor, situação e conferência. */
export const useCommissionsFilters = (rows: CommissionRow[]): FilterField[] =>
  useMemo(() => {
    const factories = optionsFromRows(rows, (row) =>
      row.factory
        ? { value: row.factory.id, label: factoryName(row.factory) }
        : null
    );
    const sellers = optionsFromRows(rows, (row) =>
      row.seller ? { value: row.seller.id, label: row.seller.name } : null
    );
    // Só as situações que EXISTEM nas linhas: oferecer "Cancelado" num mês sem
    // nenhuma cancelada devolveria a tabela vazia.
    const statuses = optionsFromRows(rows, (row) => ({
      value: row.status,
      label: COMMISSION_STATUS_LABEL[row.status],
    }));

    return [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Nome do cliente",
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: factories,
        hidden: factories.length < 2,
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellers,
        hidden: sellers.length < 2,
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: statuses,
      },
      {
        type: "select",
        key: "reconciled",
        label: "Conferência",
        placeholder: "Conferidas ou não",
        options: [
          { value: "no", label: "Ainda não conferidas" },
          { value: "yes", label: "Já conferidas" },
        ],
      },
    ];
  }, [rows]);
