"use client";

import {
  COMMISSION_STATUS_LABEL,
  type CommissionStatus,
} from "@/app/(inside)/_shared/commissions";
import { FilterField } from "@/components/Filters";
import { FieldConfig } from "@/hooks/useTableFilters";
import { useMemo } from "react";

import { CommissionReportOption } from "./interface";

/**
 * Os campos do painel, como o `useTableFilters` os guarda na URL. Quem recorta
 * é o servidor (`CommissionReportInput`); a chave de cada um é o nome que vai na
 * URL — `sellerId` do painel vira `panelSellerId` na consulta, porque o
 * `sellerId` da consulta é o escopo do gestor (o seletor da barra do relatório).
 *
 * "Conferida" é o campo que a conferência mensal usa de verdade: filtrar o que
 * ainda NÃO bateu com a planilha da fábrica é o próprio trabalho — sem ele, a
 * pessoa relê as linhas já conferidas toda vez.
 */
export const COMMISSIONS_FILTER_CONFIG: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search" },
  factoryId: { type: "select", queryField: "factoryId" },
  sellerId: { type: "select", queryField: "panelSellerId" },
  status: { type: "select", queryField: "status" },
  installment: { type: "select", queryField: "installment" },
  reconciled: { type: "select", queryField: "reconciled" },
};

interface FilterOptions {
  factories: CommissionReportOption[];
  sellers: CommissionReportOption[];
  /** Só as situações que EXISTEM no período (o servidor diz quais). */
  statuses: CommissionReportOption[];
}

/** Campos do painel: cliente, fábrica, vendedor, situação e conferência. */
export const useCommissionsFilters = ({
  factories,
  sellers,
  statuses,
}: FilterOptions): FilterField[] =>
  useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente ou nota",
        placeholder: "Nome do cliente ou número da nota",
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: factories.map(({ value, label }) => ({ value, label })),
        hidden: factories.length < 2,
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellers.map(({ value, label }) => ({ value, label })),
        hidden: sellers.length < 2,
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        // Oferecer "Cancelado" num mês sem nenhuma cancelada devolveria a
        // tabela vazia. O rótulo é o da tela, não o do servidor.
        options: statuses.map((option) => ({
          value: option.value,
          label:
            COMMISSION_STATUS_LABEL[option.value as CommissionStatus] ??
            option.label,
        })),
      },
      {
        type: "select",
        key: "installment",
        label: "Boleto",
        placeholder: "Qualquer situação",
        options: [
          { value: "overdue", label: "Vencidos e não pagos" },
          { value: "defaulted", label: "Inadimplentes" },
        ],
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
    ],
    [factories, sellers, statuses]
  );
